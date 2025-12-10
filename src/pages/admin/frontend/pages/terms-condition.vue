<template>
  <va-card class="card my-4 p-[2%] min-h-[50vh] max-w-7xl m-auto">
    <div class="flex">
      <div class="w-full">
        <!-- Loading State -->
        <div v-if="isLoading" class="flex justify-center items-center h-64">
          <ProgressSpinner style="width: 50px; height: 50px" />
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="text-center text-red-500 py-10">
          <p class="text-lg font-semibold">{{ $t('error.title') }}</p>
          <p>{{ error }}</p>
        </div>

        <!-- Terms and Conditions Content -->
        <div
          v-else-if="currentTermsAndConditions"
          class="prose max-w-none"
          :dir="appLang === 'ar' ? 'rtl' : 'ltr'"
          v-html="sanitizedTermsAndConditions"
        />

        <!-- Empty State -->
        <div v-else class="text-center text-gray-600 py-10">
          <p>{{ $t('termsAndConditions.noContent') }}</p>
        </div>
      </div>
    </div>

    <Toast />
  </va-card>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';
import axios from 'axios';
import ProgressSpinner from 'primevue/progressspinner';
import Toast from 'primevue/toast';
import DOMPurify from 'dompurify';

const { t } = useI18n();
const toast = useToast();

// Get app language from localStorage (fallback to 'en')
const getAppLang = () => localStorage.getItem('appLang') || 'en';
const appLang = ref(getAppLang());

/* ------------------------------------------------------------------ */
/* Reactive data                                                      */
/* ------------------------------------------------------------------ */
const settings = ref([]);           // Full array from API
const isLoading = ref(false);
const error = ref(null);

/* ------------------------------------------------------------------ */
/* Helper: Find setting value by key                                  */
/* ------------------------------------------------------------------ */
const getSettingValue = (key) => {
  const item = settings.value.find(s => s.key === key);
  return item?.value || '';
};

/* ------------------------------------------------------------------ */
/* Computed: Current Terms & Conditions based on language             */
/* ------------------------------------------------------------------ */
const currentTermsAndConditions = computed(() => {
  if (appLang.value === 'ar') {
    return getSettingValue('terms_conditions_ar');
  }
  return getSettingValue('terms_conditions_en');
});

/* ------------------------------------------------------------------ */
/* Sanitized HTML output                                              */
/* ------------------------------------------------------------------ */
const sanitizedTermsAndConditions = computed(() => {
  return DOMPurify.sanitize(currentTermsAndConditions.value);
});

/* ------------------------------------------------------------------ */
/* Load settings data                                                 */
/* ------------------------------------------------------------------ */
onMounted(async () => {
  isLoading.value = true;
  try {
    const { data } = await axios.get('/api/setting/not-auth');

    if (data.is_success && Array.isArray(data.data)) {
      settings.value = data.data;

      // Optional: Show warning if no terms content
      if (!currentTermsAndConditions.value) {
        toast.add({
          severity: 'warn',
          summary: t('termsAndConditions.warning'),
          detail: t('termsAndConditions.noContent'),
          life: 4000,
        });
      }
    } else {
      throw new Error('Invalid response format');
    }
  } catch (e) {
    const message = e.response?.data?.message || t('error.loadTermsAndConditions');
    error.value = message;
    toast.add({
      severity: 'error',
      summary: t('error.title'),
      detail: message,
      life: 5000,
    });
    console.error('Failed to load settings:', e);
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
.card {
  margin: 10px auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Tailwind Prose + Quill Editor (ql-align-right, etc.) support */
.prose {
  color: #374151;
  line-height: 1.75;
  font-size: 1rem;
}

.prose h1,
.prose h2,
.prose h3,
.prose strong {
  color: #1f2937;
  font-weight: 700;
  margin: 1.5rem 0 0.75rem;
}

.prose p {
  margin-bottom: 1rem;
}

.prose ul,
.prose ol {
  padding-left: 1.5rem;
  margin-bottom: 1rem;
}

.prose li {
  margin-bottom: 0.5rem;
}

/* RTL support for Arabic */
[dir="rtl"] .prose {
  text-align: right;
}

[dir="rtl"] .prose ul,
[dir="rtl"] .prose ol {
  padding-right: 1.5rem;
  padding-left: 0;
}

/* Quill-specific classes */
.prose .ql-align-right {
  text-align: right;
}

.prose .ql-align-center {
  text-align: center;
}
</style>
