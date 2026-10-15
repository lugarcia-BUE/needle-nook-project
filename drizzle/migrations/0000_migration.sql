
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text, country text, region text, city text,
  favorite_techniques text[] not null default '{}',
  experience_level text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "own profile select" on public.profiles for select to authenticated using (id = auth.uid());
create policy "own profile insert" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "own profile update" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)))
  on conflict (id) do nothing;
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.touch_updated_at() returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

create table public.patterns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  title text not null check (char_length(title) between 1 and 200),
  technique text, difficulty text, garment_type text,
  tags text[] not null default '{}',
  external_url text, file_path text, file_name text, file_type text, notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.patterns to authenticated;
grant all on public.patterns to service_role;
alter table public.patterns enable row level security;
create policy "own patterns" on public.patterns for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  name text not null check (char_length(name) between 1 and 200),
  description text,
  technique text not null default 'crochet',
  garment_type text, difficulty text,
  start_date date, target_end_date date, finished_at timestamptz,
  status text not null default 'activo' check (status in ('activo','pausado','terminado','archivado')),
  cover_path text,
  pattern_id uuid references public.patterns(id) on delete set null,
  target_measurements text, notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.projects(user_id, updated_at desc);
grant select, insert, update, delete on public.projects to authenticated;
grant all on public.projects to service_role;
alter table public.projects enable row level security;
create policy "own projects" on public.projects for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create trigger projects_touch before update on public.projects for each row execute function public.touch_updated_at();

create or replace function public.owns_project(_project_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select _project_id is null or exists (select 1 from public.projects where id = _project_id and user_id = auth.uid())
$$;

create table public.sections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  notes text, position int not null default 0,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.sections to authenticated;
grant all on public.sections to service_role;
alter table public.sections enable row level security;
create policy "own sections" on public.sections for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid() and public.owns_project(project_id));

create table public.counters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  section_id uuid references public.sections(id) on delete set null,
  name text not null default 'Contador',
  current_value int not null default 0 check (current_value >= 0),
  target_value int check (target_value is null or target_value > 0),
  stitches_per_row int check (stitches_per_row is null or stitches_per_row >= 0),
  motif_repeats int check (motif_repeats is null or motif_repeats >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.counters(user_id, updated_at desc);
grant select, insert, update, delete on public.counters to authenticated;
grant all on public.counters to service_role;
alter table public.counters enable row level security;
create policy "own counters" on public.counters for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid() and public.owns_project(project_id));
create trigger counters_touch before update on public.counters for each row execute function public.touch_updated_at();

create table public.counter_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  counter_id uuid not null references public.counters(id) on delete cascade,
  old_value int not null, new_value int not null,
  action text not null, undone boolean not null default false,
  created_at timestamptz not null default now()
);
create index on public.counter_history(counter_id, created_at desc);
grant select on public.counter_history to authenticated;
grant all on public.counter_history to service_role;
alter table public.counter_history enable row level security;
create policy "own history select" on public.counter_history for select to authenticated using (user_id = auth.uid());

create or replace function public.counter_change(_counter_id uuid, _action text, _value int default null)
returns public.counters language plpgsql security definer set search_path = public as $$
declare c public.counters; nv int; h public.counter_history;
begin
  select * into c from public.counters where id = _counter_id and user_id = auth.uid() for update;
  if not found then raise exception 'Contador no encontrado'; end if;
  if _action = 'sumar' then nv := c.current_value + 1;
  elsif _action = 'restar' then nv := greatest(c.current_value - 1, 0);
  elsif _action = 'editar' then
    if _value is null or _value < 0 then raise exception 'El valor no puede ser negativo'; end if;
    nv := _value;
  elsif _action = 'deshacer' then
    select * into h from public.counter_history where counter_id = c.id and undone = false and action <> 'deshacer' order by created_at desc limit 1;
    if not found then raise exception 'No hay cambios para deshacer'; end if;
    update public.counter_history set undone = true where id = h.id;
    nv := h.old_value;
  else raise exception 'Acción inválida'; end if;
  if nv = c.current_value and _action <> 'deshacer' then return c; end if;
  insert into public.counter_history(user_id, counter_id, old_value, new_value, action) values (auth.uid(), c.id, c.current_value, nv, _action);
  update public.counters set current_value = nv where id = c.id returning * into c;
  return c;
end; $$;
revoke all on function public.counter_change(uuid, text, int) from public, anon;
grant execute on function public.counter_change(uuid, text, int) to authenticated;

create table public.time_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  paused_seconds int not null default 0 check (paused_seconds >= 0),
  paused_at timestamptz,
  duration_seconds int check (duration_seconds is null or duration_seconds >= 0),
  is_manual boolean not null default false,
  notes text,
  created_at timestamptz not null default now()
);
create unique index one_active_session_per_user on public.time_sessions(user_id) where ended_at is null;
create index on public.time_sessions(user_id, started_at desc);
grant select, insert, update, delete on public.time_sessions to authenticated;
grant all on public.time_sessions to service_role;
alter table public.time_sessions enable row level security;
create policy "own sessions" on public.time_sessions for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid() and public.owns_project(project_id));

create table public.materials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  kind text not null check (kind in ('hilado','aguja','accesorio')),
  name text not null check (char_length(name) between 1 and 200),
  brand text, composition text, weight_category text, color text, color_code text,
  skein_weight_g numeric check (skein_weight_g is null or skein_weight_g > 0),
  skein_length_m numeric check (skein_length_m is null or skein_length_m > 0),
  quantity_available numeric not null default 0 check (quantity_available >= 0),
  needle_type text,
  diameter_mm numeric check (diameter_mm is null or diameter_mm > 0),
  length_cm numeric check (length_cm is null or length_cm > 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.materials to authenticated;
grant all on public.materials to service_role;
alter table public.materials enable row level security;
create policy "own materials" on public.materials for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create trigger materials_touch before update on public.materials for each row execute function public.touch_updated_at();

create or replace function public.owns_material(_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select _id is null or exists (select 1 from public.materials where id = _id and user_id = auth.uid())
$$;

create table public.project_materials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  material_id uuid not null references public.materials(id) on delete cascade,
  required_grams numeric check (required_grams is null or required_grams >= 0),
  required_meters numeric check (required_meters is null or required_meters >= 0),
  qty_estimated numeric check (qty_estimated is null or qty_estimated >= 0),
  qty_purchased numeric check (qty_purchased is null or qty_purchased >= 0),
  qty_used numeric check (qty_used is null or qty_used >= 0),
  notes text,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.project_materials to authenticated;
grant all on public.project_materials to service_role;
alter table public.project_materials enable row level security;
create policy "own project materials" on public.project_materials for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid() and public.owns_project(project_id) and public.owns_material(material_id));

create table public.calculations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  kind text not null check (kind in ('regla_de_tres','muestra')),
  title text, inputs jsonb not null, result jsonb not null,
  created_at timestamptz not null default now()
);
grant select, insert, delete on public.calculations to authenticated;
grant all on public.calculations to service_role;
alter table public.calculations enable row level security;
create policy "own calcs" on public.calculations for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid() and public.owns_project(project_id));

create table public.shopping_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  project_id uuid references public.projects(id) on delete set null,
  description text not null check (char_length(description) between 1 and 200),
  quantity numeric check (quantity is null or quantity > 0),
  unit text, purchased boolean not null default false,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.shopping_items to authenticated;
grant all on public.shopping_items to service_role;
alter table public.shopping_items enable row level security;
create policy "own shopping" on public.shopping_items for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid() and public.owns_project(project_id));

create policy "tejido own read" on storage.objects for select to authenticated using (bucket_id = 'tejido' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "tejido own insert" on storage.objects for insert to authenticated with check (bucket_id = 'tejido' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "tejido own update" on storage.objects for update to authenticated using (bucket_id = 'tejido' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "tejido own delete" on storage.objects for delete to authenticated using (bucket_id = 'tejido' and (storage.foldername(name))[1] = auth.uid()::text);
