<script lang="ts" setup>
import { computed, type CSSProperties } from 'vue'
const props = defineProps({
  /** 图标名称 */
  icon: {
    type: String,
    default: '',
  },
  /** 图标尺寸 */
  size: {
    type: [Number, String],
    default: 16,
  },
  /** 旋转角度 */
  rotate: Number,
  /** 加载态 */
  spin: Boolean,
  /** 是否多色 */
  colorful: Boolean,
})

const iconCls = computed(() => {
  return [
    {
      mallchat: !props.colorful,
      mallchatcolor: props.colorful,
      [`icon-spin`]: props.spin,
    },
    `icon-${props.icon}`,
  ]
})

const innerStyle = computed(() => {
  const styles: CSSProperties = {}
  if (props.size) {
    styles.fontSize = typeof props.size === 'number' ? `${props.size}px` : props.size
  }
  if (props.rotate) {
    styles.transform = `rotate(${props.rotate}deg)`
  }
  return styles
})
</script>

<template>
  <i :class="iconCls" :style="innerStyle" />
</template>
