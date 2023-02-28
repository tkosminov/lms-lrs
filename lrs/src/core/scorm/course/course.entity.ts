import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { ScormResource } from '../resource/resource.entity';

export interface IItem {
  identifier: string;
  identifierref?: string;
  title: string;
  type?: string;
  href?: string;
  items?: IItem[];
  objective_ids?: string[];
}

@Entity()
export class ScormCourse {
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
  public hash_sum: string;

  @Index()
  @Column({ nullable: false })
  public identifier: string;

  @Index()
  @Column('text', { nullable: false })
  public title: string;

  @Column('jsonb', { nullable: false, default: '[]' })
  public items: IItem[];

  @OneToMany(() => ScormResource, (resource) => resource.course)
  public resources: ScormResource[];
}
