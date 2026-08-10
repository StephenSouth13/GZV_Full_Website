'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import FloatingButtons from '@/components/FloatingButtons'
import SiteLoadingOverlay from '@/components/SiteLoadingOverlay'
import ScrollToTop from '@/components/ScrollToTop'
import ManagedPageContent from '@/components/ManagedPageContent'
import SeoBrandingManager from '@/components/SeoBrandingManager'
import { defaultLoadingSettings, getPageSlugFromPath, getSiteLoadingSettings, getSiteNavigation, type SiteLoadingSettings, type SiteNavItem } from '@/lib/site-content'

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [navigation, setNavigation] = useState<SiteNavItem[]>([])
  const [loadingSettings, setLoadingSettings] = useState<SiteLoadingSettings>(defaultLoadingSettings)
  const [booting, setBooting] = useState(true)
  const [routeLoading, setRouteLoading] = useState(false)

  useEffect(() => {
    let active = true
    const started = Date.now()
    Promise.all([getSiteNavigation(), getSiteLoadingSettings()]).then(([nav, loading]) => {
      if (!active) return
      setNavigation(nav)
      setLoadingSettings(loading)
      const wait = Math.max(0, loading.minimum_duration_ms - (Date.now() - started))
      window.setTimeout(() => active && setBooting(false), wait)
    })
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (booting) return
    setRouteLoading(true)
    const timer = window.setTimeout(() => setRouteLoading(false), Math.min(loadingSettings.minimum_duration_ms, 900))
    return () => window.clearTimeout(timer)
  }, [pathname, booting, loadingSettings.minimum_duration_ms])

  const disabledPage = useMemo(() => {
    const slug = getPageSlugFromPath(pathname)
    return navigation.find((item) => getPageSlugFromPath(item.href) === slug && !item.is_page_enabled)
  }, [navigation, pathname])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ScrollToTop />
      <SeoBrandingManager />
      <SiteLoadingOverlay settings={loadingSettings} show={booting || routeLoading} />
      <Header />
      <main>
        {disabledPage ? (
          <section className="flex min-h-[55vh] items-center justify-center bg-slate-50 px-4 py-20 text-center dark:bg-gray-900">
            <div className="max-w-xl">
              <p className="text-sm font-black uppercase tracking-[0.3em] text-[#ed1c24]">GZV</p>
              <h1 className="mt-4 text-3xl font-black text-slate-900 dark:text-white">Trang đang được bảo trì</h1>
              <p className="mt-4 text-slate-600 dark:text-slate-300">Nội dung này đang được admin tạm ẩn và sẽ quay lại khi hoàn tất cập nhật.</p>
            </div>
          </section>
        ) : (
          <>
            {children}
            <ManagedPageContent />
          </>
        )}
      </main>
      <Footer />
      <FloatingButtons />
    </div>
  )
}
