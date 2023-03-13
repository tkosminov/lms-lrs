import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { XapiStatement } from './statement.entity';
import { XapiStatementService } from './statement.service';

@Module({
  imports: [TypeOrmModule.forFeature([XapiStatement])],
  providers: [XapiStatementService],
  exports: [XapiStatementService],
})
export class XapiStatementModule {}
