<script lang="ts" setup>
import { ref } from 'vue'

interface Props {
  /** 头像地址 */
  src?: string
  /** 图标尺寸 */
  size?: number
  /** 圆形(circle)和正方形(square)两种 */
  shape?: 'circle' | 'square'
  /** 是否显示状态 */
  showStatus?: boolean
  /** 在线状态 */
  online?: boolean
}

withDefaults(defineProps<Props>(), {
  src: '',
  size: 40,
  shape: 'circle',
  showStatus: false,
  online: true,
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
