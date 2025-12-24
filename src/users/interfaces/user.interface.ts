export interface CreatePayload {
  name: string;
  email: string;
  password: string;
}

export interface UserInterface {
  id: string;
  name: string;
  email: string;
}

export interface LoginResponse {
  message: string;
  user: UserInterface;
  accessToken: string;
  refreshToken: string;
  accessTokenExpireTime: Date;
  refreshTokenExpireTime: Date;
}
