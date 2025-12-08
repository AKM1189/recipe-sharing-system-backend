import { Injectable } from '@nestjs/common';
import { IngredientsPayload } from './interfaces/recipe-ingredients.interface';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class RecipeIngredientsService {
  constructor(private prisma: PrismaService) {}

  async create(payload: IngredientsPayload[]) {
    if (!payload.length) return;

    return this.prisma.recipeIngredient.createMany({
      data: payload,
      skipDuplicates: true,
    });
  }

  async update(payload: IngredientsPayload[]) {
    if (!payload.length) return;

    return this.prisma.recipeIngredient.createMany({
      data: payload,
      skipDuplicates: true,
    });
  }
}
