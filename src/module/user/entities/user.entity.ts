import {
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Entity,
} from 'typeorm';
import { RoleTypeEnum, StatusEnum } from '@/enum';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn({
    type: 'int',
    comment: 'ID',
  })
  id: number;

  @Column({
    type: 'varchar',
    nullable: false,
    length: 100,
    comment: '用户名',
  })
  username: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 100,
    comment: '昵称',
  })
  nickname: string;

  @Column({
    type: 'varchar',
    nullable: false,
    length: 11,
    comment: '手机号',
  })
  mobile: string;

  @Column({
    type: 'varchar',
    nullable: false,
    length: 250,
    select: false,
    comment: '加密后的密码',
  })
  password: string;

  // 加密盐
  @Column({
    type: 'varchar',
    nullable: false,
    length: 100,
    select: false,
    comment: '加密盐',
  })
  salt: string;

  @Column({
    type: 'enum',
    nullable: false,
    enum: RoleTypeEnum,
    comment: '用户角色（1: 超管; 2: 作者; 3: 访客;）',
    default: RoleTypeEnum.VISITOR,
  })
  role: RoleTypeEnum;

  @Column({
    type: 'enum',
    nullable: false,
    name: 'status',
    enum: StatusEnum,
    comment: '状态（0: 禁用; 1: 启用;）',
    default: StatusEnum.NORMAL,
  })
  status: StatusEnum;

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
