-- ==============================================================================
-- SUPABASE POSTGRESQL SCHEMA & RLS MIGRATION
-- Project: ISO Digital Library & Opportunities Management System
-- Supabase Project URL: https://neyhuytsqfovqkxqvukh.supabase.co
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 1. PROFILES TABLE (Linked to auth.users or standalone app profiles)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    role TEXT DEFAULT 'member' CHECK (role IN ('super_admin', 'admin', 'office_bearer', 'member')),
    phone TEXT,
    city TEXT,
    country TEXT DEFAULT 'Pakistan',
    headline TEXT,
    bio TEXT,
    skills TEXT[] DEFAULT '{}',
    education JSONB DEFAULT '[]'::jsonb,
    experience JSONB DEFAULT '[]'::jsonb,
    resume_url TEXT,
    resume_raw_text TEXT,
    ai_profile_summary TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for profiles
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- ==============================================================================
-- 2. OPPORTUNITIES TABLE (Jobs, Fellowships, Internships, Scholarships)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    organization TEXT NOT NULL,
    opportunity_type TEXT NOT NULL CHECK (opportunity_type IN ('Full-time', 'Part-time', 'Internship', 'Scholarship', 'Volunteer', 'Fellowship', 'Project')),
    location TEXT DEFAULT 'Remote',
    is_remote BOOLEAN DEFAULT false,
    category TEXT DEFAULT 'General',
    description TEXT NOT NULL,
    requirements TEXT[] DEFAULT '{}',
    responsibilities TEXT,
    skills_required TEXT[] DEFAULT '{}',
    salary_or_stipend TEXT,
    application_deadline TIMESTAMPTZ,
    contact_email TEXT,
    external_url TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'draft', 'archived')),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for opportunities
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON public.opportunities(status);
CREATE INDEX IF NOT EXISTS idx_opportunities_type ON public.opportunities(opportunity_type);
CREATE INDEX IF NOT EXISTS idx_opportunities_created_at ON public.opportunities(created_at DESC);

-- ==============================================================================
-- 3. SAVED OPPORTUNITIES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.saved_opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
    notes TEXT,
    saved_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_saved_opportunity UNIQUE (user_id, opportunity_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_opportunities_user ON public.saved_opportunities(user_id);

-- ==============================================================================
-- 4. APPLICATIONS TABLE (Job / Opportunity Applications & AI Review Ready)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
    applicant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    applicant_name TEXT NOT NULL,
    applicant_email TEXT NOT NULL,
    applicant_phone TEXT,
    resume_url TEXT,
    cover_letter TEXT,
    status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'shortlisted', 'accepted', 'rejected')),
    ai_match_score NUMERIC(5,2),
    ai_review_feedback TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_applications_opp ON public.applications(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_applications_applicant ON public.applications(applicant_id);

-- ==============================================================================
-- 5. MEMBERS TABLE (ISO Central Repository Database)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.members (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    father_name TEXT,
    shajra_family_tree TEXT,
    city TEXT,
    country TEXT DEFAULT 'Pakistan',
    mobile_number TEXT,
    whatsapp_number TEXT,
    education TEXT,
    profession TEXT,
    blood_group TEXT,
    cnic_or_passport TEXT,
    email TEXT,
    address TEXT,
    status TEXT DEFAULT 'Active',
    joining_date TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_members_mobile ON public.members(mobile_number);
CREATE INDEX IF NOT EXISTS idx_members_city ON public.members(city);

-- ==============================================================================
-- 6. OFFICE BEARERS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.office_bearers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    designation TEXT NOT NULL,
    city TEXT NOT NULL,
    mobile_number TEXT NOT NULL,
    whatsapp TEXT,
    email TEXT,
    appointment_date TEXT,
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_office_bearers_mobile ON public.office_bearers(mobile_number);

-- ==============================================================================
-- 7. AUDIT LOGS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY,
    timestamp TEXT NOT NULL,
    user_name TEXT NOT NULL,
    action TEXT NOT NULL,
    details TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.office_bearers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active opportunities
CREATE POLICY "Public can view active opportunities"
    ON public.opportunities FOR SELECT
    USING (status = 'active' OR auth.role() = 'authenticated');

-- Allow authenticated users or service to manage opportunities
CREATE POLICY "Full access to opportunities for admins"
    ON public.opportunities FOR ALL
    USING (true)
    WITH CHECK (true);

-- Profiles policies
CREATE POLICY "Profiles read access"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Profiles self insert/update"
    ON public.profiles FOR ALL
    USING (true)
    WITH CHECK (true);

-- Saved opportunities policies
CREATE POLICY "Users can manage saved opportunities"
    ON public.saved_opportunities FOR ALL
    USING (true)
    WITH CHECK (true);

-- Applications policies
CREATE POLICY "Users can insert and view applications"
    ON public.applications FOR ALL
    USING (true)
    WITH CHECK (true);

-- Members & Office Bearers access
CREATE POLICY "Public read members"
    ON public.members FOR SELECT
    USING (true);

CREATE POLICY "Admin manage members"
    ON public.members FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Public read office_bearers"
    ON public.office_bearers FOR SELECT
    USING (true);

CREATE POLICY "Admin manage office_bearers"
    ON public.office_bearers FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Audit logs insert and select"
    ON public.audit_logs FOR ALL
    USING (true)
    WITH CHECK (true);

-- ==============================================================================
-- 9. SEED DEFAULT OPPORTUNITIES DATA FOR COMMUNITY CAREERS
-- ==============================================================================
INSERT INTO public.opportunities (
    title, organization, opportunity_type, location, is_remote, category, description,
    requirements, skills_required, salary_or_stipend, status
) VALUES
(
    'Junior Full Stack Developer',
    'ISO Tech & Digital Wing',
    'Full-time',
    'Karachi / Hybrid',
    true,
    'Information Technology',
    'Build and maintain cloud portal applications, digital archive features, and database microservices for community operations.',
    ARRAY['BS in Computer Science or equivalent', 'Proficiency in React, TypeScript, and Node.js', 'Experience with relational or NoSQL databases'],
    ARRAY['React', 'TypeScript', 'Node.js', 'TailwindCSS', 'SQL'],
    'PKR 90,000 - 140,000 / month',
    'active'
),
(
    'Youth Leadership Fellowship 2026',
    'International Sadat Organization Central Directorate',
    'Fellowship',
    'Islamabad',
    false,
    'Leadership & Youth Development',
    'A 6-month fully funded leadership fellowship designed for promising youth leaders to gain mentorship, management training, and social work experience.',
    ARRAY['Age between 18-28', 'Demonstrated community involvement', 'Strong communication skills'],
    ARRAY['Leadership', 'Public Speaking', 'Project Management', 'Team Coordination'],
    'Fully Funded + PKR 35,000 monthly stipend',
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
    ARRAY['Enrolled in recognized HEC university', 'Minimum 3.0 GPA / 70% marks', 'Sadat community lineage verification'],
    ARRAY['Academic Merit', 'Dedication'],
    'Full Tuition Coverage + Semester Allowance',
    'active'
),
(
    'Digital Archives & Content Intern',
    'ISO Heritage & Shajra Research Wing',
    'Internship',
    'Lahore / Remote',
    true,
    'Archival & Research',
    'Assist in digitization of historical lineage records, manuscript preservation, and media cataloguing.',
    ARRAY['Good writing skills', 'Attention to detail', 'Familiarity with digital scanners and Google Drive'],
    ARRAY['Data Entry', 'Archiving', 'Research', 'Content Creation'],
    'PKR 25,000 / month',
    'active'
)
ON CONFLICT DO NOTHING;
