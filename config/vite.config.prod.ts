import { mergeConfig } from 'vite'
import baseConfig from './vite.config.base'
import configCompressPlugin from './plugin/compress'
import configVisualizerPlugin from './plugin/visualizer'
import configImageminPlugin from './plugin/imagemin'

export default mergeConfig(
  {
    mode: 'production', // vite生产模式
    // 插件的具体配置请查看对应的文件
    plugins: [configCompressPlugin('gzip'), configVisualizerPlugin(), configImageminPlugin()],
    build: {
      rollupOptions: {
        output: {
          // 分包策略优化
          manualChunks: {
            vue: ['vue', 'vue-router', 'pinia', '@vueuse/core'],
            xgplayer: ['xgplayer'],
          },
        },
      },
      chunkSizeWarningLimit: 2000,
    },
  },
  baseConfig,
)
