# TODO - Đổi gzv → gzv & cập nhật domain + fix header logo

## Bước 1: Chuẩn hoá header/logo & brand
- [ ] Sửa `Frontend_GZV/components/Header.tsx`
  - [ ] Đổi `gzv CENTER`/text liên quan sang `GZV`
  - [ ] Đổi email `gzv.one@gmail.com` → `gzv.one@gmail.com`
  - [ ] Đổi link `https://gzver.gzv.one/` → `https://gzver.gzv.one/` (nếu đúng cấu trúc)
  - [ ] Fix logo bị tràn: điều chỉnh Tailwind/className & bỏ inline style width động nếu gây tràn

## Bước 2: Update metadata/app layout sang gzv.one
- [ ] Sửa `Frontend_GZV/app/layout.tsx`
  - [ ] `metadataBase` + `authors.url` + `openGraph.url` + canonical (nếu có)
  - [ ] Đổi các string domain `https://gzv.one` → `https://gzv.one`
  - [ ] Kiểm tra các image url `/gzv/assets/...` (không đổi nếu assets chưa tồn tại; nếu có thư mục gzv/assets thì chuyển)

## Bước 3: Update middleware admin domain
- [ ] Sửa `Frontend_GZV/middleware.ts`
  - [ ] Thay `ADMIN_EMAIL_DOMAIN = '@gzv.com'` → `'@gzv.one'`

## Bước 4: Đổi các đường dẫn/brand khác liên quan (chỉ trong phạm vi đã kiểm tra)
- [ ] Đổi các file đã đọc có từ `gzv/gzv` trong `app/gzver/[slug]/page.tsx` theo yêu cầu brand (tránh đổi route nếu không chắc)

## Bước 5: Build/Test
- [ ] Chạy `pnpm -C Frontend_GZV build` (hoặc lệnh phù hợp theo package)
- [ ] Smoke test: header logo không tràn, domain meta canonical/og đúng, admin middleware chạy đúng.

