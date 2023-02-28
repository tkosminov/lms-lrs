import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ScormCourse } from './course.entity';

@Injectable()
export class ScormCourseService {
  constructor(@InjectRepository(ScormCourse) public readonly repository: Repository<ScormCourse>) {}
}
