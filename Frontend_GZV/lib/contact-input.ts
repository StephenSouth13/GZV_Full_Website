import { z } from 'zod'

export const contactInput = z.object({
  name: z.string().trim().min(1).max(255),
  email: z.string().trim().email().max(255),
  message: z.string().trim().min(1).max(5000),
  phone: z.string().trim().max(80).nullish(),
  subject: z.string().trim().max(255).nullish(),
  source: z.string().trim().max(120).optional(),
  data: z.record(z.union([z.string().max(2000), z.number().finite(), z.boolean(), z.null()]))
    .refine(value => Object.keys(value).length <= 30).optional(),
})

/** Enforce the limit while streaming, including requests without Content-Length. */
export async function readContactBody(request: Request, maxBytes = 32768) {
  if (Number(request.headers.get('content-length')) > maxBytes) throw new RangeError('Payload too large')
  const reader = request.body?.getReader()
  if (!reader) throw new SyntaxError('Missing body')
  const decoder = new TextDecoder()
  let size = 0, text = ''
  try {
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > maxBytes) { await reader.cancel(); throw new RangeError('Payload too large') }
      text += decoder.decode(value, { stream: true })
    }
    return JSON.parse(text + decoder.decode())
  } finally { reader.releaseLock() }
}

/** Per-instance abuse brake; production edge limits remain a separate rollout task. */
const attempts = new Map<string, { count: number; until: number }>()
export function acceptContactAttempt(key: string, now = Date.now()) {
  const current = attempts.get(key)
  if (current && current.until > now) {
    if (current.count >= 5) return false
    current.count++
    return true
  }
  if (attempts.size >= 2048) {
    for (const [storedKey, value] of attempts) if (value.until <= now) attempts.delete(storedKey)
    // Do not evict active counters under an identity flood.
    if (attempts.size >= 2048) return false
  }
  attempts.set(key, { count: 1, until: now + 60000 })
  return true
}
