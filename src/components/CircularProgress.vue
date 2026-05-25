<template>
  <div class="circular-progress">
    <canvas ref="canvasRef" :width="size" :height="size"></canvas>
    <img class="background" :width="size" :src="timerBackground">
  </div>
</template>

<script>
import { ref, watch, onMounted, nextTick } from 'vue'
import timerBackgroundImg from '@/assets/timer-background-960.png'

export default {
  name: 'CircularProgress',
  props: {
    size: {
      type: Number,
      default: 300
    },
    remainingSeconds: {
      type: Number,
      default: 0
    },
    totalSeconds: {
      type: Number,
      default: 0
    },
    // [{ seconds, color, label }]. Total <= 3600. First entry is the active
    // (shrinking) segment.
    segments: {
      type: Array,
      default: null
    }
  },
  setup(props) {
    const canvasRef = ref(null)
    const ctx = ref(null)
    const timerBackground = timerBackgroundImg
    const strokeColor = '#950703'
    const constantsColor = '#000000'

    const degToRad = (degree) => degree * (Math.PI / 180)

    const drawCenterDot = () => {
      ctx.value.strokeStyle = constantsColor
      ctx.value.lineWidth = 10
      ctx.value.beginPath()
      ctx.value.arc(props.size / 2, props.size / 2, 5, degToRad(0), degToRad(360))
      ctx.value.stroke()
    }

    const renderSingle = (lineWidth) => {
      const minutesRemaining = props.remainingSeconds / 60
      if (minutesRemaining <= 0) return

      ctx.value.lineWidth = lineWidth
      ctx.value.strokeStyle = strokeColor
      ctx.value.beginPath()
      ctx.value.arc(
        props.size / 2,
        props.size / 2,
        lineWidth / 2,
        degToRad(-(minutesRemaining * 6) - 90),
        degToRad(-90)
      )
      ctx.value.stroke()
    }

    const renderSegmented = (lineWidth) => {
      const cx = props.size / 2
      const cy = props.size / 2
      const arcRadius = lineWidth / 2
      const outerRadius = lineWidth

      // 3600s mapped to 360deg → 1s = 0.1deg.
      let cumDeg = -90
      const boundaries = [cumDeg]
      for (const seg of props.segments) {
        const segDeg = seg.seconds * 0.1
        if (segDeg <= 0) continue
        const endDeg = cumDeg
        const startDeg = cumDeg - segDeg
        ctx.value.lineWidth = lineWidth
        ctx.value.strokeStyle = seg.color || strokeColor
        ctx.value.beginPath()
        ctx.value.arc(cx, cy, arcRadius, degToRad(startDeg), degToRad(endDeg))
        ctx.value.stroke()
        cumDeg = startDeg
        boundaries.push(cumDeg)
      }

      // Skip the outermost edge so the clock-face start tick remains clean.
      ctx.value.strokeStyle = '#ffffff'
      ctx.value.lineWidth = Math.max(2, props.size * 0.008)
      for (let i = 1; i < boundaries.length - 1; i++) {
        const a = degToRad(boundaries[i])
        ctx.value.beginPath()
        ctx.value.moveTo(cx, cy)
        ctx.value.lineTo(cx + outerRadius * Math.cos(a), cy + outerRadius * Math.sin(a))
        ctx.value.stroke()
      }

      // Skip segments under 3 min (18°) — too narrow to read.
      const fontPx = Math.max(11, Math.round(props.size * 0.045))
      ctx.value.font = `bold ${fontPx}px sans-serif`
      ctx.value.textAlign = 'center'
      ctx.value.textBaseline = 'middle'
      ctx.value.fillStyle = '#ffffff'
      let labelCum = -90
      for (const seg of props.segments) {
        const segDeg = seg.seconds * 0.1
        if (segDeg >= 18 && seg.label) {
          const midDeg = labelCum - segDeg / 2
          const labelRadius = outerRadius * 0.62
          const a = degToRad(midDeg)
          ctx.value.fillText(seg.label, cx + labelRadius * Math.cos(a), cy + labelRadius * Math.sin(a))
        }
        labelCum -= segDeg
      }
    }

    const render = () => {
      if (!ctx.value || props.size <= 0) return

      const lineWidth = (props.size / 2) - props.size * 0.115

      ctx.value.fillStyle = 'white'
      ctx.value.fillRect(0, 0, props.size, props.size)

      if (props.segments && props.segments.length > 0) {
        renderSegmented(lineWidth)
      } else {
        renderSingle(lineWidth)
      }

      drawCenterDot()
    }

    onMounted(async () => {
      await nextTick()
      ctx.value = canvasRef.value.getContext('2d')
      render()
    })

    watch(() => props.size, render)
    watch(() => props.remainingSeconds, render)
    watch(() => props.totalSeconds, render)
    watch(() => props.segments, render, { deep: true })

    return {
      canvasRef,
      timerBackground
    }
  }
}
</script>

<style lang="scss" scoped>
.circular-progress {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

canvas {
  display: block;
  transition: width 0.2s ease, height 0.2s ease;
}

.background {
  position: absolute;
  pointer-events: none;
  transition: width 0.2s ease;
}
</style>
