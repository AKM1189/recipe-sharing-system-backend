export interface CreateResponse {
  id: string;
  name: string;
  email: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface TokenPayload {
  id: string;
  email: string;
}

export interface LoginResponse {
  user: CreateResponse;
  accessToken: string;
  refreshToken: string;
  accessTokenExpireTime: Date;
  refreshTokenExpireTime: Date;
}
