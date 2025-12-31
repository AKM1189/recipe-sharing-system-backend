import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoriesPayload } from './interfaces/categories.interface';
import { PrismaService } from 'src/prisma/prisma.service';
import slugify from 'slugify';
import { Category, Prisma } from '@prisma/client';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async getMany(params?: Prisma.CategoryFindManyArgs): Promise<Category[]> {
    return this.prisma.category.findMany({
      ...params,
    });
  }

  async create(payload: string[], tx: Prisma.TransactionClient) {
    if (!payload.length) return null;
    const data = this.generateSlug(payload);
    return Promise.all(
      data.map((category) =>
        tx.category.upsert({
          where: { name: category.name },
          update: {
            name: category.name,
            slug: category.slug,
          },
          create: {
            name: category.name,
            slug: category.slug,
          },
        }),
      ),
    );
  }

  async createWithRecipe(
    recipeId: number,
    payload: string[],
    tx: Prisma.TransactionClient,
  ) {
    if (!payload.length) return null;
    const data = this.generateSlug(payload);
    const categories = await Promise.all(
      data.map((category) =>
        tx.category.upsert({
          where: { name: category.name },
          update: {},
          create: {
            name: category.name,
            slug: category.slug,
          },
        }),
      ),
    );

    await tx.recipeCategories.createMany({
      data: categories.map((category) => ({
        recipeId: recipeId,
        categoryId: category.id,
      })),
      skipDuplicates: true,
    });
  }

  // async update(recipeId: number, payload: CategoriesPayload[]) {
  //   if (!payload.length) return;
  //   const data = await this.generateSlug(payload);

  //   return await Promise.all(
  //     payload.map((item) =>
  //       this.prisma.category.upsert({
  //         where: {
  //           name: item.name,
  //         },
  //         update: {},
  //         create: { ...item, recipeId },
  //       }),
  //     ),
  //   );
  // }

  private normalize(name: string) {
    return name.trim().toLowerCase();
  }

  private generateSlug(data: string[]) {
    return data.map((item) => {
      // const slug = item.name.toLowerCase().replace(' ', '_');
      return {
        name: this.normalize(item),
        slug: slugify(item),
      };
    });
  }
}
