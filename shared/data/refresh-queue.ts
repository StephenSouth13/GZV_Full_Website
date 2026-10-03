/** Coalesce bursts and serialize reloads; a change during loading gets one follow-up. */
export function createRefreshQueue(load: () => Promise<unknown>, delay = 200) {
  let timer: ReturnType<typeof setTimeout> | undefined
  let running = false, dirty = false, disposed = false
  const run = async () => {
    timer = undefined
    if (disposed || running) return
    running = true
    dirty = false
    try { await load() } finally {
      running = false
      if (dirty && !disposed) schedule()
    }
  }
  const schedule = () => {
    if (disposed) return
    dirty = true
    if (running) return
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => { void run().catch(() => {}) }, delay)
  }
  return { schedule, dispose() { disposed = true; if (timer) clearTimeout(timer) } }
}
