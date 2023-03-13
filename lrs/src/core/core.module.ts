import { Module } from '@nestjs/common';

import { ActorModule } from './actor/actor.module';
import { ScormModule } from './scorm/scorm.module';
import { XapiModule } from './xapi/xapi.module';

@Module({
  imports: [ActorModule, ScormModule, XapiModule],
  providers: [],
  exports: [ScormModule, XapiModule],
})
export class CoreModule {}
