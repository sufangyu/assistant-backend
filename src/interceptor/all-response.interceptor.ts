import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

/**
 * 响应统一包装处理
 *
 * @export
 * @class AllResponseInterceptor
 * @implements {NestInterceptor}
 */
@Injectable()
export class AllResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data: any) => {
        const http = context.switchToHttp();
        const req = http.getRequest();
        const res = http.getResponse();

        // // fix: Cannot set headers after they are sent to the client
        // if (req.url.startsWith('/admin/login/code')) {
        //   return;
        // }

        // 设置登录 token cookie
        if (req.url.startsWith('/admin/login') && data?.token) {
          res.cookie('token', data?.token, {
            maxAge: 1000 * 60 * 30,
            httpOnly: true,
            signed: true,
          });
        }

        return {
          statusCode: 200,
          success: true,
          message: '处理成功',
          data,
        };
      }),
    );
  }
}
