import { IsString } from 'class-validator';

import { ScormCourseBaseValueDTO } from './base-value.dto';

export class ScormCourseGetValueDTO extends ScormCourseBaseValueDTO {
  @IsString()
  public course_identifier: string;

  @IsString()
  public resource_identifier: string;

  @IsString()
  public variable: string;
}
