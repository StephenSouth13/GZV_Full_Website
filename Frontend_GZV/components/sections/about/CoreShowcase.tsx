"use client"

export interface CoreShowcaseProps {
  title?: string
  subtitle?: string
  highlights?: any[]
  items?: any[]
}

export default function CoreShowcase({ title, subtitle, highlights = [], items = [] }: CoreShowcaseProps) {
  const coreItems = items.length ? items : [
    { label: "01", title: "Sứ mệnh", description: "Kết nối tri thức, chuyên gia và doanh nghiệp để tạo ra năng lực tăng trưởng có thể đo lường." },
    { label: "02", title: "Tầm nhìn", description: "Trở thành hệ sinh thái mentoring, coaching và triển khai dự án thế hệ mới tại Việt Nam." },
    { label: "03", title: "Giá trị cốt lõi", description: "Thực chiến, minh bạch, học hỏi liên tục và cam kết tạo tác động thật cho đối tác." },
  ]
  const highlightItems = highlights.length ? highlights : ["Thực chiến", "Minh bạch", "Tăng trưởng"]

  return (
    <section className="relative overflow-hidden bg-slate-50 py-16 text-slate-950 dark:bg-slate-900 dark:text-white lg:py-24">
      <div className="container px-4">
        <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-stretch">
          <div className="border border-slate-200 bg-white p-7 dark:border-white/12 dark:bg-white/[0.04] lg:p-9">
            <h2 className="text-4xl font-black uppercase leading-none text-slate-950 dark:text-white md:text-5xl">
              {title || "Sứ mệnh. Tầm nhìn. Giá trị cốt lõi."}
            </h2>
            <p className="mt-6 text-base font-semibold leading-8 text-slate-600 dark:text-white/68">
              {subtitle || "GZV định hình một hệ sinh thái triển khai thực chiến, nơi tri thức, đội ngũ và doanh nghiệp cùng tăng trưởng bằng kết quả đo lường được."}
            </p>
            <div className="mt-8 grid grid-cols-3 border border-slate-200 dark:border-white/10">
              {highlightItems.slice(0, 3).map((item: any) => (
                <div key={String(item)} className="border-r border-slate-200 p-3 text-center last:border-r-0 dark:border-white/10">
                  <p className="text-[10px] font-black uppercase tracking-wide text-slate-500 dark:text-white/62">{String(item)}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-4">
            {coreItems.map((item: any, index: number) => (
              <article key={item.title || index} className="group grid gap-4 border border-slate-200 bg-white p-5 text-slate-950 transition hover:border-[#ed1c24] dark:border-white/12 dark:bg-slate-950 dark:text-white md:grid-cols-[96px_1fr] md:items-center">
                <div className="flex h-20 w-20 items-center justify-center bg-[#ed1c24] text-2xl font-black text-white">{item.label || `0${index + 1}`}</div>
                <div>
                  <h3 className="text-2xl font-black uppercase">{item.title}</h3>
                  <p className="mt-2 text-sm font-semibold leading-7 text-slate-600 dark:text-slate-300">{item.description || item.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
