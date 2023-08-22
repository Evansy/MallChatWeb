<script setup lang="ts" name="CreateGroupModal">
import { computed, ref } from 'vue'
import { useRequest } from 'alova'
import apis from '@/services/apis'
import { RoomTypeEnum } from '@/enums'
import { ElMessage } from 'element-plus'
import { useGlobalStore } from '@/stores/global'
import { judgeClient } from '@/utils/detectDevice'
import SelectUser from './SelectUser.vue'

const client = judgeClient()

const globalStore = useGlobalStore()
const selectUser = ref<number[]>([])

const { send, loading } = useRequest(apis.createGroup, { immediate: false })
const show = computed(() => globalStore.createGroupModalInfo.show)
const close = () => {
  globalStore.createGroupModalInfo.show = false
  globalStore.createGroupModalInfo.selectedUid = []
}
const onSend = async () => {
  if (selectUser.value.length === 0) return
  const { id } = await send({ uidList: selectUser.value })
  ElMessage.success('群聊创建成功~')
  globalStore.currentSession.roomId = id
  globalStore.currentSession.type = RoomTypeEnum.Group
  close()
}
const onChecked = (checked: number[]) => {
  selectUser.value = checked
}
</script>

<template>
  <ElDialog
    class="setting-box-modal"
    :model-value="show"
    :width="client === 'PC' ? 620 : '50%'"
    :close-on-click-modal="false"
    center
    :show-close="false"
    @close="close"
  >
    <SelectUser @checked="onChecked" />
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="close">取消</el-button>
        <el-button
          type="primary"
          @click="onSend"
          :loading="loading"
          :disabled="selectUser.length === 0"
          >创建</el-button
        >
      </span>
    </template>
  </ElDialog>
</template>

<style lang="scss" src="./styles.scss" scoped />
