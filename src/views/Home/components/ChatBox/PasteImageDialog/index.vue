<script setup lang="ts">
import { ref, watchEffect, inject } from 'vue'
import { useEventListener } from '@vueuse/core'
import { MsgEnum } from '@/enums'
import { useUserStore } from '@/stores/user'

const imageBody = ref({ url: '' })
const pasteFile = ref<File>() // 记录input文本内容
const visible = ref(false)
const userStore = useUserStore()

const onChangeMsgType = inject<(msgType: MsgEnum) => void>('onChangeMsgType')
const onChangeFile = inject<(file: File[]) => void>('onChangeFile')

useEventListener(window, 'paste', (e) => {
  e.preventDefault()
  if (!userStore.isSign) return false // 未登录不支持粘贴图片交互
  if (e.clipboardData && e.clipboardData.files?.length) {
    const file = e.clipboardData.files[0]
    // TODO 可支持粘贴文件。
    if (file?.type.includes('image')) {
      pasteFile.value = file
    }
  }
  return false
})

watchEffect(() => {
  if (pasteFile?.value) {
    visible.value = true
    imageBody.value = {
      url: URL.createObjectURL(pasteFile?.value),
    }
  } else {
    visible.value = false
  }
})
const onClear = () => {
  imageBody.value.url && URL.revokeObjectURL(imageBody.value.url)
  pasteFile.value = undefined
  imageBody.value = {
    url: '',
  }
}
const onSend = async () => {
  if (!pasteFile?.value) return
  // FIXME 如下逻辑可以尝试抽为 hook
  onChangeMsgType?.(MsgEnum.IMAGE) // 设置上传类型为图片
  await onChangeFile?.([pasteFile?.value]) // 上传文件并发送消息
  visible.value = false // 关闭弹窗
  onClear()
}
</script>

<template>
  <ElDialog
    class="image-paste-modal"
    title="粘贴图片"
    v-model="visible"
    :close-on-click-modal="false"
    center
    @close="onClear"
  >
    <img v-if="imageBody.url" :src="imageBody.url" />

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="onSend"> 发送 </el-button>
      </span>
    </template>
  </ElDialog>
</template>

<style lang="scss" src="./styles.scss" />
