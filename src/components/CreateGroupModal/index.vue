<script setup lang="ts" name="CreateGroupModal">
import { computed, ref } from 'vue'
import { useRequest } from 'alova'
import apis from '@/services/apis'
import { ElMessage } from 'element-plus'
import { useGlobalStore } from '@/stores/global'
import { judgeClient } from '@/utils/detectDevice'

const client = judgeClient()

const globalStore = useGlobalStore()
const requestMsg = ref()

const { send, loading } = useRequest(apis.sendAddFriendRequest, { immediate: false })
const show = computed(() => globalStore.createGroupModalInfo.show)
const close = () => {
  globalStore.createGroupModalInfo.show = false
}
const onSend = async () => {
  await send({ msg: requestMsg.value, targetUid: globalStore.addFriendModalInfo.uid })
  ElMessage.success('TA一定会被你的诚意打动的~')
  close()
}
</script>

<template>
  <ElDialog
    class="setting-box-modal"
    :model-value="show"
    :width="client === 'PC' ? 350 : '50%'"
    :close-on-click-modal="false"
    center
    :show-close="false"
    @close="close"
  >
    这里是创建群组
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="close">取消</el-button>
        <el-button type="primary" @click="onSend" :loading="loading">发送</el-button>
      </span>
    </template>
  </ElDialog>
</template>

<style lang="scss" src="./styles.scss" scoped />
