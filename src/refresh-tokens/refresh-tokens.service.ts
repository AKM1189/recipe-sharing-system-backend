import { Injectable } from '@nestjs/common';
import { User } from 'src/auth/interfaces/auth.interface';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class RefreshTokensService {
  constructor(private prisma: PrismaService) {}

  async findOne(userId: string, device: string) {
    return await this.prisma.refreshToken.findUnique({
      where: {
        userId_device: {
          userId,
          device,
        },
      },
      select: {
        token: true,
        userId: true,
        device: true,
      },
    });
  }

  async save(
    userId: string,
    token: string,
    deviceId: string,
    expireTime: Date,
  ) {
    try {
      const hashedToken = await bcrypt.hash(token, 10);
      return await this.prisma.refreshToken.upsert({
        where: {
          userId_device: {
            userId,
            device: deviceId,
          },
        },
        update: {
          token: hashedToken,
          device: deviceId,
          exipresAt: expireTime,
        },
        create: {
          userId: userId,
          token: hashedToken,
          device: deviceId,
          exipresAt: expireTime,
        },
      });
    } catch (error) {
      throw new Error(error);
    }
  }
}
