import visualizer from 'rollup-plugin-visualizer'

/**
 * 打包分析
 * @param isOpen 是否开启打包分析
 */
export default function configVisualizerPlugin(isOpen = false) {
  // 自己手动开启或者定义打包分析环境变量开启打包分析
  if (isOpen) {
    return visualizer({
      filename: './node_modules/.cache/visualizer/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    })
  }
  return []
}
