/** 推送结果枚举类型 */
export enum PushResultEnum {
  /** 失败 */
  FAIL = 0,
  /** 正常 */
  SUCCESS = 1,
}

/** 推送结果描述 */
export const PushResultMessage = {
  0: '失败',
  1: '正常',
};

/** 推送结果类型 */
export type PushResultType = keyof typeof PushResultMessage;

/** 推送功能模块 */
export enum PushResultModuleEnum {
  /** 分享模块 */
  SHARE = 'share',
}
