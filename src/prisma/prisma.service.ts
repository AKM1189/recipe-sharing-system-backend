import { Injectable, INestApplication, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const cert = process.env.DB_SSL_CA?.replace(/\\n/g, '\n');
    const certPath = '/tmp/ca.pem';

    if (cert && !fs.existsSync(certPath)) {
      fs.writeFileSync(certPath, cert);
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
