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
  lastOptTime: string
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
    }
    /**
     * 用户名称
     */
    username: string
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
       * 举报数
       */
      banCount: number
      /**
       * 点赞数
       */
      likeCount: number
      /**
       * 该用户是否已经举报 0否 1是
       */
      userBan: 0 | 1
      /**
       * 该用户是否已经点赞 0否 1是
       */
      userLike: 0 | 1
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
    }
    /**
     * 消息发送时间
     */
    sendTime: string
    /**
     * 消息类型 1正常文本 2.爆赞 （点赞超过10）3.危险发言（举报超5）
     */
    type: MessageType
  }
}
