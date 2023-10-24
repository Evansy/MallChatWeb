<script setup lang="ts">
import { MAX_ADMIN_COUNT } from '@/constant/group'
import { computed, ref } from 'vue'
import { useGroupStore } from '@/stores/group'
import type { TransferKey } from 'element-plus'
import { ElMessage } from 'element-plus'
import type { BaseUserItem } from '@/stores/cached'

const groupStore = useGroupStore()

const isShowSetAdmin = ref<boolean>(false)
const selectedUidList = ref<number[]>([])

const computedMemberList = computed(() => {
  return (groupStore.memberList as (BaseUserItem & { roleId?: number })[]).map((member) => ({
    ...member,
    disabled: !!member.roleId,
  }))
})

const selectMember = (checkedUidList: TransferKey[]) => {
  if (checkedUidList.length + groupStore.adminList.length > MAX_ADMIN_COUNT) {
    ElMessage.error('管理员数量不能超过' + MAX_ADMIN_COUNT + '个')
  }
}

/**
 * 添加管理员
 */
const addAdmin = async () => {
  await groupStore.addAdmin(selectedUidList.value)
  isShowSetAdmin.value = false
  ElMessage.success('添加管理员成功')
}
</script>

<template>
  <div class="setting-box">
    <el-divider content-position="left">高级</el-divider>
    <div class="advanced">
      <div class="set-admin">
        <h5>
          <span>设置管理员</span>
          <span class="admin-count">
            ({{ groupStore.adminList.length }}/{{ MAX_ADMIN_COUNT }})
          </span>
        </h5>
        <div class="flex-center">
          <el-button
            type="primary"
            size="small"
            @click="isShowSetAdmin = true"
            :disabled="groupStore.adminList.length >= MAX_ADMIN_COUNT"
          >
            设置管理员
          </el-button>
          <el-avatar
            v-for="admin in groupStore.adminList"
            :key="admin.uid"
            :src="admin.avatar"
            size="small"
            class="admin-avatar"
          >
            <el-icon :size="10">
              <Avatar />
            </el-icon>
          </el-avatar>
          <el-dialog v-model="isShowSetAdmin">
            <el-transfer
              v-model="selectedUidList"
              :data="computedMemberList"
              :props="{
                key: 'uid',
                label: 'name',
              }"
              class="add-admin-transfer flex-center"
              :titles="['未设置', '已设置']"
              @left-check-change="selectMember"
            />
            <div class="add-admin-btn flex-center">
              <el-button type="primary" @click="addAdmin">添加</el-button>
            </div>
          </el-dialog>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss" src="./styles.scss"></style>
