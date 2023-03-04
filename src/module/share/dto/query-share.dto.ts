import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';
import { BaseQuery } from '@/common/dto/base';

export class QueryShareDto extends BaseQuery {
  categoryId?: number;
  tagIds?: number[];
}

/**
 * 按条件分组查询数据
 *
 * @export
 * @class QueryGroupShareDto
 */
export class QueryGroupShareDto {
  @IsIn(['year', 'quarter', 'month'], {
    message: '类型值只能取其一：year, quarter, month',
  })
  @IsNotEmpty({ message: '类型不能为空' })
  type: 'year' | 'quarter' | 'month';

  @IsString()
  @IsOptional()
  year?: string;
}
