<script setup lang="ts">
import { MAX_ADMIN_COUNT } from '@/constant/group'
import { computed, ref } from 'vue'
import { useGroupStore } from '@/stores/group'
import type { TransferKey } from 'element-plus'
import { ElMessage } from 'element-plus'
import type { BaseUserItem } from '@/stores/cached'
import { useUserStore } from '@/stores/user'

const groupStore = useGroupStore()
const userStore = useUserStore()

const isShowSetAdmin = ref<boolean>(false)
const selectedUidList = ref<number[]>([])

const computedMemberList = computed(() => {
  return (groupStore.memberList as (BaseUserItem & { roleId?: number })[]).map((member) => ({
    ...member,
    disabled: !!member.roleId,
  }))
})

const isDisableSetAdmin = computed(() => {
  return (
    (!groupStore.adminUidList.includes(userStore.userInfo.uid as number) &&
      groupStore.currentLordId !== (userStore.userInfo.uid as number)) ||
    groupStore.adminList.length >= MAX_ADMIN_COUNT
  )
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

/**
 * 删除管理员
 */
const revokeAdmin = async (uid: number) => {
  await groupStore.revokeAdmin([uid])
  ElMessage.success('撤销管理员成功')
}
</script>

<template>
  <div class="set-admin">
    <h5>
      <span>管理员操作</span>
      <span class="admin-count"> ({{ groupStore.adminList.length }}/{{ MAX_ADMIN_COUNT }}) </span>
    </h5>
    <div class="flex-center">
      <el-button
        type="primary"
        size="small"
        @click="isShowSetAdmin = true"
        :disabled="isDisableSetAdmin"
      >
        设置管理员
      </el-button>
      <div v-for="admin in groupStore.adminList" :key="admin.uid" class="admin-avatar flex-center">
        <el-popconfirm
          title="是否撤销该群管理的身份？"
          confirm-button-text="确认"
          cancel-button-text="取消"
          width="200"
          @confirm="revokeAdmin(admin.uid)"
        >
          <template #reference>
            <el-badge value="-">
              <el-avatar :src="admin.avatar" size="small">
                <el-icon :size="10">
                  <Avatar />
                </el-icon>
              </el-avatar>
            </el-badge>
          </template>
        </el-popconfirm>
      </div>
      <el-dialog v-model="isShowSetAdmin">
        <el-transfer
          v-model="selectedUidList"
          :data="computedMemberList"
          :props="{
            key: 'uid',
            label: 'name',
            disabled: 'disabled',
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
</template>

<style scoped lang="scss" src="./styles.scss"></style>
