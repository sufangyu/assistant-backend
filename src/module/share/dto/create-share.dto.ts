import { IsString, IsNumber, IsNotEmpty, IsOptional } from 'class-validator';
import { Category } from '@/module/category/entities/category.entity';
import { Tag } from '@/module/tag/entities/tag.entity';

export class CreateShareDto {
  @IsString()
  @IsNotEmpty({ message: '链接地址不能为空' })
  url: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsNotEmpty({ message: '分类不能为空' })
  categoryId: number;

  @IsNumber(
    {
      allowNaN: false,
      allowInfinity: false,
    },
    {
      each: true,
      message: '标签ID为数组类型，且每项必须为数字',
    },
  )
  @IsOptional()
  tagIds: number[];

  // 用于 save 时赋值, 不用做参数校验
  category?: Category;
  tags?: Tag[];
}
