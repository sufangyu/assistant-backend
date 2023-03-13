import * as crypto from 'crypto';

/**
 * 随机盐
 *
 * @export
 * @return {*}  {string}
 */
export function makeSalt(): string {
  return crypto.randomBytes(3).toString('base64');
}

/**
 * 使用盐加密明文密码
 * @param password 密码
 * @param salt 密码盐
 */
export function encryptPassword(password: string, salt: string): string {
  if (!password || !salt) {
    return '';
  }
  const tempSalt = Buffer.from(salt, 'base64');
  return (
    // 10000 代表迭代次数 16代表长度
    crypto.pbkdf2Sync(password, tempSalt, 10000, 16, 'sha1').toString('base64')
  );
}

/**
 * 随机密码
 *
 * @export
 * @param {number} [len=6]
 * @return {*}
 */
export function randomPassword(len = 6): string {
  let password = '';
  let j = 0;
  const char = 'ABCDEFGHIJKLMNPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';
  for (let i = 0; i < len; i++) {
    j = Math.floor(Math.random() * char.length);
    password += char.charAt(j);
  }
  return password;
}
