import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { Actor } from '../../actor/actor.entity';
import { ScormStatement } from '../statement/statement.entity';

@Index(['statement_id', 'actor_id'], { unique: true })
@Entity()
export class ScormStatementResult {
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

  @Column('text', { nullable: true })
  public value: string;

  @Index()
  @Column('uuid', { nullable: false })
  public statement_id: string;

  @ManyToOne(() => ScormStatement, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'statement_id' })
  public statement: ScormStatement;

  @Index()
  @Column('uuid', { nullable: false })
  public actor_id: string;

  @ManyToOne(() => Actor, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'actor_id' })
  public actor: Actor;
}
