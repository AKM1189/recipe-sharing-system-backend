export interface IngredientsPayload {
  id?: number | undefined;
  name: string;
  quantity: string;
  unit: string;
}

export interface IngredientsData {
  name: string;
  id: number;
  recipeId: number;
  quantity: string;
  unit: string;
}
