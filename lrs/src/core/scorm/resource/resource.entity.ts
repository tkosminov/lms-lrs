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

import { ScormCourse } from '../course/course.entity';
import { ScormStatement } from '../statement/statement.entity';

@Entity()
export class ScormResource {
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
  @Column({ nullable: false })
  public identifier: string;

  @Index()
  @Column('uuid', { nullable: false })
  public course_id: string;

  @ManyToOne(() => ScormCourse, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  public course: ScormCourse;

  @OneToMany(() => ScormStatement, (statement) => statement.resource)
  public statements: ScormStatement[];
}
