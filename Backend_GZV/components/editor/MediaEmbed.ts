import { Node } from "@tiptap/core"
import { getVideoEmbed } from "@/lib/media-url"

type MediaEmbedAttrs = {
  src: string
  kind?: "iframe" | "video"
  provider?: string | null
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    mediaEmbed: {
      setMediaEmbed: (attrs: MediaEmbedAttrs) => ReturnType
    }
  }
}

// Link video/embed (YouTube, Vimeo, TikTok, Facebook, Drive, mp4) hoặc mã <iframe> -> thuộc tính node, null nếu không nhận diện được
export function toMediaEmbedAttrs(input: string): MediaEmbedAttrs | null {
  const value = input.trim()
  const src = /^<(iframe|video)\b/i.test(value) ? value.match(/\bsrc=["']([^"']+)["']/i)?.[1] : value
  if (!src) return null
  const embed = getVideoEmbed(src)
  if (embed) return { src: embed.src, kind: embed.kind, provider: embed.provider }
  if (/^<iframe\b/i.test(value) && /^https:\/\//i.test(src)) return { src, kind: "iframe", provider: null }
  return null
}

function attrsFromElement(element: HTMLElement) {
  const media = element.matches("iframe, video") ? element : element.querySelector("iframe, video")
  const src = media?.getAttribute("src") || media?.querySelector("source")?.getAttribute("src")
  if (!media || !src) return false
  const embed = getVideoEmbed(src)
  return {
    src: embed?.src || src,
    kind: embed?.kind || (media.tagName === "VIDEO" ? "video" : "iframe"),
    provider: embed?.provider || element.getAttribute("data-provider"),
  }
}

// Kích thước ghi thẳng vào HTML để video luôn rộng hết khung bài, kể cả nơi không có CSS riêng cho .gzv-embed
const EMBED_STYLE = "display:block;width:100%;aspect-ratio:16/9;border:0;border-radius:16px;background:#050505;"

// Khối video trong trình soạn thảo, lưu ra HTML dạng <figure class="gzv-embed"><iframe|video/></figure>
export const MediaEmbed = Node.create({
  name: "mediaEmbed",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      src: { default: null },
      kind: { default: "iframe" },
      provider: { default: null },
    }
  },

  parseHTML() {
    return [
      { tag: "figure.gzv-embed", getAttrs: (element) => attrsFromElement(element as HTMLElement) },
      { tag: "div[data-youtube-video]", getAttrs: (element) => attrsFromElement(element as HTMLElement) },
      { tag: "iframe[src]", getAttrs: (element) => attrsFromElement(element as HTMLElement) },
      { tag: "video", getAttrs: (element) => attrsFromElement(element as HTMLElement) },
    ]
  },

  renderHTML({ node }) {
    const { src, kind, provider } = node.attrs
    const media =
      kind === "video"
        ? ["video", { src, controls: "true", playsinline: "true", preload: "metadata", style: EMBED_STYLE }]
        : [
            "iframe",
            {
              src,
              width: "100%",
              style: provider === "tiktok" ? EMBED_STYLE.replace("16/9", "9/16") : EMBED_STYLE,
              title: "Video",
              loading: "lazy",
              allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
              allowfullscreen: "true",
            },
          ]
    return ["figure", { class: "gzv-embed", ...(provider ? { "data-provider": provider } : {}) }, media]
  },

  addCommands() {
    return {
      setMediaEmbed:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs }),
    }
  },
})
