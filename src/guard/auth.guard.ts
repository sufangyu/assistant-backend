import {
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { CacheService } from '@/common/service/cache.service';
import { UserService } from '@/module/user/user.service';
import { AuthService } from '@/module/auth/auth.service';
import { REDIS_ACCESS_TOKEN_PREFIX } from '@/constant';

// Redis: https://blog.woolson.cn/notes/be/nestjs-role-permission.html
// http://junyao.tech/posts/711762c9.html

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly redisService: CacheService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isNoAuth = this.reflector.getAllAndOverride<boolean>('no-auth', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isNoAuth) {
      // 接口无需登录验证
      return true;
    }

    const req = context.switchToHttp().getRequest();
    // const res = context.switchToHttp().getResponse();
    const authorization =
      req.get('Authorization') ?? req.get('authorization') ?? '';
    const accessToken = authorization.replace('Bearer ', '');
    if (!accessToken) {
      throw new HttpException('未登录, 请先登录', HttpStatus.UNAUTHORIZED);
    }

    const tokenUser = await this.authService.verifyToken(accessToken);
    const cacheToken = await this.redisService.get(
      `${REDIS_ACCESS_TOKEN_PREFIX}${tokenUser.id}`,
    );
    // console.log('--------------------------');
    // console.log('accessToken:', accessToken);
    // console.log('cacheToken: ', cacheToken);
    // console.log('--------------------------');
    if (!tokenUser || !cacheToken) {
      throw new HttpException('登录过时, 请重新登录', HttpStatus.UNAUTHORIZED);
    }

    const { role } = await this.userService.findOne(tokenUser?.id);
    const requiredRoles = this.reflector.getAllAndOverride<number[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    const hasRoleAuth = (requiredRoles ?? []).includes(role);
    if (requiredRoles && !hasRoleAuth) {
      throw new HttpException('接口没有权限访问', HttpStatus.FORBIDDEN);
    }
    return this.activate(context);
  }

  async activate(context: ExecutionContext): Promise<boolean> {
    return super.canActivate(context) as Promise<boolean>;
  }
}
