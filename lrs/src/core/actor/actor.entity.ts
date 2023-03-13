import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { ScormStatementResult } from '../scorm/statement-result/statement-result.entity';
import { XapiActivity } from '../xapi/activity/activity.entity';

@Entity()
export class Actor {
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

  @Index({ unique: true })
  @Column('uuid', { nullable: false })
  public user_id: string;

  @OneToMany(() => ScormStatementResult, (statement_result) => statement_result.actor)
  public scorm_statement_results: ScormStatementResult[];

  @OneToMany(() => XapiActivity, (xapi_activity) => xapi_activity.actor)
  public xapi_activities: XapiActivity[];
}
