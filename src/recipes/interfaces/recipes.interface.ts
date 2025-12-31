export enum RecipeDifficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
  EXPERT = 'EXPERT',
}

export enum RecipeStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

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
