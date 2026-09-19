export interface Member {
  id: string; // Auto generated e.g. ISO-MEM-2026-001
  fullName: string;
  mobileNumber: string;
  whatsappNumber: string;
  city: string;
  district: string;
  division: string;
  province: string;
  country: string;
  email?: string;
  address?: string;
  joiningDate: string;
  profilePhoto: string;
  notes?: string;
  oathSubmitted?: boolean;
  oathDate?: string;
  status: 'Approved' | 'Pending' | 'Rejected' | 'Active' | 'Inactive';
  forefathers?: MemberForefathers;
}

export interface MemberForefathers {
  forefather1: string; // 1st Forefather: Father (والد محترم)
  forefather2: string; // 2nd Forefather: Grandfather (دادا محترم)
  forefather3: string; // 3rd Forefather: Great-Grandfather (پردادا محترم)
  forefather4: string; // 4th Forefather: 4th Ancestor (چوتھی پشت / لکڑدادا)
  forefather5: string; // 5th Forefather: 5th Ancestor (پانچویں پشت کے بزرگ)
  forefather6: string; // 6th Forefather: 6th Ancestor (چھٹی پشت کے بزرگ)
  forefather7: string; // 7th Forefather: 7th Ancestor (ساتویں پشت کے بزرگ)
}

export interface OfficeBearer {
  id: string; // e.g. ISO-OB-2026-001
  name: string;
  designation: string;
  mobileNumber: string;
  whatsapp: string;
  email?: string;
  city: string;
  district: string;
  division: string;
  province: string;
  country: string;
  profilePhoto: string;
  appointmentDate: string;
  notes?: string;
  status: 'Active' | 'Relieved' | 'Emeritus';
}

export interface Designation {
  id: string;
  title: string;
  level: 'Central' | 'Provincial' | 'Divisional' | 'District' | 'City';
  description?: string;
}

export interface AdminPermissions {
  manageMembers: boolean;
  manageOfficeBearers: boolean;
  manageHierarchy: boolean;
  importData: boolean;
  exportData: boolean;
  backupDatabase: boolean;
  restoreDatabase: boolean;
  manageAdmins: boolean;
  manageSystemSettings: boolean;
  viewAuditLogs: boolean;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  designation: string;
  isSuperAdmin: boolean;
  role: 'SuperAdmin' | 'Admin' | 'Manager' | 'Viewer';
  permissions: AdminPermissions;
  createdDate: string;
  lastActive?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  performedBy?: string;
  actorName?: string;
  actorRole?: string;
  module?: string;
  ipAddress?: string;
}

export interface ShajraNode {
  id: string;
  fullName: string;
  fatherName: string;
  lineageTitle: string; // e.g. Zaidi, Naqvi, Rizvi, Kazmi, etc.
  generation: number;
  branch: string;
  birthYear?: string;
  city: string;
  district: string;
  notes?: string;
  childrenIds: string[];
}

export interface DocumentRecord {
  id: string;
  title: string;
  category: 'Notification' | 'Resolution' | 'Constitution' | 'Meeting Minutes' | 'Official Letter' | 'Report';
  referenceNumber: string;
  issueDate: string;
  issuedBy: string;
  fileType: 'PDF' | 'DOCX' | 'Image' | 'TEXT';
  summary: string;
  tags: string[];
  downloadUrl?: string;
}

export interface EventRecord {
  id: string;
  title: string;
  location: string;
  city: string;
  date: string;
  time: string;
  organizer: string;
  category: 'Executive Meeting' | 'Convention' | 'Seminar' | 'General Body';
  attendeeCount: number;
  status: 'Upcoming' | 'Completed' | 'Cancelled';
  notes?: string;
}

export interface DonationRecord {
  id: string;
  donorName: string;
  membershipId?: string;
  amount: number;
  currency: string;
  category: 'Annual Membership Fee' | 'General Chanda' | 'Welfare Fund' | 'IT Support Fund' | 'Event Sponsorship';
  date: string;
  receiptNumber: string;
  paymentMethod: 'Cash' | 'Bank Transfer' | 'Online' | 'Cheque';
  status: 'Received' | 'Pending Verification';
  notes?: string;
}

export interface AttendanceRecord {
  id: string;
  eventId: string;
  eventTitle: string;
  date: string;
  memberId: string;
  memberName: string;
  designationOrRole: string;
  status: 'Present' | 'Absent' | 'Excused' | 'Late';
  timestamp: string;
}

export interface HierarchyNode {
  id: string;
  name: string;
  level: 'Country' | 'Province' | 'Division' | 'District' | 'CabinetUnit' | 'Position';
  parentId?: string;
  code?: string;
  headName?: string;
  contactNumber?: string;
  description?: string;
  status: 'Active' | 'Inactive';
}

export type ActiveTab =
  | 'dashboard'
  | 'members'
  | 'officeBearers'
  | 'hierarchy'
  | 'opportunities'
  | 'myApplications'
  | 'savedOpportunities'
  | 'supabaseConfig'
  | 'superAdmin'
  | 'adminRbac'
  | 'globalSearch'
  | 'exportImport'
  | 'googleSheets'
  | 'shajra'
  | 'documents'
  | 'membershipCard'
  | 'qrGenerator'
  | 'events'
  | 'donations'
  | 'attendance'
  | 'aiAssistant'
  | 'auditLogs'
  | 'backupSettings';

// ==============================================================================
// SUPABASE DATABASE SCHEMAS & INTERFACES
// ==============================================================================

export type UserRole = 'applicant' | 'member' | 'recruiter' | 'admin';

export interface Profile {
  id: string; // auth.users.id
  email: string;
  full_name: string;
  avatar_url?: string | null;
  role: UserRole;
  phone?: string | null;
  headline?: string | null;
  bio?: string | null;
  city?: string | null;
  country?: string | null;
  skills: string[];
  experience_level: 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
  education?: Array<{
    institution: string;
    degree: string;
    field: string;
    year?: string;
  }> | null;
  resume_url?: string | null;
  resume_filename?: string | null;
  target_roles?: string[];
  preferred_location_type?: 'remote' | 'hybrid' | 'onsite' | 'any';
  created_at?: string;
  updated_at?: string;
}

export type OpportunityType =
  | 'Full-time'
  | 'Part-time'
  | 'Contract'
  | 'Internship'
  | 'Scholarship'
  | 'Fellowship'
  | 'Mentorship';

export type OpportunityCategory =
  | 'Engineering'
  | 'Data & AI'
  | 'Design'
  | 'Product'
  | 'Marketing'
  | 'Operations'
  | 'Education'
  | 'Social Welfare'
  | 'Healthcare';

export type WorkplaceType = 'Remote' | 'Hybrid' | 'On-site';

export interface Opportunity {
  id: string;
  title: string;
  organization: string;
  type: OpportunityType;
  category: OpportunityCategory;
  location: string;
  workplace_type: WorkplaceType;
  description: string;
  responsibilities: string[];
  requirements: string[];
  skills_required: string[];
  salary_min?: number | null;
  salary_max?: number | null;
  currency: string;
  deadline?: string | null;
  status: 'active' | 'draft' | 'closed' | 'expired';
  posted_by?: string | null;
  contact_email?: string | null;
  apply_url?: string | null;
  application_count: number;
  is_featured: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SavedOpportunity {
  id: string;
  user_id: string;
  opportunity_id: string;
  notes?: string | null;
  saved_at: string;
  opportunity?: Opportunity;
}

export type ApplicationStatus =
  | 'submitted'
  | 'under_review'
  | 'interviewing'
  | 'accepted'
  | 'rejected'
  | 'withdrawn';

export interface Application {
  id: string;
  opportunity_id: string;
  applicant_id: string;
  status: ApplicationStatus;
  resume_url?: string | null;
  cover_letter?: string | null;
  portfolio_url?: string | null;
  answers?: Record<string, any>;
  feedback?: string | null;
  match_score?: number | null;
  applied_at: string;
  updated_at?: string;
  opportunity?: Opportunity;
  applicant?: Profile;
}

export interface ResumeReviewResult {
  matchScore: number;
  summary: string;
  strengths: string[];
  missingKeywords: string[];
  actionItems: string[];
  experienceAssessment: string;
  fitLevel: 'High' | 'Moderate' | 'Low';
}

export interface JobRecommendation {
  opportunityId: string;
  matchScore: number;
  reasons: string[];
  skillAlignment: string[];
}

export interface AdminCredential {
  mobileNumber: string; // ID (e.g. 03323475431)
  password: string; // Password (default: admin123)
  name: string;
  designation: string;
  role: 'SuperAdmin' | 'Admin' | 'Manager' | 'Viewer';
  isSuperAdmin: boolean;
  createdDate: string;
  profilePhoto?: string;
  email?: string;
  memberId?: string;
}

export interface RegistrationNotification {
  id: string;
  type: 'Member' | 'OfficeBearer';
  name: string;
  cityName: string;
  mobileNumber: string;
  whatsappNumber: string;
  designation?: string;
  registeredAt: string;
  isRead: boolean;
  recordId: string;
}
