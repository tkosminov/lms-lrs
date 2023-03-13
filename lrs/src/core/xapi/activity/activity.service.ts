import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { XapiActivity } from './activity.entity';

@Injectable()
export class XapiActivityService {
  constructor(@InjectRepository(XapiActivity) public readonly repository: Repository<XapiActivity>) {}
}
