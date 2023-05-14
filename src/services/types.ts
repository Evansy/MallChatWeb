export type ListResponse<T extends unknown> = {
  /**
   * 游标（下次翻页带上这参数）
   */
  cursor: string
  /**
   * 是否最后一页
   */
  isLast: boolean
  /**
   *
   */
  list: T[]
}

export enum OnlineStatus {
  Online = 1,
  Offline,
}

export type UserItem = {
  /**
   * 在线状态
   */
  activeStatus: OnlineStatus
  /**
   * 头像
   */
  avatar: string
  /**
   * 最后一次上下线时间
   */
  lastOptTime: number
  /**
   * 用户名称
   */
  name: string
  /**
   * uid
   */
  uid: number
}

export type GroupStatisticType = {
  /**
   * 在线人数
   */
  onlineNum: number
  /**
   * 总人数
   */
  totalNum: number
}

/**
 *  1正常文本 2.爆赞 （点赞超过10）3.危险发言（举报超5）
 */
export enum MessageType {
  /**
   * 1正常文本
   */
  Normal = 1,
  /**
   * 2.爆赞 （点赞超过10）
   */
  Hot,
  /**
   * 3.危险发言（举报超5）
   */
  Danger,
}

export type MessageItemType = {
  /**
   * 发送者信息
   */
  fromUser: {
    /**
     * 头像
     */
    avatar: string
    /**
     * 徽章标识，如果没有展示null
     */
    badge: {
      /**
       * 徽章说明
       */
      describe: string
      /**
       * 徽章图像
       */
      img: string
    } | null
    /**
     * 用户名称
     */
    username: string
    /**
     * 用户ID
     */
    uid: number
  }
  /**
   * 消息详情
   */
  message: {
    /**
     * 消息内容
     */
    content: string
    /**
     * 消息id
     */
    id: number
    /**
     * 消息标记
     */
    messageMark: {
      /**
       * 点赞数
       */
      likeCount: number
      /**
       * 该用户是否已经点赞 0否 1是
       */
      userLike: IsYet
      /**
       * 点赞数
       */
      dislikeCount: number
      /**
       * 到赞数
       */
      userDislike: IsYet
    }
    /**
     * 父消息，如果没有父消息，返回的是null
     */
    reply: {
      /**
       * 是否可消息跳转 0否 1是
       */
      canCallback: number
      /**
       * 是否可消息跳转 0否 1是
       */
      content: string
      /**
       * 跳转间隔的消息条数
       */
      gapCount: number
      /**
       * 消息id
       */
      id: number
      /**
       * 用户名称
       */
      username: string
    } | null
    /**
     * 消息发送时间
     */
    sendTime: number
    /**
     * 消息类型 1正常文本 2.爆赞 （点赞超过10）3.危险发言（举报超5）
     */
    type: MessageType
  }
}

export enum ActType {
  /**
   * 确认
   */
  Confirm = 1,
  /**
   * 取消
   */
  Cancel,
}
export enum MarkType {
  Like = 1,
  DisLike,
}

export type SendMsgReq = {
  content: string
  replyMsgId?: number
  roomId: number
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

export type UserInfoType = {
  /**
   * 用户唯一标识
   */
  uid: number
  /**
   * 用户头像
   */
  avatar: string
  /**
   * 用户名
   */
  name: string
  /**
   * 剩余改名次数
   */
  modifyNameChance: number
  /**
   * 性别 1为男性，2为女性
   */
  sex: SexType
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
  image: string
  // 是否拥有 0否 1是
  obtain: IsYet
  // 是否佩戴 0否 1是
  wearing: IsYet
}
