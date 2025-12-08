import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { env } from 'prisma/config';

interface TokenResponse {
  token: string;
  expireTime: Date;
}

@Injectable()
export class TokenService {
  constructor(private jwt: JwtService) {}
  private readonly accessTokenSecret = env('ACCESS_TOKEN_SECRET');
  private readonly refreshTokenSecret = env('REFRESH_TOKEN_SECRET');
  private readonly accessTokenExpiration = '10m';
  private readonly refreshTokenExpiration = '1d';

  async generateAccessToken(payload: any): Promise<TokenResponse> {
    const token = await this.jwt.signAsync(payload, {
      secret: this.accessTokenSecret,
      expiresIn: this.accessTokenExpiration,
    });

    const expireTime = new Date();
    expireTime.setHours(expireTime.getMinutes() + 10);

    return { token, expireTime };
  }

  async generateRefreshToken(payload: any): Promise<TokenResponse> {
    const token = await this.jwt.signAsync(payload, {
      secret: this.refreshTokenSecret,
      expiresIn: this.refreshTokenExpiration,
    });

    const expireTime = new Date();
    expireTime.setHours(expireTime.getDate() + 1);

    return { token, expireTime };
  }

  verifyAccessToken(token: string) {
    return this.jwt.verifyAsync(token, {
      secret: this.accessTokenSecret,
    });
  }

  verifyRefreshToken(token: string) {
    return this.jwt.verify(token, {
      secret: this.refreshTokenSecret,
    });
  }
}
