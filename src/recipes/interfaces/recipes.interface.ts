import { RecipeDifficulty, RecipeStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/client';
import { CategoriesPayload } from 'src/categories/interfaces/categories.interface';
import { IngredientsPayload } from 'src/recipe-ingredients/interfaces/recipe-ingredients.interface';
import { StepsPayload } from 'src/recipe-steps/interfaces/recipe-steps.interface';

// export enum RecipeDifficulty {
//   EASY = 'EASY',
//   MEDIUM = 'MEDIUM',
//   HARD = 'HARD',
//   EXPERT = 'EXPERT',
// }

// export enum RecipeStatus {
//   DRAFT = 'DRAFT',
//   PUBLISHED = 'PUBLISHED',
//   ARCHIVED = 'ARCHIVED',
// }

export interface RecipePayload {
  title: string;
  description: string;
  imageUrl: string | null;
  cookingTime: number;
  serving: number;
  difficulty: RecipeDifficulty;
  status: RecipeStatus;
  userId: string;
}

export interface RecipeWithRelations {
  title: string;
  description: string;
  imageUrl: string | null;
  cookingTime: number;
  serving: number;
  difficulty: RecipeDifficulty;
  status: RecipeStatus;
  userId: string;
  ingredients: IngredientsPayload[];
  steps: StepsPayload[];
  categories: CategoriesPayload[];
}

export interface RecipeResponse {
  id: number;
  title: string;
  description: string;
  imageUrl: string | null;
  cookingTime: number;
  serving: number;
  difficulty: RecipeDifficulty;
  status: RecipeStatus;
  rating: Decimal | null;
  createdAt: Date;
  updatedAt: Date | null;
  userId: string;
}
