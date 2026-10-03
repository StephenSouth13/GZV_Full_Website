import sanitizeHtml from 'sanitize-html'

/** CMS HTML is content, never executable code. Keep common editor formatting. */
export function safeHtml(value: unknown): string {
  if (typeof value !== 'string') return ''
  return sanitizeHtml(value, {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img', 'video', 'source', 'figure', 'figcaption', 'span'],
    allowedAttributes: {
      '*': ['class', 'style'],
      a: ['href', 'title', 'target', 'rel'],
      img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
      video: ['src', 'controls', 'poster', 'preload', 'width', 'height'],
      source: ['src', 'type'],
      td: ['colspan', 'rowspan'], th: ['colspan', 'rowspan'],
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowProtocolRelative: false,
    allowedStyles: { '*': {
      color: [/^#[\da-f]{3,8}$/i, /^rgba?\([\d\s,.%]+\)$/i, /^[a-z]+$/i],
      'background-color': [/^#[\da-f]{3,8}$/i, /^rgba?\([\d\s,.%]+\)$/i],
      'text-align': [/^(left|right|center|justify)$/],
      'font-weight': [/^(bold|normal|[1-9]00)$/],
      'font-style': [/^(normal|italic)$/],
      'text-decoration': [/^(underline|line-through|none)$/],
      width: [/^\d+(\.\d+)?(px|%|rem)$/],
      height: [/^auto$/, /^\d+(\.\d+)?(px|%|rem)$/],
    } },
    transformTags: { a: (tagName, attribs) => ({ tagName, attribs: { ...attribs, rel: 'noopener noreferrer' } }) },
  })
}
