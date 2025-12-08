import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TokenService } from './TokenService';

@Module({
  controllers: [UsersController],
  providers: [UsersService, TokenService],
})
export class UsersModule {}
