import { useWsLoginStore, LoginStatus } from '@/stores/ws'
import { useUserStore } from '@/stores/user'
import { useChatStore } from '@/stores/chat'
import { useGroupStore } from '@/stores/group'
import { useCachedStore } from '@/stores/cached'
import { WsResponseMessageType } from './wsType'
import type {
  LoginSuccessResType,
  LoginInitResType,
  WsReqMsgContentType,
  OnStatusChangeType,
} from './wsType'
import type { MessageType, MarkItemType, RevokedMsgType } from '@/services/types'
import { OnlineEnum } from '@/enums'
import { computedToken } from '@/services/request'
import { worker } from './initWorker'
import shakeTitle from '@/utils/shakeTitle'

class WS {
  #tasks: WsReqMsgContentType[] = []
  // 重连🔐
  #connectReady = false

  constructor() {
    this.initConnect()
    // 收到消息
    worker.addEventListener('message', this.onWorkerMsg)

    // 后台重试次数达到上限之后，tab 获取焦点再重试
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && !this.#connectReady) {
        this.initConnect()
      }

      // 获得焦点停止消息闪烁
      if (!document.hidden) {
        shakeTitle.clear()
      }
    })
  }

  initConnect = () => {
    const token = localStorage.getItem('TOKEN')
    worker.postMessage(`{"type":"initWS","value":${token ? `"${token}"` : null}}`)
  }

  onWorkerMsg = (e: MessageEvent<any>) => {
    const params: { type: string; value: unknown } = JSON.parse(e.data)
    switch (params.type) {
      case 'message': {
        this.onMessage(params.value as string)
        break
      }
      case 'open': {
        this.#dealTasks()
        break
      }
      case 'close':
      case 'error': {
        this.#onClose()
        break
      }
    }
  }

  // 重置一些属性
  #onClose = () => {
    this.#connectReady = false
  }

  #dealTasks = () => {
    this.#connectReady = true
    // 先探测登录态
    // this.#detectionLoginStatus()

    setTimeout(() => {
      const userStore = useUserStore()
      const loginStore = useWsLoginStore()
      if (userStore.isSign) {
        // 处理堆积的任务
        this.#tasks.forEach((task) => {
          this.send(task)
        })
        // 清空缓存的消息
        this.#tasks = []
      } else {
        // 如果没登录，而且已经请求了登录二维码，就要更新登录二维码。
        loginStore.loginQrCode && loginStore.getLoginQrCode()
      }
    }, 500)
  }

  #send(msg: WsReqMsgContentType) {
    worker.postMessage(
      `{"type":"message","value":${typeof msg === 'string' ? msg : JSON.stringify(msg)}}`,
    )
  }

  send = (params: WsReqMsgContentType) => {
    if (this.#connectReady) {
      this.#send(params)
    } else {
      // 放到队列
      this.#tasks.push(params)
    }
  }

  // 收到消息回调
  onMessage = (value: string) => {
    // FIXME 可能需要 try catch,
    const params: { type: WsResponseMessageType; data: unknown } = JSON.parse(value)
    const loginStore = useWsLoginStore()
    const userStore = useUserStore()
    const chatStore = useChatStore()
    const groupStore = useGroupStore()
    const cachedStore = useCachedStore()
    switch (params.type) {
      // 获取登录二维码
      case WsResponseMessageType.LoginQrCode: {
        const data = params.data as LoginInitResType
        loginStore.loginQrCode = data.loginUrl
        break
      }
      // 等待授权
      case WsResponseMessageType.WaitingAuthorize: {
        loginStore.loginStatus = LoginStatus.Waiting
        break
      }
      // 登录成功
      case WsResponseMessageType.LoginSuccess: {
        userStore.isSign = true
        const { token, ...rest } = params.data as LoginSuccessResType
        // FIXME 可以不需要赋值了，单独请求了接口。
        userStore.userInfo = { ...userStore.userInfo, ...rest }
        localStorage.setItem('USER_INFO', JSON.stringify(rest))
        localStorage.setItem('TOKEN', token)
        // 获取用户详情
        userStore.getUserDetailAction()
        // 更新一下请求里面的 token.
        computedToken.clear()
        computedToken.get()
        loginStore.loginStatus = LoginStatus.Success
        // 关闭登录弹窗
        loginStore.showLogin = false
        // 清空登录二维码
        loginStore.loginQrCode = undefined
        // 自己更新自己上线
        groupStore.batchUpdateUserStatus([
          {
            activeStatus: OnlineEnum.ONLINE,
            avatar: rest.avatar,
            lastOptTime: Date.now(),
            name: rest.name,
            uid: rest.uid,
          },
        ])
        // 初始化所有用户基本信息
        cachedStore.initAllUserBaseInfo()
        break
      }
      // 用户 token 过期
      case WsResponseMessageType.TokenExpired: {
        userStore.isSign = false
        userStore.userInfo = {}
        localStorage.removeItem('USER_INFO')
        localStorage.removeItem('TOKEN')
        loginStore.loginStatus = LoginStatus.Init
        break
      }
      // 收到消息
      case WsResponseMessageType.ReceiveMessage: {
        chatStore.pushMsg(params.data as MessageType)
        break
      }
      // 用户下线
      case WsResponseMessageType.OnOffLine: {
        const data = params.data as OnStatusChangeType
        groupStore.countInfo.onlineNum = data.onlineNum
        // groupStore.countInfo.totalNum = data.totalNum
        groupStore.batchUpdateUserStatus(data.changeList)
        break
      }
      // 小黑子的发言在禁用后，要删除他的发言
      case WsResponseMessageType.InValidUser: {
        const data = params.data as { uid: number }
        // 消息列表删掉小黑子发言
        chatStore.filterUser(data.uid)
        // 群成员列表删掉小黑子
        groupStore.filterUser(data.uid)
        break
      }
      // 点赞、倒赞消息通知
      case WsResponseMessageType.WSMsgMarkItem: {
        const data = params.data as { markList: MarkItemType[] }
        chatStore.updateMarkCount(data.markList)
        break
      }
      // 消息撤回通知
      case WsResponseMessageType.WSMsgRecall: {
        const { data } = params as { data: RevokedMsgType }
        chatStore.updateRecallStatus(data)
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
