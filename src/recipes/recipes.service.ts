import { Injectable } from '@nestjs/common';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { RecipeIngredientsService } from 'src/recipe-ingredients/recipe-ingredients.service';
import { RecipeStepsService } from 'src/recipe-steps/recipe-steps.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RecipesService {
  constructor(
    private prisma: PrismaService,
    private recipeIngredientService: RecipeIngredientsService,
    private recipeStepServicee: RecipeStepsService,
  ) {}

  async create(createRecipeDto: CreateRecipeDto, user: any) {
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

      if (createRecipeDto?.ingredients?.length) {
        await this.recipeIngredientService.create(
          recipe.id,
          createRecipeDto?.ingredients,
        );
      }

      if (createRecipeDto?.steps?.length) {
        await this.recipeStepServicee.create(recipe.id, createRecipeDto?.steps);
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
