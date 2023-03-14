import {
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from '@/module/user/user.service';
import { AuthService } from '@/module/auth/auth.service';

// Redis: https://blog.woolson.cn/notes/be/nestjs-role-permission.html
// http://junyao.tech/posts/711762c9.html

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    private readonly authService: AuthService,
    private readonly userService: UserService,
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
    const accessToken = req.get('Authorization');
    const tokenUser = await this.authService.verifyToken(accessToken);
    // console.log('tokenUser:', tokenUser);

    if (!accessToken || !tokenUser) {
      // 如果有用户信息，代表 token 没有过期，没有则 token 已失效
      throw new HttpException(
        !accessToken ? '未登录, 请先登录' : '登录过时, 请重新登录',
        HttpStatus.UNAUTHORIZED,
      );
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
