import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateReviewDto {
  @IsNumber()
  @IsOptional()
  rating: number;

  @IsString()
  @IsNotEmpty()
  review: string;

  @IsNumber()
  @IsOptional()
  parentId: number;
}
