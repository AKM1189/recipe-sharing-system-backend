import { Module } from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { RecipesController } from './recipes.controller';
import { RecipeIngredientsModule } from '../recipe-ingredients/recipe-ingredients.module';
import { RecipeStepsModule } from '../recipe-steps/recipe-steps.module';
import { R2Service } from '../image/upload-services/r2.service';
import { CategoriesModule } from '../categories/categories.module';
import { LocalStorageService } from '../image/upload-services/local-storage.service';
import { EmbeddingService } from '../embedding/embedding.service';

@Module({
  imports: [RecipeIngredientsModule, RecipeStepsModule, CategoriesModule],
  controllers: [RecipesController],
  providers: [RecipesService, R2Service, LocalStorageService, EmbeddingService],
  exports: [RecipesService],
})
export class RecipesModule {}
