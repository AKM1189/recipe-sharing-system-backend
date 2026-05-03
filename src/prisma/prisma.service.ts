import { Injectable, INestApplication, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const cert = process.env.DB_SSL_CA?.replace(/\\n/g, '\n');
    const tempDir = path.join(process.cwd(), 'temp');
    const certPath = path.join(tempDir, 'ca.pem');

    if (cert) {
      // 1. Check if directory exists, if not, create it
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      // 2. Write the file if it doesn't exist
      if (!fs.existsSync(certPath)) {
        fs.writeFileSync(certPath, cert);
      }
    }

    const databaseUrl = `${process.env.DATABASE_URL}?sslmode=require${
      cert ? `&sslrootcert=${certPath}` : ''
    }`;

    const adapter = new PrismaPg({
      connectionString: databaseUrl as string,
    });
    super({ adapter });
  }
  async onModuleInit() {
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    (this.$on as any)('beforeExit', async () => {
      await app.close();
    });
  }
}
