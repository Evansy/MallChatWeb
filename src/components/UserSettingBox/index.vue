<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useRequest } from 'alova'
import { ElMessage } from 'element-plus'
import { Select, CloseBold, EditPen } from '@element-plus/icons-vue'
import { useWsLoginStore } from '@/stores/ws'
import { useUserStore } from '@/stores/user'
import { SexType, IsYet } from '@/services/types'
import apis from '@/services/apis'
import { tempBadgeMapImg } from './constant'

const editName = reactive({
  isEdit: false,
  tempName: '',
  saving: false,
})

const loginStore = useWsLoginStore()
const userStore = useUserStore()
const visible = computed({
  get() {
    return loginStore.showLogin
  },
  set(value) {
    loginStore.showLogin = value
  },
})

const userInfo = computed(() => userStore.userInfo)
const { send, data: badgeList } = useRequest(apis.getBadgeList, { initialData: [] })

const tempBadgeList = computed(() => badgeList.value.map((item, i) => ({ ...item, image: tempBadgeMapImg[i] })))

const currentBadge = computed(() =>
  tempBadgeList.value.find((item) => item.obtain === IsYet.Yes && item.wearing === IsYet.Yes),
)

// 佩戴卸下徽章
const toggleWarningBadge = async (badgeId: number) => {
  if (!badgeId) return
  await apis.setUserBadge(badgeId).send()
  send()
}

// 编辑用户名
const onEditName = () => {
  editName.isEdit = true
  editName.tempName = userInfo.value.name || ''
}

// 确认保存用户名
const onSaveUserName = async () => {
  if (!editName.tempName || editName.tempName.trim() === '') {
    ElMessage.warning('用户名不能为空哦~')
    return
  }
  editName.saving = true
  await apis.modifyUserName(editName.tempName).send()
  userStore.userInfo.name = editName.tempName
  editName.saving = false
  editName.isEdit = false
  editName.tempName = ''
}
// 确认保存用户名
const onCancelEditName = async () => {
  editName.saving = false
  editName.isEdit = false
  editName.tempName = ''
}
</script>

<template>
  <ElDialog class="setting_box_modal" v-model="visible" :width="580" :close-on-click-modal="false" center>
    <div class="setting_box">
      <div class="setting_avatar_box">
        <ElAvatar
          size="large"
          class="setting_avatar"
          :src="userInfo?.avatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'"
        />
        <el-icon
          size="20"
          color="#fff"
          class="setting_avatar_sex"
          v-if="userInfo.sex && [SexType.Man, SexType.Female].includes(userInfo.sex)"
          :style="{
            backgroundColor: `var(${userInfo.sex === SexType.Man ? '--avatar-sex-bg-man' : '--avatar-sex-bg-female'})`,
          }"
        >
          <IEpFemale v-if="userInfo.sex === SexType.Man" />
          <IEpMale v-if="userInfo.sex === SexType.Female" />
        </el-icon>
        <img class="setting_avatar_badge" :src="currentBadge?.image" v-show="currentBadge" />
      </div>

      <div class="setting_name">
        <div class="name_edit_wrapper" v-show="editName.isEdit === false">
          <span>{{ userInfo.name || '-' }}</span>
          <el-tooltip
            class="box-item"
            effect="dark"
            :content="`剩余改名次数: ${userInfo.modifyNameChance || 0}`"
            placement="right"
          >
            <el-button
              class="name_edit_icon"
              size="small"
              :class="userInfo?.modifyNameChance && userInfo.modifyNameChance > 0 ? 'pointer' : 'not_allow'"
              :disabled="!userInfo?.modifyNameChance || userInfo.modifyNameChance === 0"
              :icon="EditPen"
              circle
              @click="onEditName"
            />
          </el-tooltip>
        </div>
        <div class="name_edit_wrapper" v-show="editName.isEdit">
          <ElInput type="text" v-model="editName.tempName" maxlength="6" />
          <el-button class="name_edit_icon" size="small" type="primary" :icon="Select" circle @click="onSaveUserName" />
          <el-button
            class="name_edit_icon"
            size="small"
            type="danger"
            :icon="CloseBold"
            circle
            @click="onCancelEditName"
          />
        </div>
      </div>

      <el-alert class="setting_tips" title="Tips: MallChat名称不允许重复，快来抢占" type="warning" :closable="false" />

      <ul class="badge_list">
        <li class="badge_item" v-for="badge of tempBadgeList" :key="badge.id">
          <img
            class="badge_item_icon"
            :class="{ badge_item_icon_has: badge.obtain === IsYet.Yes }"
            :src="badge.image"
            alt="badge"
          />
          <div class="badge_item_mask">
            <template v-if="badge.obtain === IsYet.Yes">
              <el-button size="small" v-if="badge.wearing === IsYet.No" @click="toggleWarningBadge(badge.id)">
                佩戴
              </el-button>
              <el-button size="small" v-if="badge.wearing === IsYet.Yes">卸下</el-button>
            </template>
            <el-tooltip effect="dark" :content="badge.describe" placement="top">
              <el-icon class="badge_item_info" color="#fff"><IEpInfoFilled /></el-icon>
            </el-tooltip>
          </div>
        </li>
      </ul>
    </div>
  </ElDialog>
</template>

<style lang="scss" src="./styles.scss" scoped />
