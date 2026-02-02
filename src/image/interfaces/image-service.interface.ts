// image/interfaces/image-service.interface.ts
export interface IImageService {
  uploadPublicImage(file: Express.Multer.File, key?: string): Promise<string>;
  deleteImage(key: string): Promise<void>;
  getPublicUrl(key: string): string;
}
