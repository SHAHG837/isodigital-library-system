-- ==============================================================================
-- Supabase Schema & SQL Migration: ISO Opportunities & Careers Platform
-- Project URL: https://lblryawislrrxfrmwdzc.supabase.co
-- Tables: profiles, opportunities, saved_opportunities, applications
-- Storage: resumes, opportunity-logos, avatars
-- Security: Row Level Security (RLS) & Performance Indexes
-- ==============================================================================

-- 1. Enable required PostgreSQL extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 2. Create updated_at trigger helper function
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql security definer;

-- ==============================================================================
-- TABLE 1: PROFILES
-- ==============================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text not null,
  avatar_url text,
  role text not null default 'applicant' check (role in ('applicant', 'member', 'recruiter', 'admin')),
  phone text,
  headline text,
  bio text,
  city text,
  country text default 'Pakistan',
  skills text[] default array[]::text[],
  experience_level text default 'mid' check (experience_level in ('entry', 'mid', 'senior', 'lead', 'executive')),
  education jsonb default '[]'::jsonb,
  resume_url text,
  resume_filename text,
  target_roles text[] default array[]::text[],
  preferred_location_type text default 'any' check (preferred_location_type in ('remote', 'hybrid', 'onsite', 'any')),
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

-- Trigger for profiles updated_at
drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Automatic user profile creation on Supabase Auth Signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'applicant')
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = coalesce(public.profiles.full_name, excluded.full_name);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ==============================================================================
-- TABLE 2: OPPORTUNITIES
-- ==============================================================================
create table if not exists public.opportunities (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  organization text not null,
  type text not null default 'Full-time' check (type in ('Full-time', 'Part-time', 'Contract', 'Internship', 'Scholarship', 'Fellowship', 'Mentorship')),
  category text not null default 'Engineering' check (category in ('Engineering', 'Data & AI', 'Design', 'Product', 'Marketing', 'Operations', 'Education', 'Social Welfare', 'Healthcare')),
  location text not null default 'Karachi, Pakistan',
  workplace_type text not null default 'Remote' check (workplace_type in ('Remote', 'Hybrid', 'On-site')),
  description text not null,
  responsibilities text[] default array[]::text[],
  requirements text[] default array[]::text[],
  skills_required text[] default array[]::text[],
  salary_min numeric,
  salary_max numeric,
  currency text not null default 'USD',
  deadline timestamptz,
  status text not null default 'active' check (status in ('active', 'draft', 'closed', 'expired')),
  posted_by uuid references public.profiles(id) on delete set null,
  contact_email text,
  apply_url text,
  application_count integer not null default 0,
  is_featured boolean not null default false,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

-- Trigger for opportunities updated_at
drop trigger if exists set_opportunities_updated_at on public.opportunities;
create trigger set_opportunities_updated_at
  before update on public.opportunities
  for each row execute function public.set_updated_at();

-- ==============================================================================
-- TABLE 3: SAVED_OPPORTUNITIES (Bookmarks)
-- ==============================================================================
create table if not exists public.saved_opportunities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  notes text,
  saved_at timestamptz not null default timezone('utc'::text, now()),
  constraint unique_user_saved_opportunity unique (user_id, opportunity_id)
);

-- ==============================================================================
-- TABLE 4: APPLICATIONS
-- ==============================================================================
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  applicant_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'submitted' check (status in ('submitted', 'under_review', 'interviewing', 'accepted', 'rejected', 'withdrawn')),
  resume_url text,
  cover_letter text,
  portfolio_url text,
  answers jsonb default '{}'::jsonb,
  feedback text,
  match_score integer default null,
  applied_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  constraint unique_applicant_opportunity unique (opportunity_id, applicant_id)
);

-- Trigger for applications updated_at
drop trigger if exists set_applications_updated_at on public.applications;
create trigger set_applications_updated_at
  before update on public.applications
  for each row execute function public.set_updated_at();

-- Trigger to increment opportunity application_count
create or replace function public.increment_opportunity_applications()
returns trigger as $$
begin
  update public.opportunities
  set application_count = application_count + 1
  where id = new.opportunity_id;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_application_created on public.applications;
create trigger on_application_created
  after insert on public.applications
  for each row execute function public.increment_opportunity_applications();

-- ==============================================================================
-- 5. PERFORMANCE INDEXES
-- ==============================================================================
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_profiles_email on public.profiles(email);

create index if not exists idx_opportunities_status on public.opportunities(status);
create index if not exists idx_opportunities_type on public.opportunities(type);
create index if not exists idx_opportunities_category on public.opportunities(category);
create index if not exists idx_opportunities_workplace on public.opportunities(workplace_type);
create index if not exists idx_opportunities_created_at on public.opportunities(created_at desc);
create index if not exists idx_opportunities_deadline on public.opportunities(deadline);
create index if not exists idx_opportunities_posted_by on public.opportunities(posted_by);

create index if not exists idx_saved_opportunities_user on public.saved_opportunities(user_id);
create index if not exists idx_saved_opportunities_opp on public.saved_opportunities(opportunity_id);

create index if not exists idx_applications_applicant on public.applications(applicant_id);
create index if not exists idx_applications_opportunity on public.applications(opportunity_id);
create index if not exists idx_applications_status on public.applications(status);

-- ==============================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all 4 tables
alter table public.profiles enable row level security;
alter table public.opportunities enable row level security;
alter table public.saved_opportunities enable row level security;
alter table public.applications enable row level security;

-- PROFILES RLS Policies
drop policy if exists "Profiles are viewable by everyone" on public.profiles;
create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id or auth.role() = 'service_role');

-- OPPORTUNITIES RLS Policies
drop policy if exists "Active opportunities are viewable by everyone" on public.opportunities;
create policy "Active opportunities are viewable by everyone"
  on public.opportunities for select
  using (status = 'active' or auth.uid() = posted_by or exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ));

drop policy if exists "Authenticated users can create opportunities" on public.opportunities;
create policy "Authenticated users can create opportunities"
  on public.opportunities for insert
  with check (auth.role() = 'authenticated' or auth.role() = 'service_role');

drop policy if exists "Opportunity posters and admins can update" on public.opportunities;
create policy "Opportunity posters and admins can update"
  on public.opportunities for update
  using (auth.uid() = posted_by or exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ));

drop policy if exists "Opportunity posters and admins can delete" on public.opportunities;
create policy "Opportunity posters and admins can delete"
  on public.opportunities for delete
  using (auth.uid() = posted_by or exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ));

-- SAVED_OPPORTUNITIES RLS Policies
drop policy if exists "Users can view own saved opportunities" on public.saved_opportunities;
create policy "Users can view own saved opportunities"
  on public.saved_opportunities for select
  using (auth.uid() = user_id);

drop policy if exists "Users can save opportunities" on public.saved_opportunities;
create policy "Users can save opportunities"
  on public.saved_opportunities for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can unsave opportunities" on public.saved_opportunities;
create policy "Users can unsave opportunities"
  on public.saved_opportunities for delete
  using (auth.uid() = user_id);

-- APPLICATIONS RLS Policies
drop policy if exists "Applicants and posters can view applications" on public.applications;
create policy "Applicants and posters can view applications"
  on public.applications for select
  using (
    auth.uid() = applicant_id or
    auth.uid() in (select posted_by from public.opportunities where id = applications.opportunity_id) or
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

drop policy if exists "Applicants can submit applications" on public.applications;
create policy "Applicants can submit applications"
  on public.applications for insert
  with check (auth.uid() = applicant_id);

drop policy if exists "Authorized parties can update applications" on public.applications;
create policy "Authorized parties can update applications"
  on public.applications for update
  using (
    auth.uid() = applicant_id or
    auth.uid() in (select posted_by from public.opportunities where id = applications.opportunity_id) or
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ==============================================================================
-- 7. SUPABASE STORAGE BUCKETS & STORAGE POLICIES
-- ==============================================================================
insert into storage.buckets (id, name, public)
values
  ('resumes', 'resumes', true),
  ('opportunity-logos', 'opportunity-logos', true),
  ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

-- Storage RLS policies
drop policy if exists "Public Access to Storage" on storage.objects;
create policy "Public Access to Storage"
  on storage.objects for select
  using (bucket_id in ('resumes', 'opportunity-logos', 'avatars'));

drop policy if exists "Authenticated users can upload storage objects" on storage.objects;
create policy "Authenticated users can upload storage objects"
  on storage.objects for insert
  with check (bucket_id in ('resumes', 'opportunity-logos', 'avatars') and auth.role() = 'authenticated');

drop policy if exists "Users can update own storage objects" on storage.objects;
create policy "Users can update own storage objects"
  on storage.objects for update
  using (bucket_id in ('resumes', 'opportunity-logos', 'avatars') and auth.uid()::text = (storage.foldername(name))[1]);

-- ==============================================================================
-- 8. INITIAL SEED OPPORTUNITIES (Production Ready Demo)
-- ==============================================================================
insert into public.opportunities (
  title, organization, type, category, location, workplace_type, description,
  responsibilities, requirements, skills_required, salary_min, salary_max, currency, deadline, status, is_featured
) values
(
  'Senior Full Stack AI Engineer',
  'ISO Digital Innovations Labs',
  'Full-time',
  'Engineering',
  'Islamabad / Karachi',
  'Remote',
  'We are seeking a talented Senior Full Stack AI Engineer to lead the architecture of our cloud-native platforms, integrate Gemini AI interactions, and scale our PostgreSQL and Supabase real-time infrastructure.',
  array['Design and deploy responsive web interfaces with React and TypeScript', 'Develop serverless APIs and scalable microservices', 'Integrate LLM generative AI endpoints for document analysis and automated review', 'Ensure 99.9% uptime and implement robust RLS security policies'],
  array['5+ years experience in modern TypeScript, React, and Node.js', 'Proven background with PostgreSQL, Supabase, and RLS policies', 'Hands-on experience with AI model APIs (Gemini, OpenAI)', 'Solid understanding of automated CI/CD and containerization'],
  array['React', 'TypeScript', 'Node.js', 'Supabase', 'PostgreSQL', 'Gemini AI', 'Tailwind CSS'],
  3500, 5000, 'USD',
  timezone('utc'::text, now() + interval '45 days'),
  'active', true
),
(
  'International Academic Excellence Scholarship',
  'Global Sadat Educational Trust',
  'Scholarship',
  'Education',
  'Global / United Kingdom & Europe',
  'Remote',
  'Full and partial scholarships awarded to outstanding undergraduate and graduate students pursuing degrees in Computer Science, Data Science, Artificial Intelligence, Medicine, or Sustainable Engineering.',
  array['Maintain top academic standing (minimum 3.5 CGPA or equivalent)', 'Submit semester progress reports and capstone project summaries', 'Engage in community mentoring and knowledge transfer initiatives'],
  array['Must be enrolled or holding an unconditional offer from an accredited university', 'Strong academic record with letters of recommendation', 'Demonstrated financial need or high academic merit'],
  array['Academic Writing', 'Research', 'STEM', 'Critical Thinking', 'Community Leadership'],
  5000, 12000, 'USD',
  timezone('utc'::text, now() + interval '60 days'),
  'active', true
),
(
  'UI/UX Product Designer & Design Systems',
  'NexGen Community Solutions',
  'Full-time',
  'Design',
  'Lahore, Pakistan',
  'Hybrid',
  'Join our design studio to craft high-conversion user journeys, accessible mobile interfaces, and unified Figma design systems for education and career advancement portals.',
  array['Build reusable Figma component libraries and token architectures', 'Conduct usability testing and prototype interactive user flows', 'Collaborate directly with front-end engineers to implement pixel-perfect layouts'],
  array['3+ years experience designing web and mobile applications', 'Deep mastery of Figma, auto-layout, interactive variants, and WCAG AA standards', 'Strong portfolio showcasing product thinking and typography craft'],
  array['Figma', 'UI/UX Design', 'Design Systems', 'User Research', 'Wireframing', 'Tailwind CSS'],
  1800, 2800, 'USD',
  timezone('utc'::text, now() + interval '30 days'),
  'active', false
),
(
  'Cloud & DevOps Engineering Fellowship',
  'ISO Youth Tech Incubator',
  'Fellowship',
  'Engineering',
  'Karachi, Pakistan',
  'Hybrid',
  'A 6-month fully-funded fellowship providing hands-on training with Kubernetes, Docker, Terraform, Cloud Run, Supabase edge infrastructure, and enterprise monitoring tools.',
  array['Provision and maintain cloud resources using infrastructure as code', 'Assist senior architects in monitoring cluster performance and database health', 'Document deployment pipelines and write automated regression tests'],
  array['Recent graduate or final year student in Computer Science or Electrical Engineering', 'Familiarity with Linux bash commands and basic Git workflows', 'Eagerness to learn cloud architectures and site reliability engineering'],
  array['Linux', 'Docker', 'Kubernetes', 'CI/CD', 'Git', 'Cloud Run', 'Monitoring'],
  800, 1200, 'USD',
  timezone('utc'::text, now() + interval '25 days'),
  'active', true
),
(
  'Data Science & Analytics Intern',
  'DataSphere Analytics',
  'Internship',
  'Data & AI',
  'Karachi, Pakistan',
  'Remote',
  'Exciting internship opportunity for aspiring data scientists to work on real-world member analytics, cohort retention models, and automated data visualization dashboards using Python, SQL, and Supabase.',
  array['Clean and structure diverse data sets for statistical analysis', 'Write performant SQL queries to generate weekly executive summaries', 'Build interactive visualizations using Recharts, D3, and Python notebooks'],
  array['Strong foundation in SQL, Python (Pandas/NumPy), and data visualization', 'Basic knowledge of machine learning concepts and exploratory data analysis', 'Excellent communication skills and attention to detail'],
  array['Python', 'SQL', 'PostgreSQL', 'Pandas', 'Data Visualization', 'Statistics'],
  500, 800, 'USD',
  timezone('utc'::text, now() + interval '20 days'),
  'active', false
);
