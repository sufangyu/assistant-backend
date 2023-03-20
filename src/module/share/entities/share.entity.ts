import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  JoinColumn,
  ManyToMany,
  JoinTable,
  DeleteDateColumn,
} from 'typeorm';
import { Category } from '@/module/category/entities/category.entity';
import { Tag } from '@/module/tag/entities/tag.entity';
import { Robot } from '@/module/robot/entities/robot.entity';

@Entity('share')
export class Share extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'int',
    name: 'id',
    comment: '主键id',
  })
  id: number;

  @Column({
    type: 'varchar',
    nullable: false,
    // length: 50,
    unique: false,
    name: 'url',
    comment: '链接地址',
  })
  url?: string;

  @Column({
    type: 'varchar',
    nullable: true,
    name: 'title',
    comment: '链接标题',
  })
  title: string;

  @Column({
    type: 'varchar',
    nullable: true,
    name: 'description',
    comment: '链接描述',
  })
  description: string;

  // @Column({
  //   type: 'int',
  //   name: 'category_id',
  //   comment: '分类ID',
  // })
  // categoryId: number;

  @ManyToOne(() => Category, (category) => category.id)
  @JoinColumn({ name: 'category_id' })
  public category: Category;

  // 关联标签
  @ManyToMany(() => Tag, (tag) => tag.shares, {
    cascade: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinTable({
    name: 'share_tag_id', // table name
    joinColumns: [{ name: 'share_id' }],
    inverseJoinColumns: [{ name: 'tag_id' }],
  })
  public tags: Tag[];

  // 发布关联的机器人
  @ManyToMany(() => Robot, (robot) => robot.shares, {
    cascade: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinTable({
    name: 'share_robot_id', // table name
    joinColumns: [{ name: 'share_id' }],
    inverseJoinColumns: [{ name: 'robot_id' }],
  })
  public robots: Robot[];

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
    comment: '删除时间', // null 表示未被删除，时间表示被删除时间
  })
  deletedAt: Date;
}
