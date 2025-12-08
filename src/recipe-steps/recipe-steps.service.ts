import { Injectable } from '@nestjs/common';
import { StepsPayload } from './interfaces/recipe-steps.interface';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RecipeStepsService {
  constructor(private prisma: PrismaService) {}

  async create(payload: StepsPayload[]) {
    if (!payload.length) return null;
    return await this.prisma.recipeStep.createMany({
      data: payload,
      skipDuplicates: true,
    });
  }
}
