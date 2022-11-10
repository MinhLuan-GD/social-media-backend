import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { v2 as cloadinary } from 'cloudinary';
import * as compression from 'compression';
import helmet from 'helmet';
import { AppModule } from './app.module';
import {
  corsOpts,
  compressionOpts,
  cloudinaryOpts,
} from './config/sync.config';
import { HttpExceptionFilter } from './exceptions/http-exception.filter';
import { MyLogger } from './logger/logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: new MyLogger() });
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableCors(corsOpts);
  app.use(helmet());
  app.use(compression(compressionOpts));
  cloadinary.config(cloudinaryOpts);
  await app.listen(process.env.PORT || 8000);
}
bootstrap();
