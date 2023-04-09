// 1.登录返回二维码 2.用户扫描成功等待授权 3.用户登录成功返回用户信息 4.收到消息 5.上下线推送 6.前端token失效
export enum MessageType {
  /**
   * 1.登录返回二维码
   */
  LoginQrCode = 1,
  /**
   * 2.用户扫描成功等待授权
   */
  WaitingAuthorize,
  /**
   * 3.用户登录成功返回用户信息
   */
  LoginSuccess,
  /**
   * 4.收到消息
   */
  ReceiveMessage,
  /**
   * 5.上下线推送
   */
  OnOffLine,
  /**
   * 6.前端token失效
   */
  TokenExpired,
}

export type LoginInitResType = { loginUrl: string }

export type LoginSuccessResType = {
  /**
   * 用户唯一标识
   */
  uid: number
  /**
   * 用户的登录凭证，每次请求携带
   */
  token: string
  /**
   * 用户头像
   */
  avatar: string
  /**
   * 用户名
   */
  name: string
}
