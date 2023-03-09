import { BaseQuery } from '@/common/dto/base';
import { RobotType, StatusType } from '@/enum';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class QueryRobot extends BaseQuery {
  name?: string;
  status?: StatusType;
  type?: RobotType;
}

export class ReportTypeRobotDto {
  @IsIn(['quarter', 'month'], {
    message: '类型值只能取其一：quarter, month',
  })
  @IsNotEmpty({ message: '类型不能为空' })
  type: 'month' | 'quarter';

  @IsString()
  @IsOptional()
  year?: 'string';
}
