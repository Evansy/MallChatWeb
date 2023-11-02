<script setup lang="ts">
import { useGroupStore } from '@/stores/group'
import { ElMessage } from 'element-plus'

const groupStore = useGroupStore()

/**
 * 删除管理员
 */
const exitGroup = async () => {
  await groupStore.exitGroup()
  ElMessage.success('退出群聊成功')
}
</script>

<template>
  <div class="dead-zone">
    <h5>
      <span>退出群聊</span>
    </h5>
    <div class="flex-center">
      <el-button type="danger" size="small" @click="exitGroup">退出群聊</el-button>
    </div>
  </div>
</template>

<style scoped lang="scss" src="./styles.scss"></style>
