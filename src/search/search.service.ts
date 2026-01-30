// search.service.ts
import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SearchService {
  //   private openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  //   constructor(private prisma: PrismaService) {}
  //   async searchRecipes(query: string) {
  //     // 1. Convert user search text into a math vector
  //     const embeddingResponse = await this.openai.embeddings.create({
  //       model: 'text-embedding-3-small',
  //       input: query,
  //     });
  //     const vector = embeddingResponse.data[0].embedding;
  //     // 2. Query Prisma using Cosine Distance
  //     // We use $queryRaw because Prisma doesn't support the <=> operator natively yet
  //     // const results = await this.prisma.$queryRaw`
  //     //   SELECT id, title, description,
  //     //          1 - (embedding <=> ${vector}::vector) AS score
  //     //   FROM "Recipe"
  //     //   WHERE status = 'PUBLISHED'
  //     //   ORDER BY score DESC
  //     //   LIMIT 10;
  //     // `;
  //     const results = await this.prisma.$queryRaw`
  // SELECT r.*,
  //        1 - (s.embedding <=> ${vector}::vector) AS similarity
  // FROM "RecipeSearchIndex" s
  // JOIN "Recipe" r ON r.id = s.recipeId
  // WHERE r.status = 'PUBLISHED'
  // ORDER BY s.embedding <=> ${vector}
  // LIMIT 20;
  // `;
  //     return results;
  //   }
}
