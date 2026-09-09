import React, { useState } from "react"
import { DndContext, closestCenter, type SensorDescriptor, type SensorOptions } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { RotateCcw, Save, Plus, Layers, Copy, Trash2, Code2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import type { PageBlock, SectionTemplate } from "../types"
import { fallbackTemplates, defaultPageBlocks, quickBuilderPages } from "../defaults"
import { SortableBuilderBlockRow } from "../helpers/SortableRows"
import { Field } from "../helpers/BasicHelpers"
import { RawJsonEditor } from "../helpers/RawJsonEditor"
import { BlockPropsEditor } from "../helpers/PropsEditor"

export function PageBuilderTab({
  builderSlug,
  onSelectSlug,
  builderBlocks,
  activeBlockItem,
  selectedBlockKey,
  setSelectedBlockKey,
  setPageBlocks,
  templates,
  sensors,
  onBuilderDragEnd,
  onDuplicateBlock,
  onMoveBlock,
  onSaveBuilderLayout,
  onBackToMenu,
  onPickMedia,
  saving,
}: {
  builderSlug: string
  onSelectSlug?: (slug: string) => void
  builderBlocks: Array<{ block: PageBlock; index: number }>
  activeBlockItem: { block: PageBlock; index: number } | undefined
  selectedBlockKey: string | null
  setSelectedBlockKey: (key: string | null) => void
  setPageBlocks: React.Dispatch<React.SetStateAction<PageBlock[]>>
  templates: SectionTemplate[]
  sensors: SensorDescriptor<SensorOptions>[]
  onBuilderDragEnd: (event: any) => void
  onDuplicateBlock: (block: PageBlock) => void
  onMoveBlock: (blockIndex: number, direction: -1 | 1) => void
  onSaveBuilderLayout: () => void
  onBackToMenu: () => void
  onPickMedia: (target: any) => void
  saving: boolean
}) {
  const [isTemplateSelectorOpen, setIsTemplateSelectorOpen] = useState(false)
  const [showBlockAdvancedJson, setShowBlockAdvancedJson] = useState(false)

  const updateBlock = (index: number, patch: Partial<PageBlock>) => {
    setPageBlocks((items) => items.map((item, idx) => idx === index ? { ...item, ...patch } : item))
  }

  return (
    <div className="space-y-6">
      {/* Top Bar with Navigation & Save */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-3.5 border border-slate-200 shadow-xs dark:border-white/10 dark:bg-slate-900">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onBackToMenu}
            className="rounded-none border-slate-300 text-xs font-black uppercase text-slate-800 hover:bg-slate-100 dark:border-white/10 dark:text-white"
          >
            ← Quay lại Menu
          </Button>
          <div className="h-4 w-[1px] bg-slate-200 dark:bg-white/10 hidden sm:block" />
          
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Chuyển trang:</span>
            <select
              value={builderSlug}
              onChange={(e) => onSelectSlug && onSelectSlug(e.target.value)}
              className="h-8 border border-slate-300 bg-white px-2 text-xs font-black text-[#ed1c24] uppercase rounded-none focus:outline-none dark:bg-slate-800 dark:border-white/10"
            >
              {quickBuilderPages.map((qp) => (
                <option key={qp.slug} value={qp.slug}>
                  /{qp.slug} ({qp.label})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const defaultsForSlug = defaultPageBlocks.filter((b) => b.page_slug === builderSlug)
              if (defaultsForSlug.length > 0) {
                setPageBlocks((current) => [
                  ...current.filter((b) => b.page_slug !== builderSlug),
                  ...defaultsForSlug,
                ])
              }
            }}
            className="rounded-none border-slate-300 text-xs font-black uppercase text-slate-800 hover:bg-slate-100 dark:border-white/10 dark:text-white"
            title="Nạp lại các section mẫu mặc định cho trang này"
          >
            <RotateCcw className="mr-1.5 h-3.5 w-3.5 text-[#ed1c24]" /> Nạp Section mẫu
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={onSaveBuilderLayout}
            disabled={saving}
            className="rounded-none bg-[#ed1c24] hover:bg-[#c91218] text-white text-xs font-black uppercase"
          >
            <Save className="mr-1.5 h-4 w-4" /> {saving ? "Đang lưu..." : "Lưu"}
          </Button>
        </div>
      </div>

      {/* Sidebar + Content 2-Column Layout */}
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* Left Sidebar: List of Sections / Blocks with Drag & Drop */}
        <div className="space-y-4">
          <Card className="rounded-none border-slate-200 dark:border-white/10 shadow-xs">
            <CardHeader className="p-4 border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  Danh sách Section ({builderBlocks.length})
                </CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-none text-[11px] font-black uppercase h-7 border-[#ed1c24] text-[#ed1c24] hover:bg-[#ed1c24] hover:text-white transition"
                  onClick={() => setIsTemplateSelectorOpen(!isTemplateSelectorOpen)}
                >
                  <Plus className="mr-1 h-3.5 w-3.5" /> Thêm Section
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-3 space-y-2">
              {/* Template Selector Drawer/Accordion */}
              {isTemplateSelectorOpen && (
                <div className="mb-3 p-3 border border-slate-300 bg-slate-50 dark:border-white/10 dark:bg-slate-950 space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-white/10">
                    <span className="text-[10px] font-black uppercase text-slate-500">Chọn mẫu để thêm:</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-5 px-1.5 text-[10px] text-slate-400 hover:text-slate-700"
                      onClick={() => setIsTemplateSelectorOpen(false)}
                    >
                      Đóng ✕
                    </Button>
                  </div>
                  <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                    {(templates.length ? templates : fallbackTemplates)
                      .filter((t) => t.component_type !== "page_banner" && t.template_key !== "banner-basic")
                      .map((template) => (
                        <button
                          key={template.template_key}
                          type="button"
                          onClick={() => {
                            const newBlockKey = `${template.template_key}-${Date.now()}`
                            setPageBlocks((rows) => [
                              ...rows,
                              {
                                page_slug: builderSlug,
                                block_key: newBlockKey,
                                component_type: template.component_type,
                                title: template.name,
                                props: template.default_props || {},
                                content_html: "",
                                sort_order: rows.filter((r) => r.page_slug === builderSlug).length * 10 + 10,
                                is_visible: true,
                                responsive: {},
                                seo: {},
                              },
                            ])
                            setSelectedBlockKey(newBlockKey)
                            setIsTemplateSelectorOpen(false)
                          }}
                          className="w-full text-left p-2 border border-slate-200 bg-white hover:border-[#ed1c24] hover:bg-red-50/30 dark:border-white/10 dark:bg-slate-900 transition flex items-center justify-between group"
                        >
                          <div className="min-w-0 flex-1 pr-2">
                            <div className="text-[11px] font-bold uppercase truncate group-hover:text-[#ed1c24]">{template.name}</div>
                            <div className="text-[9px] font-mono text-slate-400 truncate">{template.component_type}</div>
                          </div>
                          <Plus className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#ed1c24] shrink-0" />
                        </button>
                      ))}
                  </div>
                </div>
              )}

              {/* Drag and drop sortable list of sections */}
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onBuilderDragEnd}>
                <SortableContext
                  items={builderBlocks.map((item) => item.block.block_key)}
                  strategy={verticalListSortingStrategy}
                >
                  {builderBlocks.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-white/10 p-3">
                      <Layers className="h-6 w-6 text-slate-300 mx-auto mb-1.5" />
                      Chưa có Section nào trên trang này. Nhấn &quot;+ Thêm Section&quot; ở trên để tạo mới.
                    </div>
                  ) : (
                    builderBlocks.map(({ block, index }, pos) => (
                      <SortableBuilderBlockRow
                        key={block.block_key}
                        id={block.block_key}
                        block={block}
                        isSelected={activeBlockItem?.block.block_key === block.block_key}
                        onSelect={() => setSelectedBlockKey(block.block_key)}
                        onToggleVisible={() => updateBlock(index, { is_visible: block.is_visible === false ? true : false })}
                        onDelete={() => {
                          setPageBlocks((rows) => rows.filter((_, i) => i !== index))
                          if (selectedBlockKey === block.block_key) {
                            setSelectedBlockKey(null)
                          }
                        }}
                        onMoveUp={() => onMoveBlock(index, -1)}
                        onMoveDown={() => onMoveBlock(index, 1)}
                        isFirst={pos === 0}
                        isLast={pos === builderBlocks.length - 1}
                      />
                    ))
                  )}
                </SortableContext>
              </DndContext>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel: Content / Form Editor for Selected Section */}
        <div className="space-y-6">
          {activeBlockItem ? (
            <Card className="rounded-none border-slate-200 dark:border-white/10 shadow-xs">
              <CardHeader className="border-b border-slate-200 dark:border-white/10 pb-4 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base font-black uppercase flex items-center gap-2">
                      <span>{activeBlockItem.block.title || activeBlockItem.block.component_type}</span>
                      <Badge variant="outline" className="rounded-none font-bold text-[10px] uppercase border-[#ed1c24] text-[#ed1c24]">
                        {activeBlockItem.block.component_type}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-xs font-semibold mt-0.5">
                      Trang: <strong>/{builderSlug}</strong> | Mã: <span className="font-mono">{activeBlockItem.block.block_key}</span>
                    </CardDescription>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onDuplicateBlock(activeBlockItem.block)}
                      className="rounded-none text-xs font-bold"
                    >
                      <Copy className="mr-1.5 h-3.5 w-3.5" /> Nhân bản
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setPageBlocks((rows) => rows.filter((_, i) => i !== activeBlockItem.index))
                        setSelectedBlockKey(null)
                      }}
                      className="rounded-none text-xs font-bold"
                    >
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Xóa
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-5 pt-5">
                {/* Specialized / Props Block Editor */}
                <BlockPropsEditor
                  block={activeBlockItem.block}
                  blockIndex={activeBlockItem.index}
                  onChange={(props) => updateBlock(activeBlockItem.index, { props })}
                  onPickImage={(imageIndex) => onPickMedia({ blockImageIndex: activeBlockItem.index, imageIndex })}
                  onPickSingleImage={() => onPickMedia({ singleBlockIndex: activeBlockItem.index })}
                />

                {/* Collapsible Advanced JSON & HTML Editor */}
                <div className="pt-2 border-t border-slate-200 dark:border-white/10 space-y-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowBlockAdvancedJson(!showBlockAdvancedJson)}
                    className="rounded-none text-xs font-bold uppercase border-slate-300 dark:border-white/10 flex items-center gap-1.5"
                  >
                    <Code2 className="h-4 w-4 text-[#ed1c24]" />
                    {showBlockAdvancedJson ? "▲ Thu gọn Cấu hình JSON & HTML nâng cao" : "▼ Mở Cấu hình JSON & HTML nâng cao"}
                  </Button>

                  {showBlockAdvancedJson && (
                    <div className="space-y-4 pt-2">
                      <Field label="Cấu hình JSON nâng cao (Raw JSON)">
                        <RawJsonEditor
                          value={activeBlockItem.block.props || {}}
                          onChange={(props) => updateBlock(activeBlockItem.index, { props })}
                        />
                      </Field>

                      <Field label="HTML tùy biến bổ sung (nếu có)">
                        <Textarea
                          className="min-h-[120px] font-mono text-xs rounded-none"
                          value={activeBlockItem.block.content_html || ""}
                          onChange={(e) => updateBlock(activeBlockItem.index, { content_html: e.target.value })}
                          placeholder="<div>Nội dung HTML tùy biến...</div>"
                        />
                      </Field>
                    </div>
                  )}
                </div>

                <Button
                  type="button"
                  onClick={onSaveBuilderLayout}
                  disabled={saving}
                  className="w-full sm:w-auto rounded-none bg-[#ed1c24] hover:bg-[#c91218] text-white text-xs font-black uppercase h-10 px-8"
                >
                  <Save className="mr-2 h-4 w-4" /> {saving ? "Đang lưu..." : "Lưu thay đổi Section"}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="p-12 text-center space-y-3 border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900 shadow-xs">
              <Layers className="h-10 w-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Chưa chọn Section nào
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Vui lòng nhấp chọn một Section từ danh sách bên trái hoặc nhấn nút <strong>&quot;+ Thêm Section&quot;</strong> để tạo mới.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
