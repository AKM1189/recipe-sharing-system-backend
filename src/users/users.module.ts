import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { EmailChangeRequestsModule } from 'src/email-change-requests/email-change-requests.module';
import { R2Service } from 'src/r2.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, R2Service],
  exports: [UsersService],
  imports: [EmailChangeRequestsModule],
})
export class UsersModule {}
