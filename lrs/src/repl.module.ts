import { Module } from '@nestjs/common';

import { DatabaseModule } from './database/database.module';
import { HealthzModule } from './healthz/healthz.module';
import { LoggerModule } from './logger/logger.module';
import { CoreModule } from './core/core.module';

@Module({
  imports: [LoggerModule, HealthzModule, DatabaseModule, CoreModule],
  controllers: [],
  providers: [],
})
export class ReplModule {}
