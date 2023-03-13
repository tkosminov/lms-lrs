import { Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Column, Index, OneToMany } from 'typeorm';

import { XapiStatement } from '../statement/statement.entity';

@Entity()
export class XapiVerb {
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
  @Column('text', { nullable: false })
  public verb_id: string;

  @Column({ nullable: false })
  public name: string;

  @OneToMany(() => XapiStatement, (statement) => statement.verb)
  public statements: XapiStatement[];
}
