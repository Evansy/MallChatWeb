<script setup lang="ts">
import { useRequest } from 'alova'
// import { OnlineStatus } from '@/services/types'
import apis from '@/services/apis'
import { ChatDotRound } from '@element-plus/icons-vue'
import UserList from '../UserList/index.vue'
import { ref } from 'vue'
const isSelect = ref(false)
const getList = () => apis.getMsgList({ params: { pageSize: 20, roomId: 1 } })

const { loading, data } = useRequest(getList())
</script>

<template>
  <div class="chat-box">
    <div class="chat-wrapper">
      <template v-if="isSelect">
        <el-icon :size="160" color="#999"><ChatDotRound /></el-icon>
      </template>
      <template v-else>
        <div class="chat">
          <div class="chat-msg-list" v-loading.lock="loading">
            <template v-if="data?.list?.length">
              <div class="msg-item" v-for="msg of data?.list" :key="msg.message.id">
                <img class="msg-item-avatar" :src="msg.fromUser.avatar" />
                <div class="msg-item-box">
                  <div class="msg-item-name">{{ msg.fromUser.username }}</div>
                  <div class="msg-item-info">
                    {{ msg.message.content }}
                  </div>
                </div>
              </div>
            </template>
            <template v-else>
              <div class="list-no-data">暂无消息，快来发送第一条消息吧~</div>
            </template>
          </div>
          <div class="chat-msg-send">
            <input class="msg-input" type="text" />
            <button class="send-button">🚀</button>
          </div>
        </div>
      </template>
    </div>
    <UserList />
  </div>
</template>

<style lang="scss" src="./styles.scss" scoped />
