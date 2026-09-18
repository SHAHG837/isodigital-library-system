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
