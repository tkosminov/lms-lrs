import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { XapiVerb } from './verb.entity';
import { XapiVerbService } from './verb.service';

@Module({
  imports: [TypeOrmModule.forFeature([XapiVerb])],
  providers: [XapiVerbService],
  exports: [XapiVerbService],
})
export class XapiVerbModule {}
