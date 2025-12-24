import { HttpException, Injectable } from '@nestjs/common';
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
import { Prisma, Recipe } from '@prisma/client';
import { CategoriesService } from 'src/categories/categories.service';
import { StepsPayload } from 'src/recipe-steps/interfaces/recipe-steps.interface';
import { IngredientsPayload } from 'src/recipe-ingredients/interfaces/recipe-ingredients.interface';
import { ApiResponse } from 'src/common/api-response.interface';

@Injectable()
export class RecipesService {
  constructor(
    private prisma: PrismaService,
    private recipeIngredientService: RecipeIngredientsService,
    private recipeStepService: RecipeStepsService,
    private categoryService: CategoriesService,
    private r2Service: R2Service,
  ) {}

  async recipes(params: {
    skip?: number;
    take?: number;
    cursor?: any;
    where?: any;
    orderBy?: any;
  }): Promise<Recipe[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.recipe.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include: {
        categories: {
          include: {
            category: true,
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
    const uploads = await this.uploadAllFiles(dto, files);

    const data = {
      title: dto.title,
      description: dto.description,
      imageUrl: uploads.recipeImageKey,
      cookingTime: parseInt(dto.cookingTime),
      serving: parseInt(dto.serving),
      difficulty: dto.difficulty,
      status: dto.status,
      userId: user.id,
    };

    try {
      return await this.prisma.$transaction(async (tx) => {
        const recipe = await tx.recipe.create({
          data,
        });

        await this.attachCategories(recipe.id, dto.categories, tx);
        await this.attachIngredients(recipe.id, dto.ingredients, tx);
        await this.attachSteps(recipe.id, uploads.steps, tx);

        return recipe;
      });
    } catch (err) {
      await Promise.all(
        uploads.uploadedKeys.map((key) => this.r2Service.deleteImage(key)),
      );
      throw err;
    }
  }

  async uploadAllFiles(
    dto: CreateRecipeDto,
    files: Array<Express.Multer.File>,
  ) {
    const uploadedKeys: string[] = [];

    const steps = await Promise.all(
      dto.steps.map(async (step, index) => {
        const stepFile = files.find(
          (f) => f.fieldname === `steps[${index}][image]`,
        );
        let imageUrl: string | null = null;

        if (stepFile) {
          imageUrl = await this.r2Service.uploadPublicImage(stepFile);
          uploadedKeys.push(imageUrl);
        }

        return {
          stepNumber: parseInt(step.stepNumber),
          instruction: step.instruction,
          imageUrl,
        };
      }),
    );

    const recipeImage = files.find((f) => f.fieldname === 'recipeImage');
    let recipeImageKey: string | null = null;

    if (recipeImage) {
      recipeImageKey = await this.r2Service.uploadPublicImage(recipeImage);
      uploadedKeys.push(recipeImageKey);
    }

    return { steps, recipeImageKey, uploadedKeys };
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

  async attachIngredients(
    recipeId: number,
    ingredients: IngredientDto[],
    tx: Prisma.TransactionClient,
  ) {
    await this.recipeIngredientService.create(recipeId, ingredients, tx);
  }

  async attachSteps(
    recipeId: number,
    steps: StepsPayload[],
    tx: Prisma.TransactionClient,
  ) {
    await this.recipeStepService.create(recipeId, steps, tx);
  }

  findAll() {
    return `This action returns all recipes`;
  }

  async findOne(id: number) {
    return await this.prisma.recipe.findUnique({
      where: { id },
    });
  }

  async update(id: number, updateRecipeDto: UpdateRecipeDto) {
    const recipe = this.findOne(id);

    if (!recipe) {
      throw new HttpException('Recipe not found', 404);
    }

    const data = this.getUpdateData(updateRecipeDto);

    // try {
    //   return await this.prisma.$transaction(async (tx) => {
    //     const recipe = await tx.recipe.update({
    //       data,
    //       where: { id },
    //     });

    //     await this.attachCategories(recipe.id, dto.categories, tx);
    //     await this.attachIngredients(recipe.id, dto.ingredients, tx);
    //     await this.attachSteps(recipe.id, uploads.steps, tx);

    //     return recipe;
    //   });
    // } catch (err) {
    //   await Promise.all(
    //     uploads.uploadedKeys.map((key) => this.r2Service.deleteImage(key)),
    //   );
    //   throw err;
    // }
  }

  private getUpdateData(dto: UpdateRecipeDto) {
    const updateData: Prisma.RecipeUpdateInput = {};
    if (dto.title) updateData.title = dto.title;
    if (dto.description) updateData.description = dto.description;
    if (dto.cookingTime !== undefined)
      updateData.cookingTime = Number(dto.cookingTime);
    if (dto.serving !== undefined) updateData.serving = Number(dto.serving);
    if (dto.difficulty) updateData.difficulty = dto.difficulty;
    if (dto.status) updateData.status = dto.status;
    return updateData;
  }

  remove(id: number) {
    return `This action removes a #${id} recipe`;
  }
}
