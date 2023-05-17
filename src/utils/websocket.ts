import { useWsLoginStore, LoginStatus } from '@/stores/ws'
import { useUserStore } from '@/stores/user'
import { useChatStore } from '@/stores/chat'
import { useGroupStore } from '@/stores/group'
import { WsResponseMessageType, WsRequestMsgType } from './wsType'
import type { LoginSuccessResType, LoginInitResType, WsReqMsgContentType, OnStatusChangeType } from './wsType'
import type { MessageItemType } from '@/services/types'
import { OnlineStatus } from '@/services/types'

class WS {
  connection: WebSocket | null = null

  #tasks: WsReqMsgContentType[] = []
  #heartTimer: number | null = null

  // 重连 timer
  #timer: null | number = null
  // 重连🔐
  #lockReconnect = false

  constructor() {
    this.initConnection()
  }

  initConnection = () => {
    this.connection = new WebSocket('wss://api.mallchat.cn/websocket')
    // 收到消息
    this.connection.addEventListener('message', this.onMessage)
    // 建立链接
    this.connection.addEventListener('open', this.#dealTasks)
    // 关闭连接
    this.connection.addEventListener('close', this.#onClose)
    // 连接错误
    this.connection.addEventListener('error', this.#onClose)
  }

  // 重置一些属性
  #onClose = () => {
    // 清除心跳定时器
    if (this.#heartTimer) {
      clearInterval(this.#heartTimer)
      this.#heartTimer = null
    }

    // 已经在连接中就不重连了
    if (this.#lockReconnect) return

    // 标识重连中
    this.#lockReconnect = true

    // 清除 timer，避免任务堆积。
    if (this.#timer) {
      clearTimeout(this.#timer)
      this.#timer = null
    }

    // 断线重连
    this.#timer = setTimeout(() => {
      this.initConnection()
      // 标识已经开启重连任务
      this.#lockReconnect = false
    }, 2000)
  }

  // 检测登录状态
  #detectionLoginStatus = () => {
    const token = localStorage.getItem('TOKEN')
    if (token) {
      this.#send({
        type: WsRequestMsgType.Authorization,
        data: { token },
      })
      // 获取用户详情
      const userStore = useUserStore()
      userStore.getUserDetailAction()
    }
  }

  #dealTasks = () => {
    // 先探测登录态
    this.#detectionLoginStatus()

    // 心跳❤️检测
    this.#senHeartPack()

    setTimeout(() => {
      const userStore = useUserStore()
      const loginStore = useWsLoginStore()
      if (userStore.isSign) {
        // 处理堆积的任务
        this.#tasks.forEach((task) => {
          this.#send(task)
        })
      } else {
        // 如果没登录，而且已经请求了登录二维码，就要更新登录二维码。
        loginStore.loginQrCode && loginStore.getLoginQrCode()
      }
    }, 500)
  }

  // 发送心跳 10s 内发送
  #senHeartPack = () => {
    // 10s 检测心跳
    this.#heartTimer = setInterval(() => {
      this.#send({ type: WsRequestMsgType.HeartBeatDetection })
    }, 9900)
  }

  #send(msg: WsReqMsgContentType) {
    this.connection?.send(typeof msg === 'string' ? msg : JSON.stringify(msg))
  }

  send = (params: WsReqMsgContentType) => {
    if (this.connection?.readyState === 1) {
      this.#send(params)
    } else {
      // 放到队列
      this.#tasks.push(params)
    }
  }

  // 收到消息回调
  onMessage = (e: MessageEvent) => {
    // FIXME 可能需要 try catch,
    const params: { type: WsResponseMessageType; data: unknown } = JSON.parse(e.data)
    const loginStore = useWsLoginStore()
    const userStore = useUserStore()
    const chatStore = useChatStore()
    const groupStore = useGroupStore()
    switch (params.type) {
      case WsResponseMessageType.LoginQrCode: {
        const data = params.data as LoginInitResType
        loginStore.loginQrCode = data.loginUrl
        break
      }
      case WsResponseMessageType.WaitingAuthorize: {
        loginStore.loginStatus = LoginStatus.Waiting
        break
      }
      case WsResponseMessageType.LoginSuccess: {
        userStore.isSign = true
        const { token, ...rest } = params.data as LoginSuccessResType
        // FIXME 可以不需要赋值了，单独请求了接口。
        userStore.userInfo = { ...userStore.userInfo, ...rest }
        localStorage.setItem('USER_INFO', JSON.stringify(rest))
        localStorage.setItem('TOKEN', token)
        loginStore.loginStatus = LoginStatus.Success
        // 关闭登录弹窗
        loginStore.showLogin = false
        // 清空登录二维码
        loginStore.loginQrCode = undefined
        // 自己更新自己上线
        groupStore.batchUpdateUserStatus([
          {
            activeStatus: OnlineStatus.Online,
            avatar: rest.avatar,
            lastOptTime: Date.now(),
            name: rest.name,
            uid: rest.uid,
          },
        ])
        break
      }
      case WsResponseMessageType.TokenExpired: {
        userStore.isSign = false
        userStore.userInfo = {}
        localStorage.removeItem('USER_INFO')
        localStorage.removeItem('TOKEN')
        loginStore.loginStatus = LoginStatus.Init
        break
      }
      case WsResponseMessageType.ReceiveMessage: {
        chatStore.pushMsg(params.data as MessageItemType)
        break
      }
      case WsResponseMessageType.OnOffLine: {
        const data = params.data as OnStatusChangeType
        groupStore.countInfo.onlineNum = data.onlineNum
        groupStore.countInfo.totalNum = data.totalNum
        groupStore.batchUpdateUserStatus(data.changeList)
        break
      }
      default: {
        console.log('接收到未处理类型的消息:', params)
        break
      }
    }
  }
}

export default new WS()
