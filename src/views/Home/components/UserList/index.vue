<script setup lang="ts">
import { computed, ref, watchEffect, onMounted, nextTick } from 'vue'

import { pageSize } from '@/stores/chat'
import { useGroupStore } from '@/stores/group'
import { OnlineStatus } from '@/services/types'

const groupListLastElRef = ref<HTMLDivElement>()
const groupStore = useGroupStore()
const groupUserList = computed(() => groupStore.userList)
const statistic = computed(() => groupStore.countInfo)

watchEffect(
  () => {
    // 滚动到最新消息
    if (groupUserList.value?.length <= pageSize && groupListLastElRef.value) {
      // 加载完列表再把加载更多放出来(一开始就放出来的话，会触发 2 次加载列表)
      setTimeout(() => {
        groupListLastElRef.value && (groupListLastElRef.value.style.display = 'block')
      }, 10)
    }
  },
  { flush: 'post' },
)

onMounted(() => {
  nextTick(() => {
    const observer = new IntersectionObserver(
      async (entries) => {
        if (entries?.[0]?.isIntersecting) {
          // 加载更多
          await groupStore.loadMore()
        }
      },
      {
        // root: chatListElRef.value,
        // rootMargin: '0px',
        threshold: 1,
      },
    )
    // 元素可见性监听
    groupListLastElRef.value && observer.observe(groupListLastElRef.value)
  })
})

const hiddenGroupListShow = () => (groupStore.showGroupList = false)
</script>

<template>
  <div class="user-list-box">
    <div class="user-list-mask" @click="hiddenGroupListShow" :class="groupStore.showGroupList ? 'show' : ''" />
    <div class="user-list-wrapper" :class="groupStore.showGroupList ? 'show' : ''">
      <div class="user-list-header">群成员({{ statistic.onlineNum || 0 }}/{{ statistic.totalNum || 0 }})</div>
      <TransitionGroup
        v-show="groupUserList?.length"
        tag="ul"
        name="fade"
        class="user-list"
        v-loading.lock="groupStore.loading"
      >
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
        <li class="list-last-visible-el" key="visible_el" ref="groupListLastElRef">&nbsp;</li>
      </TransitionGroup>
      <template v-if="groupUserList?.length === 0">
        <div class="list-no-data">暂无成员~</div>
      </template>
      <!-- </ul> -->
    </div>
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
