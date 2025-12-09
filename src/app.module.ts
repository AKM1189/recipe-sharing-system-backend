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
import { AuthModule } from './auth/auth.module';
import { RefreshTokensService } from './refresh-tokens/refresh-tokens.service';
import { RefreshTokensModule } from './refresh-tokens/refresh-tokens.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    CategoriesModule,
    RecipesModule,
    RecipeIngredientsModule,
    RecipeStepsModule,
    TagsModule,
    RefreshTokensModule,
  ],
  controllers: [AppController],
  providers: [AppService, RefreshTokensService],
})
export class AppModule {}
