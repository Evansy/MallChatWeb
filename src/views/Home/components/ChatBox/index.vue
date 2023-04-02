<script setup lang="ts">
import { ChatDotRound } from '@element-plus/icons-vue'
import UserList from '../UserList/index.vue'
import { ref } from 'vue'
const isSelect = ref(false)
</script>

<template>
  <div class="chat-box">
    <div class="chat-wrapper">
      <template v-if="isSelect">
        <el-icon :size="160" color="#999"><ChatDotRound /></el-icon>
      </template>
      <template v-else>
        <div class="chat">
          <div class="chat-msg-list">
            <div class="msg-item">
              <img class="msg-item-avatar" src="@/assets/avatars/1.webp" />
              <div class="msg-item-box">
                <div class="msg-item-name">小红</div>
                <div class="msg-item-info">
                  你好啊你好啊你好啊你好啊你好啊你好啊你好啊你好啊你好啊你好啊你好啊你好啊你好啊你好啊你好啊你好啊你好啊你好啊你好啊你好啊你好啊你好啊你好啊你好啊你好啊
                </div>
              </div>
            </div>

            <div class="msg-item">
              <img class="msg-item-avatar" src="@/assets/avatars/1.webp" />
              <div class="msg-item-box">
                <div class="msg-item-name">小红</div>
                <div class="msg-item-info">你好啊你好啊你好啊你好</div>
              </div>
            </div>

            <div class="msg-item msg-item-me">
              <img class="msg-item-avatar" src="@/assets/avatars/1.webp" />
              <div class="msg-item-box">
                <div class="msg-item-name">小红</div>
                <div class="msg-item-info">你好啊你好啊你好啊你好</div>
              </div>
            </div>

            <div class="msg-item msg-item-me">
              <img class="msg-item-avatar" src="@/assets/avatars/1.webp" />
              <div class="msg-item-box">
                <div class="msg-item-name">小红</div>
                <div class="msg-item-info">你好啊你好啊你好啊你好</div>
              </div>
            </div>

            <div class="msg-item msg-item-me">
              <img class="msg-item-avatar" src="@/assets/avatars/1.webp" />
              <div class="msg-item-box">
                <div class="msg-item-name">小红</div>
                <div class="msg-item-info">你好啊你好啊你好啊你好</div>
              </div>
            </div>

            <div class="msg-item msg-item-me">
              <img class="msg-item-avatar" src="@/assets/avatars/1.webp" />
              <div class="msg-item-box">
                <div class="msg-item-name">小红</div>
                <div class="msg-item-info">你好啊你好啊你好啊你好</div>
              </div>
            </div>
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
