import { Logger } from '@/utils';
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
    const req = context.getArgByIndex(1).req;

    return next.handle().pipe(
      map((data: any) => {
        // const http = context.switchToHttp();
        // const req = http.getRequest();
        // const res = http.getResponse();

        // 设置登录 token cookie
        // if (req.url.startsWith('/admin/login') && data?.token) {
        //   res.cookie('token', data?.token, {
        //     maxAge: 1000 * 60 * 30,
        //     httpOnly: true,
        //     signed: true,
        //   });
        // }

        const logFormat = ` <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
    Request original url: ${req.originalUrl}
    Method: ${req.method}
    IP: ${req.ip}
    User: ${JSON.stringify(req.user)}
    Response data:\n ${JSON.stringify(data)}
  <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<`;
        Logger.info(logFormat);
        Logger.access(logFormat);

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
