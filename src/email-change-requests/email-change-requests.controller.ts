import { Controller } from '@nestjs/common';
import { EmailChangeRequestsService } from './email-change-requests.service';

@Controller('email-change-requests')
export class EmailChangeRequestsController {
  constructor(private readonly emailChangeRequestsService: EmailChangeRequestsService) {}
}
