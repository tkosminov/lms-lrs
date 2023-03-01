import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ScormCourse } from './course.entity';
import { ScormCourseService } from './course.service';

@Module({
  imports: [TypeOrmModule.forFeature([ScormCourse])],
  providers: [ScormCourseService],
  exports: [ScormCourseService],
})
export class ScormCourseModule {}
