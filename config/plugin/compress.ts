import type { Plugin } from 'vite'
import compressPlugin from 'vite-plugin-compression'

/**
 * gzip压缩
 * @param compress 压缩类型
 * @param deleteOriginFile 是否删除原文件
 */
export default function configCompressPlugin(
  compress: 'gzip' | 'brotli',
  deleteOriginFile = false,
): Plugin | Plugin[] {
  const plugins: Plugin[] = []

  if (compress === 'gzip') {
    plugins.push(
      compressPlugin({
        ext: '.gz',
        deleteOriginFile,
      }),
    )
  }

  if (compress === 'brotli') {
    plugins.push(
      compressPlugin({
        ext: '.br',
        algorithm: 'brotliCompress',
        deleteOriginFile,
      }),
    )
  }
  return plugins
}
