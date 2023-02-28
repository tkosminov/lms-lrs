import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ScormStatement } from './statement.entity';
import { ScormStatementService } from './statement.service';

@Module({
  imports: [TypeOrmModule.forFeature([ScormStatement])],
  providers: [ScormStatementService],
  exports: [ScormStatementService],
})
export class ScormStatementModule {}
