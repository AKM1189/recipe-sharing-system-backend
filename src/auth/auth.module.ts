import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { LocalStrategy } from './strategies/local.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { TokenService } from './TokenService';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshTokensModule } from 'src/refresh-tokens/refresh-tokens.module';
import { RefreshTokensService } from 'src/refresh-tokens/refresh-tokens.service';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({ global: true }),
    RefreshTokensModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    TokenService,
    RefreshTokensService,
  ],
})
export class AuthModule {}
