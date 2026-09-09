"use client"

export interface HeroStatsProps {
  title?: string
  subtitle?: string
  stats?: Array<{ label: string; value: string }>
  backgroundFrom?: string
  backgroundTo?: string
}

export default function HeroStats({ title, subtitle, stats = [], backgroundFrom = "#050505", backgroundTo = "#ed1c24" }: HeroStatsProps) {
  return (
    <section className="py-16 sm:py-20 text-white" style={{ background: `linear-gradient(135deg, ${backgroundFrom}, ${backgroundTo})` }}>
      <div className="container px-4">
        <div className="mx-auto max-w-5xl text-center">
          {title && <h1 className="text-4xl font-black tracking-tight sm:text-5xl md:text-6xl">{title}</h1>}
          {subtitle && <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-white/85 sm:text-xl">{subtitle}</p>}
          {stats.length > 0 && (
            <div className="mt-10 grid grid-cols-2 gap-5 md:grid-cols-4">
              {stats.map((stat: any, index: number) => (
                <div key={index} className="bg-white/5 p-3">
                  <div className="text-3xl font-black text-[#ed1c24]">{stat.value}</div>
                  <div className="mt-1 text-sm text-white/75">{stat.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
