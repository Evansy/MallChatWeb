import path from 'node:path'
import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import bundleAnalyzer from 'rollup-plugin-bundle-analyzer'
import autoprefixer from 'autoprefixer'

const pathSrc = path.resolve(__dirname, 'src')

const isProd = process.env.NODE_ENV === 'production'
const lifecycle = process.env.npm_lifecycle_event

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const envConfig = loadEnv(mode, process.cwd())
  return {
    plugins: [
      vue(),
      vueJsx(),
      AutoImport({
        resolvers: [
          ElementPlusResolver(),
          // Auto import icon components
          // 自动导入图标组件
          IconsResolver({ prefix: 'Icon' }),
        ],
        dts: path.resolve(pathSrc, 'auto-imports.d.ts'),
      }),
      Components({
        resolvers: [
          // Auto register icon components
          // 自动注册图标组件
          IconsResolver({ enabledCollections: ['ep'] }),
          ElementPlusResolver(),
        ],
        dts: path.resolve(pathSrc, 'components.d.ts'),
      }),
      Icons({ autoInstall: true }),
      // 打包分析
      lifecycle === 'report' ? bundleAnalyzer({}) : null,
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    // 去掉生产的 打印和 debugger
    esbuild: {
      drop: isProd ? ['console', 'debugger'] : [],
    },
    css: {
      postcss: {
        plugins: [
          autoprefixer({}), // add options if needed
        ],
      },
    },
    server: {
      port: 9988,
      proxy: {
        // string shorthand
        // '/foo': 'http://localhost:4567/foo',
        // with options
        '/capi': {
          // 本地配置到 .env 里面修改。生产配置在 .env.production 里面
          target: envConfig.VITE_API_PREFIX,
          changeOrigin: true,
          // rewrite: path => path.replace(/^\/api/, '')
        },
      },
    },
  }
})
