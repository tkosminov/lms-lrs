import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ScormStatement } from './statement.entity';

@Injectable()
export class ScormStatementService {
  constructor(@InjectRepository(ScormStatement) public readonly repository: Repository<ScormStatement>) {}
}
