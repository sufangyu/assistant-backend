import { BaseQuery } from '@/common/dto/base';
import { RobotType, StatusType } from '@/enum';

export class QueryRobot extends BaseQuery {
  name?: string;
  status?: StatusType;
  type?: RobotType;
}
