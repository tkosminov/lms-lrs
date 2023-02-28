import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ScormResource } from './resource.entity';

@Injectable()
export class ScormResourceService {
  constructor(@InjectRepository(ScormResource) public readonly repository: Repository<ScormResource>) {}
}
