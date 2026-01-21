import { Module } from '@nestjs/common';
import { EmailChangeRequestsService } from './email-change-requests.service';
import { EmailChangeRequestsController } from './email-change-requests.controller';

@Module({
  controllers: [EmailChangeRequestsController],
  providers: [EmailChangeRequestsService],
  exports: [EmailChangeRequestsService],
})
export class EmailChangeRequestsModule {}
