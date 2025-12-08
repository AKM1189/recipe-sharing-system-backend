import { Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from './TokenService';
import { User } from './interfaces/auth.interface';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private tokenService: TokenService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findOneByEmail(email);

    if (!user) return null;

    const isPasswordValid = bcrypt.compare(password, user.password);

    if (!isPasswordValid) return null;

    const { password: userPassword, ...result } = user;

    return result;
  }

  async login(user: User) {
    const accessToken = await this.tokenService.generateAccessToken(user);
    const refreshToken = await this.tokenService.generateRefreshToken(user);
    return {
      user,
      accessToken: accessToken.token,
      accessTokenExpiresIn: accessToken.expireTime,
      refreshToken: refreshToken.token,
      refreshTokenExpiresIn: refreshToken.expireTime,
    };
  }
}
