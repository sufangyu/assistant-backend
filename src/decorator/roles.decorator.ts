import { SetMetadata } from '@nestjs/common';
import { RoleTypeEnum } from '@/enum';

// https://www.jb51.net/article/269250.htm
export const ROLES_KEY = 'roles';
export const Roles = (...roles: RoleTypeEnum[]) =>
  SetMetadata(ROLES_KEY, roles);
