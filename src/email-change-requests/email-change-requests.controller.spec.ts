import { Test, TestingModule } from '@nestjs/testing';
import { EmailChangeRequestsController } from './email-change-requests.controller';
import { EmailChangeRequestsService } from './email-change-requests.service';

describe('EmailChangeRequestsController', () => {
  let controller: EmailChangeRequestsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmailChangeRequestsController],
      providers: [EmailChangeRequestsService],
    }).compile();

    controller = module.get<EmailChangeRequestsController>(EmailChangeRequestsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
