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
import {
  RecipeDifficulty,
  RecipeStatus,
} from '../interfaces/recipes.interface';
import { Transform, Type } from 'class-transformer';

export class IngredientDto {
  @IsString()
  name: string;

  @IsString()
  quantity: string;

  @IsString()
  unit: string;
}

export class StepDto {
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
