import { MiddlewareConsumer, Module } from '@nestjs/common';

import { DatabaseModule } from './database/database.module';
import { HealthzModule } from './healthz/healthz.module';
import { LoggerModule } from './logger/logger.module';
import { LoggerMiddleware } from './logger/logger.middleware';
import { CoreModule } from './core/core.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [LoggerModule, HealthzModule, DatabaseModule, CoreModule, UploadModule],
  controllers: [],
  providers: [],
})
export class AppModule {
  public configure(consumer: MiddlewareConsumer): void | MiddlewareConsumer {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
