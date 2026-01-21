import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  oldPassword: string;

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
  newPassword: string;
}
