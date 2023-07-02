import { ref } from 'vue'
import { createEventHook } from '@vueuse/core'
import { ElMessage } from 'element-plus'

/**
 * wav音频录制Hook
 */
export const useRecording = () => {
  const isRecording = ref(false) // 是否正在录制
  const mediaRecorder = ref<MediaRecorder | null>(null) // 录制器
  const audioUrl = ref<string | null>(null) // 音频地址
  const file = ref<File | null>(null) // 录制的WAV格式File
  const timer = ref<any>(null) // 计时器
  const second = ref(0) // 当前秒数

  const onEnd = createEventHook()

  /**
   * 开始录制
   * @return File 录制的WAV音频
   **/
  const start = () => {
    if (isRecording.value) return // 如果正在录制，就不再录制
    reset() // 重置

    const stream = navigator.mediaDevices.getUserMedia({ audio: true })
    stream.then((stream) => {
      mediaRecorder.value = new MediaRecorder(stream)
      mediaRecorder.value.start()
      isRecording.value = true
      // 开始计时
      timer.value = setInterval(() => {
        second.value++
        // 最多录制60秒
        if (second.value >= 59) {
          stop()
        }
      }, 1000)

      const audioChunks: Blob[] = []
      mediaRecorder.value.addEventListener('dataavailable', (event) => {
        audioChunks.push(event.data)
      })
      mediaRecorder.value.addEventListener('stop', () => {
        const blob = new Blob(audioChunks, { type: 'audio/wav' })
        audioUrl.value = URL.createObjectURL(blob)
        file.value = new File([blob], 'audio.wav', { type: 'audio/wav' })

        timer.value && clearInterval(timer.value) // 停止计时
        if (second.value < 2) {
          ElMessage.warning('录制时间太短')
          return
        }
        onEnd.trigger(file.value)
        second.value = 0
      })
    })
  }

  /**
   * 停止录制
   */

  const stop = () => {
    isRecording.value = false
    mediaRecorder.value?.stop()
  }

  /**
   * 重置
   **/
  const reset = () => {
    isRecording.value = false
    mediaRecorder.value = null // 事件监听器会被自动清除
    audioUrl.value = null
    file.value = null
    second.value = 0
    timer.value && clearInterval(timer.value)
  }

  return {
    isRecording,
    audioUrl,
    second,
    file,
    start,
    stop,
    reset,
    onEnd: onEnd.on,
  }
}
