import { ref } from 'vue'
import { createEventHook } from '@vueuse/core'
import apis from '@/services/apis'
import { ElMessage } from 'element-plus'

/** 文件信息类型 */
export type FileInfoType = {
  name: string
  type: string
  size: number
  suffix: string
  width?: number
  height?: number
  downloadUrl?: string
  second?: number
}

const Max = 30 // 单位M
const MAX_FILE_SIZE = Max * 1024 * 1024 // 最大上传限制

/**
 * 文件上传Hook
 */
export const useUpload = () => {
  const isUploading = ref(false) // 是否正在上传
  const progress = ref(0) // 进度
  const fileInfo = ref<FileInfoType | null>(null) // 文件信息

  const { on: onChange, trigger } = createEventHook()
  const onStart = createEventHook()

  /**
   * 上传文件
   * @param url 上传链接
   * @param file 文件
   */
  const upload = async (url: string, file: File) => {
    isUploading.value = true

    const xhr = new XMLHttpRequest()
    xhr.open('PUT', url, true)
    xhr.setRequestHeader('Content-Type', file.type)
    xhr.upload.onprogress = function (e) {
      progress.value = Math.round((e.loaded / e.total) * 100)
    }
    xhr.onload = function () {
      isUploading.value = false
      if (xhr.status === 200) {
        trigger('success')
      } else {
        trigger('fail')
      }
    }
    xhr.send(file)
  }

  /**
   * 获取图片宽高
   */
  const getImgWH = (file: File) => {
    const img = new Image()
    const tempUrl = URL.createObjectURL(file)
    img.src = tempUrl
    return new Promise((resolve, reject) => {
      img.onload = function () {
        resolve({ width: img.width, height: img.height, tempUrl })
      }
      img.onerror = function () {
        URL.revokeObjectURL(tempUrl) // 释放临时URL资源
        reject({ width: 0, height: 0, url: null })
      }
    })
  }

  /**
   * 获取音频时长
   */
  const getAudioDuration = (file: File) => {
    return new Promise((resolve, reject) => {
      const audio = new Audio()
      const tempUrl = URL.createObjectURL(file)
      audio.src = tempUrl
      // 计算音频的时长
      const countAudioTime = async () => {
        while (isNaN(audio.duration) || audio.duration === Infinity) {
          // 防止浏览器卡死
          await new Promise((resolve) => setTimeout(resolve, 100))
          // 随机进度条位置
          audio.currentTime = 10000000 * Math.random()
        }
        // 取整
        const second = Math.round(audio.duration || 0)
        resolve({ second, tempUrl })
      }
      countAudioTime()
      audio.onerror = function () {
        reject({ second: 0, tempUrl })
      }
    })
  }

  /**
   * 解析文件
   * @param file 文件
   * @returns 文件大小、文件类型、文件名、文件后缀...
   */
  const parseFile = async (file: File, addParams: Record<string, any> = {}) => {
    const { name, size, type } = file
    const suffix = name.split('.').pop() || ''
    const baseInfo = { name, size, type, suffix, ...addParams }

    if (type.includes('image')) {
      const { width, height, tempUrl } = (await getImgWH(file)) as any
      return { ...baseInfo, suffix, width, height, tempUrl }
    }

    if (type.includes('audio')) {
      const { second, tempUrl } = (await getAudioDuration(file)) as any
      return { second, tempUrl, ...baseInfo }
    }

    return baseInfo
  }

  /**
   * 上传文件
   * @param file 文件
   */
  const uploadFile = async (file: File, addParams?: Record<string, any>) => {
    if (isUploading.value) return
    const info = await parseFile(file, addParams)

    // 限制文件大小
    if (info.size > MAX_FILE_SIZE) {
      ElMessage.warning(`文件不得大于 ${Max} MB`)
      return
    }

    const { downloadUrl, uploadUrl } = await apis
      .getUploadUrl({ fileName: info.name, scene: '1' })
      .send()

    if (uploadUrl && downloadUrl) {
      fileInfo.value = { ...info, downloadUrl }
      onStart.trigger(fileInfo)
      upload(uploadUrl, file)
    } else {
      trigger('fail')
    }
  }

  return {
    fileInfo,
    isUploading,
    progress,
    onStart: onStart.on,
    onChange,
    uploadFile,
  }
}
