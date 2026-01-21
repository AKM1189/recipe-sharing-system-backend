import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { sendResponse } from 'src/common/api-response';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('recipes')
@UseGuards(JwtAuthGuard)
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post(':recipeId/reviews')
  async create(
    @Param('recipeId', ParseIntPipe) recipeId: number,
    @Request() request,
    @Body() createReviewDto: CreateReviewDto,
  ) {
    const review = await this.reviewService.create(
      recipeId,
      request.user,
      createReviewDto,
    );
    return sendResponse(200, review, 'Review added successfully!');
  }

  @Get(':recipeId/reviews')
  async findByRecipe(@Param('recipeId') recipeId: string) {
    const reviews = await this.reviewService.findByRecipe(+recipeId);
    return sendResponse(200, reviews);
  }

  @Put(':recipeId/reviews/:reviewId')
  async update(
    @Param('reviewId', ParseIntPipe) reviewId: number,
    @Param('recipeId', ParseIntPipe) recipeId: number,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    const review = await this.reviewService.update(
      reviewId,
      recipeId,
      updateReviewDto,
    );
    return sendResponse(200, review, 'Review updated successfully!');
  }

  @Delete(':recipeId/reviews/:id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Param('recipeId', ParseIntPipe) recipeId: number,
  ) {
    const review = await this.reviewService.remove(id, recipeId);
    return sendResponse(200, null, 'Review deleted successfully!');
  }
}
