import { Injectable } from '@nestjs/common';
import { StepsPayload } from './interfaces/recipe-steps.interface';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RecipeStepsService {
  constructor(private prisma: PrismaService) {}

  async create(recipeId: number, payload: StepsPayload[]) {
    if (!payload.length) return null;
    return await this.prisma.recipeStep.createMany({
      data: payload.map((item) => ({ ...item, recipeId })),
      skipDuplicates: true,
    });
  }

  async update(recipeId: number, payload: StepsPayload[]) {
    if (!payload.length) return;

    return await Promise.all(
      payload.map((item) =>
        this.prisma.recipeStep.upsert({
          where: {
            stepNumber_recipeId: {
              stepNumber: item.stepNumber,
              recipeId: recipeId,
            },
          },
          update: { instruction: item.instruction, imageUrl: item.imageUrl },
          create: { ...item, recipeId },
        }),
      ),
    );
  }
}
