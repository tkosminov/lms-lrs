import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { XapiStatement } from './statement.entity';

@Injectable()
export class XapiStatementService {
  constructor(@InjectRepository(XapiStatement) public readonly repository: Repository<XapiStatement>) {}
}
