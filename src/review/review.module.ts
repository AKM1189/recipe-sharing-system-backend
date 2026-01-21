import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { RecipesModule } from 'src/recipes/recipes.module';

@Module({
  controllers: [ReviewController],
  providers: [ReviewService],
  imports: [RecipesModule],
})
export class ReviewModule {}
