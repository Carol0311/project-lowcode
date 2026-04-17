import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import federation from '@originjs/vite-plugin-federation'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  // 动态决定 base
  const isProduction = process.env.NODE_ENV === 'production'
  const isPreview =
    process.env.NODE_ENV === 'preview' || process.env.VITE_USER_NODE_ENV === 'preview'

  let base = '/'
  if (isProduction && !isPreview) {
    base = './' // 生产环境部署到子目录
  } else if (env.VITE_BASE_URL) {
    base = env.VITE_BASE_URL // 使用环境变量
  }
  return {
    base,
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      target: 'esnext', //vite模块联邦使用
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          // 这有助于生成更清晰的 chunk
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
        },
      },
    },
    plugins: [
      vue(),
      vueJsx(),
      vueDevTools(),
      federation({
        name: 'project-lowcode',
        filename: 'remoteEntry.js',
        //对外共享的模块
        exposes: {
          './shared': './src/exposes/index.ts',
        },
        //对外共享的库
        shared: ['vue', 'pinia', 'vue-router'],
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      /**host: 'localhost',
      port: 5137,*/
      proxy: {
        '/api': {
          target: env.VITE_LOWCODE_API_KEY,
          changeOrigin: true,
        },
      },
    },
  }
})
