import { IsString } from 'class-validator';

import { ScormTerminateDTO } from './terminate.dto';

export class ScormGetValueDTO extends ScormTerminateDTO {
  @IsString()
  public variable: string;
}
