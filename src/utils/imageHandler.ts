import { CloudinaryService } from 'src/image/upload-services/cloudinary.service';

export const generatePublicImageUrl = (
  imageKey: string | null | undefined,
  cloudinaryService: CloudinaryService,
) => {
  if (!imageKey) return null;
  return cloudinaryService.getPublicUrl(imageKey);
};
