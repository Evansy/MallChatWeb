<script setup lang="ts">
import { MSG_REPLY_TEXT_MAP } from '@/constant/message'
import type { MessageType, SessionItem } from '@/services/types'

defineProps<{
  session: SessionItem
  message: MessageType
}>()
</script>

<template>
  <div class="post-confirm_box">
    <div class="contact-info">
      <img
        :src="session.avatar"
        alt="${session.avatar}"
        :title="session.name"
        class="session-avatar"
      />
      <span>{{ session.name }}</span>
    </div>
    <div class="msg-body">
      {{ MSG_REPLY_TEXT_MAP[message.message.type] ?? message.message.body?.content }}
    </div>
  </div>
</template>

<style scoped lang="scss" src="./styles.scss"></style>
