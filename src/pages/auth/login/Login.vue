<template>
  <form @submit.prevent="onsubmit" class="space-y-6">
    <div
      v-if="passwordChangedSuccessfully"
      class="flex items-start p-4 text-sm text-emerald-800 rounded-2xl bg-emerald-50 border border-emerald-100/60 shadow-sm"
      role="status"
    >
      <svg
        class="flex-shrink-0 inline w-4 h-4 me-3 mt-0.5 text-emerald-600"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          d="M16.707 5.293a1 1 0 0 1 0 1.414l-7.25 7.25a1 1 0 0 1-1.414 0l-3.25-3.25a1 1 0 1 1 1.414-1.414l2.543 2.543 6.543-6.543a1 1 0 0 1 1.414 0Z"
        />
      </svg>
      <div>
        <span class="font-bold tracking-wide">{{ t('authPasswordReset.successTitle') }}</span>
        <p class="text-xs text-emerald-700/90 mt-0.5">
          {{ t('authPasswordReset.changeSuccess') }}
        </p>
      </div>
    </div>

    <div
      v-if="localErrors.length || authStore.authErrors.length"
      class="flex items-start p-4 text-sm text-red-800 rounded-2xl bg-red-50 border border-red-100/60 shadow-sm animate-shake"
      role="alert"
    >
      <svg
        class="flex-shrink-0 inline w-4 h-4 me-3 mt-0.5 text-red-600"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM12 14a1 1 0 0 1-1 1H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 1 1Z"
        />
      </svg>
      <div>
        <span class="font-bold tracking-wide">{{ t('authPasswordReset.errorTitle') }}</span>
        <p v-for="error in visibleErrors" :key="error" class="text-xs text-red-700/90 mt-0.5">
          {{ error }}
        </p>
      </div>
    </div>

    <div class="space-y-5">
      <div class="w-full">
        <span class="p-float-label w-full block">
          <InputText
            type="email"
            id="email"
            class="w-full px-4 py-4 rounded-xl border border-gray-200 transition-all duration-200 focus:border-[#0b3baa] focus:ring-4 focus:ring-[#0b3baa]/10 bg-gray-50/50 focus:bg-white outline-none text-gray-900 text-sm font-medium"
            v-model.trim="form.email"
          />
          <label
            for="email"
            class="absolute inset-x-4 top-1/2 -translate-y-1/2 text-xs font-bold uppercase tracking-wider text-gray-400 transition-all duration-200 pointer-events-none"
          >
            {{ t('email') }}
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
          <label
            for="password"
            class="absolute inset-x-4 top-1/2 -translate-y-1/2 text-xs font-bold uppercase tracking-wider text-gray-400 transition-all duration-200 pointer-events-none"
          >
            {{ t('password') }}
          </label>
        </span>
      </div>
    </div>

    <div class="pt-1 text-end">
      <router-link
        :to="{ name: 'forgot-password' }"
        class="inline-block text-sm font-bold text-[#0b3baa] hover:text-[#082d8a] hover:underline transition-colors"
      >
        {{ t('authPasswordReset.forgotPasswordLink') }}
      </router-link>
    </div>

    <div class="pt-2">
      <button
        type="submit"
        :disabled="authStore.loading"
        class="w-full py-3.5 px-4 text-white font-bold text-sm uppercase tracking-widest rounded-xl bg-[#0b3baa] hover:bg-[#082d8a] active:scale-[0.985] transform transition-all duration-200 shadow-lg shadow-[#0b3baa]/10 hover:shadow-xl hover:shadow-[#0b3baa]/20 focus:outline-none focus:ring-2 focus:ring-[#0b3baa] focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100"
      >
        {{ authStore.loading ? t('loading') : t('login') }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../../../stores/Auth'
import InputText from 'primevue/inputtext'

const { t } = useI18n()
const route = useRoute()
const authStore = useAuthStore()

const form = ref({
  email: '',
  password: '',
})

const emailErrors = ref<string[]>([])
const passwordErrors = ref<string[]>([])

const formReady = computed(() => !emailErrors.value.length && !passwordErrors.value.length)
const localErrors = computed(() => [...emailErrors.value, ...passwordErrors.value])
const visibleErrors = computed(() => (localErrors.value.length ? localErrors.value : authStore.authErrors))
const passwordChangedSuccessfully = computed(() => route.query.passwordChanged === '1')

async function onsubmit() {
  emailErrors.value = form.value.email ? [] : [t('emailRequired')]
  passwordErrors.value = form.value.password ? [] : [t('passwordreq')]

  if (!formReady.value) return

  await authStore.handleLogin(form.value)
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
  0%, 100% {
    transform: translateX(0);
  }
  20%, 60% {
    transform: translateX(-4px);
  }
  40%, 80% {
    transform: translateX(4px);
  }
}

.animate-shake {
  animation: shake 0.4s ease-in-out;
}
</style>
