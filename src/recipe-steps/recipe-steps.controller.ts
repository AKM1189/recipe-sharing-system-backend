import { Controller } from '@nestjs/common';
import { RecipeStepsService } from './recipe-steps.service';

@Controller('recipe-steps')
export class RecipeStepsController {
  constructor(private readonly recipeStepsService: RecipeStepsService) {}
}
