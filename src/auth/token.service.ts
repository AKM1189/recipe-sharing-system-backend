// token.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { env } from 'prisma/config'; // assumes env(key: string): string
import { TokenPayload } from './interfaces/user.interface';
import { JwtService } from '@nestjs/jwt';

export interface TokenResponse {
  token: string;
  expireTime: Date;
}

@Injectable()
export class TokenService {
  constructor(private jwt: JwtService) {}

  private readonly accessTokenSecret: string = env('ACCESS_TOKEN_SECRET');
  private readonly refreshTokenSecret: string = env('REFRESH_TOKEN_SECRET');

  // Nest-style: keep durations as constants
  private readonly accessTokenExpiration = '10m';
  private readonly refreshTokenExpiration = '1d';

  async generateAccessToken(payload: TokenPayload) {
    const token = await this.jwt.signAsync(payload, {
      secret: this.accessTokenSecret,
      expiresIn: this.accessTokenExpiration,
    });

    const expireTime = new Date();
    expireTime.setMinutes(expireTime.getMinutes() + 10);

    return { token, expireTime };
  }

  async generateRefreshToken(payload: TokenPayload) {
    const token = await this.jwt.signAsync(payload, {
      secret: this.refreshTokenSecret,
      expiresIn: this.refreshTokenExpiration,
    });

    const expireTime = new Date();
    expireTime.setDate(expireTime.getDate() + 1);

    return { token, expireTime };
  }

  verifyAccessToken(token: string) {
    try {
      return this.jwt.verifyAsync(token, {
        secret: this.accessTokenSecret,
      });
    } catch {
      throw new UnauthorizedException();
    }
  }

  verifyRefreshToken(token: string) {
    try {
      return this.jwt.verifyAsync(token, {
        secret: this.refreshTokenSecret,
      });
    } catch {
      throw new UnauthorizedException();
    }
  }
}
