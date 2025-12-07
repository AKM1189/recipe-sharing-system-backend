import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { TokenService } from './token.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportAuthController } from './passport-auth.controller';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  providers: [AuthService, TokenService, LocalStrategy, JwtStrategy],
  controllers: [PassportAuthController],
  imports: [
    UsersModule,
    JwtModule.register({
      global: true,
    }),
  ],
})
export class AuthModule {}
