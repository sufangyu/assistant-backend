import { HttpException, HttpStatus } from '@nestjs/common';

export class BaseService {
  /**
   * 错误信息
   *
   * @param {string} [message='请求失败']
   * @param {number} [code=] 错误响应码
   * @memberof BaseService
   */
  error(message = '请求失败', code?: number) {
    throw new HttpException({ message }, code ?? HttpStatus.BAD_REQUEST);
  }
}
