-- Thứ tự hiển thị tác giả (Admin → Tác giả có kéo-thả / đánh số).
-- Thiếu cột này khiến trang Admin tác giả truy vấn lỗi và hiện danh sách trống.
alter table public.authors
  add column if not exists sort_order integer;

-- Đánh số sẵn 10, 20, 30... theo tên, giống thứ tự hiển thị cũ
with ranked as (
  select id, row_number() over (order by full_name) * 10 as next_order
  from public.authors
)
update public.authors a
set sort_order = ranked.next_order
from ranked
where a.id = ranked.id and a.sort_order is null;

alter table public.authors alter column sort_order set default 0;
create index if not exists authors_sort_order_idx on public.authors (sort_order);
