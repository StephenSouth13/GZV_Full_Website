# Trạng thái xử lý nợ kỹ thuật

## Đã sửa trong mã nguồn

- 13 handler media kiểm tra JWT và role trước thao tác Supabase/Cloudinary. Client thư viện media gửi token hiện tại; form multipart giữ nguyên header phù hợp.
- Truy vấn role dùng Supabase client gắn token của chính người gọi; không tự nhận quyền cộng tác viên khi thiếu profile. Default roles của ProtectedRoute có identity ổn định.
- Đường dẫn media từ chối traversal, đường dẫn tuyệt đối, wildcard và segment rỗng; giới hạn số file/tổng dung lượng cho upload nhiều file và giới hạn số kết quả API.
- Đổi thứ tự tác giả dùng RPC nguyên tử; kiểm tra lỗi và không báo thành công hai lần. Search debounce, response cũ không ghi đè; không đánh lại thứ tự toàn danh sách khi đang lọc tìm kiếm.
- Lưu hồ sơ GZVer và highlights qua cùng giao dịch, có kiểm tra revision để tránh ghi đè một hồ sơ đã được người khác sửa. Thiếu RPC được báo rõ, không âm thầm quay về đường lưu nhiều bước.
- HTML các block CMS đi qua sanitizer dùng chung; loại script, event handler, URL nguy hiểm và style ngoài allowlist.
- Contact API kiểm tra schema/body 32KiB khi đọc stream, giới hạn object bổ sung, trả mã lỗi ổn định và request ID. Có bộ hạn chế 5 lần/phút theo IP trên từng instance.
- Danh sách GZVer dùng projection cho card, phân trang 250, cache memory 30 giây và gộp request; realtime gộp burst, tuần tự hóa refetch, refresh khi tab trở lại. Sửa hook bị gọi sau nhánh return sớm.
- Khung admin dùng chiều cao viewport động, header không co; dialog thông thường cuộn được, editor vẫn dùng vùng cuộn riêng. Thêm ràng buộc min-width, padding và tab phù hợp màn hình nhỏ.
- Build bật lại TypeScript và lint. Next.js/eslint-config-next cùng 14.2.35; Tiptap transitive cố định cùng dòng 3.10.3. Những dependency `latest` được cố định về phiên bản đang dùng.
- Chỉ dùng pnpm lockfile cho hai app, bỏ package-lock cũ. Script clean không xóa dependency hoặc lockfile.
- Lệnh root chạy/build hai app thật; placeholder có tên riêng. CI cài frozen lockfile, kiểm tra TypeScript/lint/test/build; không dùng secret production.

## Migration bắt buộc trước khi deploy luồng lưu mới

`sql/20261003090000_cms_write_guards_and_transactions.sql`:

- Guard restrictive cho ghi authors/partners/gzvers/highlights/media_files, dù policy permissive cũ còn tồn tại.
- Chặn ghi trực tiếp vào bucket media của người thiếu quyền; không thay đổi bucket khác.
- Giới hạn sửa/xóa profile người khác và chặn tự nâng role.
- Thêm `authors.sort_order`, RPC reorder nguyên tử và RPC lưu hồ sơ/highlights.
- Không tự đổi role hoặc chọn tài khoản quản trị.

Kiểm tra hoặc áp dụng:

```powershell
node scripts/test-cms-transactions.cjs
node scripts/apply-cms-db.cjs
node scripts/apply-cms-db.cjs --apply
```

Runner kiểm tra có profile admin trước khi áp dụng. Trong lần chạy này, database không có profile role admin nên runner rollback và chưa áp dụng migration. Cần xác định email quản trị viên chính trước khi cấu hình quyền. Không deploy luồng RPC mới trước bước này.

Migration snapshot CV `sql/20261002120000_gzver_cv_snapshots.sql` đã qua kiểm thử trên database thực tế và đã áp dụng thành công: 14 snapshot, gồm hồ sơ active và tombstone. Phần này không đổi role hoặc quyền ghi CMS.

## Kiểm tra dự án

```powershell
pnpm --dir Frontend_GZV install --frozen-lockfile
pnpm --dir Backend_GZV install --frozen-lockfile
pnpm check
pnpm build
pnpm dev
```

Node 22 trở lên. Frontend ở port 3000, admin ở 3001. `pnpm preview` chạy hai bản production đã build. Không chạy typecheck cùng lúc build đang ghi `.next/types` của cùng app. PostgreSQL/PGlite tests cũng nên chạy sau build để tránh thiếu RAM trên máy phát triển.

## Còn cần xác minh hoặc xử lý tiếp

- Quyền thực tế trên production chỉ thay đổi sau khi áp dụng migration. Cần đối chiếu account/role hiện có và xác nhận pipeline deploy đã chạy migration trước phát hành app.
- Chưa có browser khả dụng để kiểm tra mobile/bàn phím/zoom trên màn hình thật. Các sửa viewport không phải chứng nhận mọi trang CMS đã hết tràn.
- CI cho phép các warning lint hiện hữu; còn warning ảnh `<img>` và dependency hook. Không tắt các rule để che chúng.
- Bộ hạn chế contact hiện theo instance; cần rate limit chung ở reverse proxy/platform cho nhiều instance. Proxy phải ghi đè `x-forwarded-for`; fallback `unknown` dùng một counter chung. Chưa có dashboard metrics/alert vận hành.
- Chưa thay toàn bộ type `any` bằng types database sinh tự động; chưa tách toàn bộ editor GZVer và các trang CMS lớn. Các module auth, HTML, contact, path, request queue và transaction đã được tách để làm nền.
- Chưa xác nhận mọi route rich content khác ngoài các block CMS dùng sanitizer mới, hoặc mọi policy của các bảng ngoài phạm vi migration này đã đúng role.
- Chưa nâng major framework, React hoặc editor; không coi bản vá 14.2.35 là bảo đảm mọi dependency không còn advisory. Cần audit dependency định kỳ trong pipeline.

Tài liệu thiết kế: [Supabase database functions](https://supabase.com/docs/guides/database/functions), [PostgreSQL restrictive policies](https://www.postgresql.org/docs/current/sql-createpolicy.html), [Next.js patch advisory](https://nextjs.org/blog/security-update-2025-12-11).
