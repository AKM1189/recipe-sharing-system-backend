import { Injectable } from '@nestjs/common';
import { RequestPayload } from './interfaces/email-change-requests.interface';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class EmailChangeRequestsService {
  constructor(private prisma: PrismaService) {}

  findOne(token: string) {
    return this.prisma.emailChangeRequest.findUnique({ where: { token } });
  }

  create(payload: RequestPayload) {
    return this.prisma.emailChangeRequest.create({
      data: payload,
    });
  }

  delete(id: number) {
    return this.prisma.emailChangeRequest.delete({
      where: { id },
    });
  }
}
