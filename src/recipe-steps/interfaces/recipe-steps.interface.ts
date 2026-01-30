export interface StepsPayload {
  id?: number | undefined;
  stepNumber: number;
  title: string;
  instruction: string;
  imageUrl?: string | null;
}

export interface StepsData {
  id: number;
  title: string | null;
  imageUrl: string | null;
  stepNumber: number;
  recipeId: number;
  instruction: string;
}
