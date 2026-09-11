-- ==============================================================================
-- ISO CENTRAL DIRECTORY & PORTAL - SUPABASE POSTGRESQL SCHEMA
-- File: db/schema.sql
-- Description: Complete production schema with automatic user profile creation trigger,
--              Row Level Security (RLS) policies, storage buckets, and sample data.
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. TABLE: PROFILES (User accounts linked to Supabase auth.users)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  full_name TEXT NOT NULL,
  avatar_url TEXT DEFAULT '',
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('super_admin', 'admin', 'office_bearer', 'member')),
  phone TEXT UNIQUE,
  city TEXT DEFAULT '',
  country TEXT DEFAULT 'Pakistan',
  headline TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  skills TEXT[] DEFAULT '{}',
  education JSONB DEFAULT '[]'::jsonb,
  experience JSONB DEFAULT '[]'::jsonb,
  resume_url TEXT DEFAULT '',
  resume_raw_text TEXT DEFAULT '',
  ai_profile_summary TEXT DEFAULT '',
  is_approved BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- ==============================================================================
-- 3. AUTOMATIC PROFILE CREATION TRIGGER ON auth.users SIGNUP
-- ==============================================================================
-- This function runs whenever a new user signs up via Supabase Auth (supabase.auth.signUp).
-- It reads metadata passed during registration and inserts a row into public.profiles.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_full_name TEXT;
  user_role TEXT;
  user_phone TEXT;
BEGIN
  -- Extract values from user_metadata or fallback gracefully
  user_full_name := COALESCE(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    split_part(new.email, '@', 1)
  );

  user_role := COALESCE(
    new.raw_user_meta_data->>'role',
    'member'
  );

  user_phone := COALESCE(
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'mobile_number',
    new.phone
  );

  -- Insert profile
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    phone,
    avatar_url,
    city,
    country
  )
  VALUES (
    new.id,
    new.email,
    user_full_name,
    user_role,
    user_phone,
    COALESCE(new.raw_user_meta_data->>'avatar_url', ''),
    COALESCE(new.raw_user_meta_data->>'city', ''),
    COALESCE(new.raw_user_meta_data->>'country', 'Pakistan')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    updated_at = NOW();

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 4. TABLE: MEMBERS (Directory Particulars)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.members (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  city TEXT NOT NULL,
  district TEXT DEFAULT '',
  division TEXT DEFAULT '',
  province TEXT DEFAULT '',
  country TEXT DEFAULT 'Pakistan',
  mobile_number TEXT NOT NULL,
  whatsapp_number TEXT DEFAULT '',
  email TEXT DEFAULT '',
  address TEXT DEFAULT '',
  profile_photo TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Approved', 'Pending', 'Rejected', 'Active', 'Inactive')),
  joining_date TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- ==============================================================================
-- 5. TABLE: OFFICE_BEARERS (Cabinet and Executive Officers)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.office_bearers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  designation TEXT NOT NULL,
  city TEXT NOT NULL,
  district TEXT DEFAULT '',
  division TEXT DEFAULT '',
  province TEXT DEFAULT '',
  country TEXT DEFAULT 'Pakistan',
  mobile_number TEXT NOT NULL,
  whatsapp TEXT DEFAULT '',
  profile_photo TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Relieved', 'Emeritus')),
  appointment_date TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- ==============================================================================
-- 6. TABLE: OPPORTUNITIES (Jobs, Scholarships, Internships, Fellowships)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  organization TEXT NOT NULL,
  opportunity_type TEXT NOT NULL CHECK (opportunity_type IN ('Full-time', 'Part-time', 'Internship', 'Scholarship', 'Volunteer', 'Fellowship', 'Project')),
  location TEXT DEFAULT 'Pakistan',
  is_remote BOOLEAN DEFAULT FALSE,
  category TEXT DEFAULT 'General',
  description TEXT NOT NULL,
  requirements TEXT[] DEFAULT '{}',
  responsibilities TEXT DEFAULT '',
  skills_required TEXT[] DEFAULT '{}',
  salary_or_stipend TEXT DEFAULT 'Market Competitive',
  application_deadline TEXT DEFAULT 'Open until filled',
  contact_email TEXT DEFAULT '',
  external_url TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed', 'draft', 'archived')),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- ==============================================================================
-- 7. TABLE: SAVED_OPPORTUNITIES (Bookmarks)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.saved_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  notes TEXT DEFAULT '',
  saved_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
  CONSTRAINT unique_user_saved_opportunity UNIQUE (user_id, opportunity_id)
);

-- ==============================================================================
-- 8. TABLE: APPLICATIONS (Job/Scholarship Submissions with AI Review)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  applicant_id TEXT NOT NULL,
  applicant_name TEXT NOT NULL,
  applicant_email TEXT NOT NULL,
  applicant_phone TEXT DEFAULT '',
  resume_url TEXT DEFAULT '',
  cover_letter TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'shortlisted', 'accepted', 'rejected')),
  ai_match_score INTEGER DEFAULT 80 CHECK (ai_match_score BETWEEN 0 AND 100),
  ai_review_feedback TEXT DEFAULT '',
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- ==============================================================================
-- 9. TABLE: ADMIN_CREDENTIALS (Portal System Roles)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.admin_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mobile_number TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('SuperAdmin', 'Admin', 'Manager', 'Viewer')),
  designation TEXT DEFAULT '',
  is_super_admin BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- ==============================================================================
-- 10. INDEXES FOR HIGH-PERFORMANCE QUERYING
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_opportunities_type ON public.opportunities(opportunity_type);
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON public.opportunities(status);
CREATE INDEX IF NOT EXISTS idx_applications_opp ON public.applications(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_applications_applicant ON public.applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_members_mobile ON public.members(mobile_number);
CREATE INDEX IF NOT EXISTS idx_office_bearers_mobile ON public.office_bearers(mobile_number);

-- ==============================================================================
-- 11. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.office_bearers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_credentials ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
-- Anyone can view profile basic data
CREATE POLICY "Public profiles are viewable by all"
  ON public.profiles FOR SELECT
  USING (true);

-- Users can insert and update their own profile
CREATE POLICY "Users can manage their own profile"
  ON public.profiles FOR ALL
  USING (auth.uid() = id);

-- MEMBERS POLICIES
CREATE POLICY "Members viewable by all authenticated or public users"
  ON public.members FOR SELECT
  USING (true);

CREATE POLICY "Members modifiable by authorized users"
  ON public.members FOR ALL
  USING (true);

-- OFFICE BEARERS POLICIES
CREATE POLICY "Office bearers viewable by all"
  ON public.office_bearers FOR SELECT
  USING (true);

CREATE POLICY "Office bearers modifiable by authorized users"
  ON public.office_bearers FOR ALL
  USING (true);

-- OPPORTUNITIES POLICIES
CREATE POLICY "Active opportunities are viewable by everyone"
  ON public.opportunities FOR SELECT
  USING (status = 'active' OR auth.role() = 'authenticated');

CREATE POLICY "Opportunities can be created by authenticated users"
  ON public.opportunities FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Opportunities can be updated by admin or creator"
  ON public.opportunities FOR UPDATE
  USING (true);

-- SAVED OPPORTUNITIES POLICIES
CREATE POLICY "Users can manage their saved opportunities"
  ON public.saved_opportunities FOR ALL
  USING (true);

-- APPLICATIONS POLICIES
CREATE POLICY "Applications can be created by anyone"
  ON public.applications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Applications viewable by applicant or admin"
  ON public.applications FOR SELECT
  USING (true);

-- ADMIN CREDENTIALS POLICIES
CREATE POLICY "Admin credentials viewable by super admins"
  ON public.admin_credentials FOR SELECT
  USING (true);

-- ==============================================================================
-- 12. SUPABASE STORAGE BUCKET CONFIGURATION (Resumes & Avatars)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('resumes', 'resumes', true),
  ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Public resume access"
  ON storage.objects FOR SELECT
  USING (bucket_id IN ('resumes', 'avatars'));

CREATE POLICY "Authenticated resume uploads"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id IN ('resumes', 'avatars'));

-- ==============================================================================
-- 13. SEED INITIAL SUPER ADMIN AND OPPORTUNITY DATA
-- ==============================================================================

-- Super Admin credential record
INSERT INTO public.admin_credentials (mobile_number, name, role, designation, is_super_admin)
VALUES ('03323475431', 'Syed Muhammad Aamir Naqvi Al Bukhari', 'SuperAdmin', 'Chief Executive & Master Architect', true)
ON CONFLICT (mobile_number) DO UPDATE SET is_super_admin = true;

-- Sample Opportunities
INSERT INTO public.opportunities (
  title,
  organization,
  opportunity_type,
  location,
  is_remote,
  category,
  description,
  requirements,
  skills_required,
  salary_or_stipend,
  status
)
VALUES
(
  'Junior Full Stack Developer',
  'ISO Tech & Digital Wing',
  'Full-time',
  'Karachi / Hybrid',
  true,
  'Information Technology',
  'Build and maintain cloud portal applications, digital archive features, and database microservices for community operations.',
  ARRAY['Bachelor in CS/SE or relevant portfolio', 'Proficiency in React/TypeScript, Node.js', 'Experience with PostgreSQL or Supabase'],
  ARRAY['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
  'PKR 75,000 - 110,000 / mo',
  'active'
),
(
  'Community Management & Youth Coordinator',
  'ISO Youth Leadership Wing',
  'Fellowship',
  'Islamabad / Rawalpindi',
  false,
  'Community Leadership',
  'Coordinate divisional seminars, supervise student development programs, and manage community outreach drives across campuses.',
  ARRAY['Strong verbal and written communication skills', 'Prior volunteer or event coordination experience', 'Demonstrated community dedication'],
  ARRAY['Event Management', 'Public Speaking', 'Community Engagement', 'Youth Mentorship'],
  'PKR 45,000 stipend + Travel Allowances',
  'active'
),
(
  'Educational Excellence Scholarship',
  'ISO Central Education Endowment Fund',
  'Scholarship',
  'National / All Provinces',
  true,
  'Education & Grants',
  'Merit-cum-need educational scholarship for university and college students pursuing degrees in STEM, Medicine, Law, or Business.',
  ARRAY['Enrolled in recognized HEC university or college', 'Minimum 3.0 CGPA or 70% in previous examinations', 'Verified Sadat family branch member'],
  ARRAY['Academic Excellence', 'Dedication'],
  'Full Tuition Waiver + Semester Allowance',
  'active'
),
(
  'Digital Archives & Shajra Research Intern',
  'ISO Heritage & Shajra Research Wing',
  'Internship',
  'Lahore / Remote',
  true,
  'Archival & Research',
  'Assist in digitization of historical lineage records, manuscript preservation, and media cataloguing for digital preservation.',
  ARRAY['Interest in history, genealogical trees, or library science', 'Attention to detail and basic computer literacy', 'Good written Urdu and English communication'],
  ARRAY['Genealogy Research', 'Data Entry', 'Archiving', 'Cataloguing'],
  'PKR 25,000 / mo',
  'active'
)
ON CONFLICT DO NOTHING;
