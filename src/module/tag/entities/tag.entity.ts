import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  ManyToMany,
  DeleteDateColumn,
} from 'typeorm';
import { Share } from '@/module/share/entities/share.entity';

@Entity()
export class Tag extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'int',
    name: 'id',
    comment: '标签ID',
  })
  id: number;

  @Column({
    type: 'varchar',
    nullable: false,
    length: 50,
    unique: false,
    name: 'name',
    comment: '标签名称',
  })
  name: string;

  @ManyToMany(() => Share, (share) => share.tags)
  shares: Share[];

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
