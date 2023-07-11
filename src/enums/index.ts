/**
 * 全局枚举文件
 * 如果枚举值需要在全局使用，那么请在此文件中定义。其他枚举值请在对应的文件中定义。
 * 定义规则：
 *  枚举名：XxxEnum
 *  枚举值：全部大写，单词间用下划线分割
 */
/** -------------------------------------- */

/**
 * 消息类型
 */
export enum MsgEnum {
  /** 未知 */
  UNKNOWN,
  /** 文本 */
  TEXT,
  /** 撤回 */
  RECALL,
  /** 图片 */
  IMAGE,
  /** 文件 */
  FILE,
  /** 语音 */
  VOICE,
  /** 视频 */
  VIDEO,
  /** 表情包 */
  EMOJI,
}

/**
 * 在线状态
 */
export enum OnlineEnum {
  /** 在线 */
  ONLINE = 1,
  /** 离线 */
  OFFLINE,
}

/**
 * 操作类型
 */
export enum ActEnum {
  /** 确认 */
  Confirm = 1,
  /** 取消 */
  Cancel,
}

export enum SexEnum {
  MAN = 1,
  REMALE,
}

export enum PowerEnum {
  USER,
  ADMIN,
}

export enum IsYetEnum {
  NO,
  YES,
}

export enum MarkEnum {
  LIKE = 1,
  DISLIKE,
}
