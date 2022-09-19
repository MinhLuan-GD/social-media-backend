import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { v2 } from 'cloudinary';
import * as compression from 'compression';
import { AppModule } from '@/app.module';
import { corsOpts, compressionOpts, cloudinaryOpts } from '@config/sync.config';
import { HttpExceptionFilter } from '@exceptions/http-exception.filter';
import { MyLogger } from '@logger/logger.service';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: new MyLogger() });
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableCors(corsOpts);
  app.use(helmet());
  app.use(compression(compressionOpts));
  v2.config(cloudinaryOpts);
  await app.listen(process.env.PORT || 8000);
}
bootstrap();
