// recipe.mapper.ts
import { CloudinaryService } from 'src/image/upload-services/cloudinary.service';
import { RecipeListResponseDto } from './dto/recipe-list.dto';
import {
  RecipeResponseDto,
  ReviewDto,
  StepDto,
} from './dto/recipe-response.dto';
import { generatePublicImageUrl } from 'src/utils/imageHandler';

// export function toRecipeResponseDto(
//   recipes: any[] | any,
//   cloudinaryService: CloudinaryService,
// ): RecipeListResponseDto[] | RecipeListResponseDto {
//   if (Array.isArray(recipes)) {
//     return recipes.map((recipe) => mapSingleRecipe(recipe, cloudinaryService));
//   }
//   return mapSingleRecipe(recipes, cloudinaryService);
// }

// function mapSingleRecipe(
//   recipe: any,
//   cloudinaryService: CloudinaryService,
// ): RecipeListResponseDto {
//   return {
//     id: recipe.id,
//     title: recipe.title,
//     description: recipe.description,
//     cookingTime: recipe.cookingTime,
//     serving: recipe.serving,
//     difficulty: recipe.difficulty,
//     status: recipe.status,
//     rating: recipe.rating,
//     createdAt: recipe.createdAt,
//     updatedAt: recipe.updatedAt ?? null,
//     userId: recipe.userId,
//     imageUrl: recipe.imageUrl
//       ? cloudinaryService.getPublicUrl(recipe.imageUrl) // compute Cloudinary URL
//       : null,
//     categories: recipe.categories,
//   };
// }

export function mapRecipeToResponseDto(
  recipe: any,
  cloudinaryService: CloudinaryService,
): RecipeResponseDto {
  return {
    ...recipe,
    imageUrl: recipe.imageUrl
      ? cloudinaryService.getPublicUrl(recipe.imageUrl)
      : null,
    ratingCount: recipe.reviews.filter((review: ReviewDto) => review.rating)
      .length,
    categories: recipe.categories || [],
    ingredients: recipe.ingredients || [],
    steps:
      recipe.steps.map((step: StepDto) => ({
        ...step,
        imageUrl: generatePublicImageUrl(step.imageUrl, cloudinaryService),
      })) || [],
    user: {
      ...recipe.user,
      profileUrl: generatePublicImageUrl(
        recipe.user.profileUrl,
        cloudinaryService,
      ),
    },
  };
}

export function mapRecipesToListDto(
  recipes: any[],
  cloudinaryService: CloudinaryService,
): RecipeListResponseDto[] {
  return recipes.map((recipe) => ({
    ...recipe,
    imageUrl: generatePublicImageUrl(recipe.imageUrl, cloudinaryService),
    categories: recipe.categories || [],
  }));
}
