import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { Actor } from '../../actor/actor.entity';
import { ScormResource } from '../resource/resource.entity';

@Entity()
export class ScormStatement {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @CreateDateColumn({
    type: 'timestamp without time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  public created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp without time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  public updated_at: Date;

  @Index()
  @Column('text', { nullable: false })
  public variable: string;

  @Column('text', { nullable: true })
  public value: string;

  @Index()
  @Column('uuid', { nullable: false })
  public resource_id: string;

  @ManyToOne(() => ScormResource, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'resource_id' })
  public resource: ScormResource;

  @Index()
  @Column('uuid', { nullable: false })
  public actor_id: string;

  @ManyToOne(() => Actor, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'actor_id' })
  public actor: Actor;
}
