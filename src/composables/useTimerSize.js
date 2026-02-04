import { ref, onMounted, onBeforeUnmount } from 'vue'

// Layout constants
const BOTTOM_NAV_HEIGHT = 56
const DEFAULT_PADDING = 32
const DEBOUNCE_DELAY = 100

/**
 * Debounce helper to prevent excessive resize calculations
 */
function debounce(fn, delay) {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

export function useTimerSize(extraHeight = 0) {
  const timerSize = ref(0)

  const calculateSize = (isRunning = false) => {
    const bottomNavHeight = isRunning ? 0 : BOTTOM_NAV_HEIGHT
    const availableHeight = window.innerHeight - bottomNavHeight - DEFAULT_PADDING - extraHeight
    const availableWidth = window.innerWidth - DEFAULT_PADDING
    timerSize.value = Math.min(availableHeight, availableWidth)
  }

  const onResize = debounce(() => calculateSize(), DEBOUNCE_DELAY)

  onMounted(() => {
    calculateSize()
    window.addEventListener('resize', onResize)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', onResize)
  })

  return {
    timerSize,
    calculateSize
  }
}
