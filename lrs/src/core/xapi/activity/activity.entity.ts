import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Column,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

import { Actor } from '../../actor/actor.entity';
import { XapiState } from '../state/state.entity';
import { XapiStatement } from '../statement/statement.entity';

@Index(['activity_id', 'actor_id'], { unique: true })
@Entity()
export class XapiActivity {
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

  @Column('text', { nullable: false })
  public activity_id: string;

  @Column('jsonb', { nullable: false })
  public activity: unknown;

  @OneToMany(() => XapiState, (state) => state.activity)
  public states: XapiState[];

  @OneToMany(() => XapiStatement, (statement) => statement.activity)
  public statements: XapiStatement[];

  @Index()
  @Column('uuid', { nullable: false })
  public actor_id: string;

  @ManyToOne(() => Actor, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'actor_id' })
  public actor: Actor;
}
