export interface StepsPayload {
  id?: number | undefined;
  stepNumber: number;
  instruction: string;
  imageUrl?: string | null;
}
