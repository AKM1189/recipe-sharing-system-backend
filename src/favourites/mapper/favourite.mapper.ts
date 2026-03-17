import { ImageService } from '@/image/image.service';
import { mapRecipesToListDto } from '@/recipes/recipe.mapper';

export function mapFavouritesToRecipesDto(
  favourites: any[],
  imageService: ImageService,
) {
  const recipes = favourites.map((fav) => fav.recipe);

  return mapRecipesToListDto(recipes, imageService);
}
