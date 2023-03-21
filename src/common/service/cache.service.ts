// https://blog.csdn.net/weixin_44828005/article/details/116249121
import { Injectable } from '@nestjs/common';
import { RedisService } from '@chenjm/nestjs-redis';
import { Redis } from 'ioredis';

@Injectable()
export class CacheService {
  private client: Redis;

  constructor(private redisService: RedisService) {}
  onModuleInit(): void {
    this.getClient();
  }

  private getClient() {
    this.client = this.redisService.getClient();
  }

  /**
   * 设置缓存
   *
   * @param {string} key
   * @param {*} value
   * @param {number} [second] 过期时间
   * @return {*}  {Promise<any>}
   * @memberof CacheService
   */
  public async set(key: string, value: any, second?: number): Promise<any> {
    console.log('设置 =>>', key, value, second);

    const val = JSON.stringify(value);
    if (!second) {
      await this.client.set(key, value);
    } else {
      await this.client.set(key, val, 'EX', second);
    }
  }

  /**
   * 获取缓存
   * @param key
   * @returns
   */
  public async get(key: string): Promise<any> {
    const data = await this.client.get(key);
    return data ?? null;
  }

  /**
   * 删除指定 key 的缓存
   * @param key
   * @returns
   */
  public async del(key: string): Promise<any> {
    return this.client.del(key);
  }

  /**
   * 清空所有的缓存
   *
   * @return {*}  {Promise<any>}
   * @memberof CacheService
   */
  public async flushall(): Promise<any> {
    return await this.client.flushall();
  }
}
