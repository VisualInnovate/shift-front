import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import { ref } from 'vue'

export const useCartStore = defineStore('Cart', {
  state: () => ({
    cartTotal: useStorage('cartTotal', 0),
    cartCount: useStorage('cartCount', 0),
    storeOrders: useStorage('storeOrders', []),
  }),
  getters: {
    total: (state) => state.cartTotal,
    itemCount: (state) => state.cartCount,
    orders: (state) => state.storeOrders,
  },
  actions: {
    setCartTotal(total) {
      this.cartTotal = total
    },
    setCartCount(count) {
      this.cartCount = count
    },
    setStoreOrders(orders) {
      this.storeOrders = orders
    },
    clearCart() {
      this.cartTotal = 0
      this.cartCount = 0
      this.storeOrders = []
    },
  },
})
