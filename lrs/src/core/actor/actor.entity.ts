import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ScormStatement } from '../scorm/statement/statement.entity';

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

  @OneToMany(() => ScormStatement, (statement) => statement.resource)
  public statements: ScormStatement[];
}
