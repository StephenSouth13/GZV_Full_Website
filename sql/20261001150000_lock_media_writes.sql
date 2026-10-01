-- Bảo mật: trước đây bucket "media" và bảng media_files cho phép cả khách chưa đăng nhập
-- (khóa anon công khai) sửa/xóa file. Chỉ tài khoản đã đăng nhập (admin) mới được sửa/xóa.
-- Quyền đọc công khai giữ nguyên để website hiển thị ảnh.

drop policy if exists "GZV media public delete" on storage.objects;
drop policy if exists "GZV media public update" on storage.objects;

drop policy if exists "GZV media_files public delete" on public.media_files;
drop policy if exists "GZV media_files public update" on public.media_files;

drop policy if exists "GZV media_files authenticated delete" on public.media_files;
create policy "GZV media_files authenticated delete" on public.media_files
  for delete to authenticated using (true);

drop policy if exists "GZV media_files authenticated update" on public.media_files;
create policy "GZV media_files authenticated update" on public.media_files
  for update to authenticated using (true) with check (true);
