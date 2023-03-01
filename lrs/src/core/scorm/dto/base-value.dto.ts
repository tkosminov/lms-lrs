import { IsEnum, IsUUID } from 'class-validator';

export enum EScormType {
  SCORM = 'API',
  SCORM_2004 = 'API_1484_11',
}

export class ScormBaseValueDTO {
  @IsUUID('4')
  public user_id: string;

  @IsUUID('4')
  public course_id: string;

  @IsEnum(EScormType)
  public scorm_type: EScormType;
}
