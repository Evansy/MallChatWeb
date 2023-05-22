import type { MessageItemType } from '@/services/types'
import dayjs from 'dayjs'

// 5 * 60 * 1000;
const intervalTime = 300000
// 计算 20 条，到达 20 重置
const computedCountMax = 20
let computedCount = 0

const timeToStr = (time: number) => {
  const sendTime = dayjs(time)
  const gapDay = dayjs().endOf('day').diff(sendTime, 'day')
  const isLastWeek = gapDay >= 7
  // 今天显示时分秒, 今天往前一周内，显示周几， 再前面显示日期
  return gapDay < 2
    ? `${gapDay === 1 ? '昨天 ' : ''}${sendTime.format('HH:mm')}`
    : isLastWeek
    ? sendTime.format('YYYY-MM-DD HH:mm')
    : dayjs(sendTime).format('dddd HH:mm')
}

// 超过20分钟，或者超过50条评论，展示时间
const checkTimeInterval = (cur: MessageItemType, pre: MessageItemType) => {
  if ((pre && cur.message.sendTime - pre.message.sendTime > intervalTime) || computedCount >= computedCountMax) {
    computedCount = 0
    return { ...cur, timeBlock: timeToStr(cur.message.sendTime) }
  } else {
    computedCount += 1
    return cur
  }
}

export const computedTimeBlock = (list: MessageItemType[], needFirst = true) => {
  if (!list || list.length === 0) return []
  const temp = needFirst ? [list[0]] : []
  // 跳过第一个
  for (let index = 1, len = list.length; index < len; index++) {
    const item = list[index]
    // 上个聊天记录
    const preItem = list[index - 1]
    // 超过20分钟，或者超过50条评论，展示时间
    temp.push(checkTimeInterval(item, preItem))
  }
  return temp
}
