import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { XapiActivity } from './activity.entity';
import { XapiActivityService } from './activity.service';

@Module({
  imports: [TypeOrmModule.forFeature([XapiActivity])],
  providers: [XapiActivityService],
  exports: [XapiActivityService],
})
export class XapiActivityModule {}
