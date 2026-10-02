-- Bảo mật: các policy cũ cho phép mọi người (kể cả khách dùng khóa anon công khai)
-- thêm/sửa/xóa tác giả. Giữ quyền đọc công khai cho website, chỉ admin đăng nhập được ghi.
drop policy if exists "Allow all for admin" on public.authors;
drop policy if exists "Cho phép sửa hồ sơ mentor" on public.authors;
drop policy if exists "Enable update for all users" on public.authors;
drop policy if exists "Allow auth select mentors" on public.authors;

drop policy if exists "Public read authors" on public.authors;
create policy "Public read authors" on public.authors
  for select using (true);

drop policy if exists "Authenticated manage authors" on public.authors;
create policy "Authenticated manage authors" on public.authors
  for all to authenticated using (true) with check (true);
