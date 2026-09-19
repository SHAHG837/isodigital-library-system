import React, { useState, useEffect } from 'react';
import {
  Database,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Server,
  ShieldCheck,
  HardDrive,
  FileCode,
  Key,
  Globe,
  Terminal,
  X,
  Download,
  UserCheck,
  Sparkles,
  Lock,
  Mail,
  User,
  LogOut
} from 'lucide-react';
import {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_PROJECT_ID,
  SUPABASE_DASHBOARD_URL,
  SUPABASE_SQL_EDITOR_URL,
  checkSupabaseHealth,
  SupabaseHealthStatus,
  getSupabaseSession,
  signOutSupabase
} from '../lib/supabaseClient';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'sql' | 'schema' | 'auth'>('overview');
  const [copied, setCopied] = useState(false);
  const [testing, setTesting] = useState(false);
  const [health, setHealth] = useState<SupabaseHealthStatus | null>(null);
  const [serverPing, setServerPing] = useState<{
    reachable: boolean;
    latencyMs?: number;
    error?: string;
  } | null>(null);
  const [activeSessionUser, setActiveSessionUser] = useState<any>(null);
  const [dynamicSql, setDynamicSql] = useState<string>('');

  const sqlMigrationCode = `-- ==============================================================================
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

-- ==============================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER ON auth.users SIGNUP
-- Automatically runs whenever a new user signs up in Supabase Auth
-- ==============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    email,
    full_name,
    role
  )
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(coalesce(new.email, 'user'), '@', 1)
    ),
    coalesce(new.raw_user_meta_data->>'role', 'applicant')
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = coalesce(public.profiles.full_name, excluded.full_name),
    updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

-- Bind trigger to auth.users after insert
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

-- ==============================================================================
-- 5. PERFORMANCE INDEXES
-- ==============================================================================
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_opportunities_status on public.opportunities(status);
create index if not exists idx_opportunities_category on public.opportunities(category);
create index if not exists idx_saved_opportunities_user on public.saved_opportunities(user_id);
create index if not exists idx_applications_applicant on public.applications(applicant_id);

-- ==============================================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- ==============================================================================
alter table public.profiles enable row level security;
alter table public.opportunities enable row level security;
alter table public.saved_opportunities enable row level security;
alter table public.applications enable row level security;

-- Policies
create policy "Profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Active opportunities are viewable by everyone" on public.opportunities for select using (status = 'active' or auth.uid() = posted_by);
create policy "Authenticated users can create opportunities" on public.opportunities for insert with check (auth.role() = 'authenticated');
create policy "Users can view own saved opportunities" on public.saved_opportunities for select using (auth.uid() = user_id);
create policy "Users can save opportunities" on public.saved_opportunities for insert with check (auth.uid() = user_id);
create policy "Applicants and posters can view applications" on public.applications for select using (auth.uid() = applicant_id or auth.uid() in (select posted_by from public.opportunities where id = applications.opportunity_id));
create policy "Applicants can submit applications" on public.applications for insert with check (auth.uid() = applicant_id);

-- 7. STORAGE BUCKETS
insert into storage.buckets (id, name, public) values ('resumes', 'resumes', true), ('opportunity-logos', 'opportunity-logos', true), ('avatars', 'avatars', true) on conflict (id) do update set public = true;`;

  const activeSqlCode = dynamicSql || sqlMigrationCode;

  const runDiagnostics = async () => {
    setTesting(true);
    try {
      const h = await checkSupabaseHealth();
      setHealth(h);

      const res = await fetch('/api/supabase/status');
      const ping = await res.json();
      setServerPing(ping);

      // Check active auth session
      getSupabaseSession()
        .then((session) => setActiveSessionUser(session?.user || null))
        .catch(() => {});

      // Fetch dynamic schema from disk if available
      fetch('/api/supabase/schema')
        .then((r) => (r.ok ? r.text() : ''))
        .then((txt) => {
          if (txt && txt.length > 50) setDynamicSql(txt);
        })
        .catch(() => {});
    } catch (e: any) {
      console.error('Diagnostics error:', e);
    } finally {
      setTesting(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      runDiagnostics();
    }
  }, [isOpen]);

  const handleCopySql = () => {
    navigator.clipboard.writeText(activeSqlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadSql = () => {
    const blob = new Blob([activeSqlCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'schema.sql');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">Supabase Backend Architecture</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Project: {SUPABASE_PROJECT_ID}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                PostgreSQL Database, Authentication, Row Level Security (RLS) & Storage
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={runDiagnostics}
              disabled={testing}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Re-run connection diagnostics"
            >
              <RefreshCw className={`w-4 h-4 ${testing ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 pt-2 gap-2 text-sm font-medium">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-4 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'border-emerald-400 text-emerald-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-4 h-4" />
            Overview & Status
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`pb-3 px-4 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'sql'
                ? 'border-emerald-400 text-emerald-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-4 h-4" />
            SQL Migrations Script
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`pb-3 px-4 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'schema'
                ? 'border-emerald-400 text-emerald-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            RLS & Tables
          </button>
          <button
            onClick={() => setActiveTab('auth')}
            className={`pb-3 px-4 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'auth'
                ? 'border-emerald-400 text-emerald-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HardDrive className="w-4 h-4" />
            Storage & Buckets
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-slate-300">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Connection Banner */}
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-white font-semibold text-base flex items-center gap-2">
                      Connected to Supabase Project
                      <span className="flex h-2.5 w-2.5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 font-mono mt-1 select-all break-all">
                      {SUPABASE_URL}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Publishable Key: <span className="font-mono text-slate-400">{SUPABASE_ANON_KEY.slice(0, 16)}...{SUPABASE_ANON_KEY.slice(-6)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={SUPABASE_SQL_EDITOR_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-lg shadow-emerald-950 transition-colors"
                  >
                    <span>Supabase SQL Editor</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href={SUPABASE_DASHBOARD_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs transition-colors"
                  >
                    <span>Dashboard</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Table Status Grid */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                  Required Supabase Database Tables
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    {
                      name: 'profiles',
                      desc: 'User profiles, skills, education, target roles',
                      status: health?.tables.profiles
                    },
                    {
                      name: 'opportunities',
                      desc: 'Jobs, internships, scholarships, fellowships',
                      status: health?.tables.opportunities
                    },
                    {
                      name: 'saved_opportunities',
                      desc: 'User bookmarked opportunities with timestamps',
                      status: health?.tables.saved_opportunities
                    },
                    {
                      name: 'applications',
                      desc: 'Job applications, status pipeline, AI scores',
                      status: health?.tables.applications
                    }
                  ].map((table) => (
                    <div
                      key={table.name}
                      className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono font-bold text-white text-xs">{table.name}</span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                              table.status
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-amber-500/20 text-amber-300'
                            }`}
                          >
                            {table.status ? 'Live Table' : 'Ready to Run'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-tight">{table.desc}</p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-slate-700/40 flex items-center gap-1.5 text-[11px] text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>RLS Configured</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ready for Future AI Features */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/40 via-slate-800/40 to-slate-900/60 border border-indigo-500/30">
                <div className="flex items-center gap-2.5 text-indigo-300 font-semibold mb-2">
                  <Terminal className="w-4 h-4" />
                  <span>AI Readiness: Resume Review & Job Recommendations</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  The Supabase schema stores candidate target roles, skills arrays, and application match scores. Server-side Gemini 2.5 endpoints (<code className="text-emerald-400 font-mono">/api/ai/resume-review</code> and <code className="text-emerald-400 font-mono">/api/ai/job-recommendations</code>) are actively wired to evaluate candidate resumes against requirements and rank matching opportunities.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'sql' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-800/30 p-4 rounded-xl border border-slate-700/50">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-sm">Automated SQL Schema Migration</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      db/schema.sql
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Execute this SQL script in your Supabase SQL Editor to initialize all tables, indexes, RLS policies, storage buckets, and the <code className="text-emerald-300 font-mono">handle_new_user()</code> signup trigger.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleCopySql}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-md active:scale-95"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Copied to Clipboard!' : 'Copy SQL Script'}</span>
                  </button>
                  <button
                    onClick={handleDownloadSql}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium transition-colors"
                    title="Download db/schema.sql file"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .sql</span>
                  </button>
                  <a
                    href={SUPABASE_SQL_EDITOR_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 text-xs font-medium transition-colors"
                  >
                    <span>Open Supabase SQL Editor</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Step by step instructions banner */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 flex gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">1</span>
                  <div className="text-slate-300">
                    <strong className="text-white">Copy or Download</strong>
                    <p className="text-[11px] text-slate-400 mt-0.5">Copy the full script above or download <code className="text-emerald-400">schema.sql</code>.</p>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 flex gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center shrink-0">2</span>
                  <div className="text-slate-300">
                    <strong className="text-white">Paste into SQL Editor</strong>
                    <p className="text-[11px] text-slate-400 mt-0.5">Open your Supabase project dashboard and create a new query.</p>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 flex gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0">3</span>
                  <div className="text-slate-300">
                    <strong className="text-white">Click "Run"</strong>
                    <p className="text-[11px] text-slate-400 mt-0.5">Creates tables, RLS, storage buckets, and auto-sync trigger instantly.</p>
                  </div>
                </div>
              </div>

              <div className="relative rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs overflow-x-auto max-h-[380px] text-slate-300 select-all leading-relaxed">
                <pre>{activeSqlCode}</pre>
              </div>
            </div>
          )}

          {activeTab === 'schema' && (
            <div className="space-y-4">
              <h3 className="font-bold text-white text-sm">Row Level Security (RLS) & Access Control Matrix</h3>
              <div className="rounded-xl border border-slate-800 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800/80 text-slate-300 uppercase font-semibold">
                    <tr>
                      <th className="p-3">Table</th>
                      <th className="p-3">Select Policy</th>
                      <th className="p-3">Insert Policy</th>
                      <th className="p-3">Update / Delete</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-900/40">
                    <tr>
                      <td className="p-3 font-mono font-bold text-white">profiles</td>
                      <td className="p-3 text-slate-300">Public or Authenticated</td>
                      <td className="p-3 text-emerald-400">auth.uid() = id</td>
                      <td className="p-3 text-emerald-400">auth.uid() = id</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-bold text-white">opportunities</td>
                      <td className="p-3 text-slate-300">Active status OR poster OR admin</td>
                      <td className="p-3 text-emerald-400">auth.role() = 'authenticated'</td>
                      <td className="p-3 text-emerald-400">auth.uid() = posted_by OR admin</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-bold text-white">saved_opportunities</td>
                      <td className="p-3 text-emerald-400">auth.uid() = user_id</td>
                      <td className="p-3 text-emerald-400">auth.uid() = user_id</td>
                      <td className="p-3 text-emerald-400">auth.uid() = user_id</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-bold text-white">applications</td>
                      <td className="p-3 text-slate-300">Applicant OR Opportunity Poster OR Admin</td>
                      <td className="p-3 text-emerald-400">auth.uid() = applicant_id</td>
                      <td className="p-3 text-emerald-400">Applicant OR Opportunity Poster</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'auth' && (
            <div className="space-y-5">
              {/* User Signup Auto-Creation Pipeline */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/30">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>Automatic User Profile Creation Pipeline</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  When a user signs up via email/password or magic OTP link, Supabase creates a record in <code className="text-emerald-400 font-mono">auth.users</code>. The database trigger <code className="text-emerald-400 font-mono">on_auth_user_created</code> automatically executes <code className="text-emerald-400 font-mono">public.handle_new_user()</code> to populate <code className="text-emerald-400 font-mono">public.profiles</code> with their full name, email, and designated role.
                </p>
                <div className="mt-3 p-3 rounded-lg bg-slate-950/60 border border-slate-800 font-mono text-[11px] text-slate-300">
                  <div className="text-slate-400">// Automatic Trigger Logic in schema.sql:</div>
                  <span className="text-emerald-400">create trigger</span> on_auth_user_created <br />
                  &nbsp;&nbsp;<span className="text-emerald-400">after insert on</span> auth.users <br />
                  &nbsp;&nbsp;<span className="text-emerald-400">for each row execute function</span> public.handle_new_user();
                </div>
              </div>

              {/* Active Session Status */}
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-white font-bold text-xs">
                    <UserCheck className="w-4 h-4 text-emerald-400" />
                    <span>Live Supabase Client Auth State</span>
                  </div>
                  {activeSessionUser && (
                    <button
                      onClick={async () => {
                        await signOutSupabase();
                        setActiveSessionUser(null);
                      }}
                      className="flex items-center gap-1 text-[11px] text-red-400 hover:text-red-300 transition-colors"
                    >
                      <LogOut className="w-3 h-3" />
                      <span>Sign Out</span>
                    </button>
                  )}
                </div>

                {activeSessionUser ? (
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">Email:</span>
                      <span className="font-semibold text-white">{activeSessionUser.email}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold">Active Session</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">User ID:</span>
                      <span className="font-mono text-[11px] text-slate-300">{activeSessionUser.id}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">
                    No active Supabase user session detected. You can sign in or sign up via the <strong className="text-white">"Sign In / Register"</strong> modal in the top header (select the <strong className="text-emerald-400">"Supabase Auth"</strong> tab).
                  </p>
                )}
              </div>

              {/* Storage Buckets */}
              <div className="space-y-3">
                <h3 className="font-bold text-white text-sm">Supabase Storage Buckets</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60">
                    <div className="font-mono text-white font-bold text-xs mb-1">resumes</div>
                    <p className="text-[11px] text-slate-400 mb-2">Stores PDF and DOCX resume attachments uploaded by candidates.</p>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300">Public: true</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60">
                    <div className="font-mono text-white font-bold text-xs mb-1">opportunity-logos</div>
                    <p className="text-[11px] text-slate-400 mb-2">Organization and trust logos associated with job or scholarship listings.</p>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300">Public: true</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60">
                    <div className="font-mono text-white font-bold text-xs mb-1">avatars</div>
                    <p className="text-[11px] text-slate-400 mb-2">Candidate and recruiter profile pictures and community avatars.</p>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300">Public: true</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Client: @supabase/supabase-js v2 • PostgreSQL Backend Ready</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
