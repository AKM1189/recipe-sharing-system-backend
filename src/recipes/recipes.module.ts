import { Module } from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { RecipesController } from './recipes.controller';
import { RecipeIngredientsModule } from 'src/recipe-ingredients/recipe-ingredients.module';
import { RecipeStepsModule } from 'src/recipe-steps/recipe-steps.module';

@Module({
  imports: [RecipeIngredientsModule, RecipeStepsModule],
  controllers: [RecipesController],
  providers: [RecipesService],
})
export class RecipesModule {}
