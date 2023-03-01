import { IsString } from 'class-validator';

import { ScormBaseValueDTO } from './base-value.dto';

export class ScormTerminateDTO extends ScormBaseValueDTO {
  @IsString()
  public course_identifier: string;

  @IsString()
  public resource_identifier: string;
}
