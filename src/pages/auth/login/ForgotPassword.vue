<template>
  <form @submit.prevent="submitEmail" class="space-y-6">
    <div class="text-center space-y-2">
      <h2 class="text-xl font-black text-[#0b3baa]">
        {{ t('authPasswordReset.forgotTitle') }}
      </h2>
      <p class="text-sm text-gray-500 leading-6">
        {{ t('authPasswordReset.forgotDescription') }}
      </p>
    </div>

    <div
      v-if="errors.length"
      class="p-4 text-sm text-red-800 rounded-2xl bg-red-50 border border-red-100/60 shadow-sm"
      role="alert"
    >
      <p v-for="error in errors" :key="error" class="font-medium">
        {{ error }}
      </p>
    </div>

    <div class="w-full">
      <span class="p-float-label w-full block">
        <InputText
          id="forgot-email"
          v-model.trim="email"
          type="email"
          class="w-full px-4 py-4 rounded-xl border border-gray-200 transition-all duration-200 focus:border-[#0b3baa] focus:ring-4 focus:ring-[#0b3baa]/10 bg-gray-50/50 focus:bg-white outline-none text-gray-900 text-sm font-medium"
        />
        <label
          for="forgot-email"
          class="absolute inset-x-4 top-1/2 -translate-y-1/2 text-xs font-bold uppercase tracking-wider text-gray-400 transition-all duration-200 pointer-events-none"
        >
          {{ t('authPasswordReset.emailLabel') }}
        </label>
      </span>
    </div>

    <button
      type="submit"
      class="w-full py-3.5 px-4 text-white font-bold text-sm uppercase tracking-widest rounded-xl bg-[#0b3baa] hover:bg-[#082d8a] active:scale-[0.985] transform transition-all duration-200 shadow-lg shadow-[#0b3baa]/10 hover:shadow-xl hover:shadow-[#0b3baa]/20 focus:outline-none focus:ring-2 focus:ring-[#0b3baa] focus:ring-offset-2"
    >
      {{ t('authPasswordReset.sendResetCode') }}
    </button>

    <div class="text-center">
      <router-link
        :to="{ name: 'login' }"
        class="text-sm font-bold text-[#0b3baa] hover:text-[#082d8a] hover:underline transition-colors"
      >
        {{ t('authPasswordReset.backToLogin') }}
      </router-link>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import InputText from 'primevue/inputtext'

const { t } = useI18n()
const router = useRouter()

const email = ref('')
const errors = ref<string[]>([])
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function submitEmail() {
  errors.value = []

  if (!email.value) {
    errors.value = [t('authPasswordReset.requiredEmail')]
    return
  }

  if (!emailRegex.test(email.value)) {
    errors.value = [t('authPasswordReset.invalidEmail')]
    return
  }

  router.push({
    name: 'reset-password',
    query: { email: email.value },
  })
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
</style>
