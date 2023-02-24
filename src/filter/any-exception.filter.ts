import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
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
    const request = ctx.getRequest();

    console.log(
      `--------------- ${request.method}, ${request.url}------------------`,
    );
    console.error('AllExceptionsFilter exception: ', exception);
    console.log('---------------------------------');

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

    // EntityPropertyNotFoundError：参数校验错误
    // TypeError：数据库类型错误
    if (
      exception instanceof EntityPropertyNotFoundError ||
      exception instanceof TypeError ||
      exception instanceof Error
    ) {
      message = exception.message;
    }

    response.status(200).json({
      success: status >= 200 && status <= 300,
      statusCode: status,
      timestamp: new Date().toLocaleString(),
      message,
      path: request.url,
    });
  }
}
