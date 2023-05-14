<script setup lang="ts">
import { computed } from 'vue'

import { useGroupStore } from '@/stores/group'
import { OnlineStatus } from '@/services/types'

const groupStore = useGroupStore()
const groupUserList = computed(() => groupStore.userList)
const statistic = computed(() => groupStore.countInfo)
</script>

<template>
  <div class="user-list-wrapper">
    <div class="user-list-header">群成员({{ statistic.onlineNum || 0 }}/{{ statistic.totalNum || 0 }})</div>
    <TransitionGroup tag="ul" name="fade" class="user-list" v-loading.lock="groupStore.loading">
      <template v-if="groupUserList?.length">
        <li
          class="user-list-item"
          :class="user.activeStatus === OnlineStatus.Online ? 'item-online' : ''"
          v-for="user in groupUserList"
          :key="user.uid"
        >
          <div class="item-avatar-wrapper">
            <img class="item-avatar" :src="user.avatar" />
            <i class="item-online-status" />
          </div>
          <!-- {{ dayjs(user.lastOptTime).format('HH:mm:ss') }} -->
          {{ user.name }}
        </li>
      </template>
      <template v-else>
        <li class="list-no-data">暂无成员~</li>
      </template>
      <!-- </ul> -->
    </TransitionGroup>
  </div>
</template>

<style lang="scss" src="./styles.scss" scoped />
<style>
/* 1. 声明过渡效果 */
.fade-move,
.fade-enter-active,
.fade-leave-active {
  transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
}

/* 2. 声明进入和离开的状态 */
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scaleY(0.01) translate(30px, 0);
}

/* 3. 确保离开的项目被移除出了布局流
      以便正确地计算移动时的动画效果。 */
.fade-leave-active {
  position: absolute;
}
</style>
