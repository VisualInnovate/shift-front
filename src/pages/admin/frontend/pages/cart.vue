<template>
  <div class="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 font-inter">
    <div v-if="cartImage" class="mb-6 rounded-3xl overflow-hidden shadow-lg">
      <img
        :src="cartImage"
        alt="Cart Banner"
        class="w-full  object-cover"
        loading="lazy"
      />
    </div>

    <div class="flex lg:flex-row flex-col gap-10">
      <section class="flex-1 bg-white rounded-2xl shadow-lg p-6">
        <div v-if="loading" class="flex justify-center items-center py-12 gap-4">
          <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="4" class="text-yellow-600" />
          <p class="text-lg text-gray-700">{{ t('loading') }}</p>
        </div>

        <div v-else>
          <div class="mb-8">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">{{ t('cart.selectStore') }}</h3>
            <div class="flex flex-wrap gap-3">
              <button
                v-for="store in stores"
                :key="store.unique_store_id"
                @click="toggleStore(store.unique_store_id)"
                class="px-5 py-3 rounded-lg text-sm font-medium transition-all"
                :class="
                  selectedStores.includes(store.unique_store_id)
                    ? 'bg-yellow-600 text-white shadow-md'
                    : 'bg-amber-50 text-yellow-700 hover:bg-amber-100'
                "
              >
                {{ store.display_name }}
                <span v-if="store.market_name" class="text-xs block opacity-80"> ({{ store.market_name }}) </span>
              </button>

              <button
                v-if="stores.length > 1"
                @click="selectAllStores"
                class="px-5 py-3 rounded-lg text-sm font-medium bg-amber-50 text-yellow-700 hover:bg-amber-100 transition-all"
              >
                {{ t('cart.selectAllStores') }}
              </button>
            </div>
          </div>

          <div class="mb-8">
            <h3 class="text-lg font-semibold text-gray-800 mb-3">{{ t('cart.selectAddress') }}</h3>

            <div v-if="hasAddresses" class="relative flex gap-3 items-center">
              <select
                v-model="selectedAddress"
                class="flex-1 bg-amber-50 border border-amber-300 rounded-lg px-2 py-1 text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-600"
              >
                <option :value="null" disabled>{{ t('cart.selectAddressPlaceholder') }}</option>
                <option v-for="address in addresses" :key="address.id" :value="address.id">
                  {{ (address.address_line_1 ).slice(0, 30) }}, {{ address.city }}
                </option>
              </select>

              <button
                @click="goToAddAddress"
                class="px-5 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition duration-200 text-sm flex-shrink-0"
              >
                {{ t('cart.addAddressButton') }}
              </button>
            </div>

            <div v-else class="p-4 bg-red-100 border border-red-300 rounded-lg">
              <p class="text-red-700 font-medium mb-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5 inline-block -mt-0.5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clip-rule="evenodd"
                  />
                </svg>
                {{ t('cart.selectAddressWarning') }}
              </p>
              <button
                @click="goToAddAddress"
                class="w-full py-2 bg-yellow-600 text-white font-semibold rounded-lg hover:bg-yellow-700 transition duration-200"
              >
                {{ t('cart.addAddressButton') }}
              </button>
            </div>
          </div>

          <div v-if="filteredProducts.length === 0" class="text-center py-16 text-gray-500 text-lg">
            {{ selectedStores.length === 0 ? t('cart.selectStorePrompt') : t('cart.emptyCart') }}
          </div>

          <div v-else>
            <div
              v-for="product in filteredProducts"
              :key="product.uniqueId"
              class="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 bg-gray-50 rounded-xl mb-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <img
                :src="product.img || '/images/placeholder-product.png'"
                :alt="product.name"
                class="w-24 h-24 object-contain rounded-lg border border-gray-200"
                loading="lazy"
              />

              <div class="flex-1">
                <h4 class="font-semibold text-gray-900 text-lg">{{ product.name }}</h4>
                <span class="text-yellow-700 text-sm mt-1">
                  {{ t('cart.price') }}: {{ (product.price - product.total_discounts_value).toFixed(2) }}
                  {{ t('cart.currency') }}
                </span>
                <span
                  v-if="product.total_discounts_value > 0"
                  class="text-sm m-1 text-[#0b3baa] line-through opacity-80"
                >
                  {{ Number(product.price).toFixed(2) }} {{ t('cart.currency') }}
                </span>

                <div class="flex flex-wrap items-center gap-6 mt-4">
                  <div class="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                    <button
                      @click="updateQuantity(product, product.quantity - 1)"
                      :disabled="product.quantity <= 1"
                      class="w-12 h-10 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      −
                    </button>
                    <span class="w-16 text-center font-medium py-2">{{ product.quantity }}</span>
                    <button
                      @click="updateQuantity(product, product.quantity + 1)"
                      class="w-12 h-10 text-gray-600 hover:bg-gray-100 transition"
                    >
                      +
                    </button>
                  </div>

                  <div class="text-lg font-bold text-gray-900">
                    {{ t('cart.total') || 'Total' }}: {{ getItemTotal(product) }} {{ t('cart.currency') }}
                  </div>

                  <button
                    @click="removeProduct(product)"
                    class="text-red-600 hover:text-red-800 text-sm font-medium transition"
                  >
                    {{ t('cart.remove') }}
                  </button>
                </div>
              </div>
            </div>

             <div v-if="filteredProducts.length > 0" class="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-5">
            <label for="payment-method" class="mb-2 block text-sm font-semibold text-gray-800">
              {{ t('cart.paymentMethod') }}
            </label>
            <div class="relative" :dir="locale === 'ar' ? 'rtl' : 'ltr'">
              <button
                id="payment-method"
                type="button"
                class="flex w-full items-center gap-3 rounded-lg border border-amber-300 bg-white px-4 py-3 text-start text-gray-800 shadow-sm transition hover:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-600"
                :aria-expanded="isPaymentMethodMenuOpen"
                aria-haspopup="listbox"
                @click="isPaymentMethodMenuOpen = !isPaymentMethodMenuOpen"
              >
                <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-yellow-100 text-yellow-700">
                  <i :class="[selectedPaymentMethod?.icon || 'pi pi-wallet', 'text-lg']"></i>
                </span>
                <span class="flex-1 font-medium">{{ getPaymentMethodTitle(selectedPaymentMethod) }}</span>
                <i
                  class="pi text-sm text-yellow-700 transition-transform"
                  :class="isPaymentMethodMenuOpen ? 'pi-chevron-up' : 'pi-chevron-down'"
                ></i>
              </button>

              <div
                v-if="isPaymentMethodMenuOpen"
                class="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-amber-200 bg-white p-1 shadow-xl"
                role="listbox"
                :aria-labelledby="'payment-method'"
              >
                <button
                  v-for="method in paymentOptions"
                  :key="method.id"
                  type="button"
                  :disabled="!method.enabled"
                  class="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-start transition"
                  :class="[
                    method.enabled
                      ? selectedPaymentType === method.id
                        ? 'bg-amber-50 text-yellow-800'
                        : 'text-gray-700 hover:bg-amber-50'
                      : 'cursor-not-allowed text-gray-400',
                  ]"
                  role="option"
                  :aria-selected="selectedPaymentType === method.id"
                  @click="selectedPaymentType = method.id; isPaymentMethodMenuOpen = false"
                >
                  <span
                    class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                    :class="method.enabled ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-400'"
                  >
                    <i :class="[method.icon, 'text-base']"></i>
                  </span>
                  <span class="flex-1 font-medium">
                    {{ getPaymentMethodTitle(method) }}
                    <span v-if="!method.enabled" class="block text-xs font-normal text-gray-400">
                      {{ t('cart.comingSoon') }}
                    </span>
                  </span>
                  <i v-if="selectedPaymentType === method.id" class="pi pi-check text-sm text-yellow-700"></i>
                </button>
              </div>
            </div>
          </div>
          
            <!-- Store Orders -->
            <div
              v-for="order in storeOrders"
              :key="order.unique_store_id"
              class="bg-gradient-to-r from-amber-50 to-yellow-50 p-6 mt-8 rounded-xl border border-amber-200"
            >
              <h3 class="text-xl font-bold text-gray-800 mb-4">
                {{ t('cart.orderFrom') }} {{ getStoreDisplayName(order.unique_store_id) }}
              </h3>

              <!-- Delivery Message -->
              <div
                v-if="order.delivery_message"
                class="mb-4 p-4 rounded-lg text-sm"
                :class="getDeliveryMessageClasses(order.delivery_status)"
              >
                <p class="font-semibold">
                  {{ t('cart.deliveryStatus') }}: {{ getDeliveryStatusDisplay(order.delivery_status) }}
                </p>
              </div>

              <!-- Minimum Amount Warning -->
              <div
                v-if="isBelowMinAmount(order)"
                class="mb-4 p-4 bg-orange-100 border border-orange-300 rounded-lg text-orange-800 text-sm"
              >
                <span class="font-semibold">
                  ⚠️ {{ t('cart.minAmountWarning', { min: order.min_amount_order, currency: t('cart.currency') }) }}
                </span>
                <span class="mx-1 text-base opacity-90">{{ order.min_amount_order }} {{ $t('currencyLabel') }}</span>
              </div>

              <div class="space-y-3 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600">{{ t('cart.shippingTime') }}</span>
                  <span class="font-medium">
                    {{ order.delivery_time || t('cart.notAvailable') }}
                  </span>
                </div>

                <div class="flex justify-between">
                  <span class="text-gray-600">{{ t('cart.deliveryFee') }}</span>
                  <span>{{ Number(order.delivery_fee || 0).toFixed(2) }} {{ t('cart.currency') }}</span>
                </div>

                <div class="flex justify-between">
                  <span class="text-gray-600">{{ t('cart.subtotal') }}</span>
                  <span>{{ Number(order.subtotal).toFixed(2) }} {{ t('cart.currency') }}</span>
                </div>

                <div class="flex justify-between">
                  <span class="text-gray-600">{{ t('cart.tax') }}</span>
                  <span>{{ Number(order.tax).toFixed(2) }} {{ t('cart.currency') }}</span>
                </div>

                <div class="flex justify-between" v-if="order.coupon > 0">
                  <span class="text-green-600 font-medium">{{ t('cart.couponDiscount') }}</span>
                  <span class="text-green-600 font-medium"
                    >- {{ Number(order.coupon).toFixed(2) }} {{ t('cart.currency') }}</span
                  >
                </div>

                <div class="flex justify-between">
                  <span class="text-gray-600">{{ t('cart.serviceFees') }}</span>
                  <span>{{ Number(order.total_service_fees).toFixed(2) }} {{ t('cart.currency') }}</span>
                </div>

                <div class="flex justify-between">
                  <span class="text-green-600 font-medium">{{ t('cart.discountsFees') || 'Discount Fees' }}</span>
                  <span class="text-green-600 font-medium"
                    >{{ Number(order.total_discounts_fees).toFixed(2) }} {{ t('cart.currency') }}</span
                  >
                </div>

                <div class="flex justify-between text-lg font-bold text-gray-900 pt-4 border-t border-amber-300">
                  <span>{{ t('cart.total') }}</span>
                  <span>{{ Number(order.total).toFixed(2) }} {{ t('cart.currency') }}</span>
                </div>
              </div>

              <button
                @click="submitSingleStoreOrder(order.unique_store_id, selectedPaymentType)"
                :disabled="
                  isSubmittingPayment ||
                  !selectedAddress ||
                  order.delivery_status === 'not_available' ||
                  isBelowMinAmount(order) ||
                  storesClose.some(store =>
                    (store.store_id === order.store_id) && (store.market_id === order.market_id) && store.is_busy ||
                      !store.in_time_slots,
                  )
                "
                class="w-full mt-6 py-3 bg-yellow-600 text-white font-bold rounded-lg hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200 shadow-md"
              >
                {{ t('cart.checkoutThisStoreOnly') }}
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Order Summary Sidebar -->
      <aside class="lg:w-96 w-full bg-white rounded-2xl shadow-lg p-6 h-fit sticky top-6">
        <h3 class="text-xl font-bold text-gray-800 mb-6">{{ t('cart.orderSummary') }}</h3>

        <div class="space-y-4 text-sm border-b pb-6">
          <div class="flex justify-between">
            <span class="text-gray-600">{{ t('cart.subtotal') }}</span>
            <span>{{ totalOrderSummary.subtotal.toFixed(2) }} {{ t('cart.currency') }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">{{ t('cart.tax') }}</span>
            <span>{{ totalOrderSummary.tax.toFixed(2) }} {{ t('cart.currency') }}</span>
          </div>
          <div class="flex justify-between" v-if="totalOrderSummary.coupon > 0">
            <span class="text-green-600 font-medium">{{ t('cart.couponDiscount') }}</span>
            <span class="text-green-600 font-medium"
              >- {{ totalOrderSummary.coupon.toFixed(2) }} {{ t('cart.currency') }}</span
            >
          </div>
          <div class="flex justify-between" v-if="totalOrderSummary.total_discounts_fees > 0">
            <span class="text-green-600 font-medium">{{ t('cart.discountsFees') || 'Discount Fees' }}</span>
            <span class="text-green-600 font-medium"
              >{{ totalOrderSummary.total_discounts_fees.toFixed(2) }} {{ t('cart.currency') }}</span
            >
          </div>
          <div class="flex justify-between text-xl font-bold pt-4 text-gray-900">
            <span>{{ t('cart.total') }}</span>
            <span class="text-yellow-700">{{ totalOrderSummary.total.toFixed(2) }} {{ t('cart.currency') }}</span>
          </div>
        </div>

        <!-- Global Minimum Amount Warning -->
        <div
          v-if="totalOrderSummary.belowMinAmountStores.length > 0"
          class="mt-4 p-4 bg-orange-100 border border-orange-300 rounded-lg text-orange-800 text-sm"
        >
          <p class="font-semibold">⚠️ {{ t('cart.someStoresBelowMin') }}</p>
          <ul class="mt-2 text-xs list-disc list-inside opacity-90">
            <li v-for="store in totalOrderSummary.belowMinAmountStores" :key="store.unique_store_id">
              {{ getStoreDisplayName(store.unique_store_id) }}: {{ t('cart.minRequired') }}
              {{ store.min_amount_order }} {{ t('cart.currency') }}
            </li>
          </ul>
        </div>

        <div class="mt-8">
          <input
            v-model="couponCode"
            type="text"
            :placeholder="t('cart.couponPlaceholder')"
            class="w-full px-4 py-3 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 transition"
          />
          <button
            @click="applyCoupon"
            :disabled="!couponCode.trim()"
            class="w-full mt-3 py-3 bg-amber-100 text-yellow-700 font-semibold rounded-lg hover:bg-amber-200 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {{ t('cart.applyCoupon') }}
          </button>
        </div>

        <div class="mt-6">
          <label class="block text-gray-700 font-medium mb-2">{{ t('cart.notes') || 'Special Instructions' }}</label>
          <textarea
            v-model="notes"
            :placeholder="t('cart.notesPlaceholder') || 'Add any special instructions for your order...'"
            class="w-full px-4 py-3 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 transition resize-none"
            rows="4"
          ></textarea>
        </div>

        <button
          @click="submitOrder(selectedPaymentType)"
          :disabled="
            isSubmittingPayment ||
            !canCheckoutAllStores ||
            storesClose.some((store) => !store.in_time_slots || store.is_busy)
          "
          class="w-full mt-8 py-4 bg-gray-900 text-white font-bold text-lg rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200"
        >
          {{ t('cart.checkoutAll') }}
        </button>
        <p
          v-if="!canCheckoutAllStores && selectedAddress && filteredProducts.length > 0"
          class="text-red-500 text-xs mt-2 text-center"
        >
          {{
            totalOrderSummary.unavailable
              ? t('cart.cannotCheckoutDueToDelivery')
              : t('cart.cannotCheckoutDueToMinAmount')
          }}
        </p>
      </aside>
    </div>



    <Teleport to="body">
      <Transition name="payment-sheet">
        <div
          v-if="false && isPaymentSheetOpen"
          class="fixed inset-0 z-50 flex items-end bg-slate-950/45 p-0 sm:items-center sm:justify-center sm:p-6"
          @click.self="closePaymentSheet"
        >
          <section
            class="w-full max-w-xl rounded-t-[2rem] bg-white p-5 shadow-2xl sm:rounded-[2rem] sm:p-7"
            :dir="locale === 'ar' ? 'rtl' : 'ltr'"
            role="dialog"
            aria-modal="true"
            :aria-label="locale === 'ar' ? 'اختيار طريقة الدفع' : 'Choose payment method'"
          >
            <div class="mx-auto mb-5 h-1.5 w-12 rounded-full bg-slate-200 sm:hidden"></div>
            <div class="mb-6 flex items-start justify-between gap-4">
              <div>
                <p class="text-xs font-bold uppercase tracking-[0.18em] text-yellow-600">
                  {{ locale === 'ar' ? 'إتمام الطلب' : 'Checkout' }}
                </p>
                <h2 class="mt-1 text-xl font-bold text-slate-900">
                  {{ locale === 'ar' ? 'اختر طريقة الدفع' : 'Choose a payment method' }}
                </h2>
              </div>
              <button
                type="button"
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"
                :aria-label="locale === 'ar' ? 'إغلاق' : 'Close'"
                @click="closePaymentSheet"
              >
                <i class="pi pi-times"></i>
              </button>
            </div>

            <div class="space-y-3">
              <button
                v-for="method in paymentOptions"
                :key="method.id"
                type="button"
                :disabled="!method.enabled"
                class="flex w-full items-center gap-4 rounded-2xl border p-4 text-start transition"
                :class="[
                  method.enabled
                    ? selectedPaymentType === method.id
                      ? 'border-yellow-500 bg-amber-50 shadow-sm ring-1 ring-yellow-500'
                      : 'border-slate-200 bg-white hover:border-yellow-300 hover:bg-amber-50/50'
                    : 'cursor-not-allowed border-slate-100 bg-slate-50 opacity-60',
                ]"
                @click="selectedPaymentType = method.id"
              >
                <span
                  class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                  :class="method.enabled ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-200 text-slate-400'"
                >
                  <i :class="[method.icon, 'text-lg']"></i>
                </span>
                <span class="min-w-0 flex-1">
                  <span class="block font-bold text-slate-800">{{ method.title }}</span>
                  <span class="mt-1 block text-xs leading-5 text-slate-500">{{ method.description }}</span>
                </span>
                <span
                  v-if="!method.enabled"
                  class="shrink-0 rounded-full bg-slate-200 px-2.5 py-1 text-[10px] font-bold text-slate-500"
                >
                  {{ locale === 'ar' ? 'قريباً' : 'Coming soon' }}
                </span>
                <span
                  v-else
                  class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2"
                  :class="selectedPaymentType === method.id ? 'border-yellow-600 bg-yellow-600 text-white' : 'border-slate-300'"
                >
                  <i v-if="selectedPaymentType === method.id" class="pi pi-check text-[10px]"></i>
                </span>
              </button>
            </div>

            <button
              type="button"
              :disabled="isSubmittingPayment"
              class="mt-6 w-full rounded-xl bg-gray-900 py-4 font-bold text-white transition hover:bg-gray-800 disabled:cursor-wait disabled:bg-slate-400"
              @click="confirmPayment"
            >
              {{
                isSubmittingPayment
                  ? locale === 'ar'
                    ? 'جاري إتمام الطلب...'
                    : 'Placing order...'
                  : locale === 'ar'
                    ? 'تأكيد وإتمام الطلب'
                    : 'Confirm and place order'
              }}
            </button>
          </section>
        </div>
      </Transition>
    </Teleport>

    <Toast />
  </div>
</template>

<script setup>
  import { ref, computed, onMounted, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import axios from 'axios'
  import Toast from 'primevue/toast'
  import ProgressSpinner from 'primevue/progressspinner'
  import { useToast } from 'primevue/usetoast'
  import { useRouter } from 'vue-router'

  const { t, locale } = useI18n()
  const toast = useToast()
  const router = useRouter()

  // Reactive state
  const loading = ref(true)
  const addresses = ref([])
  const selectedAddress = ref(null)
  const couponCode = ref('')
  const notes = ref('')
  const products = ref([])
  const stores = ref([])
  const selectedStores = ref([])
  const storeOrders = ref([])
  const cartImage = ref('')
  const isPaymentSheetOpen = ref(false)
  const isSubmittingPayment = ref(false)
  const selectedPaymentType = ref(1)
  const isPaymentMethodMenuOpen = ref(false)
  const checkoutTarget = ref(null)
  const generateUniqueStoreId = (store) => `${store.store_id}-${store.market_id || 'default'}`

  const paymentOptions = computed(() => {
    const isArabic = locale.value === 'ar'

    return [
      {
        id: 1,
        icon: 'pi pi-money-bill',
        title: isArabic ? 'نقداً عند الاستلام' : 'Cash on delivery',
        description: isArabic ? 'ادفع نقداً عند استلام طلبك.' : 'Pay with cash when your order arrives.',
        enabled: true,
      },
      {
        id: 2,
        icon: 'pi pi-send',
        title: isArabic ? 'الدفع عبر CliQ' : 'Pay with CliQ',
        description: isArabic
          ? 'سنقوم بتزويدك بالاسم المستعار بعد إتمام الطلب.'
          : 'We will provide the alias after your order is placed.',
        enabled: true,
      },
      {
        id: 3,
        icon: 'pi pi-credit-card',
        title: isArabic ? 'بطاقة ائتمانية' : 'Credit card',
        description: isArabic ? 'ادفع بالبطاقة عبر جهاز الدفع عند الاستلام.' : 'Pay by card at delivery.',
        enabled: false,
      },
      {
        id: 4,
        icon: 'pi pi-globe',
        title: isArabic ? 'بطاقة ائتمانية' : 'Credit card',
        description: isArabic
          ? 'ادفع مباشرة داخل التطبيق باستخدام بطاقتك الائتمانية.'
          : 'Pay directly in the app using your credit card.',
        enabled: false,
      },
    ]
  })

  const getPaymentMethodTitle = (method) => {
    if (!method) return ''

    const titles = {
      1: t('cart.cashOnDelivery'),
      2: t('cart.payWithCliq'),
      3: t('cart.creditCard'),
      4: t('cart.creditCard'),
    }

    return titles[method.id]
  }

  const selectedPaymentMethod = computed(() =>
    paymentOptions.value.find((method) => method.id === selectedPaymentType.value),
  )

  const openPaymentSheet = (type, uniqueStoreId = null) => {
    checkoutTarget.value = { type, uniqueStoreId }
    isPaymentSheetOpen.value = true
  }

  const closePaymentSheet = () => {
    isPaymentSheetOpen.value = false
    checkoutTarget.value = null
  }

  const confirmPayment = async () => {
    if (!checkoutTarget.value || isSubmittingPayment.value) return

    isSubmittingPayment.value = true

    try {
      if (checkoutTarget.value?.type === 'single') {
        await submitSingleStoreOrder(checkoutTarget.value.uniqueStoreId, selectedPaymentType.value)
        return
      }

      await submitOrder(selectedPaymentType.value)
    } finally {
      isSubmittingPayment.value = false
    }
  }

  const storesClose = ref([])

  const fetchAddresses = async () => {
    try {
      const { data } = await axios.get('/api/home/address')
      if (data.is_success) {
        addresses.value = data.data
        if (addresses.value.length > 0) {
          const defaultAddress = addresses.value.find((addr) => addr.is_default)
          selectedAddress.value = defaultAddress ? defaultAddress.id : addresses.value[0].id
        }
      }
    } catch (err) {
      toast.add({ severity: 'error', summary: t('error'), detail: t('cart.addressLoadError'), life: 4000 })
    }
  }

  const fetchCart = async () => {
    try {
      loading.value = true
      const { data } = await axios.get('/api/cart')

      if (!data.is_success) return

      cartImage.value = data.data.cart_image || ''

      const allProducts = []
      const uniqueStoresMap = new Map()

      data.data.stores.forEach((storeGroup) => {
        storesClose.value.push({
          store_id: storeGroup.store_id,
          market_id: storeGroup.market_id,
          is_busy: storeGroup.market_is_busy,
          in_time_slots: storeGroup.in_time_slots,
        })
        const unique_store_id = generateUniqueStoreId(storeGroup)

        if (!uniqueStoresMap.has(unique_store_id)) {
          uniqueStoresMap.set(unique_store_id, {
            unique_store_id,
            store_id: storeGroup.store_id,
            display_name: locale.value === 'ar' ? storeGroup.store_name_ar : storeGroup.store_name_en,
            market_name: locale.value === 'ar' ? storeGroup.market_name_ar : storeGroup.market_name_en,
          })
        }

        storeGroup.items.forEach((item) => {
          const price = item.variant?.price || item.product.base_price || 0
          const img =
            item.product.media?.[0]?.url || item.product.key_default_image || '/images/placeholder-product.png'

          allProducts.push({
            uniqueId: `${item.product_id}-${item.variant_id || 'novar'}-${unique_store_id}-${Date.now()}`,
            product_id: item.product_id,
            variant_id: item.variant_id || null,
            name: locale.value === 'ar' ? item.product.name_ar : item.product.name_en,
            img,
            price: Number(price),
            total_discounts_value: item.product.total_discounts_value || 0,
            quantity: item.quantity,
            store_id: storeGroup.store_id,
            unique_store_id,
          })
        })
      })

      stores.value = Array.from(uniqueStoresMap.values())
      products.value = allProducts

      if (stores.value.length > 0) {
        selectedStores.value = stores.value.map((s) => s.unique_store_id)
      }

      await fetchOrderTotals()
    } catch (err) {
      toast.add({ severity: 'error', summary: t('error'), detail: t('cart.cartLoadError'), life: 4000 })
    } finally {
      loading.value = false
    }
  }

  const filteredProducts = computed(() => {
    if (selectedStores.value.length === 0) return []
    return products.value.filter((p) => selectedStores.value.includes(p.unique_store_id))
  })

  const hasAddresses = computed(() => addresses.value.length > 0)

  // New: Check if a store order meets minimum amount
  const isBelowMinAmount = (order) => {
    const min = parseFloat(order.min_amount_order || 0)
    const subtotal = parseFloat(order.subtotal || 0)
    return subtotal < min
  }

  const totalOrderSummary = computed(() => {
    if (storeOrders.value.length === 0) {
      return {
        subtotal: 0,
        tax: 0,
        total: 0,
        coupon: 0,
        total_discounts_fees: 0,
        unavailable: false,
        belowMinAmountStores: [],
      }
    }

    const summary = storeOrders.value.reduce(
      (acc, order) => ({
        subtotal: acc.subtotal + Number(order.subtotal || 0),
        tax: acc.tax + Number(order.tax || 0),
        total: acc.total + Number(order.total || 0),
        coupon: acc.coupon + Number(order.coupon || 0),
        total_discounts_fees: acc.total_discounts_fees + Number(order.total_discounts_fees || 0),
        unavailable: acc.unavailable || order.delivery_status === 'not_available',
        belowMinAmountStores: isBelowMinAmount(order) ? [...acc.belowMinAmountStores, order] : acc.belowMinAmountStores,
      }),
      {
        subtotal: 0,
        tax: 0,
        total: 0,
        coupon: 0,
        total_discounts_fees: 0,
        unavailable: false,
        belowMinAmountStores: [],
      },
    )

    return summary
  })

  // Updated: Can checkout all only if address selected, items exist, delivery available, AND all stores meet min amount
  const canCheckoutAllStores = computed(() => {
    return (
      selectedAddress.value &&
      filteredProducts.value.length > 0 &&
      !totalOrderSummary.value.unavailable &&
      totalOrderSummary.value.belowMinAmountStores.length === 0
    )
  })

  const fetchOrderTotals = async () => {
    if (!selectedAddress.value || filteredProducts.value.length === 0) {
      storeOrders.value = []
      return
    }

    try {
      const payload = {
        address_id: selectedAddress.value,
        view: true,
        items: filteredProducts.value.map((p) => ({
          product_id: p.product_id,
          variant_id: p.variant_id,
          quantity: p.quantity,
        })),
      }

      if (couponCode.value.trim()) payload.coupon = couponCode.value.trim()

      const { data } = await axios.post('/api/order/view', payload)

      if (data.is_success) {
        storeOrders.value = data.data.map((order) => ({
          ...order,
          subtotal: parseFloat(order.subtotal),
          tax: parseFloat(order.tax),
          total: parseFloat(order.total),
          coupon: parseFloat(order.coupon || 0),
          total_service_fees: parseFloat(order.total_service_fees || 0),
          total_discounts_fees: parseFloat(order.total_discounts_fees || 0),
          delivery_fee: parseFloat(order.delivery_fee || 0),
          min_amount_order: order.min_amount_order || '0.00',
          unique_store_id: generateUniqueStoreId({
            store_id: order.store_id,
            market_id: order.market_id,
          }),
        }))
      }
    } catch (err) {
      console.error('Failed to fetch order totals:', err)
      storeOrders.value = []
    }
  }

  const getStoreDisplayName = (unique_store_id) => {
    const store = stores.value.find((s) => s.unique_store_id === unique_store_id)
    return store ? `${store.display_name}${store.market_name ? ` (${store.market_name})` : ''}` : t('cart.unknownStore')
  }

  const goToAddAddress = () => {
    router.push({ name: 'add-addres' })
  }

  const getDeliveryStatusDisplay = (status) => {
    switch (status) {
      case 'available':
        return t('cart.statusAvailable')
      case 'free':
        return t('cart.statusFree')
      case 'not_available':
        return t('cart.statusNotAvailable')
      default:
        return status
    }
  }

  const getDeliveryMessageClasses = (status) => {
    switch (status) {
      case 'available':
      case 'free':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'not_available':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    }
  }

  const toggleStore = (id) => {
    selectedStores.value = selectedStores.value.includes(id)
      ? selectedStores.value.filter((s) => s !== id)
      : [...selectedStores.value, id]
  }

  const selectAllStores = () => {
    selectedStores.value = stores.value.map((s) => s.unique_store_id)
  }

  const getItemTotal = (product) => {
    const priceAfterDiscount = product.price - product.total_discounts_value
    const total = priceAfterDiscount * product.quantity
    return total.toFixed(2)
  }

  const updateQuantity = async (product, newQty) => {
    if (newQty < 1) return

    try {
      await axios.post('/api/cart/update', {
        product_id: product.product_id,
        variant_id: product.variant_id,
        quantity: newQty,
      })

      product.quantity = newQty
      await fetchOrderTotals()

      toast.add({
        severity: 'success',
        summary: t('success'),
        detail: newQty > product.quantity ? t('cart.quantityIncreased') : t('cart.quantityDecreased'),
        life: 2000,
      })
    } catch (err) {
      toast.add({ severity: 'error', summary: t('error'), detail: t('cart.quantityUpdateError'), life: 4000 })
    }
  }

  const removeProduct = async (product) => {
    try {
      await axios.post('/api/cart/remove', {
        product_id: product.product_id,
        variant_id: product.variant_id,
      })

      products.value = products.value.filter((p) => p.uniqueId !== product.uniqueId)
      await fetchOrderTotals()

      toast.add({ severity: 'success', summary: t('success'), detail: t('cart.removeSuccess'), life: 3000 })
    } catch (err) {
      toast.add({ severity: 'error', summary: t('error'), detail: t('cart.removeError'), life: 4000 })
    }
  }

  const applyCoupon = async () => {
    await fetchOrderTotals()
    toast.add({ severity: 'success', summary: t('success'), detail: t('cart.couponApplied'), life: 3000 })
  }

  const submitSingleStoreOrder = async (unique_store_id, paymentType) => {
    const order = storeOrders.value.find((o) => o.unique_store_id === unique_store_id)

    if (!selectedAddress.value) {
      toast.add({ severity: 'warn', summary: t('warning'), detail: t('cart.selectAddressFirst'), life: 4000 })
      return
    }

    if (order.delivery_status === 'not_available') {
      toast.add({ severity: 'error', summary: t('error'), detail: t('cart.cannotCheckoutDueToDelivery'), life: 5000 })
      return
    }

    if (isBelowMinAmount(order)) {
      toast.add({
        severity: 'warn',
        summary: t('warning'),
        detail: t('cart.minAmountNotMet', { min: order.min_amount_order }),
        life: 5000,
      })
      return
    }

    const itemsInThisStore = filteredProducts.value.filter((p) => p.unique_store_id === unique_store_id)

    if (itemsInThisStore.length === 0) {
      toast.add({ severity: 'info', summary: t('info'), detail: t('cart.noItemsInStore'), life: 3000 })
      return
    }

    if (isSubmittingPayment.value) return
    isSubmittingPayment.value = true

    try {
      const payload = {
        address_id: selectedAddress.value,
        payment_type: paymentType,
        items: itemsInThisStore.map((p) => ({
          product_id: p.product_id,
          variant_id: p.variant_id,
          quantity: p.quantity,
        })),
      }
      if (couponCode.value.trim()) payload.coupon = couponCode.value.trim()
      if (notes.value.trim()) payload.notes = notes.value.trim()

      const { data } = await axios.post('/api/order', payload)

      if (data.is_success) {
        toast.add({
          severity: 'success',
          summary: t('success'),
          detail: t('cart.orderSuccessStore', { store: getStoreDisplayName(unique_store_id) }),
          life: 5000,
        })

        products.value = products.value.filter((p) => p.unique_store_id !== unique_store_id)
        selectedStores.value = selectedStores.value.filter((id) => id !== unique_store_id)
        closePaymentSheet()
        await fetchOrderTotals()
      }
    } catch (err) {
      const msg = err.response?.data?.message || t('cart.orderError')
      toast.add({ severity: 'error', summary: t('error'), detail: msg, life: 5000 })
    } finally {
      isSubmittingPayment.value = false
    }
  }

  const submitOrder = async (paymentType) => {
    if (!canCheckoutAllStores.value) {
      if (!selectedAddress.value) {
        toast.add({ severity: 'error', summary: t('error'), detail: t('cart.selectAddressWarning'), life: 5000 })
        goToAddAddress()
        return
      }
      if (totalOrderSummary.value.belowMinAmountStores.length > 0) {
        toast.add({
          severity: 'warn',
          summary: t('warning'),
          detail: t('cart.cannotCheckoutDueToMinAmount'),
          life: 5000,
        })
      } else if (totalOrderSummary.value.unavailable) {
        toast.add({ severity: 'error', summary: t('error'), detail: t('cart.cannotCheckoutDueToDelivery'), life: 5000 })
      }
      return
    }

    if (isSubmittingPayment.value) return
    isSubmittingPayment.value = true

    try {
      const payload = {
        address_id: selectedAddress.value,
        payment_type: paymentType,
        items: filteredProducts.value.map((p) => ({
          product_id: p.product_id,
          variant_id: p.variant_id,
          quantity: p.quantity,
        })),
      }
      if (couponCode.value.trim()) payload.coupon = couponCode.value.trim()
      if (notes.value.trim()) payload.notes = notes.value.trim()

      const { data } = await axios.post('/api/order', payload)

      if (data.is_success) {
        toast.add({ severity: 'success', summary: t('success'), detail: t('cart.orderSuccess'), life: 5000 })
        products.value = []
        storeOrders.value = []
        selectedStores.value = []
        notes.value = ''
        couponCode.value = ''
        closePaymentSheet()
      }
    } catch (err) {
      const msg = err.response?.data?.message || t('cart.orderError')
      toast.add({ severity: 'error', summary: t('error'), detail: msg, life: 5000 })
    } finally {
      isSubmittingPayment.value = false
    }
  }

  watch(() => [selectedAddress.value, selectedStores.value, couponCode.value], fetchOrderTotals, { deep: true })

  onMounted(() => {
    fetchAddresses()
    fetchCart()
  })
</script>

<style scoped>
  .payment-sheet-enter-active,
  .payment-sheet-leave-active {
    transition: opacity 0.2s ease;
  }

  .payment-sheet-enter-active section,
  .payment-sheet-leave-active section {
    transition: transform 0.25s ease;
  }

  .payment-sheet-enter-from,
  .payment-sheet-leave-to {
    opacity: 0;
  }

  .payment-sheet-enter-from section,
  .payment-sheet-leave-to section {
    transform: translateY(100%);
  }

  [dir='rtl'] .mr-4 {
    margin-right: 0;
    margin-left: 1rem;
  }
</style>
