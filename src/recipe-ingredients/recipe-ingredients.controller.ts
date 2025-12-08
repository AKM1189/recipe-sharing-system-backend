import { Body, Controller, Post } from '@nestjs/common';
import { RecipeIngredientsService } from './recipe-ingredients.service';

@Controller('recipe-ingredients')
export class RecipeIngredientsController {
  constructor(
    private readonly recipeIngredientsService: RecipeIngredientsService,
  ) {}
}
