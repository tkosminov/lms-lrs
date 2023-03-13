import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { XapiState } from './state.entity';

@Injectable()
export class XapiStateService {
  constructor(@InjectRepository(XapiState) public readonly repository: Repository<XapiState>) {}
}
