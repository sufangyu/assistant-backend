// https://blog.csdn.net/qq_39834073/article/details/107986691
// https://juejin.cn/post/6844904098689449998
import { resolve } from 'path';

const baseLogPath = resolve(__dirname, '../../logs');

export const log4jsConfig = {
  // // 替换console.log
  // replaceConsole: false,
  appenders: {
    console: {
      type: 'console',
    },
    access: {
      type: 'dateFile',
      filename: `${baseLogPath}/access/access.log`,
      alwaysIncludePattern: true,
      pattern: 'yyyy-MM-dd',
      mode: 0o777,
      daysToKeep: 60,
      numBackups: 3,
      category: 'http',
      keepFileExt: true,
    },
    app: {
      type: 'dateFile',
      filename: `${baseLogPath}/app-out/app.log`,
      alwaysIncludePattern: true,
      layout: {
        type: 'pattern',
        pattern:
          '{"date":"%d","level":"%p","category":"%c","host":"%h","pid":"%z","data":\'%m\'}',
      },
      pattern: 'yyyy-MM-dd',
      daysToKeep: 60,
      // maxLogSize: 10485760,
      numBackups: 3,
      keepFileExt: true,
    },
    errorFile: {
      type: 'dateFile',
      filename: `${baseLogPath}/errors/error.log`,
      alwaysIncludePattern: true,
      layout: {
        type: 'pattern',
        pattern:
          '{"date":"%d","level":"%p","category":"%c","host":"%h","pid":"%z","data":\'%m\'}',
      },
      pattern: 'yyyy-MM-dd',
      daysToKeep: 60,
      // maxLogSize: 10485760,
      numBackups: 3,
      keepFileExt: true,
    },
    errors: {
      type: 'logLevelFilter',
      level: 'ERROR',
      appender: 'errorFile',
    },
  },
  categories: {
    default: {
      appenders: ['console', 'app', 'errors'],
      level: 'DEBUG',
    },
    info: { appenders: ['console', 'app', 'errors'], level: 'info' },
    access: { appenders: ['console', 'app', 'errors'], level: 'info' },
    http: { appenders: ['access'], level: 'DEBUG' },
  },
  // 使用 pm2 来管理项目时，打开
  pm2: true,
  // 会根据 pm2 分配的 id 进行区分，以免各进程在写日志时造成冲突
  pm2InstanceVar: 'INSTANCE_ID',
};
