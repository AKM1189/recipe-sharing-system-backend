import { Module } from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { RecipesController } from './recipes.controller';
import { RecipeIngredientsModule } from 'src/recipe-ingredients/recipe-ingredients.module';
import { RecipeStepsModule } from 'src/recipe-steps/recipe-steps.module';
import { R2Service } from 'src/r2.service';
import { CategoriesModule } from 'src/categories/categories.module';
import { LocalStorageService } from 'src/local-storage.service';
import { EmbeddingService } from 'src/embedding/embedding.service';

@Module({
  imports: [RecipeIngredientsModule, RecipeStepsModule, CategoriesModule],
  controllers: [RecipesController],
  providers: [RecipesService, R2Service, LocalStorageService, EmbeddingService],
  exports: [RecipesService],
})
export class RecipesModule {}
