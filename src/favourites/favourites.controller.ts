import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { FavouriteService } from './favourites.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('favourites')
@UseGuards(JwtAuthGuard)
export class FavouriteController {
  constructor(private readonly favouriteService: FavouriteService) {}

  @Get('recipe/:recipeId')
  async getFavouritesByRecipe(
    @Param('recipeId', ParseIntPipe) recipeId: number,
  ) {
    return this.favouriteService.getFavouritesByRecipe(recipeId);
  }

  @Get('user')
  async getFavouritesByUser(@Request() request) {
    return this.favouriteService.getFavouritesByUser(request.user.id);
  }

  @Get('user/recipes')
  async getFavouriteRecipesByUser(@Request() request) {
    const favourites = await this.favouriteService.getFavouriteRecipesByUser(
      request.user.id,
    );
    return favourites.map((item) => item.recipe);
  }

  @Post('recipe/:recipeId')
  async addToFavourite(
    @Request() request,
    @Param('recipeId', ParseIntPipe) recipeId: number,
  ) {
    return this.favouriteService.addToFavourite(request.user.id, recipeId);
  }

  @Delete('recipe/:recipeId')
  async removeFromFavourite(
    @Request() request,
    @Param('recipeId', ParseIntPipe) recipeId: number,
  ) {
    return this.favouriteService.removeFromFavourite(request.user.id, recipeId);
  }
}
