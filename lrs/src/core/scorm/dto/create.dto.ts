import { IsArray, IsString } from 'class-validator';

import { IScormItem } from '../course/course.entity';

export class ScormCreateDTO {
  @IsString()
  public hash_sum: string;

  @IsString()
  public identifier: string;

  @IsString()
  public title: string;

  @IsArray()
  public items: IScormItem[];
}
