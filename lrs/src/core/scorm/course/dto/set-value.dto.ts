import { IsString } from 'class-validator';

import { ScormCourseGetValueDTO } from './get-value.dto';

export class ScormCourseSetValueDTO extends ScormCourseGetValueDTO {
  @IsString()
  public value: string;
}
