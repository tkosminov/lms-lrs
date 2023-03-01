import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ScormResource } from '../resource/resource.entity';
import { ScormStatementResult } from '../statement-result/statement-result.entity';

@Index(['resource_id', 'variable'], { unique: true })
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
  public base_value: string;

  @Index()
  @Column('uuid', { nullable: false })
  public resource_id: string;

  @ManyToOne(() => ScormResource, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'resource_id' })
  public resource: ScormResource;

  @OneToMany(() => ScormStatementResult, (statement_result) => statement_result.statement)
  public results: ScormStatementResult[];
}
