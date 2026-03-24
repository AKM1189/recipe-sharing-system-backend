import { Test, TestingModule } from '@nestjs/testing';
import { RecipesService } from './recipes.service';
import { PrismaService } from '../prisma/prisma.service';
import { RecipeIngredientsService } from '../recipe-ingredients/recipe-ingredients.service';
import { RecipeStepsService } from '../recipe-steps/recipe-steps.service';
import { CategoriesService } from '../categories/categories.service';
import { ImageService } from '../image/image.service';
import { EmbeddingService } from '../embedding/embedding.service';

describe('RecipesService', () => {
  let service: RecipesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecipesService,
        {
          provide: PrismaService,
          useValue: {},
        },
        {
          provide: RecipeIngredientsService,
          useValue: {},
        },
        {
          provide: RecipeStepsService,
          useValue: {},
        },
        {
          provide: CategoriesService,
          useValue: {},
        },
        {
          provide: ImageService,
          useValue: {},
        },
        {
          provide: EmbeddingService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<RecipesService>(RecipesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
