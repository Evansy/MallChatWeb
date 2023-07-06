import { resolve } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import autoprefixer from 'autoprefixer'
import Icons from 'unplugin-icons/vite'
import AutoImport from 'unplugin-auto-import/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    AutoImport({
      // 包括的文件类型
      include: [/\.[tj]sx?$/, /\.vue$/, /\.vue\?vue/, /\.md$/],
      resolvers: [ElementPlusResolver(), IconsResolver({ prefix: 'Icon' })],
      dts: 'src/auto-imports.d.ts',
    }),
    Components({
      resolvers: [
        // 自动注册图标组件
        IconsResolver({ enabledCollections: ['ep'] }),
        ElementPlusResolver(),
      ],
      dts: 'src/components.d.ts',
    }),
    Icons({ autoInstall: true }),
  ],
  resolve: {
    alias: [
      {
        find: '@',
        replacement: resolve(__dirname, '../src'),
      },
    ],
  },
  define: {
    'process.env': {},
  },
  css: {
    postcss: {
      plugins: [
        autoprefixer({}), // 自动添加样式兼容前缀
      ],
    },
  },
})
