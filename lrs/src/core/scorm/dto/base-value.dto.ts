import { IsUUID } from 'class-validator';

export class ScormBaseValueDTO {
  @IsUUID('4')
  public user_id: string;

  @IsUUID('4')
  public course_id: string;
}
