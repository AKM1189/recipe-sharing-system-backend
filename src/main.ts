import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { setDefaultAutoSelectFamilyAttemptTimeout } from 'net';
import { Agent, setGlobalDispatcher } from 'undici';

process.env.TZ = 'UTC';

// 1. Prevent DNS "hanging" (crucial for some ISP configurations)
setDefaultAutoSelectFamilyAttemptTimeout(500);

// 2. Globally override the 10s connection limit to 30s
setGlobalDispatcher(
  new Agent({
    connect: { timeout: 30000 },
  }),
);

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
    origin: (origin, callback) => {
      const allowedOrigins = [
        'http://localhost:5000',
        'https://recipixa.vercel.app',
      ];

      // Allow origins that end with .vercel.app or are in the allowed list
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app')
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // app.useStaticAssets(join(process.cwd(), 'uploads'), {
  //   prefix: '/uploads',
  // });

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
