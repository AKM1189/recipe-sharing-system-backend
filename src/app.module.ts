import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { RecipesModule } from './recipes/recipes.module';
import { RecipeIngredientsModule } from './recipe-ingredients/recipe-ingredients.module';
import { RecipeStepsModule } from './recipe-steps/recipe-steps.module';
import { TagsModule } from './tags/tags.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UsersModule,
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
