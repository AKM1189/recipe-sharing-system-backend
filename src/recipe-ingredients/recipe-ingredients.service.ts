import { Injectable } from '@nestjs/common';
import { IngredientsPayload } from './interfaces/recipe-ingredients.interface';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RecipeIngredientsService {
  constructor(private prisma: PrismaService) {}

  async create(recipeId: number, payload: IngredientsPayload[]) {
    if (!payload.length) return;

    return this.prisma.recipeIngredient.createMany({
      data: payload.map((item) => ({ ...item, recipeId })),
      skipDuplicates: true,
    });
  }

  async update(recipeId: number, payload: IngredientsPayload[]) {
    if (!payload.length) return;

    return await Promise.all(
      payload.map((item) =>
        this.prisma.recipeIngredient.upsert({
          where: {
            name_recipeId: {
              name: item.name,
              recipeId: recipeId,
            },
          },
          update: { quantity: item.quantity },
          create: { ...item, recipeId },
        }),
      ),
    );
  }
}
