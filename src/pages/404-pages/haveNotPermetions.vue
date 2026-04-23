<template>
  <!-- Page wrapper — dot-grid bg via arbitrary Tailwind values -->
  <div class="
      relative flex items-center justify-center overflow-hidden
      min-h-[calc(100vh-10rem)] px-4 py-12
      bg-slate-50
      bg-[radial-gradient(circle,#cbd5e1_1px,transparent_1px)]
      bg-[length:26px_26px]
    ">

    <!-- Ambient red blur at top-center -->
    <div class="
        pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2
        w-[480px] h-[220px]
        bg-[radial-gradient(ellipse,rgba(239,68,68,0.07)_0%,transparent_70%)]
      " />

    <!-- Content -->
    <div class="relative z-10 flex flex-col items-center text-center max-w-[460px] w-full">

      <!-- ① Status pill -->
      <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-200 mb-8">
        <span class="block w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        <span class="font-mono text-[11px] font-medium text-red-500 tracking-widest uppercase">
          HTTP 403 · Access Denied
        </span>
      </div>

      <!-- ② Lock icon with pulse rings -->
      <div class="relative flex items-center justify-center w-32 h-32 mb-6">

        <!-- Outer pulse ring -->
        <span class="absolute inset-0 rounded-full border border-red-200 animate-ping opacity-25" />
        <!-- Inner soft ring -->
        <span class="absolute inset-2 rounded-full border border-red-200 animate-pulse opacity-50" />

        <!-- Icon circle -->
        <div class="
            relative flex items-center justify-center
            w-full h-full rounded-full
            bg-white border-2 border-red-200
            shadow-[0_4px_24px_rgba(239,68,68,0.10)]
          ">
          <!-- Lock SVG -->
          <svg width="46" height="46" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="9" y="21" width="28" height="20" rx="5" fill="#fef2f2" stroke="#ef4444" stroke-width="1.5" />
            <path d="M15 21V15a8 8 0 0 1 16 0v6" stroke="#ef4444" stroke-width="1.5" stroke-linecap="round" />
            <circle cx="23" cy="31" r="3" fill="#ef4444" />
            <line x1="23" y1="34" x2="23" y2="37" stroke="#ef4444" stroke-width="1.5" stroke-linecap="round" />
          </svg>

          <!-- Badge -->
          <div class="
              absolute -bottom-0.5 -right-0.5
              flex items-center justify-center
              w-7 h-7 rounded-full bg-red-500
              border-2 border-slate-50
            ">
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <path d="M2 2L9 9M9 2L2 9" stroke="white" stroke-width="1.8" stroke-linecap="round" />
            </svg>
          </div>
        </div>
      </div>

      <!-- ③ 403 code — outline layered on ghost -->
      <div class="relative mb-1 select-none">
        <!-- Ghost layer (filled light) -->
        <span class="block font-black leading-none tracking-[-5px] text-slate-100" style="font-size: 92px;">
          403
        </span>
        <!-- Outline layer -->
        <span
          class="absolute inset-0 flex items-center justify-center font-black leading-none tracking-[-5px] text-transparent"
          style="font-size: 92px; -webkit-text-stroke: 2px #fca5a5;">
          403
        </span>
      </div>

      <!-- ④ Title -->
      <h1 class="text-[1.65rem] font-extrabold text-slate-900 tracking-tight mt-1 mb-3">
        Permission Denied
      </h1>

      <!-- ⑤ Description -->
      <p class="text-sm text-slate-400 leading-7 mb-6">
        You don't have the required privileges to access this section of the admin panel.
        <br />
        Contact your system administrator to request the necessary access.
      </p>

      <!-- ⑥ Dot divider -->
      <div class="flex items-center gap-1.5 mb-6">
        <span class="block w-1.5 h-1.5 rounded-full bg-slate-200" />
        <span class="block w-1.5 h-1.5 rounded-full bg-red-200" />
        <span class="block w-1.5 h-1.5 rounded-full bg-slate-200" />
      </div>

      <!-- ⑦ Info card -->
      <div class="
          flex items-start gap-3 w-full text-left
          bg-white rounded-xl
          border border-slate-200 border-l-[3px] border-l-blue-500
          p-4 mb-8
          shadow-[0_1px_6px_rgba(0,0,0,0.04)]
        ">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" class="shrink-0 mt-0.5">
          <circle cx="8" cy="8" r="7" stroke="#3b82f6" stroke-width="1.2" />
          <line x1="8" y1="7" x2="8" y2="11.5" stroke="#3b82f6" stroke-width="1.4" stroke-linecap="round" />
          <circle cx="8" cy="5" r=".8" fill="#3b82f6" />
        </svg>
        <p class="text-[13px] text-slate-500 leading-relaxed m-0">
          If you believe this is a mistake, make sure your account has been assigned
          the required role and try refreshing the page.
        </p>
      </div>

      <!-- ⑧ Actions -->
      <div class="flex flex-wrap items-center justify-center gap-3">

        <!-- Ghost button -->
        <button class="
            inline-flex items-center justify-center gap-2
            min-w-[132px] px-5 py-2.5 rounded-xl
            text-sm font-semibold text-slate-500
            bg-white border border-slate-200
            hover:bg-slate-50 hover:text-slate-700 hover:border-slate-300
            active:scale-[.98] transition-all duration-150
          " @click="handleBack">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7l5 5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"
              stroke-linejoin="round" />
          </svg>
          Go Back
        </button>

        <!-- Primary red button -->
        <button class="
            inline-flex items-center justify-center gap-2
            min-w-[132px] px-5 py-2.5 rounded-xl
            text-sm font-semibold text-white
            bg-red-500 border border-red-500
            hover:bg-red-600 hover:border-red-600
            active:scale-[.98] transition-all duration-150
            shadow-[0_2px_12px_rgba(239,68,68,0.25)]
          " @click="handleRefresh">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M12 7A5 5 0 1 1 7 2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
            <path d="M9.5 2H12.5V5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"
              stroke-linejoin="round" />
          </svg>
          Refresh Page
        </button>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function handleBack() {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push({ name: 'dashboard' })
  }
}

function handleRefresh() {
  window.location.reload()
}
</script>
