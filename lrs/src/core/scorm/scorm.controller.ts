import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { DataSource } from 'typeorm';
import { v4 } from 'uuid';

import { Actor } from '../actor/actor.entity';

import { ScormResource } from './resource/resource.entity';
import { ScormStatement } from './statement/statement.entity';
import { IItem, ScormCourse } from './course/course.entity';

import { ScormCreateDTO } from './dto/create.dto';
import { ScormGetValueDTO } from './dto/get-value.dto';
import { ScormSetValueDTO } from './dto/set-value.dto';
import { ScormStatementResult } from './statement-result/statement-result.entity';

const integer_variables_regexp: RegExp[] = [
  new RegExp(/cmi\.location/gm),
  new RegExp(/cmi\.core\.lesson_location/gm),
  new RegExp(/adl\.data\._count/gm),
  new RegExp(/cmi\.objectives\._count/gm),
  new RegExp(/cmi\.interactions\._count/gm),
  new RegExp(/cmi\.interactions\.[0-9]+\.objectives\._count/gm),
  new RegExp(/cmi\.interactions\.[0-9]+\.correct_responses\._count/gm),
  new RegExp(/cmi\.comments_from_learner\._count /gm),
  new RegExp(/cmi\.comments_from_lms\._count /gm),
];

const float_variables_regexp: RegExp[] = [
  new RegExp(/cmi\.interactions\.[0-9]+\.weighting/gm),
  new RegExp(/cmi\.objectives\.[0-9]+\.score\.scaled/gm),
  new RegExp(/cmi\.objectives\.[0-9]+\.score\.raw/gm),
  new RegExp(/cmi\.objectives\.[0-9]+\.score\.min/gm),
  new RegExp(/cmi\.objectives\.[0-9]+\.score\.max/gm),
  new RegExp(/cmi\.objectives\.[0-9]+\.progress_measure/gm),
  new RegExp(/cmi\.progress_measure/gm),
  new RegExp(/cmi\.score\.scaled/gm),
  new RegExp(/cmi\.score\.raw/gm),
  new RegExp(/cmi\.score\.min/gm),
  new RegExp(/cmi\.score\.max/gm),
];

@Controller('scorm')
export class ScormController {
  constructor(private readonly dataSource: DataSource) {}

  @Get('courses')
  protected async index() {
    return await this.dataSource.getRepository(ScormCourse).find({ order: { created_at: 'DESC' } });
  }

  @Get('courses/:id')
  protected async show(@Param('id') id: string) {
    return await this.dataSource.getRepository(ScormCourse).findOne({ where: { id } });
  }

  @Post('create')
  protected async create(@Body() data: ScormCreateDTO) {
    const parsed_course: Partial<ScormCourse> = {
      id: v4(),
      hash_sum: data.hash_sum,
      identifier: data.identifier,
      title: data.title,
      items: data.items,
    };

    const parsed_resources: Array<Partial<ScormResource>> = [];
    const parsed_statements: Array<Partial<ScormStatement>> = [];

    for (const item of data.items) {
      const parsed_item = this.parseItemrecursive(item, parsed_course.id);

      parsed_resources.push(...parsed_item.parsed_resources);
      parsed_statements.push(...parsed_item.parsed_statements);
    }

    await this.dataSource.getRepository(ScormCourse).insert(parsed_course);
    await this.dataSource.getRepository(ScormResource).insert(parsed_resources);

    if (parsed_statements.length) {
      await this.dataSource.getRepository(ScormStatement).insert(parsed_statements);
    }

    return { course_id: parsed_course.id };
  }

  private parseItemrecursive(item: IItem, course_id: string) {
    const parsed_resources: Array<Partial<ScormResource>> = [];
    const parsed_statements: Array<Partial<ScormStatement>> = [];

    if (item.identifierref) {
      const parsed_resource = {
        id: v4(),
        course_id: course_id,
        identifier: item.identifier,
      };

      parsed_resources.push(parsed_resource);

      if (item.objective_ids?.length) {
        parsed_statements.push({
          resource_id: parsed_resource.id,
          variable: 'cmi.objectives._count',
          base_value: `${item.objective_ids.length}`,
        });

        item.objective_ids.forEach((objective_id, index) => {
          parsed_statements.push({
            resource_id: parsed_resource.id,
            variable: `cmi.objectives.${index}.id`,
            base_value: `${objective_id}`,
          });
        });
      }
    }

    return {
      parsed_resources,
      parsed_statements,
    };
  }

  @Post('get_value')
  protected async getValue(@Body() data: ScormGetValueDTO) {
    const actor = await this.findOrCreateActor(data.user_id);

    const course = await this.dataSource.getRepository(ScormCourse).findOne({ where: { id: data.course_id } });

    const resource = await this.dataSource
      .getRepository(ScormResource)
      .findOne({ where: { course_id: course.id, identifier: data.resource_identifier } });

    const statement = await this.dataSource
      .getRepository(ScormStatement)
      .findOne({ where: { resource_id: resource.id, variable: data.variable } });

    let result_value: string | number;

    if (statement) {
      const result = await this.dataSource
        .getRepository(ScormStatementResult)
        .findOne({ where: { actor_id: actor.id, statement_id: statement.id } });

      if (result) {
        result_value = result.value;
      } else {
        result_value = statement.base_value;

        await this.dataSource
          .getRepository(ScormStatementResult)
          .insert({ actor_id: actor.id, statement_id: statement.id, value: result_value });
      }
    } else {
      const base_value = this.getBaseValue(data.variable);

      result_value = base_value;

      const res = await this.dataSource
        .getRepository(ScormStatement)
        .insert({ resource_id: resource.id, variable: data.variable, base_value });

      const statement_id = res.identifiers[0].id as string;

      await this.dataSource
        .getRepository(ScormStatementResult)
        .insert({ actor_id: actor.id, statement_id: statement_id, value: result_value });
    }

    const is_int = integer_variables_regexp.reduce((acc, curr) => {
      if (data.variable.match(curr) != null) {
        acc = true;
      }

      return acc;
    }, false);

    const is_float = float_variables_regexp.reduce((acc, curr) => {
      if (data.variable.match(curr) != null) {
        acc = true;
      }

      return acc;
    }, false);

    if (is_int) {
      const parsed_value = parseInt(result_value, 10);

      if (!isNaN(parsed_value)) {
        result_value = parsed_value;
      }
    } else if (is_float) {
      const parsed_value = parseFloat(result_value);

      if (!isNaN(parsed_value)) {
        result_value = parsed_value;
      }
    }

    return { variable: data.variable, value: result_value };
  }

  @Post('set_value')
  protected async setValue(@Body() data: ScormSetValueDTO) {
    const actor = await this.findOrCreateActor(data.user_id);

    const course = await this.dataSource.getRepository(ScormCourse).findOne({ where: { id: data.course_id } });

    const resource = await this.dataSource
      .getRepository(ScormResource)
      .findOne({ where: { course_id: course.id, identifier: data.resource_identifier } });

    const statement = await this.dataSource
      .getRepository(ScormStatement)
      .findOne({ where: { resource_id: resource.id, variable: data.variable } });

    let statement_id: string = statement?.id;

    if (!statement_id) {
      const base_value = this.getBaseValue(data.variable);

      const res = await this.dataSource
        .getRepository(ScormStatement)
        .insert({ variable: data.variable, resource_id: resource.id, base_value });

      statement_id = res.identifiers[0].id;
    }

    await this.dataSource
      .getRepository(ScormStatementResult)
      .createQueryBuilder()
      .insert()
      .into(ScormStatementResult)
      .values({
        statement_id,
        actor_id: actor.id,
        value: data.value,
      })
      .orUpdate(['value'], ['statement_id', 'actor_id'])
      .execute();

    return { variable: data.variable, value: data.value };
  }

  private async findOrCreateActor(user_id: string) {
    let actor = await this.dataSource.getRepository(Actor).findOne({ where: { user_id } });

    if (!actor) {
      await this.dataSource.getRepository(Actor).insert({ user_id });

      actor = await this.dataSource.getRepository(Actor).findOne({ where: { user_id } });
    }

    return actor;
  }

  private getBaseValue(variable: string) {
    let value = '';

    switch (variable) {
      case 'cmi.success_status': // SCORM 2004
        value = 'unknown';

        break;
      case 'cmi.completion_status': // SCORM 2004
      case 'cmi.core.lesson_status': // SCORM 1.1, SCORM 1.2
        value = 'not attempted';

        break;
      case 'cmi.location': // SCORM 2004
      case 'cmi.core.lesson_location': // SCORM 1.1, SCORM 1.2
        value = '0';

        break;
      case 'cmi.mode': // SCORM 2004
      case 'cmi.core.lesson_mode': // SCORM 1.1, SCORM 1.2
        value = 'normal';

        break;
      default:
        break;
    }

    return value;
  }
}
