'use client'

import { motion, Variants } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Users, Award, Handshake, Building2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import PageBanner from "@/components/sections/PageBanner"

export type Partner = {
  id: string
  name: string
  logo_url: string
  category: 'corporate' | 'education'
  sort_order: number
  website_url?: string | null
}

interface Props {
  corporate: Partner[]
  education: Partner[]
}

const stats = [
  { label: "Đối tác doanh nghiệp", value: "100+", icon: Handshake },
  { label: "Dự án hợp tác", value: "100+", icon: Award },
  { label: "Học viên được đào tạo", value: "5,000+", icon: Users },
]

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.45, ease: [0.6, -0.05, 0.01, 0.99] } },
}

function LogoCard({ partner, cardClass, imgClass }: { partner: Partner; cardClass: string; imgClass: string }) {
  const inner = (
    <Card className={cardClass}>
      <Image
        src={partner.logo_url}
        alt={partner.name}
        width={560}
        height={350}
        className={imgClass}
        unoptimized={partner.logo_url.startsWith('/')}
      />
    </Card>
  )
  return partner.website_url ? (
    <Link href={partner.website_url} target="_blank" rel="noopener noreferrer" aria-label={partner.name}>
      {inner}
    </Link>
  ) : inner
}

export default function PartnersClient({ corporate, education }: Props) {
  return (
    <div className="bg-white dark:bg-gray-900">
      <PageBanner
        badge="Mạng lưới toàn cầu"
        title="Đối tác & Đồng hành"
        subtitle="gzv Center có mạng lưới đối tác từ các doanh nghiệp và các trường Đại học có cùng chung tầm nhìn về phát triển giáo dục và nguồn nhân lực chất lượng cao."
        stats={[
          { value: '100+', label: 'Đối tác doanh nghiệp' },
          { value: '100+', label: 'Dự án hợp tác' },
          { value: '5000+', label: 'Học viên' },
          { value: '50+', label: 'Tỉnh thành' },
        ]}
      />

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center p-6 bg-gray-50 rounded-2xl"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <p className="text-gray-600 text-lg">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Corporate Partners */}
      <section className="py-24 bg-gray-50">
        <div className="container">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-green-500 to-teal-500 text-white px-6 py-3 rounded-full mb-4">
              <Handshake className="h-6 w-6" />
              <h2 className="text-3xl font-bold font-serif">Đối tác Doanh nghiệp & Tập đoàn</h2>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mt-4">
              Những doanh nghiệp hàng đầu đã tin tưởng và lựa chọn gzv Center làm đối tác đào tạo và phát triển nguồn nhân lực.
            </p>
          </motion.div>

          {corporate.length === 0 ? (
            <p className="text-center text-gray-500">Chưa có đối tác nào.</p>
          ) : (
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
            >
              {corporate.map(partner => (
                <motion.div key={partner.id} variants={itemVariants}>
                  <LogoCard
                    partner={partner}
                    cardClass="p-6 flex items-center justify-center h-40 bg-white hover:shadow-lg hover:scale-105 transition-all duration-300 rounded-2xl border"
                    imgClass="max-h-24 w-auto object-contain"
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Education & Association */}
      <section className="py-24 bg-white">
        <div className="container">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 rounded-full mb-4">
              <Building2 className="h-6 w-6" />
              <h2 className="text-3xl font-bold font-serif">Đối tác Giáo dục & Hiệp hội</h2>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mt-4">
              Hợp tác chặt chẽ với các trường đại học, viện nghiên cứu và hiệp hội ngành nghề để nâng cao chất lượng đào tạo.
            </p>
          </motion.div>

          {education.length === 0 ? (
            <p className="text-center text-gray-500">Chưa có đối tác nào.</p>
          ) : (
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
            >
              {education.map(partner => (
                <motion.div key={partner.id} variants={itemVariants}>
                  <LogoCard
                    partner={partner}
                    cardClass="p-6 flex items-center justify-center h-32 bg-white hover:shadow-lg hover:scale-105 transition-all duration-300 rounded-2xl border"
                    imgClass="max-h-[6.8rem] w-auto object-contain"
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-teal-600 text-white">
        <div className="container text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 font-serif">Trở thành Đối tác của gzv</h2>
            <p className="text-xl text-blue-100 mb-10 max-w-3xl mx-auto">
              Cùng chúng tôi kiến tạo những giá trị bền vững cho cộng đồng và doanh nghiệp thông qua các chương trình đào tạo chất lượng cao.
            </p>
            <Link href="/lien-he">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-10 py-6">
                Liên hệ Hợp tác
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
