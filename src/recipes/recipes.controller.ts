import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  UseInterceptors,
  UploadedFiles,
  UseGuards,
  ParseIntPipe,
  HttpException,
  Put,
} from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { sendResponse } from 'src/common/api-response';

@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Get()
  async getRecipes() {
    const recipes = await this.recipesService.recipes();
    return sendResponse(200, recipes);
  }

  @Get('category/:category')
  async getRecipesByCategory(@Param('category') category: string) {
    const recipes = await this.recipesService.recipesByCategory(category);
    return sendResponse(200, recipes);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user')
  async getRecipesByUser(@Request() request) {
    const recipes = await this.recipesService.recipesByUser(request.user.id);
    return sendResponse(200, recipes);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(AnyFilesInterceptor())
  create(
    @Body() createRecipeDto,
    @Request() request,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5_000_000 }),
          new FileTypeValidator({
            fileType: /(jpg|jpeg|png|webp)$/,
          }),
        ],
        fileIsRequired: false, // allow recipe without image
      }),
    )
    files: Array<Express.Multer.File>,
  ) {
    const recipe = this.recipesService.create(
      createRecipeDto,
      request.user,
      files,
    );
    return sendResponse(200, recipe, 'Recipe added successfully.');
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const recipe = await this.recipesService.findOne(+id);
    console.log('recipe', recipe);
    if (!recipe) throw new HttpException('Recipe not found', 404);
    const data = {
      ...recipe,
      ratingCount: recipe.reviews.filter((review) => review.rating).length,
    };
    return sendResponse(200, data);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(AnyFilesInterceptor())
  update(
    @Param('id') id: string,
    @Body() updateRecipeDto: UpdateRecipeDto,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5_000_000 }),
          new FileTypeValidator({
            fileType: /(jpg|jpeg|png|webp)$/,
          }),
        ],
        fileIsRequired: false, // allow recipe without image
      }),
    )
    files: Array<Express.Multer.File>,
  ) {
    console.log('update dto', updateRecipeDto);
    return this.recipesService.update(+id, updateRecipeDto, files);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.recipesService.remove(+id);
  }
}
