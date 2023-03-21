import { RoleType, StatusType } from '@/enum';
import { BaseQuery } from '@/common/dto/base.dto';

export class QueryUser extends BaseQuery {
  username?: string;
  status?: StatusType;
  role?: RoleType;
}
