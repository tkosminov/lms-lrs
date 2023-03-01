import { IsDefined, Validate } from 'class-validator';

import { IsNumberOrString } from '../../../validation/string-or-number.validation';

import { ScormGetValueDTO } from './get-value.dto';

export class ScormSetValueDTO extends ScormGetValueDTO {
  @IsDefined()
  @Validate(IsNumberOrString)
  public value: string;
}
