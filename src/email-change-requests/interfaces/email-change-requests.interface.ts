export interface RequestPayload {
  userId: string;
  newEmail: string;
  token: string;
  expiresAt: Date;
}
