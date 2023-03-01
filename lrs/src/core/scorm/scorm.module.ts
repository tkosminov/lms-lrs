import { Module } from '@nestjs/common';

import { ScormCourseModule } from './course/course.module';
import { ScormResourceModule } from './resource/resource.module';
import { ScormStatementModule } from './statement/statement.module';
import { ScormStatementResultModule } from './statement-result/statement-result.module';
import { ScormController } from './scorm.controller';

@Module({
  imports: [ScormCourseModule, ScormResourceModule, ScormStatementModule, ScormStatementResultModule],
  providers: [],
  controllers: [ScormController],
  exports: [ScormCourseModule, ScormResourceModule, ScormStatementModule, ScormStatementResultModule],
})
export class ScormModule {}
