import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
} from '@nestjs/common';
import { LocalStorageService } from './local-storage.service';

@Controller('images')
export class ImagesController {
  constructor(private readonly imageService: LocalStorageService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5_000_000 }),
          new FileTypeValidator({
            fileType: /(jpg|jpeg|png|webp)$/,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    const imageKey = await this.imageService.uploadPublicImage(file);

    return {
      message: 'Image uploaded successfully',
      imageKey,
      // publicUrl: `${process.env.CDN_BASE_URL}/${imageKey}`,
      publicUrl: `http://localhost:${process.env.PORT}/${imageKey}`,
    };
  }
}
