import eventBus from '@/utils/eventBus'
import apis from '@/services/apis'
import type { MsgReadUnReadCountType } from '@/services/types'
import type { Method } from 'alova'
import type { FetchRequestInit } from 'alova/GlobalFetch'
import type { Ref } from 'vue'

const queue = new Set<number>()
let timer: number | null = null
let request: Method<
  Ref<unknown>,
  Ref<unknown>,
  MsgReadUnReadCountType[],
  unknown,
  FetchRequestInit,
  Response,
  Headers
> | null = null

const onAddReadCountTask = ({ msgId }: { msgId: number }) => {
  console.log('add', msgId)
  queue.add(msgId)
}
const onRemoveReadCountTask = ({ msgId }: { msgId: number }) => {
  console.log('delete', msgId)
  queue.delete(msgId)
}
const task = () => {
  // 10s 了上个请求还未完成就中断掉
  request?.abort()
  console.log(queue.size)
  if (queue.size > 0) {
    // 开始新请求
    request = apis.getMsgReadCount({ params: { msgIds: [...queue] } })
    request.send().then((res) => {
      const result = new Map<number, MsgReadUnReadCountType>()
      res.forEach((item) => result.set(item.msgId, item))
      eventBus.emit('onGetReadCount', result)
      request = null
    })
  }
}

export const initListener = () => {
  eventBus.on('onAddReadCountTask', onAddReadCountTask)
  eventBus.on('onRemoveReadCountTask', onRemoveReadCountTask)
  readCountQueue()
}

export const clearListener = () => {
  console.log('clearListener')
  eventBus.off('onAddReadCountTask', onAddReadCountTask)
  eventBus.off('onRemoveReadCountTask', onRemoveReadCountTask)
  timer && clearInterval(timer)
}

export const clearQueue = () => {
  queue.clear()
  timer && clearInterval(timer)
  readCountQueue()
}

export const readCountQueue = () => {
  task()
  console.log('readCountQueue', queue.size)
  timer = setInterval(task, 5000)
}
