import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import { v4 as uuid } from 'uuid';
import { IImageService } from '../interfaces/image-service.interface';

@Injectable()
export class CloudinaryService implements IImageService {
  constructor() {
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      throw new Error('Missing Cloudinary environment variables');
    }

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  /**
   * Upload public image to Cloudinary
   * Returns public_id (store this in DB)
   */
  async uploadPublicImage(file: Express.Multer.File): Promise<string> {
    const publicId = `recipes/${uuid()}`;

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          public_id: publicId,
          folder: 'recipes',
          resource_type: 'image',
        },
        (error, result) => {
          if (error) return reject(error);
          if (result) resolve(result.public_id);
        },
      );

      Readable.from(file.buffer).pipe(uploadStream);
    });
  }

  /**
   * Delete image from Cloudinary
   */
  async deleteImage(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
  }

  /**
   * Optional helper: get public URL
   */
  getPublicUrl(publicId: string, options?: any): string {
    return cloudinary.url(publicId, {
      secure: true,
      ...options,
    });
  }
}
