import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotImplementedException,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import type { LoginInput } from './interfaces/user.interface';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UsersService } from 'src/users/users.service';

@Controller('auth')
export class PassportAuthController {
  constructor(
    private authService: AuthService,
    private userService: UsersService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Post('passport-login')
  login(@Request() request) {
    return this.authService.signIn(request.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('passport-me')
  getUserInto(@Request() request) {
    return this.userService.findOneById(request.user.id);
  }
}
