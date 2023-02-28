import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import config from 'config';
import cookieParser from 'cookie-parser';
import express from 'express';
import helmet from 'helmet';
import { json, urlencoded } from 'body-parser';
import { DataSourceOptions } from 'typeorm';
import { createDatabase } from 'typeorm-extension';

import { AppModule } from './app.module';
import { cors_options_delegate } from './cors.options';
import { HttpExceptionFilter } from './filters/exception.filter';
import { getOrmConfig } from './database/database-ormconfig.constant';

const app_settings = config.get<IAppSettings>('APP_SETTINGS');

async function bootstrap() {
  await createDatabase({ options: getOrmConfig() as DataSourceOptions, ifNotExist: true });

  const server = express();

  const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
    bodyParser: true,
  });

  app.use(json({ limit: app_settings.body_limit }));

  app.use(
    urlencoded({
      limit: app_settings.body_limit,
      extended: true,
      parameterLimit: app_settings.body_parameter_limit,
    })
  );

  app.use(
    helmet({
      contentSecurityPolicy: false,
    })
  );

  app.use(cookieParser());

  app.enableCors(cors_options_delegate);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    })
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  const options = new DocumentBuilder().setTitle('NestJS-Example').setVersion('1.0').build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('swagger', app, document);

  await app.listen(app_settings.port);
}

bootstrap();
