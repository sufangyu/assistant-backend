import { HttpException, HttpStatus } from '@nestjs/common';

export class BaseService {
  /**
   * 排除错误/异常响应
   *
   * @param {string} [message='请求失败']
   * @memberof BaseService
   */
  error(message = '请求失败') {
    throw new HttpException({ message }, HttpStatus.BAD_REQUEST);
  }
}
