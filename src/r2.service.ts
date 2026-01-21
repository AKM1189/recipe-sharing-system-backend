import {
  PutObjectCommand,
  DeleteObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { NodeHttpHandler } from '@smithy/node-http-handler';
import { Agent } from 'https';

@Injectable()
export class R2Service {
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor() {
    if (
      !process.env.R2_ENDPOINT ||
      !process.env.R2_ACCESS_KEY_ID ||
      !process.env.R2_SECRET_ACCESS_KEY ||
      !process.env.R2_BUCKET_NAME
    ) {
      throw new Error('Missing R2 environment variables');
    }

    this.bucket = process.env.R2_BUCKET_NAME;

    this.client = new S3Client({
      region: 'auto',
      endpoint: process.env.R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
      requestHandler: new NodeHttpHandler({
        httpsAgent: new Agent({
          keepAlive: true,
          // Ensure we aren't using session tickets that might be corrupted
          maxCachedSessions: 0,
        }),
        // Force the use of HTTP/1.1 to avoid H2 frame corruption
      }),
    });
  }

  /**
   * Upload public image to R2
   * Returns the object key (store this in DB)
   */
  async uploadPublicImage(file: Express.Multer.File): Promise<string> {
    const key = `recipes/${uuid()}`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        CacheControl: 'public, max-age=31536000, immutable',
      }),
    );

    return key;
  }

  /**
   * Delete image from R2
   */
  async deleteImage(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }
}
