import { Decimal } from '@prisma/client/runtime/client';
import { Expose, Type } from 'class-transformer';

export class CategoryDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  slug: string;
}

export class RecipeCategoryDto {
  @Expose()
  recipeId: number;

  @Expose()
  categoryId: number;

  @Expose()
  category: CategoryDto;
}

export class RecipeListResponseDto {
  @Expose()
  id: number;

  @Expose()
  title: string;

  @Expose()
  description: string;

  @Expose()
  imageUrl: string | null;

  @Expose()
  cookingTime: number;

  @Expose()
  serving: number;

  @Expose()
  difficulty: string;

  @Expose()
  status: string;

  @Expose()
  rating: Decimal | null;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date | null;

  @Expose()
  userId: string;

  @Expose()
  @Type(() => RecipeCategoryDto)
  categories: RecipeCategoryDto[] = [];
}
