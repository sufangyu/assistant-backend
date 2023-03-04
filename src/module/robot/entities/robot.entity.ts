import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Share } from '@/module/share/entities/share.entity';
import { RobotTypeEnum, StatusEnum, StatusType } from '@/enum';

@Entity()
export class Robot extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'int',
    name: 'id',
    comment: '机器人ID',
  })
  id: number;

  @Column({
    type: 'varchar',
    nullable: false,
    length: 50,
    name: 'name',
    comment: '机器人名称',
  })
  name: string;

  @Column({
    type: 'enum',
    nullable: false,
    name: 'type',
    enum: RobotTypeEnum,
    comment: '机器人类型（1: 飞书; 2: 钉钉; 3: 企微）',
    // default: RobotTypeEnum.FEI_SHU,
  })
  type: RobotTypeEnum;

  @Column({
    type: 'varchar',
    nullable: false,
    length: 250,
    name: 'webhook',
    comment: '机器人 Webhook',
  })
  webhook: string;

  @Column({
    type: 'enum',
    nullable: false,
    name: 'status',
    enum: StatusEnum,
    comment: '状态（0: 禁用; 1: 启用;）',
    default: StatusEnum.NORMAL,
  })
  status: StatusEnum;

  @ManyToMany(() => Share, (share) => share.robots)
  public shares: Share[];

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
