import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  Query,
  Request,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { sendResponse } from 'src/common/api-response';
import { UsersService } from './users.service';
import { UpdateEmailDto } from './dto/update-email.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('profileImage'))
  @Post(':id/profile/update')
  async updateProfile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5_000_000 }),
          new FileTypeValidator({
            fileType: /(jpg|jpeg|png|webp)$/,
          }),
        ],
        fileIsRequired: false, // allow recipe without image
      }),
    )
    file: Express.Multer.File,
    @Request() request,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    const { user } = request;
    if (!user) throw new UnauthorizedException('Unauthorized');

    const updatedUser = await this.usersService.updateProfile(
      user.id,
      updateProfileDto,
      file,
    );
    return sendResponse(200, updatedUser);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/email/update')
  async requestEmailChange(
    @Request() request,
    @Body() updateEmailDto: UpdateEmailDto,
  ) {
    const { user } = request;
    if (!user) throw new UnauthorizedException('Unauthorized');

    await this.usersService.requestEmailChange(user.id, updateEmailDto);
    return sendResponse(
      200,
      null,
      'A verification email sent to your new email.',
    );
  }

  @Get('change-email-confirm')
  async confirm(@Query('token') token: string) {
    return this.usersService.confirmEmailChange(token);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/password/update')
  async changePassword(@Request() request, @Body() dto: ChangePasswordDto) {
    const { user } = request;
    if (!user) throw new UnauthorizedException('Unauthorized');

    const updatedUser = await this.usersService.changePassword(user.id, dto);
    return sendResponse(200, updatedUser);
  }
}
