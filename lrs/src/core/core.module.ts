import { Module } from '@nestjs/common';

import { ActorModule } from './actor/actor.module';
import { ScormModule } from './scorm/scorm.module';

@Module({
  imports: [ActorModule, ScormModule],
  providers: [],
  exports: [ScormModule],
})
export class CoreModule {}
