import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class UpdateEmailDto {
  @IsEmail()
  @IsNotEmpty()
  oldEmail: string;

  @IsEmail()
  @IsNotEmpty()
  newEmail: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
