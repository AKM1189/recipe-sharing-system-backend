import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { TokenService } from './TokenService';
import { User } from './interfaces/auth.interface';
import { RefreshTokensService } from 'src/refresh-tokens/refresh-tokens.service';
import { randomUUID } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private tokenService: TokenService,
    private refreshTokenService: RefreshTokensService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findOneByEmail(email);

    if (!user) return null;

    const isPasswordValid = bcrypt.compare(password, user.password);

    if (!isPasswordValid) return null;

    const { password: userPassword, ...result } = user;

    return result;
  }

  async login(user: User, deviceId: string | undefined) {
    const device = deviceId ?? randomUUID();
    const accessToken = await this.tokenService.generateAccessToken(user);
    const refreshToken = await this.tokenService.generateRefreshToken({
      ...user,
      device,
    });

    await this.refreshTokenService.save(
      user.id,
      refreshToken.token,
      device,
      refreshToken.expireTime,
    );

    return {
      user,
      accessToken: accessToken.token,
      accessTokenExpiresIn: accessToken.expireTime,
      refreshToken: refreshToken.token,
      refreshTokenExpiresIn: refreshToken.expireTime,
      deviceId: device,
    };
  }

  async refresh(refreshToken: string) {
    const payload = this.tokenService.verifyRefreshToken(refreshToken);

    if (!payload) throw new UnauthorizedException('1 Invalid refresh token');

    const tokenData = await this.refreshTokenService.findOne(
      payload.id,
      payload.device,
    );

    if (!tokenData) throw new UnauthorizedException('2 Invalid refresh token');

    const isValid = bcrypt.compare(refreshToken, tokenData.token);

    if (!isValid) throw new UnauthorizedException('3 Invalid refresh token');

    const user = await this.usersService.findOne(payload.id);

    if (!user) throw new UnauthorizedException('4 Invalid refresh token');

    return this.login(user, tokenData.device ?? '');
  }
}
