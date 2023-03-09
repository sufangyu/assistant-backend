import {
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Entity,
} from 'typeorm';
import { PushResultEnum } from '@/enum';

@Entity()
export class PushRecord extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'int',
    name: 'id',
    comment: '记录ID',
  })
  id: number;

  @Column({
    type: 'varchar',
    nullable: false,
    length: 50,
    name: 'module',
    comment: '功能模块',
  })
  module: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 500,
    name: 'variable',
    comment: '推送变量、参数集合（JSON 字符串格式）',
  })
  variable: string;

  @Column({
    type: 'int',
    nullable: false,
    name: 'result',
    comment: '推送结果 (0:失败; 1:成功)',
  })
  result: PushResultEnum;

  @CreateDateColumn({
    type: 'timestamp',
    nullable: false,
    name: 'created_at',
    comment: '创建时间',
    // default: new Date(),
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    nullable: false,
    name: 'updated_at',
    select: false,
    comment: '更新时间',
  })
  updatedAt: Date;

  @DeleteDateColumn({
    type: 'timestamp',
    nullable: true,
    name: 'deleted_at',
    select: false,
    comment: '删除时间', // null 表示未被删除，时间表示被删除时间
  })
  deletedAt: Date;
}
