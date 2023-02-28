import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Actor } from './actor.entity';

@Injectable()
export class ActorService {
  constructor(@InjectRepository(Actor) public readonly repository: Repository<Actor>) {}
}
