import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { EmailChangeRequestsModule } from 'src/email-change-requests/email-change-requests.module';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
  imports: [EmailChangeRequestsModule],
})
export class UsersModule {}
