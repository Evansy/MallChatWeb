<script setup lang="ts" name="MsgReadCard">
import { ref, reactive, computed, watch } from 'vue'
import type { TabsPaneContext } from 'element-plus'
import { useRequest } from 'alova'
import cloneDeep from 'lodash/cloneDeep'
import isEqual from 'lodash/isEqual'
import apis from '@/services/apis'
import UserItem from './UserItem.vue'
import { judgeClient } from '@/utils/detectDevice'
import { useGlobalStore } from '@/stores/global'

// 查询类型 1已读 2未读
enum SearchType {
  Read = 1,
  Unread,
}

const client = judgeClient()

const globalStore = useGlobalStore()

const initData = {
  [SearchType.Read]: { list: [], cursor: '', isLast: false },
  [SearchType.Unread]: { list: [], cursor: '', isLast: false },
}

const value = computed({
  get() {
    return globalStore.currentReadUnreadList.show
  },
  set(value) {
    globalStore.currentReadUnreadList.show = value
    if (value === false) {
      // 恢复初始值
      globalStore.currentReadUnreadList.msgId = null
      active.value = SearchType.Read
      list[SearchType.Read] = cloneDeep(initData[SearchType.Read])
      list[SearchType.Unread] = cloneDeep(initData[SearchType.Unread])
    }
  },
})

const msgId = computed(() => globalStore.currentReadUnreadList.msgId)

const active = ref<SearchType>(SearchType.Read)
const list = reactive<
  Record<SearchType, { list: { uid: number }[]; cursor: string; isLast: boolean }>
>(cloneDeep(initData))
const curList = computed(() => list[active.value])
const { send, data } = useRequest(apis.getMsgReadList, { immediate: false })

watch(data, (val, oldVal) => {
  if (!val || isEqual(val, oldVal)) return
  list[active.value].cursor = val.cursor
  list[active.value].list.push(...val.list)
  list[active.value].isLast = val.isLast
})

// 切换 Tab 也请求
watch(active, (val, oldVal) => {
  if (val !== oldVal && msgId.value && curList.value.cursor === '') {
    send({
      params: {
        searchType: active.value,
        pageSize: 20,
        msgId: msgId.value,
        cursor: curList.value.cursor || undefined,
      },
    })
  }
})

// 弹窗打开而且有 msgId 值就发送请求
watch(value, (val) => {
  if (val && msgId.value) {
    send({
      params: {
        searchType: active.value,
        pageSize: 20,
        msgId: msgId.value,
        cursor: curList.value.cursor || undefined,
      },
    })
  }
})
// tab 点击
const handleClick = (tab: TabsPaneContext) => {
  active.value = tab.paneName as SearchType
}
// 加载更多
const load = () => {
  if (curList.value.isLast) return
  send({
    params: {
      searchType: active.value,
      pageSize: 20,
      msgId: msgId.value,
      cursor: curList.value.cursor || undefined,
    },
  })
}
</script>

<template>
  <ElDialog
    class="msg-read-modal"
    v-model="value"
    :width="client === 'PC' ? 350 : '85%'"
    :close-on-click-modal="false"
    center
  >
    <el-tabs type="border-card" stretch v-model="active" class="demo-tabs" @tab-click="handleClick">
      <el-tab-pane style="width: 50%" label="已读" :name="SearchType.Read" />
      <el-tab-pane style="width: 50%" label="未读" :name="SearchType.Unread" />
      <ul v-infinite-scroll="load" class="read-unread-list" style="overflow: auto">
        <UserItem v-for="i in curList.list" :key="i.uid" :uid="i.uid" />
        <li v-if="curList.list?.length === 0" class="read-unread-no-data">暂无数据~</li>
      </ul>
    </el-tabs>
  </ElDialog>
</template>

<style lang="scss" src="./styles.scss" scoped />
