/**
 * 类型定义文件
 * 注意：请使用TSDoc规范进行注释，以便在使用时能够获得良好提示。
 * @see TSDoc规范https://tsdoc.org/
 **/

/***/
export type ListResponse<T extends unknown> = {
  /** 游标（下次翻页带上这参数）*/
  cursor: string
  /** 是否最后一页 */
  isLast: boolean
  list: T[]
}

export enum OnlineStatus {
  Online = 1,
  Offline,
}

export type CacheBadgeReq = {
  /** 最后更新时间 更新超过 10 分钟异步去更新。 */
  lastModifyTime?: number
  /** 徽章 ID */
  itemId: number
}

export type CacheBadgeItem = {
  /** 是否需要更新数据源。 */
  needRefresh?: boolean
  /** 最后更新时间 更新超过 10 分钟异步去更新。 */
  lastModifyTime: number
  /** 徽章说明 */
  describe: string
  /** 徽章图标 */
  img: string
  /** 徽章 ID */
  itemId: number
}

export type CacheUserReq = {
  /** 最后更新时间 更新超过 10 分钟异步去更新。 */
  lastModifyTime?: number
  /** uid */
  uid: number
}

export type CacheUserItem = {
  /** 是否需要更新数据源。 */
  needRefresh?: boolean
  /** 最后更新时间 更新超过 10 分钟异步去更新。 */
  lastModifyTime: number
  /** 获得的徽章 */
  itemIds: number[]
  /** 佩戴的徽章 */
  wearingItemId: number
  /** 归属地 */
  locPlace: string
  /** 头像 */
  avatar: string
  /** 最后一次上下线时间 */
  lastOptTime: number
  /** 用户名称 */
  name: string
  /** uid */
  uid: number
}

export type UserItem = {
  /** 在线状态 */
  activeStatus: OnlineStatus
  /** 头像 */
  avatar: string
  /** 最后一次上下线时间 */
  lastOptTime: number
  /** 用户名称 */
  name: string
  /** uid */
  uid: number
}

export type GroupStatisticType = {
  /** 在线人数 */
  onlineNum: number
  /** 总人数 */
  totalNum: number
}

export type MessageReplyType = {
  /** 是否可消息跳转 0否 1是 */
  canCallback: number
  /** 是否可消息跳转 0否 1是 */
  content: string
  /** 跳转间隔的消息条数 */
  gapCount: number
  /** 消息id */
  id: number
  /** 用户名称 */
  username: string
}

export enum ActType {
  /** 确认 */
  Confirm = 1,
  /** 取消 */
  Cancel,
}
export enum MarkType {
  Like = 1,
  DisLike,
}

export type MarkMsgReq = {
  // actType	动作类型 1确认 2取消
  actType: ActType
  // 标记类型 1点赞 2举报
  markType: MarkType
  // 消息 ID
  msgId: number
}

export enum SexType {
  Man = 1,
  Female,
}

export enum PowerType {
  User,
  Admin,
}

export type UserInfoType = {
  /** 用户唯一标识 */
  uid: number
  /** 用户头像 */
  avatar: string
  /** 用户名 */
  name: string
  /** 剩余改名次数 */
  modifyNameChance: number
  /** 性别 1为男性，2为女性 */
  sex: SexType
  /** 徽章，本地字段，有值用本地，无值用远端 */
  badge?: string
  /** 权限 */
  power?: number
}

// 是否拥有 0否 1是
export enum IsYet {
  No,
  Yes,
}

export type BadgeType = {
  // 徽章描述
  describe: string
  // 徽章id
  id: number
  // 徽章图标
  img: string
  // 是否拥有 0否 1是
  obtain: IsYet
  // 是否佩戴 0否 1是
  wearing: IsYet
}

export type MarkItemType = {
  /** 操作用户 */
  uid: number
  /** 消息id */
  msgId: number
  /** 操作类型 1点赞 2举报 */
  markType: MarkType
  /** 数量 */
  markCount: number
  /** 动作类型 1确认 2取消 */
  actType: ActType
}

export type RevokedMsgType = {
  /** 消息ID */
  msgId: number
  /** 会话ID */
  roomId?: number
  /** 撤回人ID */
  recallUid?: number
}

export enum MsgTypeType {
  /** 文本 */
  Text = 1,
  /** 撤回 */
  Recall,
}

// -------------------- ⬇消息体类型定义⬇ ----------------

/**
 * 消息返回体
 */
export type MessageType = {
  /** 发送者信息 */
  fromUser: MsgUserType
  /** 消息主体 */
  message: MsgType
  /** 发送时间 */
  sendTime: string
  /** 时间段（可选） */
  timeBlock?: string
}

/**
 * 消息中用户信息
 */
export type MsgUserType = {
  /** 用户ID */
  uid: number
  /** 用户名 */
  username: string
  /** 头像 */
  avatar: string
  /** 归属地 */
  locPlace: string
  /** 徽章 */
  badge?: {
    /** 徽章地址 */
    img: string
    /** 描述 */
    describe: string // 描述
  }
}

/**
 * 消息互动信息
 */
export type MessageMarkType = {
  /** 点赞 */
  userLike: number
  /** 举报 */
  userDislike: number
  /** 点赞数 */
  likeCount: number
  /** 举报数 */
  dislikeCount: number
}

/**
 * 消息内容
 */
export type MsgType = {
  id: number
  type: number
  /** TODO：不同消息类型不同Body 未来后端增加其它类型后变更为`联合类型`, `条件类型` */
  body: BodyType | any
  sendTime: number
  messageMark: MessageMarkType
}

/**
 * 消息
 */
export type BodyType = {
  /** 消息内容 */
  content: string
  /** 回复 */
  reply: {
    id: number
    username: string
    type: number
    /** 根据不同类型回复的消息展示也不同-`过渡版` */
    body: any
    /**
     * 是否可消息跳转
     * @enum {number}  `0`否 `1`是
     */
    canCallback: number
    /** 跳转间隔的消息条数  */
    gapCount: number
  }
  /**
   * 消息链接映射
   * @deprecated 即将废弃？
   */
  urlTitleMap: Record<string, string>
}

/**
 * 发送消息载体
 */
export type MessageReq = {
  /** 会话id */
  roomId: number
  /** 消息类型 */
  msgType: number
  /** 消息体 */
  body: {
    /** 文本消息内容 */
    content: string
    /** 回复的消息id */
    replyMsgId?: number
  }
}
