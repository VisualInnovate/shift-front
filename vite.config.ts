import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'url'
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'
import prerender from 'vite-plugin-prerender'

const __dirname = dirname(fileURLToPath(import.meta.url))

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VueI18nPlugin({
      include: resolve(__dirname, './src/i18n/locales/**'),
    }),
    prerender({
      staticDir: join(__dirname, 'dist'),
      routes: [
        '/',
        '/follow-us',
        '/terms-condition',
        '/Privacy-Policy',
        '/stores',
        '/stores-hasmarket',
        '/stores-nomarket',
        '/forget-password',
        '/register',
        '/authlog',
        '/product-details/1',
        '/subcategory/1',
        '/produts-category/1',
        '/products-brand/1',
        '/products-exclusive/1',
      ],
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 3000,
  },
})
