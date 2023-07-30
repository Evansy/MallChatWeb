<script lang="ts" setup>
import { computed, type CSSProperties } from 'vue'

interface Props {
  /** 图标名称 */
  icon: string
  /** 图标尺寸 */
  size?: number | string
  /** 旋转角度 */
  rotate?: number
  /** 加载态 */
  spin?: boolean
  /** 是否多色 */
  colorful?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  size: 16,
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
