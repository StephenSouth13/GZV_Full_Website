# Rà soát nợ kỹ thuật — 03/10/2026

Phạm vi: đọc mã nguồn frontend, admin, API, cấu hình build, SQL, cache/realtime và luồng lưu/sắp xếp. Không thay đổi dữ liệu production hoặc gọi thử API upload. Các nhận định về policy là theo SQL trong repository; chưa xác nhận policy đang chạy trên Supabase. Không kiểm tra trực quan bằng trình duyệt trong lần rà soát này.

## Ưu tiên xử lý

### 1. P0 — API media chưa xác thực trước khi dùng service role

- `Backend_GZV/app/api/images/route.ts:122`: POST đọc token nhưng không xác minh người dùng/quyền trước `uploadFile`.
- `Backend_GZV/lib/supabase-storage.ts:4`: ưu tiên service role; dòng 12 chỉ chuyển token người gọi vào client khi không có service role. Khi server có khóa này, upload không phụ thuộc quyền của người gọi.
- GET của cùng route dùng service role đọc `media_files` mà chưa kiểm tra quyền hoặc lọc `is_public`.
- Fallback development ghép `folder` do client cung cấp với đường dẫn filesystem mà chưa kiểm tra đường dẫn đích nằm trong `public`.
- Đề xuất: kiểm tra JWT và quyền server trước đọc body/upload; dùng client theo người gọi hoặc service role chỉ sau kiểm tra quyền. Giới hạn folder, xác minh đường dẫn tuyệt đối, giới hạn request và phân trang. Trả 401/403 rõ ràng.
- Hoàn thành khi: khách bị từ chối upload; người dùng thiếu quyền bị từ chối; admin upload thành công; đường dẫn `../` bị từ chối; API thư viện không lộ media riêng tư.

### 2. P0 — Quyền ghi database rộng hơn mô tả

- `sql/20261002151000_lock_authors_writes.sql:17` và `sql/20261002152000_lock_partners_writes.sql:11`: `for all to authenticated using (true) with check (true)` cho phép mọi tài khoản đăng nhập ghi, không giới hạn admin như chú thích.
- `ProtectedRoute` chỉ kiểm soát UI, không ngăn gọi REST trực tiếp. `verifyAuth` truy vấn profile qua singleton anon, không gắn token người gọi vào truy vấn profile; cần kiểm tra tính đúng đắn với RLS thực tế.
- Đề xuất: thống nhất quyền admin/editor/collab/user; kiểm tra role trong policy và server; rà quyền sửa `profiles.role`, storage và các bảng CMS khác. Không chỉ thêm policy hạn chế vì policy permissive cũ có thể tiếp tục mở quyền.
- Hoàn thành khi: kiểm thử quyền trực tiếp qua API/database cho từng role; tự nâng quyền và ghi trái phép bị từ chối. Xác minh production trước khi kết luận đang bị khai thác.

### 3. P1 — Thứ tự tác giả có lỗi ghi và phụ thuộc migration

- `Backend_GZV/app/admin/authors/page.tsx:26`: truy vấn luôn yêu cầu `sort_order`, dù database chưa có cột sẽ trả lỗi. Lỗi 400 người dùng cung cấp phù hợp khả năng lệch schema, nhưng cần response body để xác nhận nguyên nhân.
- Dòng 68: vòng lặp update không kiểm tra `error`. Supabase có thể trả lỗi trong kết quả mà không throw; toast vẫn báo thành công.
- `handleAutoRenumber` báo thành công thêm lần nữa kể cả handler bên trong đã bắt lỗi. Search kích hoạt query theo mỗi ký tự, không debounce hoặc bảo vệ response cũ.
- Đề xuất: migration là điều kiện rollout, thông báo thiếu schema rõ ràng; RPC giao dịch lưu thứ tự cả danh sách, chỉ cập nhật UI/thông báo thành công sau commit. Debounce/cancel tìm kiếm và chỉ đánh số trên phạm vi được người dùng chọn rõ ràng.
- Hoàn thành khi: lỗi mạng/RLS không báo thành công; thứ tự lưu nguyên tử; tải lại vẫn đúng; kết quả search cũ không ghi đè search mới.

### 4. P1 — Build xanh chưa bảo đảm chất lượng

- Cả hai `next.config.mjs` tắt TypeScript và lint trong build.
- Root `build` chỉ tạo trang placeholder qua `scripts/build-dist.cjs`; không build hai ứng dụng thật. Không thấy workflow `.github` trong repository.
- Có nhiều lockfile và phiên bản khác nhau giữa root/frontend/backend. `eslint-config-next` 16.2.9 khác major Next 14; các package `latest` làm môi trường cài đặt khó đồng nhất.
- Đề xuất: một package manager/lockfile strategy; script `typecheck`, lint không tương tác, regression tests và build hai app trong CI. Sau khi sửa lỗi tồn đọng, bật lại kiểm tra build. Không nâng major hàng loạt trước kiểm tra tương thích.
- Hoàn thành khi: PR có lỗi kiểu hoặc lint bị chặn; root check kiểm tra cả hai app; clean install tái lập được. Không xóa lockfile trong script clean thường ngày.

### 5. P1 — Lưu hồ sơ nhiều bước chưa nguyên tử

- `Backend_GZV/components/admin/gzvers/GZVerModal.tsx:482`: lưu `gzvers`, sau đó upsert highlights riêng. Nếu bước hai thất bại, hồ sơ đã đổi dù UI báo không lưu được.
- Cơ chế hiện tại có thể phát realtime trạng thái trung gian. Khi highlights rỗng, không có bước xóa; cần quy định rõ sự khác nhau giữa bỏ lựa chọn, ẩn và xóa.
- Đề xuất: RPC giao dịch cho hồ sơ + quan hệ, validate payload phía database/server; revision để phát hiện hai admin sửa cùng hồ sơ; rollback hoặc báo phần đã lưu cho các luồng chưa chuyển được.
- Hoàn thành khi: lỗi highlights rollback toàn bộ; không mất thay đổi của admin khác; snapshot phản ánh đúng một lần lưu hoàn chỉnh.

### 6. P1 — Responsive đang được sửa từng màn hình

- Modal GZVer/dự án hiện đã có cải tiến vùng cuộn/footer; không nên coi toàn bộ CMS đã hoàn chỉnh mobile.
- Root body `overflow-hidden`, shell `min-h-screen`, admin `h-screen` và các vùng cuộn lồng nhau vẫn cùng tồn tại. Đây là cấu trúc dễ gặp vấn đề khi thanh trình duyệt/bàn phím mobile thay đổi chiều cao.
- Form dự án vẫn có padding 32–40px; header/tab/action ở các màn hình có quy tắc riêng. Chưa có tiêu chuẩn editor chung hoặc kiểm thử viewport.
- Đề xuất: `AdminEditorDialog`/`AdminPageToolbar` dùng chung; một vùng cuộn nội dung, footer không co, `dvh`, safe-area; bảng cuộn ngang cục bộ, tab không nở trang. Chuẩn hóa focus, bàn phím, cảnh báo rời form chưa lưu.
- Hoàn thành khi: nút lưu thao tác được ở 320/375/768px và desktop thấp, zoom 200%, khi mở bàn phím; không cuộn ngang toàn trang. Xác minh trên thiết bị/trình duyệt thật.

### 7. P1 — Realtime vẫn có thể gây nhiều lần đọc

- `Frontend_GZV/components/sections/home/GzversGrid.tsx:76`: mỗi event ở ba bảng gọi lại toàn bộ nhóm query; không debounce, không gộp request đang chạy, không giới hạn theo section, không ngừng ở tab ẩn.
- `Frontend_GZV/lib/api-supabase.ts:510`: danh sách dùng `select('*')`, có thể lấy cả trường CV/rich content không cần cho card và thiếu phân trang ở quy mô lớn.
- Cache CMS và CV hiện có giúp giảm tải ở các luồng đã chuyển, nhưng không phủ mọi trang. Cache snapshot database chỉ hoạt động khi migration đã được áp dụng; chưa xác minh trạng thái production trong audit này.
- Đề xuất: projection dành riêng cho card, phân trang, debounce/coalesce và subscription dùng chung; tái dùng cơ chế cache sẵn có. Đo số request và thời gian DB trước/sau, không thêm một lớp cache mới tùy tiện.
- Hoàn thành khi: một đợt bulk reorder không tạo một đợt refetch cho mỗi hàng ở mỗi client; reconnect vẫn cập nhật; ẩn/xóa hồ sơ được phản ánh đúng.

### 8. P1 — HTML CMS thiếu ranh giới an toàn rõ ràng

- `Frontend_GZV/components/sections/common/HtmlBlock.tsx:13` và các block khác đưa HTML vào `dangerouslySetInnerHTML`. Không thấy sanitizer HTML dùng chung trong tìm kiếm mã nguồn.
- Chưa chứng minh được khai thác end-to-end; mức độ phụ thuộc quyền ghi CMS và dữ liệu được đưa vào các component.
- Đề xuất: xác định có cho phép HTML tùy ý hay không; sanitize bằng allowlist khi lưu/render, giới hạn URL/protocol/embed và style; CSP bổ sung. Không dùng regex làm sanitizer HTML tổng quát.
- Hoàn thành khi: payload event handler/script/URL nguy hiểm không thực thi, nội dung editor hợp lệ vẫn hiển thị đúng.

### 9. P2 — Schema/types và component lớn khó bảo trì

- SQL phân tán giữa `sql/`, `Backend_GZV/sql/`, `supabase/migrations/` và các thư mục backup/codex. Không có một quy trình rõ ràng chứng minh tất cả migration mới được áp dụng.
- Model dùng nhiều `any`, type handwritten và JSON settings; editor GZVer chứa nhiều trách nhiệm trong một file lớn. Backend/frontend lệch dependencies và có UI sao chép.
- Đề xuất: một lịch sử migration chuẩn + kiểm tra schema rollout; types sinh từ database, schema validation cho JSON; tách editor theo section/hook/service. Chia sẻ contract dữ liệu và primitive hữu ích, không refactor toàn bộ một lượt.
- Hoàn thành khi: thiếu migration được phát hiện trước release; kiểu dữ liệu không phải sửa nhiều nơi; thay đổi một section không ảnh hưởng luồng lưu khác.

### 10. P2 — Thiếu chống abuse và quan sát vận hành

- `Frontend_GZV/app/api/contact/route.ts`: có giới hạn chiều dài một số text, nhưng object `data` không giới hạn/schema; chưa thấy rate limit/chống spam tại route. Trả message lỗi database trực tiếp ra client.
- Log phân tán qua console/toast; chưa có bằng chứng về alert, metrics, request ID hoặc ngân sách request Supabase. Có thể có cấu hình ngoài repo, cần xác minh.
- Đề xuất: giới hạn body và schema contact, chống spam/rate limit tại ứng dụng hoặc hạ tầng; error code công khai ổn định, chi tiết nội bộ trong log; theo dõi API 400/429/5xx, subscription và query latency.
- Hoàn thành khi: traffic lỗi/spam không làm tăng ghi vô hạn; biết nguyên nhân và phạm vi lỗi từ request ID; có cảnh báo trước khi quá tải.

## Lộ trình đề xuất

1. **Đợt đầu — quyền và tính đúng:** API media, policy role, lỗi báo lưu thành công, xác minh migration `authors.sort_order` và snapshot; CI tối thiểu.
2. **Đợt hai — luồng biên tập:** lưu giao dịch, chuẩn modal/mobile, regression tests lưu/sắp xếp, schema validation và HTML.
3. **Đợt ba — tải và bảo trì:** projection/pagination/realtime, dashboard metrics, types database, tách component lớn và thống nhất dependency/lockfiles.

Ưu tiên hoàn thành tiêu chí của từng đợt thay vì mở thêm thiết kế trước khi đường lưu và quyền đã ổn định. Chưa ước lượng ngày công vì chưa xác minh schema production và chưa đo tải thực tế.

## Kết quả kiểm tra

- Backend TypeScript: qua.
- Frontend TypeScript: qua khi chạy riêng với heap 2GiB. Lần chạy đồng thời đầu tiên bị Node hết bộ nhớ; đây là giới hạn tài nguyên của lần kiểm tra, không phải lỗi TypeScript đã xác nhận.
- Không chạy build production, lint toàn bộ, kiểm thử trực quan hoặc security exploit trong audit này.
- Chỉ thêm báo cáo này; không sửa tính năng hoặc database trong lần rà soát.
