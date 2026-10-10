-- Skill2Project AI — reference schema (Supabase/Postgres). Apply when enabling a backend.
create type public.app_role as enum ('admin', 'student');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null, college text, degree text, branch text, academic_year text,
  target_role text, preferred_difficulty text, hours_per_week int default 6, budget_inr int default 2000,
  preferred_category text, created_at timestamptz default now(), updated_at timestamptz default now()
);
create table public.user_roles (id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id) on delete cascade not null, role app_role not null, unique (user_id, role));
create table public.skills (id uuid primary key default gen_random_uuid(), name text unique not null);
create table public.projects (
  id uuid primary key default gen_random_uuid(), slug text unique not null, title text not null, description text,
  category text, difficulty text, roles text[], budget_inr int, weeks int, hours_per_week int,
  tools text[], outcomes text[], steps text[], testing text[], outputs text[], enhancements text[], safety text[],
  created_at timestamptz default now()
);
create table public.project_skills (project_id uuid references public.projects(id) on delete cascade, skill_id uuid references public.skills(id), level int check (level between 1 and 3), primary key (project_id, skill_id));
create table public.user_skills (user_id uuid references auth.users(id) on delete cascade, skill_id uuid references public.skills(id), level int check (level between 1 and 3), primary key (user_id, skill_id));
create table public.saved_projects (user_id uuid references auth.users(id) on delete cascade, project_id uuid references public.projects(id) on delete cascade, created_at timestamptz default now(), primary key (user_id, project_id));
create table public.user_projects (
  id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id) on delete cascade not null,
  project_id uuid references public.projects(id) not null, status text default 'in_progress',
  github_url text, demo_url text, technologies text, challenges text, learnings text,
  started_at timestamptz default now(), completed_at timestamptz
);
create table public.project_tasks (id uuid primary key default gen_random_uuid(), user_project_id uuid references public.user_projects(id) on delete cascade not null, title text not null, done boolean default false, done_at timestamptz, created_at timestamptz default now());
create table public.assessments (id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id) on delete cascade not null, skill_id uuid references public.skills(id), correct int, total int, level int, created_at timestamptz default now());
create table public.roadmaps (id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id) on delete cascade not null, target_role text, created_at timestamptz default now());
create table public.milestones (id uuid primary key default gen_random_uuid(), roadmap_id uuid references public.roadmaps(id) on delete cascade not null, key text, title text, done boolean default false, updated_at timestamptz default now());

create index on public.user_projects(user_id); create index on public.project_tasks(user_project_id);
create index on public.assessments(user_id); create index on public.milestones(roadmap_id);

create or replace function public.has_role(_user_id uuid, _role app_role) returns boolean
language sql stable security definer set search_path = public as $$ select exists (select 1 from public.user_roles where user_id = _user_id and role = _role) $$;

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.skills enable row level security;
alter table public.projects enable row level security;
alter table public.project_skills enable row level security;
alter table public.user_skills enable row level security;
alter table public.saved_projects enable row level security;
alter table public.user_projects enable row level security;
alter table public.project_tasks enable row level security;
alter table public.assessments enable row level security;
alter table public.roadmaps enable row level security;
alter table public.milestones enable row level security;

-- Public catalog: readable by all, editable by admins only
create policy "catalog read" on public.projects for select using (true);
create policy "catalog admin" on public.projects for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "skills read" on public.skills for select using (true);
create policy "skills admin" on public.skills for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "pskills read" on public.project_skills for select using (true);
create policy "pskills admin" on public.project_skills for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "own roles" on public.user_roles for select to authenticated using (auth.uid() = user_id);

-- Private student data: owner only
create policy "own profile" on public.profiles for all to authenticated using (auth.uid() = id) with check (auth.uid() = id);
create policy "own skills" on public.user_skills for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own saved" on public.saved_projects for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own projects" on public.user_projects for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own tasks" on public.project_tasks for all to authenticated
  using (exists (select 1 from public.user_projects u where u.id = user_project_id and u.user_id = auth.uid()))
  with check (exists (select 1 from public.user_projects u where u.id = user_project_id and u.user_id = auth.uid()));
create policy "own assessments" on public.assessments for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own roadmaps" on public.roadmaps for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own milestones" on public.milestones for all to authenticated
  using (exists (select 1 from public.roadmaps r where r.id = roadmap_id and r.user_id = auth.uid()))
  with check (exists (select 1 from public.roadmaps r where r.id = roadmap_id and r.user_id = auth.uid()));

-- Seed (excerpt — full catalog lives in src/lib/projects.ts)
insert into public.skills (name) values ('C Programming'), ('Python'), ('Digital Electronics'), ('Verilog'), ('ESP32'), ('React'), ('SQL'), ('Machine Learning') on conflict do nothing;
insert into public.projects (slug, title, category, difficulty, roles, budget_inr, weeks, hours_per_week)
values ('esp32-env-monitor', 'ESP32 Environmental Monitoring Station', 'IoT', 'Beginner', array['Embedded Systems Engineer','IoT Engineer'], 1200, 4, 5),
       ('verilog-alu', '8-bit ALU in Verilog', 'VLSI', 'Beginner', array['VLSI Design Engineer'], 0, 3, 5) on conflict do nothing;
