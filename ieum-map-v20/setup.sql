-- Supabase SQL Editor에서 1회 실행
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade
);
create table if not exists public.map_state (
  id text primary key,
  payload jsonb not null default '{}'::jsonb,
  revision bigint not null default 1,
  updated_at timestamptz not null default now()
);
insert into public.map_state(id,payload) values ('main','{"pins":{},"pinSources":{},"custom":{},"outlineLinks":{}}'::jsonb)
on conflict(id) do nothing;
alter table public.admin_users enable row level security;
alter table public.map_state enable row level security;
revoke all on public.admin_users from anon;
revoke all on public.map_state from anon;
grant select on public.map_state to anon, authenticated;
grant select on public.admin_users to authenticated;
drop policy if exists "Public map read" on public.map_state;
create policy "Public map read" on public.map_state for select to anon, authenticated using (true);
drop policy if exists "Admin self check" on public.admin_users;
create policy "Admin self check" on public.admin_users for select to authenticated using (user_id=auth.uid());
-- 쓰기는 보안 검사 함수에서만 허용
create or replace function public.save_map_state(new_payload jsonb)
returns bigint language plpgsql security definer set search_path = '' as $$
declare rev bigint;
begin
 if auth.uid() is null or not exists(select 1 from public.admin_users where user_id=auth.uid()) then
   raise exception 'Not authorized';
 end if;
 if jsonb_typeof(new_payload) <> 'object' or octet_length(new_payload::text)>200000 then
   raise exception 'Invalid payload';
 end if;
 update public.map_state set payload=new_payload,revision=revision+1,updated_at=now()
 where id='main' returning revision into rev;
 return rev;
end; $$;
revoke all on function public.save_map_state(jsonb) from public, anon;
grant execute on function public.save_map_state(jsonb) to authenticated;
-- 관리자 추가: Supabase Authentication > Users에서 계정 생성 후 아래 SQL 실행
-- insert into public.admin_users(user_id) values ('여기에-관리자-USER-UUID');
