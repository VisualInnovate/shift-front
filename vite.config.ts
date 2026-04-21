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
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('primevue') || id.includes('primeicons')) return 'primevue'
            if (id.includes('@amcharts')) return 'amcharts'
            if (id.includes('leaflet') || id.includes('maplibre') || id.includes('yandex')) return 'maps'
            if (id.includes('chart.js') || id.includes('chartjs')) return 'charts'
            if (id.includes('swiper')) return 'swiper'
            if (id.includes('filepond')) return 'filepond'
            if (id.includes('pusher')) return 'pusher'
            if (id.includes('vue-i18n') || id.includes('@intlify')) return 'i18n'
            if (id.includes('vuestic-ui')) return 'vuestic'
            return 'vendor'
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
})
