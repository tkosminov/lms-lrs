import { Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Column, Index, JoinColumn, ManyToOne } from 'typeorm';

import { XapiActivity } from '../activity/activity.entity';
import { XapiVerb } from '../verb/verb.entity';

@Index(['activity_id', 'statement_id'], { unique: true })
@Entity()
export class XapiStatement {
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
  public statement_id: string;

  @Column('jsonb', { nullable: false })
  public statement: unknown;

  @Column('text', { nullable: false })
  public content_type: string;

  @Index()
  @Column('uuid', { nullable: false })
  public verb_id: string;

  @ManyToOne(() => XapiVerb, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'verb_id' })
  public verb: XapiVerb;

  @Index()
  @Column('uuid', { nullable: false })
  public activity_id: string;

  @ManyToOne(() => XapiActivity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'activity_id' })
  public activity: XapiActivity;
}
