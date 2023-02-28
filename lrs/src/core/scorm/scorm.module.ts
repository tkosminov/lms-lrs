import { Module } from '@nestjs/common';

import { ScormCourseModule } from './course/course.module';
import { ScormResourceModule } from './resource/resource.module';
import { ScormStatementModule } from './statement/statement.module';

@Module({
  imports: [ScormCourseModule, ScormResourceModule, ScormStatementModule],
  providers: [],
  exports: [ScormCourseModule, ScormResourceModule, ScormStatementModule],
})
export class ScormModule {}
