import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LocalStorageService {
  private readonly uploadRoot = path.join(process.cwd(), 'uploads');

  constructor() {
    // Ensure base folder exists
    if (!fs.existsSync(this.uploadRoot)) {
      fs.mkdirSync(this.uploadRoot, { recursive: true });
    }
  }

  async uploadPublicImage(file: Express.Multer.File): Promise<string> {
    const ext = path.extname(file.originalname);
    const filename = `${uuid()}${ext}`;
    const folder = path.join(this.uploadRoot, 'recipes');

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }

    const filePath = path.join(folder, filename);

    await fs.promises.writeFile(filePath, file.buffer);

    // Public URL
    return `/uploads/recipes/${filename}`;
  }

  async deleteImage(relativePath: string): Promise<void> {
    const fullPath = path.join(process.cwd(), relativePath);

    if (fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath);
    }
  }
}
