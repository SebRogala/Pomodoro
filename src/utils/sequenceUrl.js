import { formatDuration, parseTimeInput } from '@/stores/sequences'

/**
 * Encode a sequence to a shareable URL hash
 * Format: #seq=Step1:1m,Step2:90s&name=MySequence&repeat=1&auto=0
 */
export function encodeSequenceUrl(sequence) {
  const steps = sequence.steps
    .map(s => `${encodeURIComponent(s.name)}:${formatDuration(s.duration)}`)
    .join(',')

  const params = new URLSearchParams()
  params.set('seq', steps)
  params.set('name', sequence.name)

  if (sequence.repeatCount !== 1) {
    params.set('repeat', sequence.repeatCount.toString())
  }

  if (sequence.autoAdvance) {
    params.set('auto', '1')
  }

  if (sequence.category && sequence.category !== 'custom') {
    params.set('cat', sequence.category)
  }

  return `${window.location.origin}${window.location.pathname}#${params.toString()}`
}

/**
 * Decode a sequence from URL hash
 * Returns null if no valid sequence found
 */
export function decodeSequenceUrl(hash) {
  if (!hash || !hash.startsWith('#')) return null

  try {
    const params = new URLSearchParams(hash.slice(1))
    const stepsStr = params.get('seq')

    if (!stepsStr) return null

    const steps = stepsStr.split(',').map((stepStr, index) => {
      const lastColonIndex = stepStr.lastIndexOf(':')
      if (lastColonIndex === -1) return null

      const name = decodeURIComponent(stepStr.slice(0, lastColonIndex))
      const durationStr = stepStr.slice(lastColonIndex + 1)
      const duration = parseTimeInput(durationStr)

      if (!name || !duration) return null

      return {
        id: crypto.randomUUID(),
        name,
        duration
      }
    }).filter(Boolean)

    if (steps.length === 0) return null

    const name = params.get('name') || 'Imported Sequence'
    const repeatCount = parseInt(params.get('repeat')) || 1
    const autoAdvance = params.get('auto') === '1'
    const category = params.get('cat') || 'custom'

    return {
      name,
      steps,
      repeatCount,
      autoAdvance,
      category
    }
  } catch (e) {
    console.warn('Failed to decode sequence URL:', e)
    return null
  }
}

/**
 * Check current URL for a sequence and return it
 */
export function getSequenceFromCurrentUrl() {
  return decodeSequenceUrl(window.location.hash)
}

/**
 * Clear the sequence from URL without reload
 */
export function clearSequenceFromUrl() {
  history.replaceState(null, '', window.location.pathname)
}

/**
 * Copy sequence URL to clipboard
 */
export async function copySequenceUrl(sequence) {
  const url = encodeSequenceUrl(sequence)
  try {
    await navigator.clipboard.writeText(url)
    return true
  } catch (e) {
    console.warn('Failed to copy to clipboard:', e)
    return false
  }
}
