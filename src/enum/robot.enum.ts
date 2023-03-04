/** 机器人枚举类型 */
export enum RobotTypeEnum {
  /** 飞书 */
  FEI_SHU = 1,
  /** 钉钉 */
  DING_DING = 2,
  /** 企微 */
  QI_WEI = 3,
}

/** 机器人 */
export const RobotTypeMessage = {
  1: '飞书',
  2: '钉钉',
  3: '企微',
};

/** 机器人类型 */
export type RobotType = keyof typeof RobotTypeMessage;

/** 机器人信息模版枚举 */
export enum RobotMessageTemplateEnum {
  /** 每篇模版 */
  EACH = 1,
  /** 日报模版 */
  DAY = 2,
  /** 月报模版 */
  MONTH = 3,
  /** 季度模版 */
  QUARTER = 4,
  /** 年度模版 */
  YEAR = 5,
}

/** 机器人信息模版描述 */
export const RobotMessageTemplateMessage = {
  1: '每篇模版',
  2: '日报模版',
  3: '月报模版',
  4: '季度模版',
  5: '年度模版',
};
