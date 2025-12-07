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
import { AuthGuard } from './guards/auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() payload: LoginInput) {
    return this.authService.login(payload);
  }

  @UseGuards(AuthGuard)
  @Get('me')
  getUserInto(@Request() request) {
    return request.user;
  }
}
