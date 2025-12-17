import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  MinLength,
} from 'class-validator';

export class SignupDto {
  @IsString()
  @MinLength(3)
  @IsNotEmpty()
  @ApiProperty({ description: 'username' })
  name: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ description: 'user email' })
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
  @ApiProperty({ description: 'user password' })
  password: string;
}
