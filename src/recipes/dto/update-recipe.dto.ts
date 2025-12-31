import { IsArray, IsOptional } from 'class-validator';
import { CreateRecipeDto } from './create-recipe.dto';

export class UpdateRecipeDto extends CreateRecipeDto {
  @IsArray()
  @IsOptional()
  deletedSteps: string[];

  @IsArray()
  @IsOptional()
  deletedIngredients: string[];
}
