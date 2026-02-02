import { Injectable } from '@nestjs/common';
import { CloudinaryService } from './upload-services/cloudinary.service';

@Injectable()
export class ImageService extends CloudinaryService {}
