import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // <-- makes PrismaService available everywhere
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // <-- allows other modules to use PrismaService
})
export class PrismaModule {}
