import { Logger } from '@/utils';
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { EntityPropertyNotFoundError } from 'typeorm';

/**
 * 异常统一处理
 *
 * @export
 * @class AllExceptionsFilter
 * @implements {ExceptionFilter}
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(
    exception: HttpException | EntityPropertyNotFoundError | any,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const { method, url, originalUrl, ip } = ctx.getRequest();

    // console.log(`--------------- ${method}, ${url} ------------------`);
    // console.error('AllExceptionsFilter exception: ', exception);
    // console.log('-------------------------------------------');

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // TODO: 优化提示信息
    const SQL_MESSAGES_ERROR = ['Cannot add or update a child row'];
    const isSQLError = SQL_MESSAGES_ERROR.some((msg) =>
      (exception.message as string).startsWith(msg),
    );
    let message = isSQLError
      ? '请求失败，请检查参数'
      : exception?.response?.message || exception?.response;

    if (
      exception instanceof EntityPropertyNotFoundError || // ：参数校验错误
      exception instanceof TypeError || // ：类型错误
      exception instanceof Error ||
      exception instanceof NotFoundException // 找不到资源
    ) {
      message = exception.message;
    }

    const logFormat = ` <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
    Request original url: ${originalUrl}
    Method: ${method}
    IP: ${ip}
    Status code: ${status} - ${typeof status}
    Response: ${exception.toString()} \n  <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
    `;

    if (status >= 500) {
      Logger.error(logFormat);
    } else if (status >= 400) {
      Logger.warn(logFormat);
    } else {
      Logger.info(logFormat);
    }

    response.status(exception.status ?? 200).json({
      success: status >= 200 && status <= 300,
      statusCode: status,
      timestamp: new Date().toLocaleString(),
      message,
      path: url,
    });
  }
}
