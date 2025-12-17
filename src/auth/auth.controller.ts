import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
  UseGuards,
  NotImplementedException,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { SignupDto } from './dto/signup.dto';
import { LogoutDto } from './dto/logout.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('signup')
  signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Request() request, @Body() body) {
    return this.authService.login(request.user, body?.deviceId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Request() request, @Body() dto: LogoutDto) {
    return this.authService.logout(request.user.id, dto.deviceId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/me')
  async getProfile(@Request() request) {
    return request.user;
  }

  @UseGuards(JwtAuthGuard)
  @Post('/refresh')
  async refresh(@Body() body) {
    return this.authService.refresh(body.refreshToken);
  }
}
