<script setup lang="ts">
import { useChatStore } from '@/stores/chat'
import { ref } from 'vue'
import SettingBox from '@/views/Home/Chat/components/ChatList/RoomName/components/SettingBox/SettingBox.vue'

const chatStore = useChatStore()
const isShowSetting = ref<boolean>(false)
</script>

<template>
  <div class="room-name">
    <span class="name">{{ chatStore.currentSessionInfo?.name }}</span>
    <span
      class="setting"
      @click="isShowSetting = true"
      v-if="chatStore.isGroup && !chatStore.currentSessionInfo?.hot_Flag"
    >
      设置
    </span>
  </div>
  <el-drawer v-model="isShowSetting" direction="rtl" append-to-body>
    <template #header>
      <h4 class="text-[#f5f5f5]">设置</h4>
    </template>
    <template #default>
      <SettingBox />
    </template>
  </el-drawer>
</template>

<style lang="scss" src="./styles.scss">
.el-drawer__header {
  margin-bottom: 0 !important;
}
</style>
