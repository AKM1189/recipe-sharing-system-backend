export interface CreatePayload {
  name: string;
  email: string;
  password: string;
}

export interface CreateResponse {
  id: string;
  name: string;
  email: string;
}

export interface LoginResponse {
  message: string;
  user: CreateResponse;
  accessToken: string;
  refreshToken: string;
  accessTokenExpireTime: Date;
  refreshTokenExpireTime: Date;
}
