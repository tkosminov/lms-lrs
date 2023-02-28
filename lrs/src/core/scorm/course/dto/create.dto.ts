import { IsArray, IsString } from 'class-validator';
import { IItem } from '../course.entity';

export class ScormCourseCreateDTO {
  @IsString()
  public hash_sum: string;

  @IsString()
  public identifier: string;

  @IsString()
  public title: string;

  @IsArray()
  public items: IItem[];
}
