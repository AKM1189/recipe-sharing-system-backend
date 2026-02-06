import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRecipeDto, StepDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { RecipeIngredientsService } from 'src/recipe-ingredients/recipe-ingredients.service';
import { RecipeStepsService } from 'src/recipe-steps/recipe-steps.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserInterface } from 'src/users/interfaces/user.interface';
import { Prisma, Recipe, User } from '@prisma/client';
import { CategoriesService } from 'src/categories/categories.service';
import { EmbeddingService } from 'src/embedding/embedding.service';
import { ImageService } from 'src/image/image.service';

@Injectable()
export class RecipesService {
  constructor(
    private prisma: PrismaService,
    private recipeIngredientService: RecipeIngredientsService,
    private recipeStepService: RecipeStepsService,
    private categoryService: CategoriesService,
    private imageService: ImageService,
    private embeddingService: EmbeddingService,
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
            profileUrl: true,
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

        // await this.saveEmbedding(recipe.id, tx);

        return recipe;
      });
    } catch (err) {
      await Promise.all(
        uploadedKeys.map((key) => this.imageService.deleteImage(key)),
      );
      throw err;
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
        await this.saveEmbedding(recipe.id, tx);

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

  // async search(query: string) {
  //   const queryEmbedding = await this.embeddingService.embed(query);
  //   const queryVector = this.toPgVector(queryEmbedding);

  //   const results = await this.prisma.$queryRawUnsafe(
  //     `SELECT
  //       r.*,
  //       COALESCE(
  //       json_agg(
  //       DISTINCT jsonb_build_object(
  //       'recipeId', rc."recipeId",
  //       'categoryId', rc."categoryId",
  //       'category', jsonb_build_object(
  //         'id', c.id,
  //         'name', c.name,
  //         'slug', c.slug
  //       )
  //       )
  //       ) FILTER (WHERE rc."categoryId" IS NOT NULL),
  //       '[]'
  //       ) AS categories,
  //       1 - (s.embedding <=> $1::vector) AS similarity
  //       FROM "RecipeSearchIndex" s
  //       JOIN "Recipe" r ON r.id = s."recipeId"
  //       LEFT JOIN "RecipeCategories" rc ON rc."recipeId" = r.id
  //       LEFT JOIN "Category" c ON c.id = rc."categoryId"
  //       WHERE r.status = 'PUBLISHED'
  //       GROUP BY r.id, s.embedding
  //       ORDER BY s.embedding <=> $1::vector
  //       LIMIT 20;
  //       `,
  //     queryVector,
  //   );

  //   return results;
  // }

  async search(query: string) {
    const results = this.prisma.recipe.findMany({
      where: {
        OR: [
          {
            title: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            ingredients: {
              some: {
                name: {
                  contains: query,
                  mode: 'insensitive',
                },
              },
            },
          },
          {
            categories: {
              some: {
                category: {
                  name: {
                    contains: query,
                    mode: 'insensitive',
                  },
                },
              },
            },
          },
        ],
      },
      include: {
        ingredients: true,
        categories: { include: { category: true } },
      },
    });

    return results;
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
    return newCategories;
  }

  async remove(id: number, user: User) {
    const toDeleteKeys: string[] = [];
    const recipe = await this.prisma.recipe.findUnique({
      where: { id },
      include: { steps: true },
    });
    if (!recipe) {
      throw new NotFoundException('Recipe not found!');
    }
    if (user.id !== recipe.userId) {
      throw new NotFoundException(
        'You are not authorized to delete this recipe!',
      );
    }
    if (recipe.imageUrl) toDeleteKeys.push(recipe.imageUrl);
    recipe.steps.map(
      (step) => step.imageUrl && toDeleteKeys.push(step.imageUrl),
    );
    if (toDeleteKeys.length > 0) {
      toDeleteKeys.map((key) => this.imageService.deleteImage(key));
    }
    return this.prisma.recipe.delete({ where: { id } });
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

  async saveEmbedding(recipeId: number, tx: Prisma.TransactionClient) {
    const { content, vector } = await this.generateEmbedding(recipeId, tx);
    return tx.$executeRawUnsafe(
      `INSERT INTO "RecipeSearchIndex" ("recipeId", "content", "embedding")
    VALUES ($1, $2, $3::vector)
    ON CONFLICT ("recipeId")
    DO UPDATE SET
      "embedding" = EXCLUDED."embedding",
      "content"   = EXCLUDED."content",
      "updatedAt" = now();`,
      recipeId,
      content,
      vector,
    );
  }

  async updateEmbedding(recipeId: number, tx: Prisma.TransactionClient) {
    const { content, vector } = await this.generateEmbedding(recipeId, tx);

    return tx.$executeRawUnsafe(
      `
    UPDATE "RecipeSearchIndex"
    SET
      "content"   = $2,
      "embedding" = $3::vector,
      "updatedAt" = now()
    WHERE "recipeId" = $1
    `,
      recipeId,
      content,
      vector,
    );
  }

  async generateEmbedding(recipeId: number, tx: Prisma.TransactionClient) {
    const recipe = await tx.recipe.findUnique({
      where: { id: recipeId },
      include: {
        categories: {
          include: { category: true },
        },
        ingredients: true,
      },
    });

    const content = this.buildRecipeText(recipe);
    const embedding = await this.embeddingService.embed(content);
    const vector = this.toPgVector(embedding);

    return { content, vector };
  }

  toPgVector(vec: number[]): string {
    return `[${vec.join(',')}]`;
  }

  buildRecipeText(recipe: any) {
    return `Title: ${recipe.title}
    Description: ${recipe.description}
    Difficulty: ${recipe.difficulty}
    Cooking time: ${recipe.cookingTime} minutes
    Serving: ${recipe.serving}
    Ingredients: ${recipe.ingredients.map((i) => i.name).join(', ')}
    Categories: ${recipe.categories.map((c) => c.category.name).join(', ')}`;
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
