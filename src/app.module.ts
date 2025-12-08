import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { PrismaService } from './prisma.service';
import { RecipeModule } from './recipe/recipe.module';
import { CategoriesModule } from './categories/categories.module';
import { RecipesModule } from './recipes/recipes.module';
import { RecipeIngredientsModule } from './recipe-ingredients/recipe-ingredients.module';
import { RecipeStepsModule } from './recipe-steps/recipe-steps.module';
import { TagsModule } from './tags/tags.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UsersModule,
    RecipeModule,
    CategoriesModule,
    RecipesModule,
    RecipeIngredientsModule,
    RecipeStepsModule,
    TagsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
