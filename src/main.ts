import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

process.env.TZ = 'UTC';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // <--- This MUST be true
      transformOptions: {
        enableImplicitConversion: true, // Allows automatic conversion of basic types
      },
    }),
  );
  // app.useGlobalFilters(new AllExceptionsFilter());

  app.enableCors({
    origin: [
      'http://localhost:5000', // Next.js dev
      'http://127.0.0.1:5000', // sometimes needed
      'https:Serv//your-frontend.com', // production
    ],
    credentials: true, // IMPORTANT for cookies
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads',
  });

  // swagger set up
  const config = new DocumentBuilder()
    .setTitle('Recipe Sharing System')
    .setDescription('The system API description')
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
