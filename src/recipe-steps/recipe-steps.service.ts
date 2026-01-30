import { Injectable } from '@nestjs/common';
import { StepsPayload } from './interfaces/recipe-steps.interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class RecipeStepsService {
  constructor(private prisma: PrismaService) {}

  findByRecipe(recipeId: number) {
    return this.prisma.recipeStep.findMany({
      where: { recipeId },
    });
  }

  async create(
    recipeId: number,
    payload: StepsPayload[],
    tx?: Prisma.TransactionClient,
  ) {
    if (!payload.length) return null;
    const client = tx || this.prisma;

    return await client.recipeStep.createMany({
      data: payload.map((item) => ({ ...item, recipeId })),
      skipDuplicates: true,
    });
  }

  async findOne(id: number) {
    return this.prisma.recipeStep.findUnique({ where: { id } });
  }

  async update(
    id: number,
    payload: StepsPayload,
    tx?: Prisma.TransactionClient,
  ) {
    if (!payload) return;
    const client = tx || this.prisma;

    return client.recipeStep.update({
      where: { id },
      data: {
        stepNumber: payload.stepNumber,
        title: payload.title,
        instruction: payload.instruction,
        imageUrl: payload.imageUrl ?? null,
      },
    });
  }

  async updateByRecipe(
    recipeId: number,
    payload: StepsPayload[],
    deletedSteps: string[],
    tx?: Prisma.TransactionClient,
  ) {
    if (!payload) return;
    const client = tx || this.prisma;

    const toDelete =
      deletedSteps?.length > 0 ? deletedSteps?.map((id) => parseInt(id)) : [];

    if (toDelete.length > 0) {
      await client.recipeStep.deleteMany({
        where: { id: { in: toDelete } },
      });
    }

    // 4️⃣ Update or Create
    for (let i = 0; i < payload.length; i++) {
      const step = payload[i];

      if (step.id) {
        // UPDATE
        await client.recipeStep.update({
          where: { id: step.id },
          data: {
            stepNumber: step.stepNumber,
            title: step.title,
            instruction: step.instruction,
            imageUrl: step.imageUrl ?? null,
          },
        });
      } else {
        // CREATE
        await client.recipeStep.create({
          data: {
            stepNumber: step.stepNumber,
            title: step.title,
            instruction: step.instruction,
            imageUrl: step.imageUrl ?? null,
            recipeId,
          },
        });
      }
    }
  }

  async deleteByRecipe(recipeId: number, tx?: Prisma.TransactionClient) {
    const client = tx || this.prisma;

    return await client.recipeStep.deleteMany({
      where: { recipeId },
    });
  }
}
