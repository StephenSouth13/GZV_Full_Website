type Entry<T> = { value: T; expires: number }
type Pending<T> = { promise: Promise<T> }
type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem" | "key" | "length">

/** Bounded cache with request coalescing and race-safe invalidation. Never store credentials here. */
export class RequestCache {
  private entries = new Map<string, Entry<any>>()
  private pending = new Map<string, Pending<any>>()
  private failures = new Map<string, { error: unknown; expires: number }>()
  constructor(private maxEntries = 80, private storage?: () => StorageLike | undefined, private namespace = "gzv-public-v2:") {}

  peek<T>(key: string): T | undefined {
    let entry = this.entries.get(key)
    if (!entry && this.storage) {
      try {
        const raw = this.storage()?.getItem(this.namespace + key)
        if (raw) { const parsed = JSON.parse(raw); if (typeof parsed.expires === "number" && parsed.expires > Date.now()) { entry = parsed; this.put(key, parsed.value, parsed.expires) } else this.storage()?.removeItem(this.namespace + key) }
      } catch {}
    }
    if (entry && entry.expires > Date.now()) return entry.value as T
    return undefined
  }

  async get<T>(key: string, loader: () => Promise<T>, ttl = 60000): Promise<T> {
    const cached = this.peek<T>(key)
    if (cached !== undefined) return cached
    const existing = this.pending.get(key)
    if (existing) return existing.promise
    const failed = this.failures.get(key)
    if (failed && failed.expires > Date.now()) throw failed.error
    const promise = Promise.resolve().then(loader).then((value) => {
      if (this.pending.get(key)?.promise === promise) this.put(key, value, Date.now() + ttl)
      return value
    }).catch((error) => {
      if (this.pending.get(key)?.promise === promise) {
        this.failures.set(key, { error, expires: Date.now() + 10000 })
        if (this.failures.size > this.maxEntries) this.failures.delete(this.failures.keys().next().value as string)
      }
      throw error
    }).finally(() => {
      if (this.pending.get(key)?.promise === promise) this.pending.delete(key)
    })
    this.pending.set(key, { promise })
    return promise
  }

  put<T>(key: string, value: T, expires = Date.now() + 60000) {
    this.entries.delete(key)
    this.entries.set(key, { value, expires })
    this.failures.delete(key)
    try {
      const store = this.storage?.()
      if (store) {
        const serialized = JSON.stringify({ value, expires })
        // Very large portfolios stay in memory instead of exhausting browser storage.
        if (serialized.length < 1000000) store.setItem(this.namespace + key, serialized)
        else store.removeItem(this.namespace + key)
        const storedKeys: string[] = []
        for (let i = 0; i < store.length; i++) { const storedKey = store.key(i); if (storedKey?.startsWith(this.namespace)) storedKeys.push(storedKey) }
        while (storedKeys.length > this.maxEntries) store.removeItem(storedKeys.shift()!)
      }
    } catch {}
    while (this.entries.size > this.maxEntries) {
      const oldest = this.entries.keys().next().value as string
      this.entries.delete(oldest)
      try { this.storage?.()?.removeItem(this.namespace + oldest) } catch {}
    }
  }

  invalidate(prefix = "") {
    const keys = new Set([...this.entries.keys(), ...this.pending.keys(), ...this.failures.keys()])
    for (const key of keys) if (key.startsWith(prefix)) {
      this.entries.delete(key); this.pending.delete(key); this.failures.delete(key)
      try { this.storage?.()?.removeItem(this.namespace + key) } catch {}
    }
    // Include persisted entries that have not been hydrated in this tab yet.
    try {
      const store = this.storage?.()
      if (store) {
        const storedKeys: string[] = []
        for (let i = 0; i < store.length; i++) { const key = store.key(i); if (key?.startsWith(this.namespace + prefix)) storedKeys.push(key) }
        storedKeys.forEach((key) => store.removeItem(key))
      }
    } catch {}
  }
}
