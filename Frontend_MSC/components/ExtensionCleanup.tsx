'use client'

import { useEffect } from 'react'

export default function ExtensionCleanup() {
  useEffect(() => {
    const ATTRS = ['data-new-gr-c-s-check-loaded', 'data-gr-ext-installed']

    function stripAttrs(node: Element | Document) {
      try {
        const el = node as Element
        if (el && el.hasAttribute) {
          ATTRS.forEach((a) => {
            if (el.hasAttribute && el.hasAttribute(a)) el.removeAttribute(a)
          })
        }
      } catch (e) {
        // ignore
      }
    }

    // Initialize ethereum property safely to prevent extension conflicts
    if (typeof window !== 'undefined' && !window.hasOwnProperty('ethereum')) {
      try {
        Object.defineProperty(window, 'ethereum', {
          value: undefined,
          writable: true,
          configurable: true,
        })
      } catch (e) {
        // ignore if already defined
      }
    }

    // Strip from documentElement and body immediately
    if (typeof document !== 'undefined') {
      stripAttrs(document.documentElement)
      stripAttrs(document.body)
    }

    // Observe future attribute additions or new nodes
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === 'attributes' && m.target instanceof Element) {
          stripAttrs(m.target as Element)
        }
        if (m.type === 'childList') {
          m.addedNodes.forEach((n) => {
            if (n instanceof Element) {
              stripAttrs(n)
              // also strip recursively on children
              n.querySelectorAll?.(ATTRS.map(() => '*').join(',')).forEach((c) => {
                ATTRS.forEach((a) => c.removeAttribute?.(a))
              })
            }
          })
        }
      }
    })

    observer.observe(document.documentElement || document, {
      attributes: true,
      attributeFilter: ATTRS as any,
      childList: true,
      subtree: true,
    })

    return () => observer.disconnect()
  }, [])

  return null
}
