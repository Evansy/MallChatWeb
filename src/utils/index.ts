import { MsgEnum } from '@/enums'
/**
 * 文件大小格式化
 */
export const formatBytes = (bytes: number): string => {
  if (bytes === 0 || !bytes) {
    return '0 B'
  }

  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const base = 1024
  const unitIndex = Math.floor(Math.log(bytes) / Math.log(base))
  const size = parseFloat((bytes / Math.pow(base, unitIndex)).toFixed(2))

  return size + ' ' + units[unitIndex]
}

/** 注意！这是文件图标映射关系表，如有修改需求-请联系前端管理同学 */
const fileSuffixMap: Record<string, string> = {
  'jpg': 'jpg',
  'jpeg': 'jpg',
  'png': 'jpg',
  'webp': 'jpg',
  'mp4': 'mp4',
  'mov': 'mp4',
  'avi': 'mp4',
  'rmvb': 'mp4',
  'doc': 'doc',
  'docx': 'doc',
  'mp3': 'mp3',
  'wav': 'mp3',
  'aac': 'mp3',
  'flac': 'mp3',
  'pdf': 'pdf',
  'ppt': 'ppt',
  'pptx': 'ppt',
  'xls': 'xls',
  'xlsx': 'xls',
  'zip': 'zip',
  'rar': 'zip',
  '7z': 'zip',
  'txt': 'txt',
}
/**
 * 获取文件对应的Icon
 * @param fileName 文件名
 * @returns Icon
 */
export const getFileSuffix = (fileName: string): string => {
  if (!fileName) return 'other'

  const suffix = fileName.toLowerCase().split('.').pop()
  if (!suffix) return 'other'

  return fileSuffixMap[suffix] || 'other'
}

/**
 * 转换文件类型
 * @param suffix 文件后缀
 */
export const convertFileType = (suffix: string) => {
  if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(suffix)) {
    return MsgEnum.IMAGE
  } else if ([''].includes(suffix)) {
    // TODO: 视频消息 暂不支持-所有视频消息都会被当做文件处理
    return MsgEnum.VIDEO
  } else if (['mp3', 'wav'].includes(suffix)) {
    return MsgEnum.VOICE
  } else {
    return MsgEnum.FILE
  }
}

// 生成消息体
export const generateBody = (fileInfo: any, isMock?: boolean) => {
  const { size, suffix, width, height, downloadUrl, name, second, tempUrl } = fileInfo
  const type = convertFileType(suffix)
  const url = isMock ? tempUrl : downloadUrl
  const baseBody = { size, url }
  let body = {}

  if (type === MsgEnum.IMAGE) {
    body = { ...baseBody, width, height }
  } else if (type === MsgEnum.VOICE) {
    body = { ...baseBody, second }
  } else if (type === MsgEnum.VIDEO) {
    body = { ...baseBody, thumbWidth: null, thumbHeight: null, thumbUrl: null }
  } else if (type === MsgEnum.FILE) {
    body = { ...baseBody, fileName: name, url: downloadUrl }
  }
  return { body, type }
}
