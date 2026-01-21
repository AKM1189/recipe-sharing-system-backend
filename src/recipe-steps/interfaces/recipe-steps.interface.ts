export interface StepsPayload {
  id?: number | undefined;
  stepNumber: number;
  title: string;
  instruction: string;
  imageUrl?: string | null;
}
