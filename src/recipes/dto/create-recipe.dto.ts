import {
  ArrayNotEmpty,
  IsEmpty,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { RecipeDifficulty, RecipeStatus } from '@prisma/client';

export class IngredientDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  name: string;

  @IsString()
  quantity: string;

  @IsString()
  unit: string;
}

export class StepDto {
  @IsString()
  @IsOptional()
  stepId?: string;

  @IsString()
  title: string;

  @IsString()
  stepNumber: string;

  @IsString()
  instruction: string;

  @IsOptional()
  imageUrl?: string;
}

export class CreateRecipeDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  cookingTime: string;

  @IsString()
  serving: string;

  @IsOptional()
  imageUrl?: string;

  //   @IsEnum(['EASY', 'MEDIUM', 'HARD'])
  // difficulty: string;

  // @IsEnum(['Draft', 'Published'])
  // status: string;

  @IsString()
  difficulty: RecipeDifficulty;

  @IsString()
  status: RecipeStatus;

  @ArrayNotEmpty({ message: 'Ingredients cannot be empty' })
  @ValidateNested({ each: true })
  @Type(() => IngredientDto)
  ingredients: IngredientDto[];

  @ArrayNotEmpty({ message: 'Directions cannot be empty' })
  @ValidateNested({ each: true })
  @Type(() => StepDto)
  steps: StepDto[];

  @ArrayNotEmpty({ message: 'Categories cannot be empty' })
  categories: string[];

  // @IsNotEmpty()
  // tags: string[];
}
