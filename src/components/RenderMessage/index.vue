<script setup lang="ts">
import { MsgEnum } from '@/enums'
import type { MsgType } from '@/services/types'
import Image from './image.vue'
import Voice from './voice.vue'
import File from './file.vue'
import Video from './video.vue'
import Text from './text.vue'
import Emoji from './emoji.vue'

const componentMap = {
  [MsgEnum.UNKNOWN]: '',
  [MsgEnum.TEXT]: Text,
  [MsgEnum.RECALL]: '',
  [MsgEnum.IMAGE]: Image,
  [MsgEnum.VOICE]: Voice,
  [MsgEnum.FILE]: File,
  [MsgEnum.VIDEO]: Video,
  [MsgEnum.EMOJI]: Emoji,
}

defineProps<{ message: MsgType }>()
</script>

<template>
  <component :is="componentMap[message.type]" :body="message.body" />
</template>
