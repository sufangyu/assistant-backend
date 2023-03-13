export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      /** 应用端口 */
      readonly APP_PORT?: number;

      /** MySQL 连接地址 */
      readonly MYSQL_HOST?: string;
      /** MySQL 端口 */
      readonly MYSQL_PORT?: string;
      /** MySQL 连接用户 */
      readonly MYSQL_USER?: string;
      /** MySQL 连接密码 */
      readonly MYSQL_PASSWORD?: string;
      /** MySQL 数据库 */
      readonly MYSQL_DATABASE?: string;

      /** JWT 密钥 */
      readonly JWT_SECRET_KEY?: string;
      /** JWT 过期时间 */
      readonly JWT_SECRET_TIME?: string;
    }
  }
}
