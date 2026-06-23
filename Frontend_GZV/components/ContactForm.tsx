'use client'

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { MapPin, Phone, Mail, Clock, Facebook, MessageSquare, Send, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import PageBanner from "@/components/sections/PageBanner"
import { supabase } from "@/lib/api-supabase"

type FieldType =
  | 'text'
  | 'email'
  | 'tel'
  | 'number'
  | 'url'
  | 'textarea'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'date'

interface FormField {
  id: string
  field_key: string
  label: string
  field_type: FieldType
  placeholder?: string | null
  help_text?: string | null
  options: Array<{ label: string; value: string }> | string[]
  is_required: boolean
  is_active: boolean
  sort_order: number
  width: 'full' | 'half'
}

const DEFAULT_FIELDS: FormField[] = [
  { id: 'd1', field_key: 'name', label: 'Họ và tên', field_type: 'text', placeholder: 'Nguyễn Văn A', options: [], is_required: true, is_active: true, sort_order: 1, width: 'full' },
  { id: 'd2', field_key: 'email', label: 'Email', field_type: 'email', placeholder: 'email@example.com', options: [], is_required: true, is_active: true, sort_order: 2, width: 'half' },
  { id: 'd3', field_key: 'phone', label: 'Số điện thoại', field_type: 'tel', placeholder: '090 xxx xxxx', options: [], is_required: false, is_active: true, sort_order: 3, width: 'half' },
  { id: 'd4', field_key: 'message', label: 'Nội dung', field_type: 'textarea', placeholder: 'Tôi cần tư vấn về khóa học...', options: [], is_required: true, is_active: true, sort_order: 4, width: 'full' },
]

function normalizeOptions(raw: any): Array<{ label: string; value: string }> {
  if (!raw) return []
  if (Array.isArray(raw)) {
    return raw.map((o: any) => {
      if (typeof o === 'string') return { label: o, value: o }
      return { label: String(o.label ?? o.value ?? ''), value: String(o.value ?? o.label ?? '') }
    }).filter(o => o.value)
  }
  return []
}

export default function ContactForm() {
  const [fields, setFields] = useState<FormField[]>(DEFAULT_FIELDS)
  const [values, setValues] = useState<Record<string, any>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null)
  const [errorMsg, setErrorMsg] = useState<string>('')

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const { data, error } = await supabase
          .from('contact_form_fields')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true })
        if (error) throw error
        if (mounted && data && data.length > 0) {
          setFields(
            data.map((r: any) => ({
              ...r,
              options: normalizeOptions(r.options),
              width: r.width === 'half' ? 'half' : 'full',
            })) as FormField[]
          )
        }
      } catch {
        // fallback to defaults
      }
    })()
    return () => { mounted = false }
  }, [])

  // Reset values whenever fields change
  useEffect(() => {
    setValues((prev) => {
      const next: Record<string, any> = {}
      for (const f of fields) {
        next[f.field_key] = prev[f.field_key] ?? (f.field_type === 'checkbox' ? false : '')
      }
      return next
    })
  }, [fields])

  const setVal = (key: string, v: any) =>
    setValues((p) => ({ ...p, [key]: v }))

  const contactInfo = useMemo(() => ([
    { icon: MapPin, title: "Địa chỉ", lines: ["279 Nguyễn Tri Phương, Phường 5,", "Phường Diên Hồng,  TP. Hồ Chí Minh"] },
    { icon: Phone, title: "Điện thoại", lines: ["(+84) 329 381 489"], link: "tel:+84329381489" },
    { icon: Mail, title: "Email", lines: ["gzv.one@gmail.com"], link: "mailto:gzv.one@gmail.com" },
    { icon: Clock, title: "Giờ làm việc", lines: ["Thứ 2 - Thứ 7: 8:00 - 17:30", "Chủ nhật: Nghỉ"] },
  ]), [])

  const socialLinks = [
    { icon: Facebook, name: "Facebook", href: "https://www.facebook.com/gzv.one" },
    { icon: MessageSquare, name: "Zalo", href: "https://zalo.me/g/acumou501" },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus(null)
    setErrorMsg('')

    // Validate
    for (const f of fields) {
      const v = values[f.field_key]
      if (f.is_required && (v === undefined || v === null || v === '' || v === false)) {
        setErrorMsg(`Vui lòng nhập "${f.label}".`)
        setSubmitStatus('error')
        setIsSubmitting(false)
        return
      }
    }

    const reserved = ['name', 'email', 'phone', 'subject', 'message']
    const payload: any = {
      name: values.name ?? null,
      email: values.email ?? null,
      phone: values.phone ?? null,
      subject: values.subject ?? null,
      message: values.message ?? null,
      data: {},
      source: 'lien-he',
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
    }
    for (const f of fields) {
      if (!reserved.includes(f.field_key)) {
        payload.data[f.field_key] = values[f.field_key] ?? null
      }
    }

    let submitError: string | null = null
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        submitError = body?.error || 'Không gửi được tin nhắn.'
      }
    } catch {
      const { error } = await supabase.from('contact_messages').insert(payload)
      submitError = error?.message || null
    }

    if (submitError) {
      setSubmitStatus('error')
      setErrorMsg('Không gửi được tin nhắn. Vui lòng thử lại sau.')
    } else {
      setSubmitStatus('success')
      const cleared: Record<string, any> = {}
      for (const f of fields) cleared[f.field_key] = f.field_type === 'checkbox' ? false : ''
      setValues(cleared)
    }
    setIsSubmitting(false)
  }

  const renderField = (f: FormField) => {
    const v = values[f.field_key] ?? ''
    const common = {
      id: f.field_key,
      name: f.field_key,
      required: f.is_required,
      placeholder: f.placeholder ?? '',
    }

    switch (f.field_type) {
      case 'textarea':
        return (
          <Textarea {...common} rows={5} value={v}
            onChange={(e) => setVal(f.field_key, e.target.value)} />
        )
      case 'select':
        return (
          <Select value={v || undefined} onValueChange={(val) => setVal(f.field_key, val)}>
            <SelectTrigger><SelectValue placeholder={f.placeholder || 'Chọn...'} /></SelectTrigger>
            <SelectContent>
              {normalizeOptions(f.options).map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      case 'radio':
        return (
          <RadioGroup value={v} onValueChange={(val) => setVal(f.field_key, val)} className="flex flex-wrap gap-4">
            {normalizeOptions(f.options).map((o) => (
              <div key={o.value} className="flex items-center space-x-2">
                <RadioGroupItem id={`${f.field_key}-${o.value}`} value={o.value} />
                <Label htmlFor={`${f.field_key}-${o.value}`}>{o.label}</Label>
              </div>
            ))}
          </RadioGroup>
        )
      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox id={f.field_key} checked={!!v}
              onCheckedChange={(c) => setVal(f.field_key, !!c)} />
            <Label htmlFor={f.field_key} className="text-sm text-gray-700">
              {f.help_text || f.label}
            </Label>
          </div>
        )
      case 'date':
        return <Input {...common} type="date" value={v} onChange={(e) => setVal(f.field_key, e.target.value)} />
      case 'number':
        return <Input {...common} type="number" value={v} onChange={(e) => setVal(f.field_key, e.target.value)} />
      case 'url':
        return <Input {...common} type="url" value={v} onChange={(e) => setVal(f.field_key, e.target.value)} />
      case 'email':
        return <Input {...common} type="email" value={v} onChange={(e) => setVal(f.field_key, e.target.value)} />
      case 'tel':
        return <Input {...common} type="tel" value={v} onChange={(e) => setVal(f.field_key, e.target.value)} />
      default:
        return <Input {...common} type="text" value={v} onChange={(e) => setVal(f.field_key, e.target.value)} />
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900">
      <PageBanner
        badge="Liên hệ ngay"
        title="Kết nối với gzv"
        subtitle="Chúng tôi luôn sẵn sàng lắng nghe và tư vấn. Hãy để lại lời nhắn hoặc liên hệ trực tiếp để bắt đầu hành trình phát triển của bạn."
        stats={[
          { value: '+84', label: 'Điện thoại' },
          { value: '24/7', label: 'Hỗ trợ' },
          { value: '100%', label: 'Tin cậy' },
          { value: 'Online', label: 'Sẵn sàng' },
        ]}
      />

      <section className="py-24 bg-white">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            <motion.div
              className="lg:col-span-3"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
            >
              <Card className="shadow-2xl border-0 rounded-2xl p-4 md:p-8">
                <CardHeader>
                  <CardTitle className="text-3xl font-bold text-gray-900">Gửi lời nhắn cho chúng tôi</CardTitle>
                  <p className="text-gray-500 mt-2 text-sm">Điền thông tin bên dưới, đội ngũ gzv sẽ phản hồi trong vòng 24 giờ làm việc.</p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {fields.map((f) => (
                      <div key={f.id} className={f.width === 'half' ? 'md:col-span-1' : 'md:col-span-2'}>
                        {f.field_type !== 'checkbox' && (
                          <label htmlFor={f.field_key} className="block text-sm font-medium text-gray-700 mb-2">
                            {f.label} {f.is_required && <span className="text-red-500">*</span>}
                          </label>
                        )}
                        {renderField(f)}
                        {f.help_text && f.field_type !== 'checkbox' && (
                          <p className="text-xs text-gray-500 mt-1">{f.help_text}</p>
                        )}
                      </div>
                    ))}

                    <div className="md:col-span-2">
                      <Button type="submit" disabled={isSubmitting}
                        className="w-full btn-primary text-lg py-6" size="lg">
                        {isSubmitting ? 'Đang gửi...' : (
                          <span className="inline-flex items-center gap-2"><Send className="h-5 w-5" /> Gửi tin nhắn</span>
                        )}
                      </Button>
                      {submitStatus === 'success' && (
                        <div className="flex items-center gap-2 text-green-600 mt-4 justify-center">
                          <CheckCircle2 className="h-5 w-5" />
                          <span>Cảm ơn bạn! Tin nhắn đã được gửi thành công.</span>
                        </div>
                      )}
                      {submitStatus === 'error' && (
                        <div className="flex items-center gap-2 text-red-600 mt-4 justify-center">
                          <AlertCircle className="h-5 w-5" />
                          <span>{errorMsg || 'Đã có lỗi xảy ra, vui lòng thử lại.'}</span>
                        </div>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              className="lg:col-span-2 space-y-8"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="shadow-lg border-0 rounded-2xl">
                <CardHeader><CardTitle className="text-2xl font-bold text-gray-900">Thông tin liên hệ</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  {contactInfo.map((item, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <item.icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-1">{item.title}</h4>
                        {item.link ? (
                          <a href={item.link} className="text-gray-600 hover:text-blue-600 transition-colors">
                            {item.lines.map((line, i) => <p key={i}>{line}</p>)}
                          </a>
                        ) : (
                          item.lines.map((line, i) => <p key={i} className="text-gray-600">{line}</p>)
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card className="shadow-lg border-0 rounded-2xl">
                <CardHeader><CardTitle className="text-2xl font-bold text-gray-900">Mạng xã hội</CardTitle></CardHeader>
                <CardContent className="flex space-x-4">
                  {socialLinks.map(link => (
                    <a key={link.name} href={link.href} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" className="h-12 w-12 rounded-full p-0 hover:bg-blue-100 hover:border-blue-500">
                        <link.icon className="h-6 w-6 text-blue-600" />
                      </Button>
                    </a>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="pb-24 bg-white">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="w-full h-96 bg-gray-200 rounded-2xl overflow-hidden shadow-lg">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3547.0824622742025!2d106.66582407451699!3d10.761148759476423!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752fe01ccb37b3%3A0xb9b5223950251041!2sgzv%20Center!5e1!3m2!1svi!2s!4v1754099890700!5m2!1svi!2s"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Vị trí Trung tâm gzv"
              />
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
