# Trạng thái xử lý nợ kỹ thuật

## Đã sửa trong mã nguồn

- 13 handler media kiểm tra JWT và role trước thao tác Supabase/Cloudinary. Client thư viện media gửi token hiện tại; form multipart giữ nguyên header phù hợp.
- Truy vấn role dùng Supabase client gắn token của chính người gọi; không tự nhận quyền cộng tác viên khi thiếu profile. Default roles của ProtectedRoute có identity ổn định.
- Trang đăng nhập không còn tự tạo profile `collab` khi truy vấn profile lỗi hoặc bị thiếu. Ba role CMS `admin/editor/collab` dùng chung một định nghĩa; header/sidebar mặc định về `user` trong lúc chưa xác minh quyền.
- Route gốc của backend (`/`) và `/admin` chuyển thẳng tới `/admin/dashboard`; khách chưa đăng nhập tiếp tục được `ProtectedRoute` đưa về `/admin-login`. Đã loại bỏ dashboard demo cũ nằm ngoài lớp bảo vệ.
- Đường dẫn media từ chối traversal, đường dẫn tuyệt đối, wildcard và segment rỗng; giới hạn số file/tổng dung lượng cho upload nhiều file và giới hạn số kết quả API.
- Đổi thứ tự tác giả dùng RPC nguyên tử; kiểm tra lỗi và không báo thành công hai lần. Search debounce, response cũ không ghi đè; không đánh lại thứ tự toàn danh sách khi đang lọc tìm kiếm.
- Bài viết có `sort_order`, nút lên/xuống và ô nhập thứ tự; việc đổi thứ tự dùng RPC nguyên tử, bị khóa khi danh sách đang lọc và các sự kiện realtime được gộp trước khi tải lại. Form tạo/sửa cho phép chỉnh ngày giờ xuất bản hoặc đặt lịch tương lai; truy vấn website công khai ưu tiên thứ tự đã lưu.
- Lưu hồ sơ GZVer và highlights qua cùng giao dịch, có kiểm tra revision để tránh ghi đè một hồ sơ đã được người khác sửa. Thiếu RPC được báo rõ, không âm thầm quay về đường lưu nhiều bước.
- HTML các block CMS đi qua sanitizer dùng chung; loại script, event handler, URL nguy hiểm và style ngoài allowlist.
- Contact API kiểm tra schema/body 32KiB khi đọc stream, giới hạn object bổ sung, trả mã lỗi ổn định và request ID. Có bộ hạn chế 5 lần/phút theo IP trên từng instance.
- Danh sách GZVer dùng projection cho card, phân trang 250, cache memory 30 giây và gộp request; realtime gộp burst, tuần tự hóa refetch, refresh khi tab trở lại. Sửa hook bị gọi sau nhánh return sớm.
- Khung admin dùng chiều cao viewport động, header không co; dialog thông thường cuộn được, editor vẫn dùng vùng cuộn riêng. Thêm ràng buộc min-width, padding và tab phù hợp màn hình nhỏ.
- Footer lưu của editor GZVer, tác giả và mentor xếp dọc/toàn chiều ngang trên điện thoại; drag preview tác giả/GZVer không còn ép viewport rộng 450–500px.
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

Runner kiểm tra có profile thuộc nhóm CMS (admin/editor/collab). Đã xác minh tài khoản thử có quyền collab và áp dụng migration thành công trên database thực tế; không thay đổi role tài khoản. Luồng chống ghi đè trả PT409 (HTTP 409) để client nhận lỗi xung đột ngay.

Migration snapshot CV `sql/20261002120000_gzver_cv_snapshots.sql` đã qua kiểm thử trên database thực tế và đã áp dụng thành công: 14 snapshot, gồm hồ sơ active và tombstone. Phần này không đổi role hoặc quyền ghi CMS.

Migration bài viết `sql/20261005100000_articles_order_and_publish_date.sql` đã áp dụng thành công: backfill thứ tự hiện có, thêm RPC `reorder_articles`, cập nhật view `allblogposts` và guard quyền ghi cho bảng `articles`.

## Kiểm thử với tài khoản thật

Đã đăng nhập với quyền collab và kiểm thử trên Supabase thực tế: lưu hồ sơ, rollback toàn bộ khi highlights sai FK, từ chối revision cũ bằng HTTP 409 và RPC sắp xếp tác giả. API admin production chạy local đã qua kiểm tra khách 401, collab 200, đường dẫn sai 400 và upload ảnh thực tế. Đã xóa hồ sơ, tác giả, ảnh, metadata và snapshot tạm; đăng xuất phiên thử.

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

- Migration database đã áp dụng. Cần phát hành mã nguồn app mới qua pipeline để các sửa đổi client/API có hiệu lực trên website production.
- Chưa có browser khả dụng để kiểm tra mobile/bàn phím/zoom trên màn hình thật. Các sửa viewport không phải chứng nhận mọi trang CMS đã hết tràn.
- CI cho phép các warning lint hiện hữu; còn warning ảnh `<img>` và dependency hook. Không tắt các rule để che chúng.
- Bộ hạn chế contact hiện theo instance; cần rate limit chung ở reverse proxy/platform cho nhiều instance. Proxy phải ghi đè `x-forwarded-for`; fallback `unknown` dùng một counter chung. Chưa có dashboard metrics/alert vận hành.
- Chưa thay toàn bộ type `any` bằng types database sinh tự động; chưa tách toàn bộ editor GZVer và các trang CMS lớn. Các module auth, HTML, contact, path, request queue và transaction đã được tách để làm nền.
- Chưa xác nhận mọi route rich content khác ngoài các block CMS dùng sanitizer mới, hoặc mọi policy của các bảng ngoài phạm vi migration này đã đúng role.
- Chưa nâng major framework, React hoặc editor; không coi bản vá 14.2.35 là bảo đảm mọi dependency không còn advisory. Cần audit dependency định kỳ trong pipeline.

Tài liệu thiết kế: [Supabase database functions](https://supabase.com/docs/guides/database/functions), [PostgreSQL restrictive policies](https://www.postgresql.org/docs/current/sql-createpolicy.html), [Next.js patch advisory](https://nextjs.org/blog/security-update-2025-12-11).
