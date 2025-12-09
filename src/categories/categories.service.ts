import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoriesPayload } from './interfaces/categories.interface';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(payload: CategoriesPayload[]) {
    if (!payload.length) return null;
    return await this.prisma.category.createMany({
      data: payload,
      skipDuplicates: true,
    });
  }
}
