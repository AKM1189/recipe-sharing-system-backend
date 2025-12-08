import { Injectable } from '@nestjs/common';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { PrismaService } from 'src/prisma.service';
import { User } from 'src/generated/prisma/client';
import { RecipeIngredientsService } from 'src/recipe-ingredients/recipe-ingredients.service';
import { RecipeStepsService } from 'src/recipe-steps/recipe-steps.service';

@Injectable()
export class RecipesService {
  constructor(
    private prisma: PrismaService,
    private recipeIngredientService: RecipeIngredientsService,
    private recipeStepServicee: RecipeStepsService,
  ) {}

  async create(createRecipeDto: CreateRecipeDto, user: User) {
    const {
      title,
      description,
      imageUrl,
      cookingTime,
      serving,
      difficulty,
      status,
    } = createRecipeDto;

    const data = {
      title,
      description,
      imageUrl,
      cookingTime,
      serving,
      difficulty,
      status,
      userId: user.id,
    };

    return await this.prisma.$transaction(async (tx) => {
      const recipe = await tx.recipe.create({
        data,
      });
      const ingredientPayload = createRecipeDto.ingredients?.map((item) => ({
        ...item,
        recipeId: recipe.id,
      }));
      const stepPayload = createRecipeDto.steps?.map((item) => ({
        ...item,
        recipeId: recipe.id,
      }));

      if (ingredientPayload?.length) {
        await this.recipeIngredientService.create(ingredientPayload);
      }

      if (stepPayload?.length) {
        await this.recipeStepServicee.create(stepPayload);
      }
      return recipe;
    });
  }

  findAll() {
    return `This action returns all recipes`;
  }

  findOne(id: number) {
    return `This action returns a #${id} recipe`;
  }

  update(id: number, updateRecipeDto: UpdateRecipeDto) {
    return `This action updates a #${id} recipe`;
  }

  remove(id: number) {
    return `This action removes a #${id} recipe`;
  }
}
