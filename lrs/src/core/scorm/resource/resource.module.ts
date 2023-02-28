import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ScormResource } from './resource.entity';
import { ScormResourceService } from './resource.service';

@Module({
  imports: [TypeOrmModule.forFeature([ScormResource])],
  providers: [ScormResourceService],
  exports: [ScormResourceService],
})
export class ScormResourceModule {}
