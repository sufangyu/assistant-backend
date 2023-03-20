import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  DeleteDateColumn,
} from 'typeorm';
import { Share } from '@/module/share/entities/share.entity';

@Entity('category')
export class Category extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'int',
    name: 'id',
    comment: '分类ID',
  })
  id: number;

  @Column({
    type: 'varchar',
    nullable: false,
    length: 50,
    unique: false,
    name: 'name',
    comment: '分类名称',
  })
  name: string;

  // 删除分类数据, 不设置分享的 categoryId, 只在查询数据时不返回对应分类信息
  @OneToMany(() => Share, (share) => share.category, {
    // cascade: true,
    // onDelete: 'SET NULL',
    // orphanedRowAction: 'nullify',
  })
  share: Share[];

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
