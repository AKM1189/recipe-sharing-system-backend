import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  Min,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 0,
    },
    {
      message:
        'Password should include at least minimum 8 characters, 1 lowercase, 1 uppercase, and 1 number.',
    },
  )
  @IsNotEmpty()
  password: string;
}
