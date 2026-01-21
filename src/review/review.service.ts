import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { UserInterface } from 'src/users/interfaces/user.interface';
import { RecipesService } from 'src/recipes/recipes.service';

@Injectable()
export class ReviewService {
  constructor(
    private prisma: PrismaService,
    private recipeService: RecipesService,
  ) {}

  async create(
    recipeId: number,
    user: UserInterface,
    createReviewDto: CreateReviewDto,
  ) {
    const { rating, parentId } = createReviewDto;

    await this.findRecipe(recipeId);

    const existingReview = await this.prisma.review.findFirst({
      where: {
        recipeId,
        userId: user.id,
        parentId: null,
      },
    });

    if (existingReview && !existingReview.deleted && !parentId) {
      throw new BadRequestException('You have already reviewed this recipe');
    }

    if (parentId && rating) {
      throw new BadRequestException('Replies cannot have rating');
    }

    const payload = {
      recipeId,
      rating: createReviewDto.rating ?? null,
      description: createReviewDto.review,
      userId: user.id,
      parentId: parentId ?? null,
      // parent: {
      //   connect: { id: parentId },
      // },
      // recipe: {
      //   connect: { id: recipeId },
      // },
      // user: {
      //   connect: { id: user.id },
      // },
    };

    try {
      return await this.prisma.$transaction(async (tx) => {
        const review = await this.prisma.review.create({ data: payload });

        await this.recipeService.addRating(recipeId, tx);
        return review;
      });
    } catch (error) {
      throw error;
    }
  }

  async findByRecipe(recipeId: number) {
    await this.findRecipe(recipeId);

    return this.prisma.review.findMany({
      where: {
        recipeId,
      },
      include: {
        user: true,
        replies: {
          include: {
            user: true,
            replies: {
              include: {
                user: true,
                replies: true,
              },
            },
          },
        },
      },
    });
  }

  async update(id: number, recipeId: number, updateReviewDto: UpdateReviewDto) {
    const { parentId } = updateReviewDto;

    await this.findRecipe(recipeId);

    const payload = {
      recipeId,
      rating: updateReviewDto.rating,
      description: updateReviewDto.review,
      parentId: parentId ?? null,
    };
    try {
      return await this.prisma.$transaction(async (tx) => {
        const review = await this.prisma.review.update({
          data: payload,
          where: {
            id,
            recipeId,
          },
        });

        await this.recipeService.addRating(recipeId, tx);
        return review;
      });
    } catch (error) {
      throw error;
    }
  }

  async remove(id: number, recipeId: number) {
    await this.findRecipe(recipeId);
    return await this.prisma.$transaction(async (tx) => {
      const review = this.prisma.review.update({
        data: { deleted: true },
        where: { id, recipeId },
      });
      await this.recipeService.addRating(recipeId, tx);
      return review;
    });
  }

  async removeByRecipe(recipeId: number, tx: Prisma.TransactionClient) {
    await this.findRecipe(recipeId, tx);
    return tx.review.deleteMany({ where: { recipeId } });
  }

  async findRecipe(recipeId: number, tx?: Prisma.TransactionClient) {
    const client = tx || this.prisma;
    const recipe = await client.recipe.findUnique({
      where: { id: recipeId },
    });

    if (!recipe) throw new HttpException('Recipe not found', 404);
  }
}
