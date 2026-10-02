-- Bảo mật: partners cho phép khách (khóa anon công khai) thêm/sửa/xóa đối tác.
-- Admin hiện chỉ ghi được nhờ các policy công khai này (policy "Admins can ..." yêu cầu
-- profiles.role admin/collab mà phần lớn tài khoản admin không có), nên thay bằng quyền
-- cho tài khoản đã đăng nhập. Quyền đọc công khai không đổi.
drop policy if exists "GZV partners public insert" on public.partners;
drop policy if exists "GZV partners public update" on public.partners;
drop policy if exists "GZV partners public delete" on public.partners;

drop policy if exists "Authenticated manage partners" on public.partners;
create policy "Authenticated manage partners" on public.partners
  for all to authenticated using (true) with check (true);
