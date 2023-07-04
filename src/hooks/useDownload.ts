import { ref } from 'vue'
import { createEventHook } from '@vueuse/core'

const useDownload = () => {
  const process = ref(0)
  const isDownloading = ref(false)

  const { on: onLoaded, trigger } = createEventHook()

  const getFileExtension = (url: string) => {
    const pathname = new URL(url).pathname
    const lastDotIndex = pathname.lastIndexOf('.')
    if (lastDotIndex === -1) {
      return ''
    }
    return pathname.slice(lastDotIndex + 1)
  }

  const getFileName = (url: string) => {
    const pathname = new URL(url).pathname
    const lastDotIndex = pathname.lastIndexOf('/')
    if (lastDotIndex === -1) {
      return '未知文件'
    }
    return pathname.slice(lastDotIndex + 1)
  }

  const downloadFile = (url: string, filename?: string, extension?: string) => {
    isDownloading.value = true
    const xhr = new XMLHttpRequest()
    xhr.open('GET', url, true)
    xhr.responseType = 'blob'
    xhr.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.floor((event.loaded / event.total) * 100)
        process.value = percentComplete
      }
    }
    xhr.onload = () => {
      if (xhr.status === 200) {
        const blob = new Blob([xhr.response], { type: 'application/octet-stream' })
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        const urlExtension = getFileExtension(url)
        const ext = extension || urlExtension
        if (filename) {
          a.download = `${filename}${ext ? '.' : ''}${ext}`
        } else {
          const urlFileNmae = getFileName(url)
          a.download = urlFileNmae
        }
        a.click()
        // 调用 URL.revokeObjectURL() 方法来释放该内存
        URL.revokeObjectURL(a.href)
        trigger('success')
      } else {
        trigger('fail')
      }
      // 清空进度
      process.value = 0
      isDownloading.value = false
    }
    xhr.send()
  }

  return {
    onLoaded,
    downloadFile,
    process,
    isDownloading,
  }
}

export default useDownload
