-- Execute esta migração no Supabase antes de publicar a nova versão.

create table if not exists public.company_follows (
  user_id uuid not null references auth.users(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, company_id)
);

alter table public.company_follows enable row level security;

drop policy if exists "users read their company follows" on public.company_follows;
create policy "users read their company follows"
  on public.company_follows for select
  using (auth.uid() = user_id);

drop policy if exists "users manage their company follows" on public.company_follows;
create policy "users manage their company follows"
  on public.company_follows for insert
  with check (auth.uid() = user_id);

drop policy if exists "users delete their company follows" on public.company_follows;
create policy "users delete their company follows"
  on public.company_follows for delete
  using (auth.uid() = user_id);

create or replace function public.company_follow_count(company_id_input uuid)
returns bigint
language sql
security definer
set search_path = public
stable
as $$
  select count(*) from public.company_follows where company_id = company_id_input;
$$;

grant execute on function public.company_follow_count(uuid) to anon, authenticated;

-- Impede duas candidaturas do mesmo candidato para a mesma vaga.
create unique index if not exists applications_job_applicant_unique
  on public.applications (job_id, applicant_id);

create index if not exists messages_sender_receiver_created_idx
  on public.messages (sender_id, receiver_id, created_at);

create index if not exists messages_receiver_sender_created_idx
  on public.messages (receiver_id, sender_id, created_at);

alter table public.applications enable row level security;
alter table public.saved_jobs enable row level security;
alter table public.messages enable row level security;

drop policy if exists "candidates create applications" on public.applications;
create policy "candidates create applications" on public.applications for insert to authenticated
  with check (auth.uid() = applicant_id);

drop policy if exists "participants read applications" on public.applications;
create policy "participants read applications" on public.applications for select to authenticated
  using (
    auth.uid() = applicant_id or exists (
      select 1 from public.jobs j
      join public.companies c on c.id = j.company_id
      where j.id = applications.job_id and c.user_id = auth.uid()
    )
  );

drop policy if exists "companies update their applications" on public.applications;
create policy "companies update their applications" on public.applications for update to authenticated
  using (exists (
    select 1 from public.jobs j
    join public.companies c on c.id = j.company_id
    where j.id = applications.job_id and c.user_id = auth.uid()
  ));

drop policy if exists "users manage saved jobs" on public.saved_jobs;
create policy "users manage saved jobs" on public.saved_jobs for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "participants read messages" on public.messages;
create policy "participants read messages" on public.messages for select to authenticated
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

drop policy if exists "users send their messages" on public.messages;
create policy "users send their messages" on public.messages for insert to authenticated
  with check (auth.uid() = sender_id and receiver_id <> auth.uid() and length(trim(content)) between 1 and 2000);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, role)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'name'), ''), split_part(new.email, '@', 1)),
    case when new.raw_user_meta_data ->> 'role' = 'empresa' then 'empresa' else 'candidato' end
  )
  on conflict (id) do update set
    name = excluded.name,
    role = excluded.role;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.delete_user()
returns void
language sql
security definer
set search_path = public, auth
as $$
  delete from auth.users where id = auth.uid();
$$;

revoke all on function public.delete_user() from public;
grant execute on function public.delete_user() to authenticated;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true), ('curriculos', 'curriculos', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "users upload own profile files" on storage.objects;
create policy "users upload own profile files" on storage.objects for insert to authenticated
  with check (bucket_id in ('avatars', 'curriculos') and name like auth.uid()::text || '-%');

drop policy if exists "users delete own profile files" on storage.objects;
create policy "users delete own profile files" on storage.objects for delete to authenticated
  using (bucket_id in ('avatars', 'curriculos') and name like auth.uid()::text || '-%');
