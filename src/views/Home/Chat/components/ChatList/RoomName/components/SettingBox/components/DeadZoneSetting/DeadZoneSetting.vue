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
      <el-popconfirm
        title="是否退出该群聊？"
        confirm-button-text="确认"
        cancel-button-text="取消"
        width="200"
        @confirm="exitGroup"
      >
        <template #reference>
          <el-button type="danger" size="small">退出群聊</el-button>
        </template>
      </el-popconfirm>
    </div>
  </div>
</template>

<style scoped lang="scss" src="./styles.scss"></style>
