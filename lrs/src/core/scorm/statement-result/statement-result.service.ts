import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ScormStatementResult } from './statement-result.entity';

@Injectable()
export class ScormStatementResultService {
  constructor(@InjectRepository(ScormStatementResult) public readonly repository: Repository<ScormStatementResult>) {}
}
