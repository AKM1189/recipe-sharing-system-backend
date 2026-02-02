import { Expose, Type } from 'class-transformer';
import { RecipeListResponseDto } from './recipe-list.dto';

export class IngredientDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  quantity: string;

  @Expose()
  unit: string;
}

export class StepDto {
  @Expose()
  stepNumber: number;

  @Expose()
  title: string;

  @Expose()
  instruction: string;

  @Expose()
  imageUrl: string | null;
}

export class UserDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  email: string;

  @Expose()
  profileUrl: string | null;
}

export class ReviewDto {
  @Expose()
  id: number;
  @Expose()
  rating: number;
  @Expose()
  description: string;
  @Expose()
  parentId: number;
  @Expose()
  deleted: boolean;
  @Expose()
  @Type(() => UserDto)
  user: UserDto;
}

export class RecipeResponseDto extends RecipeListResponseDto {
  @Expose()
  @Type(() => IngredientDto)
  ingredients: IngredientDto[] = [];

  @Expose()
  @Type(() => StepDto)
  steps: StepDto[] = [];

  @Expose()
  @Type(() => ReviewDto)
  reviews: ReviewDto[] = [];

  @Expose()
  @Type(() => UserDto)
  user: UserDto[] = [];
}
