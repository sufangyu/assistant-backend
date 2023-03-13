/** 角色枚举类型 */
export enum RoleTypeEnum {
  /** 超管 */
  ROOT = 1,
  /** 作者 */
  AUTHOR = 2,
  /** 游客 */
  VISITOR = 3,
}

/** 机器人 */
export const RoleTypeMessage = {
  1: '超管',
  2: '作者',
  3: '游客',
};

/** 机器人类型 */
export type RoleType = keyof typeof RoleTypeMessage;
