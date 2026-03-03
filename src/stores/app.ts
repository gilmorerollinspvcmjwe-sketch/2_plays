import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  const count = ref(0)
  const name = ref('Vue3 App')

  function increment() {
    count.value++
  }

  function decrement() {
    count.value--
  }

  return { count, name, increment, decrement }
})
