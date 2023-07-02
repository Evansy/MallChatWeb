<script lang="ts" setup>
import { ref } from 'vue'

defineProps({
  /** 头像地址 */
  src: {
    type: String,
    default: '',
  },
  /** 图标尺寸 */
  size: {
    type: Number,
    default: 40,
  },
  /** 圆形(circle)和正方形(square)两种 */
  shape: {
    type: String,
    default: 'circle',
  },
  /** 是否显示状态 */
  showStatus: {
    type: Boolean,
    default: false,
  },
  /** 在线状态 */
  online: {
    type: Boolean,
    default: true,
  },
})

const hasError = ref(false)
</script>

<template>
  <div
    :class="['avatar', `avatar-${shape}`, { downline: !online }]"
    :style="{ width: size + 'px', height: size + 'px' }"
  >
    <template v-if="src">
      <Icon v-if="hasError" icon="avatar" :size="size" />
      <img v-else :src="src" alt="avatar" @error="hasError = true" />
    </template>
    <slot v-else>
      <Icon icon="avatar" :size="size" />
    </slot>
    <i v-if="showStatus" class="status" />
  </div>
</template>

<style lang="scss" src="./styles.scss" scoped />
