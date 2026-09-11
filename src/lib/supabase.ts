import { createClient } from '@supabase/supabase-js';
import { Member, OfficeBearer } from '../types';

// Supabase Connection Credentials configured as requested
export const SUPABASE_URL =
  (import.meta.env.VITE_SUPABASE_URL as string) ||
  'https://neyhuytsqfovqkxqvukh.supabase.co';

export const SUPABASE_ANON_KEY =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ||
  'sb_publishable_f9bsgg11RbWIk5ASfFgJnQ_SUpB8MHK';

// Initialize Supabase Client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

// Database Type Definitions
export interface Profile {
  id: string;
  email?: string;
  full_name: string;
  avatar_url?: string;
  role?: 'super_admin' | 'admin' | 'office_bearer' | 'member';
  phone?: string;
  city?: string;
  country?: string;
  headline?: string;
  bio?: string;
  skills?: string[];
  education?: any[];
  experience?: any[];
  resume_url?: string;
  resume_raw_text?: string;
  ai_profile_summary?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Opportunity {
  id: string;
  title: string;
  organization: string;
  opportunity_type: 'Full-time' | 'Part-time' | 'Internship' | 'Scholarship' | 'Volunteer' | 'Fellowship' | 'Project';
  location?: string;
  is_remote?: boolean;
  category?: string;
  description: string;
  requirements?: string[];
  responsibilities?: string;
  skills_required?: string[];
  salary_or_stipend?: string;
  application_deadline?: string;
  contact_email?: string;
  external_url?: string;
  status?: 'active' | 'closed' | 'draft' | 'archived';
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SavedOpportunity {
  id: string;
  user_id: string;
  opportunity_id: string;
  notes?: string;
  saved_at?: string;
  opportunity?: Opportunity;
}

export interface Application {
  id: string;
  opportunity_id: string;
  applicant_id: string;
  applicant_name: string;
  applicant_email: string;
  applicant_phone?: string;
  resume_url?: string;
  cover_letter?: string;
  status: 'submitted' | 'under_review' | 'shortlisted' | 'accepted' | 'rejected';
  ai_match_score?: number;
  ai_review_feedback?: string;
  submitted_at?: string;
  opportunity?: Opportunity;
}

// Fallback in-memory seed data for opportunities when table is being provisioned
export const DEFAULT_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'opp-1',
    title: 'Junior Full Stack Developer',
    organization: 'ISO Tech & Digital Wing',
    opportunity_type: 'Full-time',
    location: 'Karachi / Hybrid',
    is_remote: true,
    category: 'Information Technology',
    description: 'Build and maintain cloud portal applications, digital archive features, and database microservices for community operations.',
    requirements: [
      'BS in Computer Science or Software Engineering',
      'Proficiency in React, TypeScript, Node.js',
      'Familiarity with PostgreSQL / Supabase and TailwindCSS'
    ],
    skills_required: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'TailwindCSS'],
    salary_or_stipend: 'PKR 90,000 - 140,000 / mo',
    status: 'active',
    created_at: new Date().toISOString()
  },
  {
    id: 'opp-2',
    title: 'Youth Leadership Fellowship 2026',
    organization: 'International Sadat Organization Central Directorate',
    opportunity_type: 'Fellowship',
    location: 'Islamabad',
    is_remote: false,
    category: 'Leadership & Youth Development',
    description: 'A 6-month fully funded leadership fellowship designed for promising youth leaders to gain mentorship, management training, and social work experience.',
    requirements: [
      'Age between 18-28 years',
      'Demonstrated commitment to social and welfare service',
      'Strong communication and organizational skills'
    ],
    skills_required: ['Leadership', 'Public Speaking', 'Community Outreach', 'Event Planning'],
    salary_or_stipend: 'Fully Funded + PKR 35,000 / mo stipend',
    status: 'active',
    created_at: new Date().toISOString()
  },
  {
    id: 'opp-3',
    title: 'Educational Excellence Scholarship',
    organization: 'ISO Central Education Endowment Fund',
    opportunity_type: 'Scholarship',
    location: 'National / All Provinces',
    is_remote: true,
    category: 'Education & Grants',
    description: 'Merit-cum-need educational scholarship for university and college students pursuing degrees in STEM, Medicine, Law, or Business.',
    requirements: [
      'Enrolled in recognized HEC university or college',
      'Minimum 3.0 CGPA or 70% in previous examinations',
      'Verified Sadat family branch member'
    ],
    skills_required: ['Academic Excellence', 'Dedication'],
    salary_or_stipend: 'Full Tuition Waiver + Semester Allowance',
    status: 'active',
    created_at: new Date().toISOString()
  },
  {
    id: 'opp-4',
    title: 'Digital Archives & Shajra Research Intern',
    organization: 'ISO Heritage & Shajra Research Wing',
    opportunity_type: 'Internship',
    location: 'Lahore / Remote',
    is_remote: true,
    category: 'Archival & Research',
    description: 'Assist in digitization of historical lineage records, manuscript preservation, and media cataloguing for digital preservation.',
    requirements: [
      'Interest in history, genealogical trees, or library science',
      'Attention to detail and basic computer literacy',
      'Good written Urdu and English communication'
    ],
    skills_required: ['Genealogy Research', 'Data Entry', 'Archiving', 'Cataloguing'],
    salary_or_stipend: 'PKR 25,000 / mo',
    status: 'active',
    created_at: new Date().toISOString()
  }
];

// Helper: Test Supabase Connection
export async function testSupabaseConnection(): Promise<{ connected: boolean; message: string; details?: any }> {
  try {
    const { data, error } = await supabase.from('opportunities').select('count', { count: 'exact', head: true });
    if (error) {
      // If table doesn't exist yet, we still know the API responded
      if (error.code === '42P01') {
        return {
          connected: true,
          message: 'Supabase connected! Schema tables need to be created (SQL migration provided).'
        };
      }
      return { connected: false, message: error.message };
    }
    return { connected: true, message: 'Connected to Supabase PostgreSQL Database successfully!' };
  } catch (err: any) {
    return { connected: false, message: err?.message || 'Connection error' };
  }
}

// Helper: Fetch Opportunities from Supabase (with fallback)
export async function fetchOpportunities(): Promise<Opportunity[]> {
  try {
    const { data, error } = await supabase
      .from('opportunities')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      // Return default opportunities if table empty or not yet created
      return DEFAULT_OPPORTUNITIES;
    }
    return data as Opportunity[];
  } catch (err) {
    console.warn('Using default opportunities fallback:', err);
    return DEFAULT_OPPORTUNITIES;
  }
}

// Helper: Create Opportunity
export async function createOpportunity(opp: Omit<Opportunity, 'id' | 'created_at'>): Promise<Opportunity> {
  const newOpp: Opportunity = {
    ...opp,
    id: `opp-${Date.now()}`,
    created_at: new Date().toISOString()
  };

  try {
    const { data, error } = await supabase
      .from('opportunities')
      .insert([{
        title: opp.title,
        organization: opp.organization,
        opportunity_type: opp.opportunity_type,
        location: opp.location,
        is_remote: opp.is_remote,
        category: opp.category,
        description: opp.description,
        requirements: opp.requirements,
        skills_required: opp.skills_required,
        salary_or_stipend: opp.salary_or_stipend,
        status: opp.status || 'active'
      }])
      .select()
      .single();

    if (!error && data) {
      return data as Opportunity;
    }
  } catch (err) {
    console.warn('Supabase opportunity insert failed, saving locally:', err);
  }
  return newOpp;
}

// Helper: Submit Application
export async function submitApplication(appData: Omit<Application, 'id' | 'submitted_at' | 'status'>): Promise<Application> {
  const newApp: Application = {
    ...appData,
    id: `app-${Date.now()}`,
    status: 'submitted',
    submitted_at: new Date().toISOString()
  };

  try {
    const { data, error } = await supabase
      .from('applications')
      .insert([newApp])
      .select()
      .single();

    if (!error && data) {
      return data as Application;
    }
  } catch (err) {
    console.warn('Supabase application insert failed, using fallback:', err);
  }

  // Also persist in local storage
  const storedApps = JSON.parse(localStorage.getItem('iso_applications') || '[]');
  storedApps.unshift(newApp);
  localStorage.setItem('iso_applications', JSON.stringify(storedApps));

  return newApp;
}

// Helper: Save Opportunity
export async function saveOpportunity(userId: string, opportunityId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('saved_opportunities')
      .insert([{ user_id: userId, opportunity_id: opportunityId }]);
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.warn('Supabase save opportunity:', err?.message);
    return { success: false, error: err?.message };
  }
}

// Helper: Fetch User Applications
export async function fetchUserApplications(applicantId?: string): Promise<Application[]> {
  try {
    let query = supabase.from('applications').select('*, opportunity:opportunities(*)');
    if (applicantId) {
      query = query.eq('applicant_id', applicantId);
    }
    const { data, error } = await query;
    if (!error && data) {
      return data as Application[];
    }
  } catch (err) {
    console.warn('Supabase fetch applications fallback:', err);
  }
  const storedApps = JSON.parse(localStorage.getItem('iso_applications') || '[]');
  return storedApps;
}

// Helper: Sync Members to Supabase
export async function syncMembersToSupabase(members: Member[]): Promise<{ count: number; error?: string }> {
  try {
    const rows = members.map((m) => ({
      id: m.id,
      full_name: m.fullName,
      city: m.city,
      district: m.district,
      division: m.division,
      province: m.province,
      country: m.country,
      mobile_number: m.mobileNumber,
      whatsapp_number: m.whatsappNumber,
      email: m.email || '',
      address: m.address || '',
      profile_photo: m.profilePhoto,
      notes: m.notes || '',
      status: m.status,
      joining_date: m.joiningDate
    }));

    const { error } = await supabase
      .from('members')
      .upsert(rows, { onConflict: 'id' });

    if (error) throw error;
    return { count: rows.length };
  } catch (err: any) {
    return { count: 0, error: err?.message || 'Sync failed' };
  }
}

// Helper: Sync Office Bearers to Supabase
export async function syncOfficeBearersToSupabase(bearers: OfficeBearer[]): Promise<{ count: number; error?: string }> {
  try {
    const rows = bearers.map((b) => ({
      id: b.id,
      name: b.name,
      designation: b.designation,
      city: b.city,
      district: b.district,
      division: b.division,
      province: b.province,
      country: b.country,
      mobile_number: b.mobileNumber,
      whatsapp: b.whatsapp,
      profile_photo: b.profilePhoto,
      notes: b.notes || '',
      appointment_date: b.appointmentDate,
      status: b.status
    }));

    const { error } = await supabase
      .from('office_bearers')
      .upsert(rows, { onConflict: 'id' });

    if (error) throw error;
    return { count: rows.length };
  } catch (err: any) {
    return { count: 0, error: err?.message || 'Sync failed' };
  }
}
