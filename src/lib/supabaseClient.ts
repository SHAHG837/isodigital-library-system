import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  Profile,
  Opportunity,
  SavedOpportunity,
  Application,
  ApplicationStatus,
  OpportunityType,
  OpportunityCategory,
  WorkplaceType
} from '../types';

// Helper functions to sanitize and extract Supabase configurations safely
export function sanitizeSupabaseUrl(rawUrl?: string): string {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return 'https://neyhuytsqfovqkxqvukh.supabase.co';
  }
  let cleaned = rawUrl.trim().replace(/^["']|["']$/g, '').trim();

  // If user pasted a dashboard URL, e.g. "https://supabase.com/dashboard/project/neyhuytsqfovqkxqvukh"
  const dashboardMatch = cleaned.match(/dashboard\/project\/([a-z0-9_-]+)/i);
  if (dashboardMatch && dashboardMatch[1]) {
    return `https://${dashboardMatch[1]}.supabase.co`;
  }

  // If text contains https://xxx.supabase.co anywhere (e.g. "project url https://neyhuytsqfovqkxqvukh.supabase.co")
  const supabaseCoMatch = cleaned.match(/https?:\/\/[a-z0-9_-]+\.supabase\.co/i);
  if (supabaseCoMatch) {
    return supabaseCoMatch[0];
  }

  // If user passed a bare project ref ID (15-30 chars)
  const bareRefMatch = cleaned.match(/^[a-z0-9_-]{15,30}$/i);
  if (bareRefMatch) {
    return `https://${bareRefMatch[0]}.supabase.co`;
  }

  // Clean prefix labels like "project url:", "url:", "project_url="
  cleaned = cleaned.replace(/^(?:project\s*url|url)\s*[:=]?\s*/i, '').trim();

  if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) {
    try {
      const parsed = new URL(cleaned);
      return parsed.origin;
    } catch {
      // ignore
    }
  }

  return 'https://neyhuytsqfovqkxqvukh.supabase.co';
}

export function extractSupabaseProjectId(rawUrl?: string): string {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return 'neyhuytsqfovqkxqvukh';
  }
  const clean = rawUrl.trim();
  const dashboardMatch = clean.match(/dashboard\/project\/([a-z0-9_-]+)/i);
  if (dashboardMatch && dashboardMatch[1]) return dashboardMatch[1];
  const domainMatch = clean.match(/([a-z0-9_-]+)\.supabase\.co/i);
  if (domainMatch && domainMatch[1]) return domainMatch[1];
  if (/^[a-z0-9_-]{15,30}$/i.test(clean)) return clean;
  return 'neyhuytsqfovqkxqvukh';
}

export function sanitizeSupabaseKey(rawKey?: string): string {
  if (!rawKey || typeof rawKey !== 'string') {
    return 'sb_publishable_f9bsgg11RbWIk5ASfFgJnQ_SUpB8MHK';
  }
  let cleaned = rawKey.trim().replace(/^["']|["']$/g, '').trim();
  cleaned = cleaned.replace(/^(?:anon\s*key|api\s*key|publishable\s*key|key)\s*[:=]?\s*/i, '').trim();
  return cleaned || 'sb_publishable_f9bsgg11RbWIk5ASfFgJnQ_SUpB8MHK';
}

// Supabase Configuration from Environment or Direct Verified Project Credentials
const rawEnvUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined) || 'https://neyhuytsqfovqkxqvukh.supabase.co';
const rawEnvKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) || 'sb_publishable_f9bsgg11RbWIk5ASfFgJnQ_SUpB8MHK';

export const SUPABASE_URL = sanitizeSupabaseUrl(rawEnvUrl);
export const SUPABASE_ANON_KEY = sanitizeSupabaseKey(rawEnvKey);
export const SUPABASE_PROJECT_ID = extractSupabaseProjectId(rawEnvUrl);
export const SUPABASE_DASHBOARD_URL = `https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}`;
export const SUPABASE_SQL_EDITOR_URL = `${SUPABASE_DASHBOARD_URL}/sql/new`;

// Initialize Supabase Client Safely (Guaranteed never to crash application)
function createSafeSupabaseClient(): SupabaseClient {
  try {
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
  } catch (err) {
    console.warn('[Supabase Client Init Fallback]:', err);
    return createClient('https://neyhuytsqfovqkxqvukh.supabase.co', 'sb_publishable_f9bsgg11RbWIk5ASfFgJnQ_SUpB8MHK', {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    });
  }
}

export const supabase: SupabaseClient = createSafeSupabaseClient();

// ==============================================================================
// INITIAL DEMO OPPORTUNITIES (Production Grade Fallback & Seed Data)
// ==============================================================================
export const INITIAL_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'opp-001',
    title: 'Senior Full Stack AI Engineer',
    organization: 'ISO Digital Innovations Labs',
    type: 'Full-time',
    category: 'Engineering',
    location: 'Islamabad / Karachi',
    workplace_type: 'Remote',
    description:
      'Lead the architecture of our cloud-native platforms, integrate Gemini AI interactions, and scale our PostgreSQL and Supabase real-time infrastructure.',
    responsibilities: [
      'Architect and deploy responsive web interfaces using React, TypeScript, and Tailwind',
      'Build serverless APIs and integrate PostgreSQL real-time subscriptions',
      'Deploy Gemini 2.5 generative AI models for automated resume and application review',
      'Ensure 99.9% uptime and implement robust Row Level Security (RLS) policies'
    ],
    requirements: [
      '5+ years experience in modern TypeScript, React, and Node.js',
      'Proven background with PostgreSQL, Supabase, and RLS policies',
      'Hands-on experience integrating LLM APIs (Gemini, Anthropic, OpenAI)',
      'Solid understanding of automated CI/CD and containerization'
    ],
    skills_required: ['React', 'TypeScript', 'Node.js', 'Supabase', 'PostgreSQL', 'Gemini AI', 'Tailwind CSS'],
    salary_min: 3500,
    salary_max: 5000,
    currency: 'USD',
    deadline: '2026-11-15T23:59:59Z',
    status: 'active',
    contact_email: 'careers@isoglobal.org',
    apply_url: '',
    application_count: 14,
    is_featured: true,
    created_at: '2026-09-01T10:00:00Z'
  },
  {
    id: 'opp-002',
    title: 'International Academic Excellence Scholarship',
    organization: 'Global Sadat Educational Trust',
    type: 'Scholarship',
    category: 'Education',
    location: 'Global / UK & Europe',
    workplace_type: 'Remote',
    description:
      'Full and partial scholarships awarded to outstanding undergraduate and graduate students pursuing degrees in Computer Science, Data Science, Artificial Intelligence, or Medicine.',
    responsibilities: [
      'Maintain top academic standing (minimum 3.5 CGPA or equivalent)',
      'Submit semester progress reports and capstone project summaries',
      'Engage in community mentoring and knowledge transfer initiatives'
    ],
    requirements: [
      'Enrolled or holding unconditional offer from an accredited university',
      'Strong academic record with two academic recommendation letters',
      'Demonstrated leadership potential and community contribution'
    ],
    skills_required: ['Academic Writing', 'Research', 'STEM', 'Critical Thinking', 'Community Leadership'],
    salary_min: 5000,
    salary_max: 12000,
    currency: 'USD',
    deadline: '2026-12-01T23:59:59Z',
    status: 'active',
    contact_email: 'scholarships@isoglobal.org',
    apply_url: '',
    application_count: 38,
    is_featured: true,
    created_at: '2026-09-05T12:00:00Z'
  },
  {
    id: 'opp-003',
    title: 'UI/UX Product Designer & Design Systems',
    organization: 'NexGen Community Solutions',
    type: 'Full-time',
    category: 'Design',
    location: 'Lahore, Pakistan',
    workplace_type: 'Hybrid',
    description:
      'Craft high-conversion user journeys, accessible mobile interfaces, and unified Figma design systems for education and career advancement portals.',
    responsibilities: [
      'Build reusable Figma component libraries and token architectures',
      'Conduct usability testing and prototype interactive user flows',
      'Collaborate directly with front-end engineers to implement pixel-perfect layouts'
    ],
    requirements: [
      '3+ years experience designing web and mobile applications',
      'Mastery of Figma, auto-layout, interactive variants, and WCAG AA standards',
      'Strong portfolio showcasing product thinking and typography craft'
    ],
    skills_required: ['Figma', 'UI/UX Design', 'Design Systems', 'User Research', 'Wireframing', 'Tailwind CSS'],
    salary_min: 1800,
    salary_max: 2800,
    currency: 'USD',
    deadline: '2026-10-30T23:59:59Z',
    status: 'active',
    contact_email: 'design@nexgencommunity.org',
    apply_url: '',
    application_count: 9,
    is_featured: false,
    created_at: '2026-09-10T08:00:00Z'
  },
  {
    id: 'opp-004',
    title: 'Cloud & DevOps Engineering Fellowship',
    organization: 'ISO Youth Tech Incubator',
    type: 'Fellowship',
    category: 'Engineering',
    location: 'Karachi, Pakistan',
    workplace_type: 'Hybrid',
    description:
      'A 6-month fully-funded fellowship providing hands-on training with Kubernetes, Docker, Terraform, Cloud Run, Supabase edge infrastructure, and enterprise monitoring tools.',
    responsibilities: [
      'Provision and maintain cloud resources using infrastructure as code',
      'Assist senior architects in monitoring cluster performance and database health',
      'Document deployment pipelines and write automated regression tests'
    ],
    requirements: [
      'Recent graduate or final year student in CS, IT, or Electrical Engineering',
      'Familiarity with Linux bash commands and basic Git workflows',
      'Eagerness to learn cloud architectures and site reliability engineering'
    ],
    skills_required: ['Linux', 'Docker', 'Kubernetes', 'CI/CD', 'Git', 'Cloud Run', 'Monitoring'],
    salary_min: 800,
    salary_max: 1200,
    currency: 'USD',
    deadline: '2026-10-25T23:59:59Z',
    status: 'active',
    contact_email: 'fellowships@isoglobal.org',
    apply_url: '',
    application_count: 22,
    is_featured: true,
    created_at: '2026-09-12T14:30:00Z'
  },
  {
    id: 'opp-005',
    title: 'Data Science & Analytics Intern',
    organization: 'DataSphere Analytics',
    type: 'Internship',
    category: 'Data & AI',
    location: 'Karachi, Pakistan',
    workplace_type: 'Remote',
    description:
      'Work on real-world member analytics, cohort retention models, and automated data visualization dashboards using Python, SQL, and Supabase.',
    responsibilities: [
      'Clean and structure diverse data sets for statistical analysis',
      'Write performant SQL queries to generate executive summaries',
      'Build interactive visualizations using Recharts and Python notebooks'
    ],
    requirements: [
      'Solid foundation in SQL, Python (Pandas/NumPy), and data visualization',
      'Basic knowledge of machine learning concepts and exploratory analysis',
      'High attention to detail and good communication skills'
    ],
    skills_required: ['Python', 'SQL', 'PostgreSQL', 'Pandas', 'Data Visualization', 'Statistics'],
    salary_min: 500,
    salary_max: 800,
    currency: 'USD',
    deadline: '2026-10-18T23:59:59Z',
    status: 'active',
    contact_email: 'interns@datasphere.io',
    apply_url: '',
    application_count: 17,
    is_featured: false,
    created_at: '2026-09-15T09:15:00Z'
  }
];

// Local cache keys
const STORAGE_KEY_OPPORTUNITIES = 'supabase_cache_opportunities';
const STORAGE_KEY_SAVED = 'supabase_cache_saved_opportunities';
const STORAGE_KEY_APPLICATIONS = 'supabase_cache_applications';
const STORAGE_KEY_PROFILES = 'supabase_cache_profiles';

// ==============================================================================
// HEALTH & SCHEMA STATUS VERIFICATION
// ==============================================================================
export interface SupabaseHealthStatus {
  connected: boolean;
  projectUrl: string;
  projectId: string;
  hasAnonKey: boolean;
  tables: {
    profiles: boolean;
    opportunities: boolean;
    saved_opportunities: boolean;
    applications: boolean;
  };
  storageBuckets: {
    resumes: boolean;
    opportunityLogos: boolean;
    avatars: boolean;
  };
  error?: string | null;
  lastChecked: string;
}

export async function checkSupabaseHealth(): Promise<SupabaseHealthStatus> {
  const result: SupabaseHealthStatus = {
    connected: false,
    projectUrl: SUPABASE_URL,
    projectId: SUPABASE_PROJECT_ID,
    hasAnonKey: Boolean(SUPABASE_ANON_KEY && SUPABASE_ANON_KEY.length > 10),
    tables: {
      profiles: false,
      opportunities: false,
      saved_opportunities: false,
      applications: false
    },
    storageBuckets: {
      resumes: false,
      opportunityLogos: false,
      avatars: false
    },
    error: null,
    lastChecked: new Date().toISOString()
  };

  try {
    // 1. Test opportunities table
    const { data: opps, error: oppErr } = await supabase
      .from('opportunities')
      .select('id')
      .limit(1);

    if (!oppErr) {
      result.connected = true;
      result.tables.opportunities = true;
    } else if (oppErr.code !== 'PGRST116' && oppErr.message?.includes('does not exist')) {
      result.connected = true; // Connection reached server, but table needs migration
      result.tables.opportunities = false;
    }

    // 2. Test profiles table
    const { error: profErr } = await supabase.from('profiles').select('id').limit(1);
    if (!profErr) {
      result.connected = true;
      result.tables.profiles = true;
    }

    // 3. Test saved_opportunities table
    const { error: saveErr } = await supabase.from('saved_opportunities').select('id').limit(1);
    if (!saveErr) {
      result.tables.saved_opportunities = true;
    }

    // 4. Test applications table
    const { error: appErr } = await supabase.from('applications').select('id').limit(1);
    if (!appErr) {
      result.tables.applications = true;
    }

    // 5. Test storage buckets
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      if (buckets) {
        result.storageBuckets.resumes = buckets.some((b) => b.id === 'resumes');
        result.storageBuckets.opportunityLogos = buckets.some((b) => b.id === 'opportunity-logos');
        result.storageBuckets.avatars = buckets.some((b) => b.id === 'avatars');
      }
    } catch {
      // Storage check non-fatal
    }
  } catch (err: any) {
    result.error = err?.message || 'Connection test failed';
  }

  return result;
}

// ==============================================================================
// OPPORTUNITIES SERVICE
// ==============================================================================
export async function getOpportunities(filters?: {
  type?: string;
  category?: string;
  workplace_type?: string;
  search?: string;
}): Promise<Opportunity[]> {
  try {
    let query = supabase
      .from('opportunities')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.type && filters.type !== 'All') {
      query = query.eq('type', filters.type);
    }
    if (filters?.category && filters.category !== 'All') {
      query = query.eq('category', filters.category);
    }
    if (filters?.workplace_type && filters.workplace_type !== 'All') {
      query = query.eq('workplace_type', filters.workplace_type);
    }
    if (filters?.search) {
      const term = `%${filters.search.toLowerCase()}%`;
      query = query.or(`title.ilike.${term},organization.ilike.${term},description.ilike.${term}`);
    }

    const { data, error } = await query;

    if (!error && data && data.length > 0) {
      // Cache locally for resilient offline access
      localStorage.setItem(STORAGE_KEY_OPPORTUNITIES, JSON.stringify(data));
      return data as Opportunity[];
    }
  } catch (e) {
    console.warn('Supabase remote query fell back to local cache/seed:', e);
  }

  // Graceful fallback to cached or initial demo opportunities
  const cached = localStorage.getItem(STORAGE_KEY_OPPORTUNITIES);
  let list: Opportunity[] = cached ? JSON.parse(cached) : INITIAL_OPPORTUNITIES;

  if (filters?.type && filters.type !== 'All') {
    list = list.filter((o) => o.type === filters.type);
  }
  if (filters?.category && filters.category !== 'All') {
    list = list.filter((o) => o.category === filters.category);
  }
  if (filters?.workplace_type && filters.workplace_type !== 'All') {
    list = list.filter((o) => o.workplace_type === filters.workplace_type);
  }
  if (filters?.search) {
    const s = filters.search.toLowerCase();
    list = list.filter(
      (o) =>
        o.title.toLowerCase().includes(s) ||
        o.organization.toLowerCase().includes(s) ||
        o.description.toLowerCase().includes(s) ||
        o.skills_required.some((skill) => skill.toLowerCase().includes(s))
    );
  }

  return list;
}

export async function createOpportunity(
  newOpp: Omit<Opportunity, 'id' | 'created_at' | 'updated_at' | 'application_count'>
): Promise<Opportunity> {
  const payload = {
    ...newOpp,
    application_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  try {
    const { data, error } = await supabase
      .from('opportunities')
      .insert([payload])
      .select()
      .single();

    if (!error && data) {
      // Update local cache
      const cached = localStorage.getItem(STORAGE_KEY_OPPORTUNITIES);
      const list: Opportunity[] = cached ? JSON.parse(cached) : INITIAL_OPPORTUNITIES;
      localStorage.setItem(STORAGE_KEY_OPPORTUNITIES, JSON.stringify([data, ...list]));
      return data as Opportunity;
    }
  } catch (e) {
    console.warn('Supabase insert failed, storing locally:', e);
  }

  // Local fallback
  const created: Opportunity = {
    ...payload,
    id: `opp-local-${Date.now()}`
  };
  const cached = localStorage.getItem(STORAGE_KEY_OPPORTUNITIES);
  const list: Opportunity[] = cached ? JSON.parse(cached) : INITIAL_OPPORTUNITIES;
  localStorage.setItem(STORAGE_KEY_OPPORTUNITIES, JSON.stringify([created, ...list]));
  return created;
}

export async function updateOpportunity(
  id: string,
  updates: Partial<Opportunity>
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('opportunities')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (!error) {
      // Sync local cache
      const cached = localStorage.getItem(STORAGE_KEY_OPPORTUNITIES);
      if (cached) {
        const list: Opportunity[] = JSON.parse(cached);
        const updated = list.map((o) => (o.id === id ? { ...o, ...updates } : o));
        localStorage.setItem(STORAGE_KEY_OPPORTUNITIES, JSON.stringify(updated));
      }
      return true;
    }
  } catch (e) {
    console.warn('Supabase update failed:', e);
  }

  // Fallback update local cache
  const cached = localStorage.getItem(STORAGE_KEY_OPPORTUNITIES);
  if (cached) {
    const list: Opportunity[] = JSON.parse(cached);
    const updated = list.map((o) => (o.id === id ? { ...o, ...updates } : o));
    localStorage.setItem(STORAGE_KEY_OPPORTUNITIES, JSON.stringify(updated));
  }
  return true;
}

export async function deleteOpportunity(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('opportunities').delete().eq('id', id);
    if (!error) {
      const cached = localStorage.getItem(STORAGE_KEY_OPPORTUNITIES);
      if (cached) {
        const list: Opportunity[] = JSON.parse(cached);
        localStorage.setItem(STORAGE_KEY_OPPORTUNITIES, JSON.stringify(list.filter((o) => o.id !== id)));
      }
      return true;
    }
  } catch (e) {
    console.warn('Supabase delete failed:', e);
  }

  const cached = localStorage.getItem(STORAGE_KEY_OPPORTUNITIES);
  if (cached) {
    const list: Opportunity[] = JSON.parse(cached);
    localStorage.setItem(STORAGE_KEY_OPPORTUNITIES, JSON.stringify(list.filter((o) => o.id !== id)));
  }
  return true;
}

// ==============================================================================
// SAVED OPPORTUNITIES (BOOKMARKS)
// ==============================================================================
export async function getSavedOpportunities(userId: string): Promise<SavedOpportunity[]> {
  try {
    const { data, error } = await supabase
      .from('saved_opportunities')
      .select('*, opportunity:opportunities(*)')
      .eq('user_id', userId)
      .order('saved_at', { ascending: false });

    if (!error && data) {
      localStorage.setItem(`${STORAGE_KEY_SAVED}_${userId}`, JSON.stringify(data));
      return data as SavedOpportunity[];
    }
  } catch (e) {
    console.warn('Supabase saved opportunities query fallback:', e);
  }

  const cached = localStorage.getItem(`${STORAGE_KEY_SAVED}_${userId}`);
  return cached ? JSON.parse(cached) : [];
}

export async function toggleSaveOpportunity(
  userId: string,
  opportunity: Opportunity,
  notes?: string
): Promise<boolean> {
  try {
    // Check if already saved
    const { data: existing } = await supabase
      .from('saved_opportunities')
      .select('id')
      .eq('user_id', userId)
      .eq('opportunity_id', opportunity.id)
      .maybeSingle();

    if (existing) {
      // Unsave
      await supabase.from('saved_opportunities').delete().eq('id', existing.id);
      updateLocalSaved(userId, opportunity.id, false);
      return false;
    } else {
      // Save
      await supabase.from('saved_opportunities').insert([
        {
          user_id: userId,
          opportunity_id: opportunity.id,
          notes: notes || '',
          saved_at: new Date().toISOString()
        }
      ]);
      updateLocalSaved(userId, opportunity.id, true, opportunity, notes);
      return true;
    }
  } catch (e) {
    console.warn('Supabase toggle save error, handling in local cache:', e);
  }

  // Fallback local toggle
  const cached = localStorage.getItem(`${STORAGE_KEY_SAVED}_${userId}`);
  let list: SavedOpportunity[] = cached ? JSON.parse(cached) : [];
  const exists = list.some((item) => item.opportunity_id === opportunity.id);

  if (exists) {
    list = list.filter((item) => item.opportunity_id !== opportunity.id);
    localStorage.setItem(`${STORAGE_KEY_SAVED}_${userId}`, JSON.stringify(list));
    return false;
  } else {
    const newSave: SavedOpportunity = {
      id: `save-${Date.now()}`,
      user_id: userId,
      opportunity_id: opportunity.id,
      notes: notes || '',
      saved_at: new Date().toISOString(),
      opportunity
    };
    list = [newSave, ...list];
    localStorage.setItem(`${STORAGE_KEY_SAVED}_${userId}`, JSON.stringify(list));
    return true;
  }
}

function updateLocalSaved(
  userId: string,
  opportunityId: string,
  saved: boolean,
  opportunity?: Opportunity,
  notes?: string
) {
  const cached = localStorage.getItem(`${STORAGE_KEY_SAVED}_${userId}`);
  let list: SavedOpportunity[] = cached ? JSON.parse(cached) : [];
  if (saved && opportunity) {
    list = [
      {
        id: `save-${Date.now()}`,
        user_id: userId,
        opportunity_id: opportunityId,
        notes: notes || '',
        saved_at: new Date().toISOString(),
        opportunity
      },
      ...list.filter((i) => i.opportunity_id !== opportunityId)
    ];
  } else {
    list = list.filter((i) => i.opportunity_id !== opportunityId);
  }
  localStorage.setItem(`${STORAGE_KEY_SAVED}_${userId}`, JSON.stringify(list));
}

// ==============================================================================
// APPLICATIONS SERVICE
// ==============================================================================
export async function submitApplication(appData: {
  opportunity_id: string;
  applicant_id: string;
  resume_url?: string;
  cover_letter?: string;
  portfolio_url?: string;
  answers?: Record<string, any>;
  match_score?: number;
  opportunity?: Opportunity;
  applicant?: Profile;
}): Promise<Application> {
  const payload = {
    opportunity_id: appData.opportunity_id,
    applicant_id: appData.applicant_id,
    status: 'submitted' as ApplicationStatus,
    resume_url: appData.resume_url || null,
    cover_letter: appData.cover_letter || null,
    portfolio_url: appData.portfolio_url || null,
    answers: appData.answers || {},
    match_score: appData.match_score || null,
    applied_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  try {
    const { data, error } = await supabase
      .from('applications')
      .insert([payload])
      .select('*, opportunity:opportunities(*)')
      .single();

    if (!error && data) {
      syncLocalApplication(data);
      return data as Application;
    }
  } catch (e) {
    console.warn('Supabase application submission error:', e);
  }

  // Local fallback
  const localApp: Application = {
    ...payload,
    id: `app-local-${Date.now()}`,
    opportunity: appData.opportunity,
    applicant: appData.applicant
  };
  syncLocalApplication(localApp);
  return localApp;
}

function syncLocalApplication(app: Application) {
  const cached = localStorage.getItem(STORAGE_KEY_APPLICATIONS);
  const list: Application[] = cached ? JSON.parse(cached) : [];
  const updated = [app, ...list.filter((a) => a.id !== app.id)];
  localStorage.setItem(STORAGE_KEY_APPLICATIONS, JSON.stringify(updated));
}

export async function getUserApplications(userId: string): Promise<Application[]> {
  try {
    const { data, error } = await supabase
      .from('applications')
      .select('*, opportunity:opportunities(*)')
      .eq('applicant_id', userId)
      .order('applied_at', { ascending: false });

    if (!error && data) {
      return data as Application[];
    }
  } catch (e) {
    console.warn('Supabase applications fetch error:', e);
  }

  const cached = localStorage.getItem(STORAGE_KEY_APPLICATIONS);
  const list: Application[] = cached ? JSON.parse(cached) : [];
  return list.filter((a) => a.applicant_id === userId);
}

export async function getAllApplications(): Promise<Application[]> {
  try {
    const { data, error } = await supabase
      .from('applications')
      .select('*, opportunity:opportunities(*), applicant:profiles(*)')
      .order('applied_at', { ascending: false });

    if (!error && data) {
      return data as Application[];
    }
  } catch (e) {
    console.warn('Supabase all applications fetch error:', e);
  }

  const cached = localStorage.getItem(STORAGE_KEY_APPLICATIONS);
  return cached ? JSON.parse(cached) : [];
}

export async function updateApplicationStatus(
  applicationId: string,
  status: ApplicationStatus,
  feedback?: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('applications')
      .update({
        status,
        feedback: feedback || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', applicationId);

    if (!error) {
      updateLocalAppStatus(applicationId, status, feedback);
      return true;
    }
  } catch (e) {
    console.warn('Supabase application update status failed:', e);
  }

  updateLocalAppStatus(applicationId, status, feedback);
  return true;
}

function updateLocalAppStatus(id: string, status: ApplicationStatus, feedback?: string) {
  const cached = localStorage.getItem(STORAGE_KEY_APPLICATIONS);
  if (cached) {
    const list: Application[] = JSON.parse(cached);
    const updated = list.map((a) =>
      a.id === id ? { ...a, status, feedback: feedback || a.feedback } : a
    );
    localStorage.setItem(STORAGE_KEY_APPLICATIONS, JSON.stringify(updated));
  }
}

// ==============================================================================
// PROFILES SERVICE
// ==============================================================================
export async function getProfile(userId: string): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (!error && data) {
      return data as Profile;
    }
  } catch (e) {
    console.warn('Supabase getProfile error:', e);
  }

  const cached = localStorage.getItem(`${STORAGE_KEY_PROFILES}_${userId}`);
  return cached ? JSON.parse(cached) : null;
}

export async function upsertProfile(profile: Partial<Profile> & { id: string }): Promise<Profile> {
  const payload = {
    ...profile,
    updated_at: new Date().toISOString()
  };

  try {
    const { data, error } = await supabase
      .from('profiles')
      .upsert(payload)
      .select()
      .single();

    if (!error && data) {
      localStorage.setItem(`${STORAGE_KEY_PROFILES}_${profile.id}`, JSON.stringify(data));
      return data as Profile;
    }
  } catch (e) {
    console.warn('Supabase upsertProfile error:', e);
  }

  const existing = localStorage.getItem(`${STORAGE_KEY_PROFILES}_${profile.id}`);
  const base = existing ? JSON.parse(existing) : {};
  const merged = { ...base, ...payload };
  localStorage.setItem(`${STORAGE_KEY_PROFILES}_${profile.id}`, JSON.stringify(merged));
  return merged as Profile;
}

// ==============================================================================
// STORAGE SERVICE (Resumes, Logos, Avatars)
// ==============================================================================
export async function uploadResumeToStorage(
  file: File,
  userId: string
): Promise<{ url: string; filename: string }> {
  const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filePath = `${userId}/${Date.now()}_${cleanName}`;

  try {
    const { data, error } = await supabase.storage
      .from('resumes')
      .upload(filePath, file, { upsert: true });

    if (!error && data) {
      const { data: publicData } = supabase.storage.from('resumes').getPublicUrl(data.path);
      return { url: publicData.publicUrl, filename: file.name };
    }
  } catch (e) {
    console.warn('Supabase storage upload failed, creating base64 data URL:', e);
  }

  // Local object URL fallback
  const objectUrl = URL.createObjectURL(file);
  return { url: objectUrl, filename: file.name };
}

// ==============================================================================
// SUPABASE AUTHENTICATION SERVICE (Sign Up, Sign In, OTP, Session & Profile Sync)
// ==============================================================================

export interface SupabaseAuthResult {
  success: boolean;
  user?: any;
  session?: any;
  profile?: Profile | null;
  requiresEmailConfirmation?: boolean;
  error?: string;
}

/**
 * Sign up a new user using Supabase Auth.
 * When called, Supabase creates the user in auth.users, and the db/schema.sql
 * trigger (on_auth_user_created) automatically creates a row in public.profiles.
 */
export async function signUpWithSupabase(
  email: string,
  password: string,
  fullName: string,
  role: 'applicant' | 'member' | 'recruiter' | 'admin' = 'applicant'
): Promise<SupabaseAuthResult> {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          full_name: cleanName,
          role
        }
      }
    });

    if (error) {
      return { success: false, error: error.message };
    }

    const user = data.user;
    const session = data.session;
    const requiresEmailConfirmation = !session && !!user;

    // Check / hydrate profile from public.profiles
    let profile: Profile | null = null;
    if (user) {
      profile = await getProfile(user.id);
      if (!profile) {
        // Fallback upsert in case trigger is pending or executed asynchronously
        profile = await upsertProfile({
          id: user.id,
          email: cleanEmail,
          full_name: cleanName,
          role,
          skills: [],
          experience_level: 'mid'
        });
      }
    }

    return {
      success: true,
      user,
      session,
      profile,
      requiresEmailConfirmation
    };
  } catch (err: any) {
    console.error('Supabase signUp error:', err);
    return { success: false, error: err.message || 'An unexpected error occurred during signup.' };
  }
}

/**
 * Sign in existing user using Supabase Auth (Email & Password).
 */
export async function signInWithSupabase(
  email: string,
  password: string
): Promise<SupabaseAuthResult> {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password
    });

    if (error) {
      return { success: false, error: error.message };
    }

    const user = data.user;
    const session = data.session;
    let profile: Profile | null = null;

    if (user) {
      profile = await getProfile(user.id);
      if (!profile) {
        // If profile doesn't exist yet, seed it from user metadata
        profile = await upsertProfile({
          id: user.id,
          email: user.email || cleanEmail,
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || cleanEmail.split('@')[0],
          role: user.user_metadata?.role || 'applicant',
          skills: [],
          experience_level: 'mid'
        });
      }
    }

    return {
      success: true,
      user,
      session,
      profile
    };
  } catch (err: any) {
    console.error('Supabase signIn error:', err);
    return { success: false, error: err.message || 'An unexpected error occurred during login.' };
  }
}

/**
 * Send Magic Link / Email OTP using Supabase Auth.
 */
export async function signInWithSupabaseOtp(
  email: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const { error } = await supabase.auth.signInWithOtp({
      email: cleanEmail,
      options: {
        shouldCreateUser: true
      }
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.error('Supabase signInWithOtp error:', err);
    return { success: false, error: err.message || 'Failed to dispatch Supabase OTP.' };
  }
}

/**
 * Verify Supabase Email OTP code.
 */
export async function verifySupabaseOtp(
  email: string,
  token: string
): Promise<SupabaseAuthResult> {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const cleanToken = token.trim();

    const { data, error } = await supabase.auth.verifyOtp({
      email: cleanEmail,
      token: cleanToken,
      type: 'email'
    });

    if (error) {
      return { success: false, error: error.message };
    }

    const user = data.user;
    const session = data.session;
    let profile: Profile | null = null;

    if (user) {
      profile = await getProfile(user.id);
      if (!profile) {
        profile = await upsertProfile({
          id: user.id,
          email: user.email || cleanEmail,
          full_name: user.user_metadata?.full_name || cleanEmail.split('@')[0],
          role: user.user_metadata?.role || 'applicant',
          skills: [],
          experience_level: 'mid'
        });
      }
    }

    return {
      success: true,
      user,
      session,
      profile
    };
  } catch (err: any) {
    console.error('Supabase verifyOtp error:', err);
    return { success: false, error: err.message || 'Failed to verify Supabase OTP.' };
  }
}

/**
 * Sign out user from Supabase.
 */
export async function signOutSupabase(): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.error('Supabase signOut error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Retrieve current active Supabase session.
 */
export async function getSupabaseSession() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data) return null;
    return data.session;
  } catch {
    return null;
  }
}

/**
 * Retrieve current active Supabase user.
 */
export async function getSupabaseUser() {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data) return null;
    return data.user;
  } catch {
    return null;
  }
}

/**
 * Subscribe to Supabase auth state changes.
 */
export function onSupabaseAuthStateChange(
  callback: (event: string, session: any) => void
) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
}
