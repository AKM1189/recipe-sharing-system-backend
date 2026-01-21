import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Optional } from '@nestjs/common';

export class UpdateProfileDto {
  @IsString()
  @MinLength(3)
  @IsNotEmpty()
  name: string;

  @IsString()
  @Optional()
  phoneNo: string;
}
