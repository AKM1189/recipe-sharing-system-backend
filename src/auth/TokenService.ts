import { Injectable, UnauthorizedException } from '@nestjs/common';
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
  private readonly accessTokenExpiration = '15m';
  private readonly refreshTokenExpiration = '1d';

  async generateAccessToken(payload: any): Promise<TokenResponse> {
    const token = await this.jwt.signAsync(payload, {
      secret: this.accessTokenSecret,
      expiresIn: this.accessTokenExpiration,
    });

    const expireTime = new Date();
    expireTime.setHours(expireTime.getMinutes() + 15);

    return { token, expireTime };
  }

  async generateRefreshToken(payload: any): Promise<TokenResponse> {
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
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Access token expired');
      }

      throw new UnauthorizedException('Invalid access token');
    }
  }

  verifyRefreshToken(token: string) {
    try {
      return this.jwt.verify(token, {
        secret: this.refreshTokenSecret,
      });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Refresh token expired');
      }

      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
