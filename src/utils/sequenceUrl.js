import { formatDuration, parseTimeInput } from '@/stores/sequences'

// Maximum allowed length for names to prevent abuse
const MAX_NAME_LENGTH = 100

/**
 * Sanitize a string to prevent XSS and limit length
 * Removes HTML tags and limits to safe length
 */
function sanitizeString(str) {
  if (!str || typeof str !== 'string') return ''
  // Remove any HTML tags and trim
  const cleaned = str.replace(/<[^>]*>/g, '').trim()
  // Limit length
  return cleaned.slice(0, MAX_NAME_LENGTH)
}

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

      const rawName = decodeURIComponent(stepStr.slice(0, lastColonIndex))
      const name = sanitizeString(rawName)
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

    const rawName = params.get('name') || 'Imported Sequence'
    const name = sanitizeString(rawName)
    const repeatCount = parseInt(params.get('repeat')) || 1
    const autoAdvance = params.get('auto') === '1'
    const rawCategory = params.get('cat') || 'custom'
    // Validate category to prevent injection
    const category = ['cooking', 'productivity', 'custom'].includes(rawCategory) ? rawCategory : 'custom'

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
 * Returns { success: boolean, url?: string }
 * If clipboard unavailable, returns the URL so it can be displayed to user
 */
export async function copySequenceUrl(sequence) {
  const url = encodeSequenceUrl(sequence)

  // Check if clipboard API is available (requires secure context)
  if (!navigator.clipboard || !navigator.clipboard.writeText) {
    console.warn('Clipboard API not available (requires HTTPS)')
    return { success: false, url }
  }

  try {
    await navigator.clipboard.writeText(url)
    return { success: true }
  } catch (e) {
    console.warn('Failed to copy to clipboard:', e)
    return { success: false, url }
  }
}
