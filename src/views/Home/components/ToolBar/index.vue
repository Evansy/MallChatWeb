<script setup lang="ts">
import { computed, ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { useGroupStore } from '@/stores/group'
import defaultAvatar from '@/assets/avatars/default.png'
import qrcode from '@/assets/qrcode.jpeg'
import { judgeClient } from '@/utils/detectDevice'

const client = judgeClient()
const visible = ref(false)
const userStore = useUserStore()
const groupStore = useGroupStore()

const avatar = computed(() => userStore?.userInfo.avatar)

const showSettingBox = () => (visible.value = true)
const toggleGroupListShow = () => (groupStore.showGroupList = !groupStore.showGroupList)
const operateBtns = [
  {
    title: '微信',
    icon: 'icon-wechat',
    text: '微信',
    url: '',
  },
  {
    title: 'bilibili',
    icon: 'icon-bilibili',
    text: '',
    url: 'https://space.bilibili.com/146719540',
  },

  {
    title: '语雀',
    icon: 'icon-yuque',
    text: '项目文档',
    url: 'https://www.yuque.com/snab/planet/cef1mcko4fve0ur3',
  },

  {
    title: 'tencent cloud',
    icon: 'icon-tencent-cloud',
    text: '618超优惠',
    url: 'https://curl.qcloud.com/qSaH0JLT',
  },
  {
    title: 'MallChatWeb Server',
    icon: 'icon-github',
    text: '后端源码',
    url: '',
    func: () => window.open('https://github.com/zongzibinbin/MallChat', '_blank'),
  },
  {
    title: 'MallChatWeb Web',
    icon: 'icon-github',
    text: '前端源码',
    url: '',
    func: () => window.open('https://github.com/Evansy/MallChatWeb', '_blank'),
  },
]
</script>

<template>
  <aside class="side-toolbar">
    <ElAvatar
      size="large"
      style="min-width: 56px"
      class="side-toolbar-avatar"
      :src="avatar || defaultAvatar"
      v-login="showSettingBox"
    />
    <div class="operate-icons">
      <div
        class="operate-item"
        v-for="(item, index) in operateBtns"
        :key="index"
        :style="client !== 'PC' ? (item.text ? 'min-width:16vw;' : 'min-width:8vw;') : ''"
      >
        <div v-if="item.title != '微信'">
          <a
            v-if="item.url"
            class="operate-icon-link"
            :href="item.url"
            target="_blank"
            rel="noopener noreferrer"
            :title="item.title"
          >
            <i :class="`operate-icon ${item.icon}`" /><span class="operate-icon-text">{{
              item.text
            }}</span>
          </a>
          <a
            v-else
            class="operate-icon-link"
            v-login="item.func"
            target="_blank"
            rel="noopener noreferrer"
            :title="item.title"
          >
            <i :class="`operate-icon ${item.icon}`" /><span class="operate-icon-text">{{
              item.text
            }}</span>
          </a>
        </div>

        <el-tooltip v-else effect="dark" :placement="client === 'PC' ? 'right' : 'bottom'">
          <template #content>
            <img class="icon-wechat-qrcode" :src="qrcode" alt="wx qrcode" />
          </template>
          <div class="operate-box">
            <i class="operate-icon icon-wechat" />
          </div>
        </el-tooltip>
      </div>
    </div>

    <el-icon class="menu-icon" color="var(--font-main)" :size="32" @click="toggleGroupListShow">
      <IEpFold />
    </el-icon>

    <UserSettingBox v-model="visible" />
  </aside>
</template>

<style lang="scss" src="./styles.scss" scoped />
