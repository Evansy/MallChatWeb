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
const onToMallChat = () => window.open('https://github.com/zongzibinbin/MallChat', '_blank')
const onToMallChatWeb = () => window.open('https://github.com/Evansy/MallChatWeb', '_blank')
const toggleGroupListShow = () => (groupStore.showGroupList = !groupStore.showGroupList)
const iconsOperate = ref([
  {
    text: '项目文档',
    class: '',
    iconClass: 'icon-yuque',
    rel: 'noopener noreferrer',
    title: '语雀',
    target: '_blank',
    href: 'https://www.yuque.com/snab/planet/cef1mcko4fve0ur3',
    vlogin: false,
    order: 0,
  },
  {
    text: '',
    class: '',
    iconClass: 'icon-bilibili',
    rel: 'noopener noreferrer',
    title: 'bilibili',
    target: '_blank',
    href: 'https://space.bilibili.com/146719540',
    vlogin: false,
    order: 1,
  },
  {
    text: '618超优惠',
    class: '',
    iconClass: 'icon-tencent-cloud',
    rel: 'noopener noreferrer',
    title: 'tencent cloud',
    target: '_blank',
    href: 'https://curl.qcloud.com/qSaH0JLT',
    vlogin: false,
    order: 3,
  },
  {
    text: '后端源码',
    class: '',
    iconClass: 'icon-github',
    rel: 'noopener noreferrer',
    title: 'MallChatWeb Server',
    target: '_blank',
    href: 'https://github.com/zongzibinbin/MallChat',
    vlogin: onToMallChat,
    order: 4,
  },
  {
    text: '前端源码',
    class: '',
    iconClass: 'icon-github',
    rel: 'noopener noreferrer',
    title: 'MallChatWeb Web',
    target: '_blank',
    href: 'https://github.com/Evansy/MallChatWeb',
    vlogin: onToMallChatWeb,
    order: 5,
  },
])
</script>

<template>
  <aside class="side-toolbar">
    <ElAvatar class="side-toolbar-avatar" :src="avatar || defaultAvatar" v-login="showSettingBox" />

    <div class="operate-icons">
      <el-tooltip effect="dark" :placement="client === 'PC' ? 'right' : 'bottom'">
        <template #content>
          <img class="icon-wechat-qrcode" width="200" :src="qrcode" alt="wx qrcode" />
        </template>
        <a
          class="operate-icons-item"
          style="order: 2"
          target="_blank"
          rel="noopener noreferrer"
          title="wechat"
        >
          <i class="operate-icon icon-wechat" />
        </a>
      </el-tooltip>
      <a
        class="operate-icons-item"
        v-for="(item, index) in iconsOperate"
        :key="index"
        :class="item.class"
        :target="item.target"
        :rel="item.rel"
        :title="item.title"
        :href="item.href"
        v-login="item.vlogin"
        :style="{
          order: item.order,
        }"
      >
        <i class="operate-icon" :class="[item.iconClass]" />
        <span class="operate-icons-text">
          {{ item.text }}
        </span>
      </a>
    </div>

    <el-icon class="menu-icon" color="var(--font-main)" :size="32" @click="toggleGroupListShow">
      <IEpFold />
    </el-icon>

    <UserSettingBox v-model="visible" />
  </aside>
</template>

<style lang="scss" src="./styles.scss" scoped />
