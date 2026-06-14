<template>
  <form @submit.prevent="onsubmit" class="space-y-6">

    <!-- بانر عرض الأخطاء بتصميم عصري ملائم للألوان -->
    <div
      v-if="authStore.authErrors.length"
      class="flex items-start p-4 text-sm text-red-800 rounded-2xl bg-red-50 border border-red-100/60 shadow-sm animate-shake"
      role="alert"
    >
      <svg class="flex-shrink-0 inline w-4 h-4 me-3 mt-0.5 text-red-600" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM12 14a1 1 0 0 1-1 1H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 1 1Z"/>
      </svg>
      <div>
        <span class="font-bold tracking-wide">خطأ في المصادقة</span>
        <p class="text-xs text-red-700/90 mt-0.5">{{ authStore.authErrors[0] }}</p>
      </div>
    </div>


    <div class="space-y-5">


      <div class="w-full">
        <span class="p-float-label w-full block">
          <InputText
            type="email"
            id="email"
            class="w-full px-4 py-4 rounded-xl border border-gray-200 transition-all duration-200 focus:border-[#0b3baa] focus:ring-4 focus:ring-[#0b3baa]/10 bg-gray-50/50 focus:bg-white outline-none text-gray-900 text-sm font-medium"
            v-model="form.email"
          />
          <label for="email" class="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold uppercase tracking-wider text-gray-400 transition-all duration-200 pointer-events-none">
            البريد الإلكتروني
          </label>
        </span>
      </div>

      <div class="w-full">
        <span class="p-float-label w-full block">
          <InputText
            type="password"
            id="password"
            class="w-full px-4 py-4 rounded-xl border border-gray-200 transition-all duration-200 focus:border-[#0b3baa] focus:ring-4 focus:ring-[#0b3baa]/10 bg-gray-50/50 focus:bg-white outline-none text-gray-900 text-sm font-medium"
            v-model="form.password"
          />
          <label for="password" class="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold uppercase tracking-wider text-gray-400 transition-all duration-200 pointer-events-none">
            كلمة المرور
          </label>
        </span>
      </div>

    </div>

    <div class="pt-2">
      <button
        type="submit"
        class="w-full py-3.5 px-4 text-white font-bold text-sm uppercase tracking-widest rounded-xl bg-[#0b3baa] hover:bg-[#082d8a] active:scale-[0.985] transform transition-all duration-200 shadow-lg shadow-[#0b3baa]/10 hover:shadow-xl hover:shadow-[#0b3baa]/20 focus:outline-none focus:ring-2 focus:ring-[#0b3baa] focus:ring-offset-2"
        @click="authStore.handleLogin(form)"
      >
        {{ t('login') }}
      </button>
    </div>

  </form>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../../../stores/Auth'
import InputText from 'primevue/inputtext';

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  email: '',
  password: '',
})

const emailErrors = ref<string[]>([])
const passwordErrors = ref<string[]>([])

const formReady = computed(() => !emailErrors.value.length && !passwordErrors.value.length)

function onsubmit() {
  emailErrors.value = form.value.email ? [] : ['Email is required']
  passwordErrors.value = form.value.password ? [] : ['Password is required']

  if (!formReady.value) return

  router.push({ name: 'dashboard' })
}
</script>

<style scoped>
:deep(.p-float-label) {
  position: relative;
}

:deep(.p-float-label) label {
  left: 1rem;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.p-float-label input:focus ~ label),
:deep(.p-float-label input.p-filled ~ label) {
  top: -0.1rem !important;
  font-size: 0.7rem !important;
  font-weight: 800 !important;
  color: #0b3baa !important;
  background-color: white;
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid rgba(249, 192, 6, 0.4);
}


@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-4px); }
  40%, 80% { transform: translateX(4px); }
}
.animate-shake {
  animation: shake 0.4s ease-in-out;
}
</style>
