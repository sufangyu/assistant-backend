import { RoleType, StatusType } from '@/enum';
import { BaseQuery } from '@/common/dto/base';

export class QueryUser extends BaseQuery {
  username?: string;
  status?: StatusType;
  role?: RoleType;
}
