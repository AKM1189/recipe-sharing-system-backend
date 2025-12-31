import { Injectable } from '@nestjs/common';
import { IngredientsPayload } from './interfaces/recipe-ingredients.interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class RecipeIngredientsService {
  constructor(private prisma: PrismaService) {}

  async create(
    recipeId: number,
    payload: Omit<IngredientsPayload, 'id'>[],
    tx?: Prisma.TransactionClient,
  ) {
    if (!payload.length) return;
    const client = tx || this.prisma;

    return client.recipeIngredient.createMany({
      data: payload.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        recipeId,
      })),
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
          update: { quantity: item.quantity, unit: item.unit },
          create: { ...item, recipeId },
        }),
      ),
    );
  }

  async updateByRecipe(
    recipeId: number,
    payload: IngredientsPayload[],
    deletedIngredients: string[],
    tx?: Prisma.TransactionClient,
  ) {
    if (!payload) return;
    const client = tx || this.prisma;

    const toDelete =
      deletedIngredients?.length > 0
        ? deletedIngredients?.map((id) => parseInt(id))
        : [];
    console.log('to delete', deletedIngredients);
    if (toDelete.length > 0) {
      await client.recipeIngredient.deleteMany({
        where: { id: { in: toDelete } },
      });
    }

    // 4️⃣ Update or Create
    for (let i = 0; i < payload.length; i++) {
      const ingredient = payload[i];

      if (ingredient.id) {
        // UPDATE
        await client.recipeIngredient.update({
          where: { id: ingredient.id },
          data: {
            name: ingredient.name,
            quantity: ingredient.quantity,
            unit: ingredient.unit,
          },
        });
      } else {
        // CREATE
        await client.recipeIngredient.create({
          data: {
            name: ingredient.name,
            quantity: ingredient.quantity,
            unit: ingredient.unit,
            recipeId,
          },
        });
      }
    }
  }

  async deleteByRecipe(recipeId: number, tx?: Prisma.TransactionClient) {
    const client = tx || this.prisma;

    return client.recipeIngredient.deleteMany({
      where: { recipeId },
    });
  }
}
