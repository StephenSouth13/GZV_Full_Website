export const DEFAULT_NEWS_LAYOUT = { columns: 3, rows: 3 }

export function resolveNewsLayout(settings?: Record<string, unknown> | null) {
  const integer = (value: unknown, max: number, fallback: number) =>
    typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= max ? value : fallback
  return {
    columns: integer(settings?.news_listing_columns, 4, DEFAULT_NEWS_LAYOUT.columns),
    rows: integer(settings?.news_listing_rows, 10, DEFAULT_NEWS_LAYOUT.rows),
  }
}

