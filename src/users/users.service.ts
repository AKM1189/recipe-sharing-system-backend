import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma.service';
import { CreateResponse, LoginResponse } from './interfaces/user.interface';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';
import { TokenService } from './TokenService';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private tokenService: TokenService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<CreateResponse> {
    const { email, password } = createUserDto;
    const existingUser = await this.prisma.user.findFirst({
      where: { email: email },
    });
    if (existingUser) {
      throw new BadRequestException('Email already exists!', {
        cause: new Error(),
        description: 'This email is already registered by another user.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    createUserDto.password = hashedPassword;

    return this.prisma.user.create({
      data: createUserDto,
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
    console.log('decode', decode);
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
