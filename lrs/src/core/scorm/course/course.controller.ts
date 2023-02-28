import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { DataSource } from 'typeorm';
import { v4 } from 'uuid';

import { Actor } from '../../actor/actor.entity';
import { ScormResource } from '../resource/resource.entity';
import { ScormStatement } from '../statement/statement.entity';
import { ScormCourse } from './course.entity';

import { ScormCourseCreateDTO } from './dto/create.dto';
import { ScormCourseGetValueDTO } from './dto/get-value.dto';
import { ScormCourseSetValueDTO } from './dto/set-value.dto';
import { ScormCourseBaseValueDTO } from './dto/base-value.dto';

@Controller('scorm')
export class ScormCourseController {
  constructor(private readonly dataSource: DataSource) {}

  @Get('courses')
  public async index() {
    return await this.dataSource.getRepository(ScormCourse).find({ order: { created_at: 'DESC' } });
  }

  @Get('courses/:id')
  public async show(@Param('id') id: string) {
    return await this.dataSource.getRepository(ScormCourse).findOne({ where: { id } });
  }

  @Post('get_value')
  public async getValue(@Body() data: ScormCourseGetValueDTO) {
    const actor = await this.findOrCreateActor(data.user_id);

    const course = await this.dataSource.getRepository(ScormCourse).findOne({ where: { id: data.course_id } });
    const resource = await this.dataSource
      .getRepository(ScormResource)
      .findOne({ where: { course_id: course.id, identifier: data.resource_identifier } });
    const statement = await this.dataSource
      .getRepository(ScormStatement)
      .findOne({ where: { resource_id: resource.id, actor_id: actor.id, variable: data.variable } });

    let value: string;

    if (statement) {
      value = statement.value;
    } else {
      value = await this.createFirstStatement(data.variable, resource.id, actor.id);
    }

    return { variable: data.variable, value };
  }

  @Post('set_value')
  public async setValue(@Body() data: ScormCourseSetValueDTO) {
    const actor = await this.findOrCreateActor(data.user_id);

    const course = await this.dataSource.getRepository(ScormCourse).findOne({ where: { id: data.course_id } });
    const resource = await this.dataSource
      .getRepository(ScormResource)
      .findOne({ where: { course_id: course.id, identifier: data.resource_identifier } });
    const statement = await this.dataSource
      .getRepository(ScormStatement)
      .findOne({ where: { resource_id: resource.id, actor_id: actor.id, variable: data.variable } });

    if (statement) {
      await this.dataSource.getRepository(ScormStatement).update(statement.id, { value: data.value });
    } else {
      await this.dataSource
        .getRepository(ScormStatement)
        .insert({ value: data.value, variable: data.variable, resource_id: resource.id, actor_id: actor.id });
    }

    return { variable: data.variable, value: data.value };
  }

  @Post('terminate')
  public async terminate(@Body() data: ScormCourseBaseValueDTO) {
    const actor = await this.findOrCreateActor(data.user_id);
    const course = await this.dataSource.getRepository(ScormCourse).findOne({ where: { id: data.course_id } });

    return '';
  }

  @Post('create')
  public async create(@Body() data: ScormCourseCreateDTO) {
    const course: Partial<ScormCourse> = {
      id: v4(),
      hash_sum: data.hash_sum,
      identifier: data.identifier,
      title: data.title,
      items: data.items,
    };

    const resources: Array<Partial<ScormResource>> = [];

    data.items.forEach((item) => {
      if (item.identifierref) {
        resources.push({
          id: v4(),
          course_id: course.id,
          identifier: item.identifierref,
        });
      }
    });

    await this.dataSource.getRepository(ScormCourse).insert(course);
    await this.dataSource.getRepository(ScormResource).insert(resources);

    return { course_id: course.id };
  }

  private async findOrCreateActor(user_id: string) {
    let actor = await this.dataSource.getRepository(Actor).findOne({ where: { user_id } });

    if (!actor) {
      await this.dataSource.getRepository(Actor).insert({ user_id });

      actor = await this.dataSource.getRepository(Actor).findOne({ where: { user_id } });
    }

    return actor;
  }

  private async createFirstStatement(variable: string, resource_id: string, actor_id: string) {
    let value: string;

    switch (variable) {
      case 'cmi.completion_status': // SCORM 2004
      case 'cmi.core.lesson_status': // SCORM 1.1, SCORM 1.2
        value = 'not attempted';

        break;
      case 'cmi.comments_from_learner._count':
      case 'cmi.comments_from_lms._count':
      case 'cmi.interactions._count':
      case 'cmi.objectives._count':
        value = '0';

        break;
      case 'cmi.location': // SCORM 2004
      case 'cmi.core.lesson_location': // SCORM 1.1, SCORM 1.2
      default:
        value = '';

        break;
    }

    await this.dataSource.getRepository(ScormStatement).insert({ value, variable, resource_id, actor_id });

    return value;
  }
}
