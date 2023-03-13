import { Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Column, Index, JoinColumn, ManyToOne } from 'typeorm';

import { XapiActivity } from '../activity/activity.entity';

@Index(['activity_id', 'state_id'], { unique: true })
@Entity()
export class XapiState {
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
  public state_id: string;

  @Column('jsonb', { nullable: false })
  public state: unknown;

  @Column('text', { nullable: false })
  public content_type: string;

  @Index()
  @Column('uuid', { nullable: false })
  public activity_id: string;

  @ManyToOne(() => XapiActivity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'activity_id' })
  public activity: XapiActivity;
}
