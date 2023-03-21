import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';
import { BaseQuery } from '@/common/dto/base.dto';

export class QueryShareDto extends BaseQuery {
  categoryId?: number;
  tagIds?: number[];
}

/**
 * 按条件归档查询数据
 *
 * @export
 * @class QueryShareFiledDto
 */
export class QueryShareFiledDto {
  @IsIn(['year', 'quarter', 'month'], {
    message: '类型值只能取其一：year, quarter, month',
  })
  @IsNotEmpty({ message: '类型不能为空' })
  type: 'quarter' | 'month';

  @IsString()
  @IsOptional()
  year?: string;
}

/**
 * 趋势同比（季度/月度）
 *
 * @export
 * @class QueryShareFiledDto
 */
export class QueryShareTrendDto {
  @IsIn(['year', 'quarter', 'month'], {
    message: '类型值只能取其一：year, quarter, month',
  })
  @IsNotEmpty({ message: '类型不能为空' })
  type: 'year' | 'quarter' | 'month';
  // @IsString()
  // @IsOptional()
  // year?: string;
}

export class TrendQueryDto {
  @IsIn(['7day', '14day', '30day'], {
    message: '类型值只能取其一：7day, 14day, 30day',
  })
  @IsNotEmpty({ message: '类型不能为空' })
  type: '7day' | '14day' | '30day';

  @IsString()
  @IsOptional()
  year?: string;
}
