export interface CreateResponse {
  id: string;
  name: string;
  email: string;
}

export interface LoginResponse {
  user: CreateResponse;
  accessToken: string;
  refreshToken: string;
  accessTokenExpireTime: Date;
  refreshTokenExpireTime: Date;
}
