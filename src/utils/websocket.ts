import { useWsLoginStore, LoginStatus } from '@/stores/ws'
import { useUserStore } from '@/stores/user'
import { MessageType } from './wsType'
import type { LoginSuccessResType, LoginInitResType } from './wsType'

class WS {
  connection: WebSocket | null

  #tasks: string[] = []
  #connectionReady: boolean = false

  constructor() {
    this.connection = new WebSocket('ws://101.33.251.36:8090')
    this.connection.addEventListener('message', this.onMessage)
    this.connection.addEventListener('open', this.#dealTasks)
  }

  #dealTasks = () => {
    this.#connectionReady = true
    this.#tasks.forEach((task) => {
      this.connection?.send(task)
    })
  }

  send = (params: string) => {
    if (this.#connectionReady) {
      this.connection?.send(params)
    } else {
      // 放到队列
      this.#tasks.push(params)
    }
  }

  onMessage = (e: MessageEvent) => {
    const params: { type: MessageType; data: unknown } = JSON.parse(e.data)
    const loginStore = useWsLoginStore()
    const userStore = useUserStore()
    switch (params.type) {
      case MessageType.LoginQrCode: {
        const data = params.data as LoginInitResType
        loginStore.loginQrCode = data.loginUrl
        break
      }
      case MessageType.WaitingAuthorize: {
        loginStore.loginStatus = LoginStatus.Waiting
        break
      }
      case MessageType.LoginSuccess: {
        //
        // {
        //   "uid": 10000,
        //   "avatar": "https://thirdwx.qlogo.cn/mmopen/vi_32/DYAIOgq83erIJoJWYBGtV9aBemHLFQEcJvFUURZyv3mfvbiadPgIKas9XBKlzRpyWiboV4VV4cz7BbXiaoLfgeFjg/132",
        //   "token": "10000",
        //   "name": "🐳 康康"
        // }
        const { token, ...rest } = params.data as LoginSuccessResType
        userStore.userInfo = rest
        localStorage.setItem('USER_INFO', JSON.stringify(rest))
        localStorage.setItem('TOKEN', token)
        loginStore.loginStatus = LoginStatus.Success
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
