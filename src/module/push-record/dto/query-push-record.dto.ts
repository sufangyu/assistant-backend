import { BaseQuery } from '@/common/dto/base';
import { PushResultEnum } from '@/enum';
import { IsIn, IsOptional } from 'class-validator';

// export class QueryRobot extends BaseQuery {
//   name?: string;
//   status?: StatusType;
//   type?: RobotType;
// }

export class PushRecordQueryRobotDto extends BaseQuery {
  @IsIn([0, 1, '0', '1'], {
    message: '推送结果只能是：0, 1',
  })
  @IsOptional()
  result?: PushResultEnum;
}
