import { ImageService } from 'src/image/image.service';
import { mapRecipesToListDto } from 'src/recipes/recipe.mapper';

export function mapFavouritesToRecipesDto(
  favourites: any[],
  imageService: ImageService,
) {
  const recipes = favourites.map((fav) => fav.recipe);

  return mapRecipesToListDto(recipes, imageService);
}
