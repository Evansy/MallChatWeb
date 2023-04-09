<script setup lang="ts">
import { useRequest } from 'alova'
import { OnlineStatus } from '@/services/types'
import apis from '@/services/apis'

// const onlineStatus = OnlineStatus
const getList = () => apis.getGroupList({ params: { pageSize: 20 } })

const { loading, data } = useRequest(getList())
const { data: statistic } = useRequest(apis.getMemberStatistic, { initialData: {} })
</script>

<template>
  <div class="user-list-wrapper">
    <div class="user-list-header">群成员({{ statistic.onlineNum || 0 }}/{{ statistic.totalNum || 0 }})</div>
    <ul class="user-list" v-loading.lock="loading">
      <template v-if="data?.list?.length">
        <li
          class="user-list-item"
          :class="user.activeStatus === OnlineStatus.Online ? 'item-online' : ''"
          v-for="user in data?.list"
          :key="user.uid"
        >
          <img class="item-avatar" :src="user.avatar" />{{ user.name }}
        </li>
      </template>
      <template v-else>
        <li class="list-no-data">暂无成员~</li>
      </template>
    </ul>
  </div>
</template>

<style lang="scss" src="./styles.scss" scoped />
