import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import {
  CreateRecipeDto,
  IngredientDto,
  StepDto,
} from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { RecipeIngredientsService } from 'src/recipe-ingredients/recipe-ingredients.service';
import { RecipeStepsService } from 'src/recipe-steps/recipe-steps.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { R2Service } from 'src/r2.service';
import { UserInterface } from 'src/users/interfaces/user.interface';
import { Prisma, Recipe, User } from '@prisma/client';
import { CategoriesService } from 'src/categories/categories.service';
import OpenAI from 'openai';
import { LocalStorageService } from 'src/local-storage.service';

@Injectable()
export class RecipesService {
  constructor(
    private prisma: PrismaService,
    private recipeIngredientService: RecipeIngredientsService,
    private recipeStepService: RecipeStepsService,
    private categoryService: CategoriesService,
    private imageService: LocalStorageService,
  ) {}

  async recipes(params?: Prisma.RecipeFindManyArgs): Promise<Recipe[]> {
    return this.prisma.recipe.findMany({
      ...params,
      orderBy: { createdAt: 'desc' },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
    });
  }

  recipesByUser(userId: string) {
    return this.prisma.recipe.findMany({
      where: { userId },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
    });
  }

  recipesByCategory(category: string) {
    return this.prisma.recipe.findMany({
      where: {
        categories: {
          some: {
            category: {
              name: category,
            },
          },
        },
      },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
    });
  }

  findOne(id: number) {
    return this.prisma.recipe.findUnique({
      where: { id },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
        ingredients: true,
        steps: {
          orderBy: {
            stepNumber: 'asc',
          },
        },
        reviews: {
          select: {
            user: true,
            id: true,
            rating: true,
            description: true,
            parentId: true,
            deleted: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async create(
    dto: CreateRecipeDto,
    user: UserInterface,
    files: Array<Express.Multer.File>,
  ): Promise<Recipe> {
    if (!user) {
      throw new HttpException('User not found', 404);
    }

    const { steps, recipeImageKey, uploadedKeys } = await this.uploadAllFiles(
      dto,
      files,
    );

    const data = this.buildRecipeCreatePayload(dto, recipeImageKey, user);
    try {
      return await this.prisma.$transaction(async (tx) => {
        const recipe = await tx.recipe.create({
          data,
        });

        await this.attachCategories(recipe.id, dto.categories, tx);
        await this.recipeIngredientService.create(
          recipe.id,
          dto.ingredients,
          tx,
        );

        await this.recipeStepService.create(recipe.id, steps, tx);

        return recipe;
      });
    } catch (err) {
      await Promise.all(
        uploadedKeys.map((key) => this.imageService.deleteImage(key)),
      );
      throw err;
    }
  }

  async uploadAllFiles(
    dto: CreateRecipeDto,
    files: Array<Express.Multer.File>,
  ) {
    const uploadedKeys: string[] = [];

    try {
      const {
        stepImageMap,
        uploadedKeys: stepUploadedKeys,
        toDeleteKeys,
      } = await this.uploadStepImages(dto.steps, files);

      uploadedKeys.push(...stepUploadedKeys);

      const recipeImageKey = await this.uploadRecipeImage(files);
      if (recipeImageKey) uploadedKeys.push(recipeImageKey);

      const steps = await this.buildStepsPayload(dto.steps, stepImageMap);

      return { steps, recipeImageKey, uploadedKeys, toDeleteKeys };
    } catch (err) {
      throw err;
    }
  }

  async uploadRecipeImage(files: Array<Express.Multer.File>) {
    const recipeImage = files.find((f) => f.fieldname === 'recipeImage');
    return recipeImage
      ? await this.imageService.uploadPublicImage(recipeImage)
      : null;
  }

  async uploadStepImages(steps: StepDto[], files: Array<Express.Multer.File>) {
    const uploadedKeys: string[] = [];
    const toDeleteKeys: string[] = [];
    const stepImageMap = new Map<number, string | null>();

    await Promise.all(
      steps.map(async (step, index) => {
        const stepFile = files.find(
          (f) => f.fieldname === `steps[${index}][image]`,
        );
        let imageUrl: string | null = step.imageUrl || null;

        if (stepFile) {
          if (imageUrl) toDeleteKeys.push(imageUrl);

          imageUrl = await this.imageService.uploadPublicImage(stepFile);
          uploadedKeys.push(imageUrl);
        }

        stepImageMap.set(index, imageUrl);
      }),
    );
    return {
      stepImageMap,
      uploadedKeys,
      toDeleteKeys,
    };
  }

  async buildStepsPayload(
    steps: StepDto[],
    stepImageMap: Map<number, string | null>,
  ) {
    return steps.map((step, index) => ({
      id: this.formatId(step.stepId),
      stepNumber: Number(step.stepNumber),
      title: step.title,
      instruction: step.instruction,
      imageUrl: stepImageMap.get(index) ?? null,
    }));
  }

  async attachCategories(
    recipeId: number,
    categories: string[],
    tx: Prisma.TransactionClient,
  ) {
    const newCategories = await this.categoryService.create(categories, tx);

    if (newCategories && newCategories?.length > 0) {
      await tx.recipeCategories.createMany({
        data: newCategories.map((category) => ({
          recipeId: recipeId,
          categoryId: category.id,
        })),
        skipDuplicates: true,
      });
    }
  }

  async update(
    id: number,
    dto: UpdateRecipeDto,
    files: Array<Express.Multer.File>,
  ): Promise<Recipe> {
    const recipe = await this.findOne(id);
    let deletedRecipeImgKey: string | null | undefined = recipe?.imageUrl;
    let deletedStepsImgKeys: string[] = [];
    if (!recipe) {
      throw new HttpException('Recipe not found', 404);
    }

    if (dto?.deletedSteps?.length > 0) {
      await Promise.all(
        dto.deletedSteps.map(async (id) => {
          const step = await this.recipeStepService.findOne(Number(id));
          if (step?.imageUrl) deletedStepsImgKeys.push(step.imageUrl);
        }),
      );
    }
    const { steps, recipeImageKey, uploadedKeys, toDeleteKeys } =
      await this.uploadAllFiles(dto, files);
    if (toDeleteKeys.length > 0) {
      toDeleteKeys.map((key) => deletedStepsImgKeys.push(key));
    }

    const recipeData = this.buildRecipeUpdatePayload(dto, recipeImageKey);

    try {
      const recipe = await this.prisma.$transaction(async (tx) => {
        const recipe = await tx.recipe.update({
          data: recipeData,
          where: { id },
        });

        await this.attachCategories(recipe.id, dto.categories, tx);

        const formattedIngredients = dto.ingredients.map((ingredient) => ({
          ...ingredient,
          id: this.formatId(ingredient.id),
        }));
        await this.recipeIngredientService.updateByRecipe(
          recipe.id,
          formattedIngredients,
          dto.deletedIngredients,
          tx,
        );

        await this.recipeStepService.updateByRecipe(
          recipe.id,
          steps,
          dto.deletedSteps,
          tx,
        );

        return recipe;
      });
      if (deletedStepsImgKeys.length > 0) {
        await Promise.all(
          deletedStepsImgKeys.map((key) => this.imageService.deleteImage(key)),
        );
      }

      if (recipeImageKey && deletedRecipeImgKey) {
        await this.imageService.deleteImage(deletedRecipeImgKey);
      }
      return recipe;
    } catch (err) {
      await Promise.all(
        uploadedKeys.map((key) => this.imageService.deleteImage(key)),
      );
      throw err;
    }
  }

  remove(id: number) {
    return `This action removes a #${id} recipe`;
  }

  formatId(id?: string): number | undefined {
    if (!id || id === '0') return undefined;
    return Number(id);
  }

  buildRecipeCreatePayload(
    dto: CreateRecipeDto,
    recipeImageKey: string | null,
    user: UserInterface,
  ): Prisma.RecipeCreateInput {
    return {
      title: dto.title,
      description: dto.description,
      imageUrl: recipeImageKey,
      cookingTime: parseInt(dto.cookingTime),
      serving: parseInt(dto.serving),
      difficulty: dto.difficulty,
      status: dto.status,
      rating: 0,
      user: {
        connect: {
          id: user.id,
        },
      },
    };
  }

  buildRecipeUpdatePayload(
    dto: UpdateRecipeDto,
    recipeImageKey: string | null,
  ): Prisma.RecipeUpdateInput {
    return {
      title: dto.title,
      description: dto.description,
      imageUrl: recipeImageKey ?? dto.imageUrl ?? null,
      cookingTime: Number(dto.cookingTime) || 0,
      serving: Number(dto.serving) || 0,
      difficulty: dto.difficulty,
      status: dto.status,
    };
  }

  async addRating(recipeId: number, tx: Prisma.TransactionClient) {
    const recipe = await this.findOne(recipeId);
    if (!recipe) throw new BadRequestException('Recipe not found!');

    const client = tx ?? this.prisma;

    let totalRating = 0;
    recipe?.reviews.map((review) => {
      if (!review.deleted) totalRating += review.rating ?? 0;
    }, 0);

    const totalLength = recipe?.reviews.filter(
      (review) => review.rating && !review.deleted,
    ).length;

    if (totalRating && totalLength) {
      const avgRating = totalRating / totalLength;
      recipe.rating = new Prisma.Decimal(avgRating);
    }

    await client.recipe.update({
      where: { id: recipeId },
      data: {
        rating: recipe.rating,
      },
    });
  }
}
