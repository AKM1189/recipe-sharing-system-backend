import { Test, TestingModule } from '@nestjs/testing';
import { FavouriteController } from './favourites.controller';
import { FavouriteService } from './favourites.service';

describe('FavouriteController', () => {
  let controller: FavouriteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FavouriteController],
      providers: [FavouriteService],
    }).compile();

    controller = module.get<FavouriteController>(FavouriteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
