import { SetMetadata } from '@nestjs/common';

/**
 * 无需登录鉴权
 */
export const NoAuth = () => SetMetadata('no-auth', true);
