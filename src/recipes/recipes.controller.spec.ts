import { Test, TestingModule } from '@nestjs/testing';
import { RecipesController } from './recipes.controller';
import { RecipesService } from './recipes.service';
import { ImageService } from '../image/image.service';
import { sendResponse } from '../common/api-response';

describe('RecipesController', () => {
  let controller: RecipesController;
  let recipesService: jest.Mocked<RecipesService>;

  const imageServiceMock = {
    getPublicUrl: jest.fn((key: string) => `https://cdn.test/${key}`),
  } as unknown as ImageService;

  const recipesServiceMock = {
    recipes: jest.fn(),
    search: jest.fn(),
  } as unknown as jest.Mocked<RecipesService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecipesController],
      providers: [
        {
          provide: RecipesService,
          useValue: recipesServiceMock,
        },
        {
          provide: ImageService,
          useValue: imageServiceMock,
        },
      ],
    }).compile();

    controller = module.get<RecipesController>(RecipesController);
    recipesService = module.get(RecipesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('returns paginated recipes for the default listing route', async () => {
    recipesService.recipes.mockResolvedValue({
      items: [
        {
          id: 1,
          title: 'Tea',
          imageUrl: 'recipes/tea',
          categories: [],
        },
      ],
      meta: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    } as any);

    const result = await controller.getRecipes(undefined, {
      page: 1,
      limit: 10,
    });

    expect(recipesService.recipes).toHaveBeenCalledWith({ page: 1, limit: 10 });
    expect(result).toEqual(
      sendResponse(200, {
        items: [
          {
            id: 1,
            title: 'Tea',
            imageUrl: 'https://cdn.test/recipes/tea',
            categories: [],
          },
        ],
        meta: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      }),
    );
  });

  it('uses the search path when query is provided', async () => {
    recipesService.search.mockResolvedValue({
      items: [],
      meta: {
        page: 2,
        limit: 5,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: true,
      },
    } as any);

    await controller.getRecipes('cake', { page: 2, limit: 5 });

    expect(recipesService.search).toHaveBeenCalledWith('cake', {
      page: 2,
      limit: 5,
    });
  });
});
