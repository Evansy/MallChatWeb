import { mergeConfig, loadEnv } from 'vite'
import baseConfig from './vite.config.base'

const lifecycle = process.env.npm_lifecycle_event
const isHttpsLifecycle = lifecycle === 'dev:https'

export default mergeConfig(
  {
    mode: 'development', // vite开发模式
    server: {
      port: 9988,
      open: false, // 自动打开浏览器
      fs: {
        strict: true, // 文件读取必须是相对于根目录的绝对路径
      },
      https: isHttpsLifecycle, // 开启https
      proxy: {
        // capi 开头的请求代理到远程服务器
        '/capi': {
          // 地址根据环境配置读取
          target: loadEnv('development', process.cwd()).VITE_API_PREFIX,
          changeOrigin: true,
        },
      },
    },
  },
  baseConfig,
)
