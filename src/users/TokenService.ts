import { Injectable } from '@nestjs/common';
import { env } from 'prisma/config';
import * as jwt from 'jsonwebtoken';
import { TokenResponse } from './interfaces/token.interface';

@Injectable()
export class TokenService {
  private readonly accessTokenSecret = env('ACCESS_TOKEN_SECRET');
  private readonly refreshTokenSecret = env('REFRESH_TOKEN_SECRET');
  private readonly accessTokenExpiration = '10m';
  private readonly refreshTokenExpiration = '1d';

  generateAccessToken(payload: any): TokenResponse {
    const token = jwt.sign(payload, this.accessTokenSecret, {
      expiresIn: this.accessTokenExpiration,
    });

    const expireTime = new Date();
    expireTime.setHours(expireTime.getMinutes() + 10);

    return { token, expireTime };
  }

  generateRefreshToken(payload: any): TokenResponse {
    const token = jwt.sign(payload, this.refreshTokenSecret, {
      expiresIn: this.refreshTokenExpiration,
    });

    const expireTime = new Date();
    expireTime.setHours(expireTime.getDate() + 1);

    return { token, expireTime };
  }

  verifyAccessToken(token: string) {
    return jwt.verify(token, this.accessTokenSecret);
  }

  verifyRefreshToken(token: string) {
    return jwt.verify(token, this.refreshTokenSecret);
  }
}
