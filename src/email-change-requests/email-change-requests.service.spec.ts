import { Test, TestingModule } from '@nestjs/testing';
import { EmailChangeRequestsService } from './email-change-requests.service';

describe('EmailChangeRequestsService', () => {
  let service: EmailChangeRequestsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailChangeRequestsService],
    }).compile();

    service = module.get<EmailChangeRequestsService>(EmailChangeRequestsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
