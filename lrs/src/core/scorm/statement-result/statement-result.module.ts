import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ScormStatementResult } from './statement-result.entity';
import { ScormStatementResultService } from './statement-result.service';

@Module({
  imports: [TypeOrmModule.forFeature([ScormStatementResult])],
  providers: [ScormStatementResultService],
  exports: [ScormStatementResultService],
})
export class ScormStatementResultModule {}
