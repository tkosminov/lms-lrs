import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Actor } from './actor.entity';
import { ActorService } from './actor.service';

@Module({
  imports: [TypeOrmModule.forFeature([Actor])],
  providers: [ActorService],
  exports: [ActorService],
})
export class ActorModule {}
