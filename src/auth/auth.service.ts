import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { TokenService } from './TokenService';
import { User } from './interfaces/auth.interface';
import { RefreshTokensService } from 'src/refresh-tokens/refresh-tokens.service';
import { randomUUID } from 'crypto';
import { SignupDto } from './dto/signup.dto';
import { LogoutDto } from './dto/logout.dto';
import { TokenResponse } from 'src/users/interfaces/token.interface';

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

  async signup(dto: SignupDto) {
    const { email, password } = dto;
    const existingUser = await this.usersService.findOneByEmail(email);

    if (existingUser) {
      throw new BadRequestException('Email already exists!', {
        cause: new Error(),
        description: 'This email is already registered by another user.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    dto.password = hashedPassword;

    const user = await this.usersService.createUser(dto);

    return {
      message: 'Signup successful',
      user,
    };
  }

  async login(user: User, deviceId: string | undefined) {
    const { accessToken, refreshToken, device } = await this.generateTokens(
      user,
      deviceId,
    );

    return {
      message: 'Login Successful',
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

    const {
      accessToken,
      refreshToken: newRefreshToken,
      device,
    } = await this.generateTokens(user, tokenData.device);

    return {
      user,
      accessToken: accessToken.token,
      accessTokenExpiresIn: accessToken.expireTime,
      refreshToken: newRefreshToken.token,
      refreshTokenExpiresIn: newRefreshToken.expireTime,
      deviceId: device,
    };
  }

  async logout(userId: string, deviceId: string) {
    await this.refreshTokenService.delete(userId, deviceId);

    return {
      message: 'Logout Successful',
    };
  }

  async generateTokens(
    user: User,
    deviceId: string | undefined | null,
  ): Promise<{
    accessToken: TokenResponse;
    refreshToken: TokenResponse;
    device: string;
  }> {
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

    return { accessToken, refreshToken, device };
  }
}
