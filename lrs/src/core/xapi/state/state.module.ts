import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { XapiState } from './state.entity';
import { XapiStateService } from './state.service';

@Module({
  imports: [TypeOrmModule.forFeature([XapiState])],
  providers: [XapiStateService],
  exports: [XapiStateService],
})
export class XapiStateModule {}
