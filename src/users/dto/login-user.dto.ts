import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginUserDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ description: 'user email' })
  email: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'user password' })
  password: string;
}
