import { ref, onMounted, onBeforeUnmount } from 'vue'

export function useTimerSize(extraHeight = 0) {
  const timerSize = ref(0)

  const calculateSize = (isRunning = false) => {
    const bottomNavHeight = isRunning ? 0 : 56
    const padding = 32
    const availableHeight = window.innerHeight - bottomNavHeight - padding - extraHeight
    const availableWidth = window.innerWidth - padding
    timerSize.value = Math.min(availableHeight, availableWidth)
  }

  const onResize = () => calculateSize()

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
