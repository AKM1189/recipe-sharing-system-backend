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
  Query,
  BadRequestException,
} from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { sendResponse } from 'src/common/api-response';
import { Recipe } from '@prisma/client';
import { mapRecipesToListDto, mapRecipeToResponseDto } from './recipe.mapper';
import { ImageService } from 'src/image/image.service';

@Controller('recipes')
export class RecipesController {
  constructor(
    private readonly recipesService: RecipesService,
    private readonly imageService: ImageService,
  ) {}

  @Get()
  async getRecipes(@Query('query') query: string) {
    let recipes: unknown = [];
    if (!query) {
      recipes = await this.recipesService.recipes();
    } else {
      recipes = (await this.recipesService.search(query)) ?? [];
    }

    if (Array.isArray(recipes) && recipes.length > 0) {
      recipes = mapRecipesToListDto(recipes, this.imageService);
    }
    return sendResponse(200, recipes);
  }

  @Get('category/:category')
  async getRecipesByCategory(@Param('category') category: string) {
    const recipes = await this.recipesService.recipesByCategory(category);
    const data = mapRecipesToListDto(recipes, this.imageService);

    return sendResponse(200, data);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user')
  async getRecipesByUser(@Request() request) {
    const recipes = await this.recipesService.recipesByUser(request.user.id);
    const data = mapRecipesToListDto(recipes, this.imageService);
    return sendResponse(200, data);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    AnyFilesInterceptor({
      limits: {
        files: 10,
        fileSize: 5 * 1024 * 1024, // 5MB each
      },
    }),
  )
  async create(
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
    const recipe = await this.recipesService.create(
      createRecipeDto,
      request.user,
      files,
    );
    return sendResponse(200, recipe, 'Recipe created successfully.');
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const recipe = await this.recipesService.findOne(+id);
    if (!recipe) throw new HttpException('Recipe not found', 404);
    const data = mapRecipeToResponseDto(recipe, this.imageService);
    return sendResponse(200, data);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(AnyFilesInterceptor())
  async update(
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
    return this.recipesService.update(+id, updateRecipeDto, files);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Request() request) {
    return this.recipesService.remove(+id, request.user);
  }
}
