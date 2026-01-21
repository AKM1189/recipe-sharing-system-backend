import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FavouriteService {
  constructor(private prisma: PrismaService) {}

  getFavouritesByUser(userId: string) {
    return this.prisma.favourite.findMany({
      where: { userId },
    });
  }

  getFavouriteRecipesByUser(userId: string) {
    return this.prisma.favourite.findMany({
      where: { userId },
      select: {
        recipe: {
          include: {
            categories: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });
  }

  getFavouritesByRecipe(recipeId: number) {
    return this.prisma.favourite.findMany({
      where: { recipeId },
    });
  }

  addToFavourite(userId: string, recipeId: number) {
    return this.prisma.favourite.create({
      data: {
        userId,
        recipeId,
      },
    });
  }

  removeFromFavourite(userId: string, recipeId: number) {
    return this.prisma.favourite.delete({
      where: {
        userId_recipeId: {
          userId,
          recipeId,
        },
      },
    });
  }
}
