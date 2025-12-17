import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  CreatePayload,
  CreateResponse,
  LoginResponse,
} from './interfaces/user.interface';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';
import { TokenService } from './TokenService';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private tokenService: TokenService,
  ) {}

  async createUser(payload: CreatePayload): Promise<CreateResponse> {
    return this.prisma.user.create({
      data: payload,
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
  }

  async login(loginUserDto: LoginUserDto): Promise<LoginResponse> {
    const { email, password } = loginUserDto;

    const existingUser = await this.prisma.user.findFirst({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
      },
    });

    if (!existingUser) {
      throw new UnauthorizedException('Invalid Credentials', {
        cause: new Error(),
        description: 'Invalid email or password',
      });
    }

    const isPasswordValid = bcrypt.compare(password, existingUser.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid Credentials', {
        cause: new Error(),
        description: 'Invalid email or password',
      });
    }

    const payload = {
      id: existingUser.id,
      name: existingUser.name,
      email: existingUser.email,
    };

    const accessToken = this.tokenService.generateAccessToken(payload);
    const refreshToken = this.tokenService.generateRefreshToken(payload);

    return {
      message: 'Login Successful',
      user: payload,
      accessToken: accessToken.token,
      refreshToken: refreshToken.token,
      accessTokenExpireTime: accessToken.expireTime,
      refreshTokenExpireTime: refreshToken.expireTime,
    };
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    const decode = this.tokenService.verifyRefreshToken(
      refreshTokenDto.refreshToken,
    );

    const existingUser = await this.prisma.user.findUnique({
      where: { id: decode.id },
    });

    if (!existingUser) {
      throw new UnauthorizedException();
    }

    const payload = {
      id: existingUser.id,
      name: existingUser.name,
      email: existingUser.email,
    };

    const accessToken = this.tokenService.generateAccessToken(payload);
    const refreshToken = this.tokenService.generateRefreshToken(payload);

    return {
      accessToken: accessToken.token,
      refreshToken: refreshToken.token,
      accessTokenExpireTime: accessToken.expireTime,
      refreshTokenExpireTime: refreshToken.expireTime,
    };
  }

  findOneById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
  }

  findOneByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
      },
    });
  }

  findAll() {
    return `This action returns all users`;
  }

  async findOne(id: string) {
    return await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
