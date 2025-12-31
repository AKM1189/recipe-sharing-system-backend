import { Controller, Get } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { sendResponse } from 'src/common/api-response';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async getCategories() {
    const categories = await this.categoriesService.getMany();
    return sendResponse(200, categories);
  }
}
