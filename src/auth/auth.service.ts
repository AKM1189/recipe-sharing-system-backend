import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { TokenService } from './token.service';
import {
  CreateResponse,
  LoginInput,
  LoginResponse,
} from './interfaces/user.interface';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private tokenService: TokenService,
  ) {}

  async validateUser(payload: LoginInput) {
    if (!payload) return null;

    const user = await this.userService.findOneByEmail(payload.email);

    if (!user) return null;

    const isPasswordValid = bcrypt.compare(payload.password, user.password);

    if (!isPasswordValid) return null;

    const { password, createdAt, updatedAt, ...result } = user;
    return result;
  }

  async login(payload: LoginInput): Promise<LoginResponse> {
    const user = await this.validateUser(payload);

    if (!user) throw new UnauthorizedException();

    const tokenPayload = {
      id: user.id,
      email: user.email,
    };

    const accessToken =
      await this.tokenService.generateAccessToken(tokenPayload);
    const refreshToken =
      await this.tokenService.generateRefreshToken(tokenPayload);

    return {
      user: user,
      accessToken: accessToken.token,
      refreshToken: refreshToken.token,
      accessTokenExpireTime: accessToken.expireTime,
      refreshTokenExpireTime: refreshToken.expireTime,
    };
  }

  async signIn(user: CreateResponse): Promise<LoginResponse> {
    const tokenPayload = {
      id: user.id,
      email: user.email,
    };

    const accessToken =
      await this.tokenService.generateAccessToken(tokenPayload);
    const refreshToken =
      await this.tokenService.generateRefreshToken(tokenPayload);

    return {
      user: user,
      accessToken: accessToken.token,
      refreshToken: refreshToken.token,
      accessTokenExpireTime: accessToken.expireTime,
      refreshTokenExpireTime: refreshToken.expireTime,
    };
  }
}
