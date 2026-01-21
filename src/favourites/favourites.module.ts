import { Module } from '@nestjs/common';
import { FavouriteService } from './favourites.service';
import { FavouriteController } from './favourites.controller';

@Module({
  controllers: [FavouriteController],
  providers: [FavouriteService],
})
export class FavouriteModule {}
