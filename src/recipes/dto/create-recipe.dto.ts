import { IsEmpty, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import {
  RecipeDifficulty,
  RecipeStatus,
} from '../interfaces/recipes.interface';

export class CreateRecipeDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEmpty()
  image: File;

  @IsNumber()
  @IsNotEmpty()
  cookingTime: number;

  @IsNumber()
  @IsNotEmpty()
  serving: number;

  @IsString()
  @IsNotEmpty()
  difficulty: RecipeDifficulty;

  @IsString()
  @IsNotEmpty()
  status: RecipeStatus;

  @IsNotEmpty()
  ingredients: {
    name: string;
    quantity: string;
    unit: string;
  }[];

  @IsNotEmpty()
  steps: {
    stepNumber: number;
    instruction: string;
    imageUrl?: string;
  }[];

  @IsNotEmpty()
  categories: number[];

  @IsNotEmpty()
  tags: string[];
}
