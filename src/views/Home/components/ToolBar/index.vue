<script setup lang="ts">
import { computed, ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { useGroupStore } from '@/stores/group'
import { useGlobalStore } from '@/stores/global'
import qrcode from '@/assets/qrcode.jpeg'
import { judgeClient } from '@/utils/detectDevice'

const client = judgeClient()
const visible = ref(false)
const userStore = useUserStore()
const groupStore = useGroupStore()
const globalStore = useGlobalStore()

const avatar = computed(() => userStore?.userInfo.avatar)
const unReadMark = computed(() => globalStore.unReadMark)
const showSettingBox = () => (visible.value = true)
const toggleGroupListShow = () => (groupStore.showGroupList = !groupStore.showGroupList)
// 是否PC端
const isPc = computed(() => client === 'PC')

const menuList = [
  {
    name: '',
    desc: '哔哩哔哩',
    icon: 'bilibili',
    handler: () => {
      window.open('https://space.bilibili.com/146719540', '_blank')
    },
  },
  {
    name: '项目文档',
    desc: '语雀',
    icon: 'yuque',
    handler: () => {
      window.open('https://www.yuque.com/snab/planet/cef1mcko4fve0ur3', '_blank')
    },
  },
  {
    name: '618超优惠',
    desc: '腾讯云',
    icon: 'qcloud',
    handler: () => {
      window.open('https://curl.qcloud.com/qSaH0JLT', '_blank')
    },
  },
  {
    name: '后端源码',
    desc: 'MallChatWeb Server',
    icon: 'github',
    handler: () => {
      window.open('https://github.com/zongzibinbin/MallChat', '_blank')
    },
  },
  {
    name: '前端源码',
    desc: 'MallChatWeb Web',
    icon: 'github',
    handler: () => {
      window.open('https://github.com/Evansy/MallChatWeb', '_blank')
    },
  },
]
</script>

<template>
  <aside class="side-toolbar">
    <Avatar :src="avatar" :size="isPc ? 50 : 40" v-login="showSettingBox" />
    <div class="tool-icons">
      <router-link exactActiveClass="tool-icon-active" to="/">
        <el-badge
          :value="unReadMark.newMsgUnreadCount"
          :hidden="unReadMark.newMsgUnreadCount === 0"
          :max="99"
        >
          <Icon class="tool-icon" icon="chat" :size="28" />
        </el-badge>
      </router-link>
      <router-link exactActiveClass="tool-icon-active" to="/contact">
        <el-badge
          :value="unReadMark.newFriendUnreadCount"
          :hidden="unReadMark.newFriendUnreadCount === 0"
          :max="99"
        >
          <Icon class="tool-icon" icon="group" :size="28" />
        </el-badge>
      </router-link>
    </div>

    <div class="menu">
      <el-tooltip effect="dark" :placement="isPc ? 'right' : 'bottom'">
        <template #content>
          <img class="icon-wechat-qrcode" :src="qrcode" alt="wx qrcode" />
        </template>
        <Icon icon="weixin" :size="28" colorful />
      </el-tooltip>
      <a
        v-for="(item, index) in menuList"
        class="menu-item"
        :key="index"
        :title="item.desc"
        @click="item.handler"
      >
        <Icon :icon="item.icon" :size="28" colorful />
        <span v-if="item.name" class="menu-item-name">{{ item.name }}</span>
      </a>
    </div>
    <Icon icon="zhankai" :size="28" @click="toggleGroupListShow" />
    <UserSettingBox v-model="visible" />
  </aside>
</template>

<style lang="scss" src="./styles.scss" scoped />
