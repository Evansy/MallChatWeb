<script setup lang="ts">
import type { PropType } from 'vue'
import { MsgEnum } from '@/enums'
import type { MsgType as M } from '@/services/types'
import Image from './image.vue'
import Voice from './voice.vue'
import File from './file.vue'
import Video from './video.vue'
import Text from './text.vue'

const componentMap = {
  [MsgEnum.UNKNOWN]: '',
  [MsgEnum.TEXT]: Text,
  [MsgEnum.RECALL]: '',
  [MsgEnum.IMAGE]: Image,
  [MsgEnum.VOICE]: File,
  [MsgEnum.FILE]: File,
  [MsgEnum.VIDEO]: Video,
}

defineProps({
  message: {
    type: Object as PropType<M>,
    required: true,
  },
})
</script>

<template>
  <component :is="componentMap[message.type]" :body="message.body" />
</template>
