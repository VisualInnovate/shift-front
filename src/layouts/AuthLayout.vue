<template>
  <div class="auth-unified-bg min-h-screen w-full flex flex-col justify-center items-center p-4 sm:p-6" >

    <div class="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100/80 p-8 sm:p-10 transition-all duration-300 hover:shadow-[0_20px_50px_rgba(11,59,170,0.15)]">

      <div class="text-center mb-8">
        <router-link to="/" class="inline-block focus:outline-none group">
          <div class="mx-auto h-20 w-20 rounded-2xl flex items-center justify-center bg-gray-50 p-2.5 border border-gray-100 shadow-inner group-hover:scale-105 transition-all duration-300">
            <img
              src="../assets/shiftlogo.png"
              alt="SHIFT7 Logo"
              class="h-full w-full object-contain"
            />
          </div>
        </router-link>

        <h1 class="mt-4 text-2xl font-black text-[#0b3baa] tracking-tight">
          {{ t('login') }}
        </h1>
        <p class="mt-2 text-xs text-gray-400 font-medium tracking-wide">
          {{ t('auth.loginnote') }}
        </p>
      </div>

      <div class="relative flex py-2 items-center mb-6">
        <div class="flex-grow border-t border-gray-100"></div>
        <span class="flex-shrink mx-4 text-[10px] text-gray-300 font-bold uppercase tracking-widest">{{ t('Secure_Portal') }}</span>
        <div class="flex-grow border-t border-gray-100"></div>
      </div>


      <router-view />

    </div>


    <div class="mt-6 text-center text-[11px] text-gray-400 font-medium tracking-wider">
      &copy; {{ t('auth.copyright') }} SHIFT7 {{ currentYear }}
    </div>

  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
import { useAppLangStore } from '../stores/AppLangStore'

const { t } = useI18n()
const appLangStore = useAppLangStore()
const isRtl = computed(() => appLangStore.isRtl)
const currentYear = computed(() => new Date().getFullYear())
</script>

<style lang="scss" scoped>
.auth-unified-bg {
  background: radial-gradient(circle at top right, #f8fafc 0%, #f1f5f9 100%);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0; right: 0; left: 0; bottom: 0;
    background-image: radial-gradient(rgba(11, 59, 170, 0.03) 1.5px, transparent 1.5px);
    background-size: 24px 24px;
    pointer-events: none;
  }
}
</style>
