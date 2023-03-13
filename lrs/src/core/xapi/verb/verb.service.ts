import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { XapiVerb } from './verb.entity';

@Injectable()
export class XapiVerbService {
  constructor(@InjectRepository(XapiVerb) public readonly repository: Repository<XapiVerb>) {}
}
