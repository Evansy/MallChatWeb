<script setup lang="ts">
import type { PropType } from 'vue'
import type { ImageBody } from '@/services/types'

defineProps({
  body: {
    type: Object as PropType<ImageBody>,
    required: true,
  },
})

const MAX_WIDTH = 200 // 预设宽度
const MAX_HEIGHT = 150 // 预设高度

/**
 * 核心就是的到高度，产生明确占位防止图片加载时页面抖动
 * @param width 宽度
 * @param height 高度
 */
const getImageHeight = (width: number, height: number) => {
  // 小： 如果图片宽高都小于最大宽高，直接返回原高度
  if (width < MAX_WIDTH && height < MAX_HEIGHT) {
    return height
    // 宽： 根据宽度等比缩放
  } else if (width > height) {
    return (MAX_WIDTH / width) * height
    // 窄：返回最大高度
  } else if (width === height || width < height) {
    return MAX_HEIGHT
  }
}
</script>

<template>
  <el-image
    class="image"
    hide-on-click-modal
    preview-teleported
    :src="body?.url"
    :style="{ height: getImageHeight(body.width, body.height) + 'px' }"
    :preview-src-list="[body?.url]"
    fit="scale-down"
  >
    <template #placeholder>
      <div class="image-slot">
        <Icon icon="loading2" :size="18" spin colorful />
        Loading...
      </div>
    </template>
    <template #error>
      <div class="image-slot">
        <Icon icon="dazed" :size="36" colorful />
        加载失败
      </div>
    </template>
  </el-image>
</template>
