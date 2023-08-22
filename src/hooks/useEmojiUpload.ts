import { ref } from 'vue'
import { createEventHook } from '@vueuse/core'
import apis from '@/services/apis'
import { useEmojiStore } from '@/stores/emoji'

/**
 * 表情图上传Hook
 */
export const useEmojiUpload = () => {
  const isEmojiUp = ref(false) // 是否正在上传
  const progress = ref(0) // 进度
  const emojiStore = useEmojiStore()

  const onStart = createEventHook()
  const onSuccess = createEventHook()
  const onFail = createEventHook()

  /**
   * 上传文件
   * @param url 上传链接
   * @param file 文件
   */
  const upload = async (url: string, file: File) => {
    isEmojiUp.value = true

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('PUT', url, true)
      xhr.setRequestHeader('Content-Type', file.type)
      xhr.upload.onprogress = (e) => {
        progress.value = Math.round((e.loaded / e.total) * 100)
      }
      xhr.onload = () => {
        isEmojiUp.value = false
        if (xhr.status === 200) {
          onSuccess.trigger(file)
          resolve(true)
        } else {
          onFail.trigger(file)
          reject(false)
        }
      }
      xhr.onerror = () => {
        onFail.trigger(file)
        reject(false)
      }
      xhr.send(file)
    })
  }

  /**
   * 按比例压缩图片
   * @param file 原文件
   * @returns 压缩图
   */
  const compressImage = async (file: File) => {
    const maxDimension = 240 // 目标最大尺寸
    const targetQuality = 0.9 // 目标质量

    return new Promise((resolve) => {
      if (file.type === 'image/gif') {
        resolve(file)
        return
      }
      const img = new Image()
      const tempUrl = URL.createObjectURL(file)
      img.src = tempUrl
      img.onload = () => {
        const { height, width } = img

        let compressedWidth
        let compressedHeight

        if (width > height) {
          compressedWidth = maxDimension
          compressedHeight = Math.round((height / width) * maxDimension)
        } else {
          compressedHeight = maxDimension
          compressedWidth = Math.round((width / height) * maxDimension)
        }

        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        canvas.height = maxDimension
        canvas.width = maxDimension

        if (context) {
          context.clearRect(0, 0, maxDimension, maxDimension)
          context.fillStyle = 'rgba(0, 0, 0, 0)' // 使用透明颜色填充
          context.fillRect(0, 0, maxDimension, maxDimension)
          context.drawImage(
            img,
            0,
            0,
            width,
            height,
            (maxDimension - compressedWidth) / 2,
            (maxDimension - compressedHeight) / 2,
            compressedWidth,
            compressedHeight,
          )

          canvas.toBlob(
            (blob) => {
              if (!blob) return
              const name = Date.now() + '_emoji.png' // 时间戳生成唯一文件名
              const compressedFile = new File([blob], name, { type: 'image/png' })
              resolve(compressedFile)
              URL.revokeObjectURL(tempUrl)
            },
            'image/png',
            targetQuality,
          )
        }
      }

      img.onerror = () => {
        URL.revokeObjectURL(tempUrl)
      }
    })
  }

  const uploadEmoji = async (file: File) => {
    const compressFile = (await compressImage(file)) as File
    if (!compressFile) return
    const { downloadUrl, uploadUrl } = await apis
      .getUploadUrl({ fileName: compressFile.name, scene: '2' })
      .send()
    if (uploadUrl && downloadUrl) {
      onStart.trigger({ file, downloadUrl })
      upload(uploadUrl, compressFile).then((res) => {
        if (res) {
          emojiStore.addEmoji(downloadUrl)
        }
      })
    }
  }

  return {
    isEmojiUp,
    onStart: onStart.on,
    onFail: onFail.on,
    onSuccess: onSuccess.on,
    uploadEmoji,
  }
}
