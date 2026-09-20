import { Member, OfficeBearer, Designation, AdminUser, AuditLog, ShajraNode, DocumentRecord, EventRecord, DonationRecord, AttendanceRecord } from '../types';

import logoImg from '../assets/images/iso_official_logo_1784710240088.jpg';
import superAdminImg from '../assets/images/super_admin_portrait_1784710259971.jpg';

export const ISO_LOGO_URL = logoImg;
export const SUPER_ADMIN_PHOTO_URL = superAdminImg;

export const SUPER_ADMIN_INFO = {
  name: 'Syed Muhammad Aamir Naqvi Al Bukhari',
  designation: 'Chairman IT Support Council',
  mobileNumber: '03323475431',
  email: 'syedmuhammadamir837@gmail.com',
  city: 'Karachi',
  district: 'Karachi Central',
  division: 'Karachi',
  province: 'Sindh',
  country: 'Pakistan',
  profilePhoto: SUPER_ADMIN_PHOTO_URL,
  appointmentDate: '2018-01-15'
};

export const INITIAL_SUPER_ADMIN_USER: AdminUser = {
  id: 'ADM-0001',
  name: 'Syed Muhammad Aamir Naqvi Al Bukhari',
  email: 'syedmuhammadamir837@gmail.com',
  phone: '03323475431',
  designation: 'Chairman IT Support Council',
  isSuperAdmin: true,
  role: 'SuperAdmin',
  permissions: {
    manageMembers: true,
    manageOfficeBearers: true,
    manageHierarchy: true,
    importData: true,
    exportData: true,
    backupDatabase: true,
    restoreDatabase: true,
    manageAdmins: true,
    manageSystemSettings: true,
    viewAuditLogs: true
  },
  createdDate: '2018-01-15',
  lastActive: new Date().toISOString()
};

export const INITIAL_ADMINS: AdminUser[] = [
  INITIAL_SUPER_ADMIN_USER,
  {
    id: 'ADM-0004',
    name: 'Syed Muhammad Nazir Mukhtar Naqvi ',
    email: 'worldonesadat@gmail.com',
    phone: '03032880555',
    designation: 'Regional Secretary',
    role: 'Admin',
    isSuperAdmin: false,
    permissions: {
      manageMembers: true,
      manageOfficeBearers: true,
      manageHierarchy: true,
      importData: true,
      exportData: true,
      backupDatabase: false,
      restoreDatabase: false,
      manageAdmins: false,
      manageSystemSettings: false,
      viewAuditLogs: true
    },
    createdDate: '2026-09-11',
    lastActive: '2026-09-11T15:30:41.416Z'
  }
];

export const INITIAL_DESIGNATIONS: Designation[] = [
  { id: 'DESG-001', title: 'Chairman IT Support Council', level: 'Central', description: 'Supreme IT & Digital Systems Oversight' },
  { id: 'DESG-002', title: 'Central President (Sadr-e-Markaz)', level: 'Central', description: 'Executive head of international organization' },
  { id: 'DESG-003', title: 'Central Vice President', level: 'Central', description: 'Deputy central executive leader' },
  { id: 'DESG-004', title: 'Central General Secretary', level: 'Central', description: 'Administrative chief officer' },
  { id: 'DESG-005', title: 'Provincial President', level: 'Provincial', description: 'Head of provincial council' },
  { id: 'DESG-006', title: 'Divisional President', level: 'Divisional', description: 'Head of division zone' },
  { id: 'DESG-007', title: 'District President', level: 'District', description: 'District organization head' },
  { id: 'DESG-008', title: 'City Secretary', level: 'City', description: 'Municipal unit coordinator' },
  { id: 'DESG-009', title: 'Finance Secretary (Nazim-e-Maliyat)', level: 'Central', description: 'Financial & chanda manager' },
  { id: 'DESG-010', title: 'Information Secretary (Nazim-e-Ittelaat)', level: 'Central', description: 'Media & public relations' }
];

export const INITIAL_OFFICE_BEARERS: OfficeBearer[] = [
  {
    id: 'ISO-OB-2026-001',
    name: 'Syed Muhammad Aamir Naqvi Al Bukhari',
    designation: 'Chairman IT Support Council',
    mobileNumber: '03323475431',
    whatsapp: '03323475431',
    city: 'Karachi',
    district: 'Karachi Central',
    division: 'Karachi',
    province: 'Sindh',
    country: 'Pakistan',
    profilePhoto: SUPER_ADMIN_PHOTO_URL,
    appointmentDate: '2018-01-15',
    notes: 'Creator and Chief Architect of ISO Digital Library & Global IT Infrastructure.',
    status: 'Active'
  },
  {
    id: 'ISO-OB-2026-002',
    name: 'Syed Safdar Nawaz Trimzi',
    designation: 'Central President (Sadr-e-Markaz)',
    mobileNumber: '+923008658360',
    whatsapp: '+923008658360',
    city: 'Faisalabad',
    district: 'Faisalabad',
    division: 'Faisalabad',
    province: 'PUNJAB',
    country: 'Pakistan',
    profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    appointmentDate: '2026-01-01',
    notes: 'Presiding central body conventions and international delegations.',
    status: 'Active'
  },
  {
    id: 'ISO-OB-2026-003',
    name: 'Syed Sajjad Hussain Bukhari',
    designation: 'Chairman Media Support Council@General Sectrey',
    mobileNumber: '+923298562895',
    whatsapp: '+923298562895',
    city: 'Rasoolpur Syedian Shreef',
    district: 'Gujrat',
    division: 'Gujrat',
    province: 'Punjab',
    country: 'Pakistan',
    profilePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    appointmentDate: '2026-01-01',
    notes: 'Managing secretariat operations and record distribution.',
    status: 'Active'
  },
  {
    id: 'ISO-OB-2026-004',
    name: 'Syed Muhammad Nazir Mukhtar Naqvi ',
    designation: 'Chairman and Chief Oragnizer ISO',
    mobileNumber: '+923032880555',
    whatsapp: '+923032880555',
    city: 'sayahwa',
    district: 'Muzafargarh',
    division: 'D G Khan',
    province: 'Sindh',
    country: 'Pakistan',
    profilePhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80',
    appointmentDate: '2026-01-01',
    notes: 'Overseeing all districts in Sindh province.',
    status: 'Active'
  },
  {
    id: 'ISO-OB-2026-005',
    name: 'Syed Kazim Hussain Shah',
    designation: 'Provincial President',
    mobileNumber: '03335557788',
    whatsapp: '03335557788',
    city: 'Peshawar',
    district: 'Peshawar',
    division: 'Peshawar',
    province: 'Khyber Pakhtunkhwa',
    country: 'Pakistan',
    profilePhoto: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80',
    appointmentDate: '2023-09-01',
    notes: 'Managing KPK provincial cabinet and northern outreach.',
    status: 'Active'
  },
  {
    id: 'ISO-OB-2026-006',
    name: 'Syed Mehdi Naqvi',
    designation: 'Divisional President',
    mobileNumber: '03456677889',
    whatsapp: '03456677889',
    city: 'Quetta',
    district: 'Quetta',
    division: 'Quetta',
    province: 'Balochistan',
    country: 'Pakistan',
    profilePhoto: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80',
    appointmentDate: '2024-02-14',
    notes: 'Head of Quetta division council.',
    status: 'Active'
  },
  {
    id: 'ISO-OB-2026-007',
    name: 'Syed Abbas Haider Kazmi',
    designation: 'Divisional President',
    mobileNumber: '03124455667',
    whatsapp: '03124455667',
    city: 'Gilgit',
    district: 'Gilgit',
    division: 'Gilgit',
    province: 'Gilgit-Baltistan',
    country: 'Pakistan',
    profilePhoto: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop&q=80',
    appointmentDate: '2024-05-18',
    notes: 'Gilgit-Baltistan central chapter organizer.',
    status: 'Active'
  }
];

export const INITIAL_MEMBERS: Member[] = [
  {
    id: 'ISO-MEM-2026-001',
    fullName: 'Syed Murtaza Ali Naqvi',
    mobileNumber: '03331112233',
    whatsappNumber: '03331112233',
    city: 'Karachi',
    district: 'Karachi Central',
    division: 'Karachi',
    province: 'Sindh',
    country: 'Pakistan',
    email: 'murtaza.naqvi@gmail.com',
    address: 'Block 4, Nazimabad, Karachi',
    joiningDate: '2021-03-10',
    profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    notes: 'Senior Member and Lead Volunteer in Welfare Committee.',
    status: 'Active'
  },
  {
    id: 'ISO-MEM-2026-002',
    fullName: 'Syed Zain Ul Abidin Rizvi',
    mobileNumber: '03004445566',
    whatsappNumber: '03004445566',
    city: 'Lahore',
    district: 'Lahore',
    division: 'Lahore',
    province: 'Punjab',
    country: 'Pakistan',
    email: 'zain.rizvi@yahoo.com',
    address: 'Gulberg III, Lahore',
    joiningDate: '2021-07-22',
    profilePhoto: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80',
    notes: 'Active coordinator for Punjab youth affairs.',
    status: 'Active'
  },
  {
    id: 'ISO-MEM-2026-003',
    fullName: 'Syed Jafar Hussain Zaidi',
    mobileNumber: '03218889900',
    whatsappNumber: '03218889900',
    city: 'Rawalpindi',
    district: 'Rawalpindi',
    division: 'Rawalpindi',
    province: 'Punjab',
    country: 'Pakistan',
    email: 'jafar.zaidi@hotmail.com',
    address: 'Saddar, Rawalpindi',
    joiningDate: '2022-01-15',
    profilePhoto: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=300&auto=format&fit=crop&q=80',
    notes: 'Publication team volunteer.',
    status: 'Active'
  },
  {
    id: 'ISO-MEM-2026-004',
    fullName: 'Syeda Fatima Tuz Zahra Naqvi',
    mobileNumber: '03342223344',
    whatsappNumber: '03342223344',
    city: 'Hyderabad',
    district: 'Hyderabad',
    division: 'Hyderabad',
    province: 'Sindh',
    country: 'Pakistan',
    email: 'fatima.naqvi@iso.org.pk',
    address: 'Latifabad Unit 6, Hyderabad',
    joiningDate: '2022-08-05',
    profilePhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
    notes: 'Ladies Wing organizer in Hyderabad division.',
    status: 'Active'
  },
  {
    id: 'ISO-MEM-2026-005',
    fullName: 'Syed Muhammad Baqir Kazmi',
    mobileNumber: '03137778899',
    whatsappNumber: '03137778899',
    city: 'Multan',
    district: 'Multan',
    division: 'Multan',
    province: 'Punjab',
    country: 'Pakistan',
    email: 'baqir.kazmi@outlook.com',
    address: 'Shah Rukn-e-Alam Colony, Multan',
    joiningDate: '2023-02-18',
    profilePhoto: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop&q=80',
    notes: 'Educational support program supervisor.',
    status: 'Active'
  },
  {
    id: 'ISO-MEM-2026-006',
    fullName: 'Syed Akbar Ali Shah',
    mobileNumber: '03359990011',
    whatsappNumber: '03359990011',
    city: 'Peshawar',
    district: 'Peshawar',
    division: 'Peshawar',
    province: 'Khyber Pakhtunkhwa',
    country: 'Pakistan',
    email: 'akbar.shah@gmail.com',
    address: 'Hayatabad Phase 3, Peshawar',
    joiningDate: '2023-05-11',
    profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    notes: 'KPK blood donation network volunteer.',
    status: 'Active'
  },
  {
    id: 'ISO-MEM-2026-007',
    fullName: 'Syed Raza Hasan Bukhari',
    mobileNumber: '03461112244',
    whatsappNumber: '03461112244',
    city: 'Sukkur',
    district: 'Sukkur',
    division: 'Sukkur',
    province: 'Sindh',
    country: 'Pakistan',
    email: 'raza.bukhari@gmail.com',
    address: 'Military Road, Sukkur',
    joiningDate: '2023-11-04',
    profilePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    notes: 'Local community hall liaison.',
    status: 'Active'
  },
  {
    id: 'ISO-MEM-2026-008',
    fullName: 'Syed Hussain Asghar Gardezi',
    mobileNumber: '03013334455',
    whatsappNumber: '03013334455',
    city: 'Faisalabad',
    district: 'Faisalabad',
    division: 'Faisalabad',
    province: 'Punjab',
    country: 'Pakistan',
    email: 'hussain.gardezi@gmail.com',
    address: 'People’s Colony, Faisalabad',
    joiningDate: '2024-01-20',
    profilePhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80',
    notes: 'Faisalabad district coordinator.',
    status: 'Active'
  },
  {
    id: 'ISO-MEM-2026-009',
    fullName: 'Syed Kumail Abbas Taqvi',
    mobileNumber: '03152223355',
    whatsappNumber: '03152223355',
    city: 'Skardu',
    district: 'Skardu',
    division: 'Baltistan',
    province: 'Gilgit-Baltistan',
    country: 'Pakistan',
    email: 'kumail.taqvi@gmail.com',
    address: 'Hussainabad, Skardu',
    joiningDate: '2024-04-12',
    profilePhoto: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80',
    notes: 'Baltistan winter relief supervisor.',
    status: 'Active'
  },
  {
    id: 'ISO-MEM-2026-010',
    fullName: 'Syed Mohammad Ali Londoni',
    mobileNumber: '+447911123456',
    whatsappNumber: '+447911123456',
    city: 'London',
    district: 'Greater London',
    division: 'UK Central',
    province: 'England',
    country: 'United Kingdom',
    email: 'm.ali@iso-uk.org',
    address: 'Edgware Road, London',
    joiningDate: '2024-06-01',
    profilePhoto: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80',
    notes: 'ISO Overseas UK Chapter Senior Representative.',
    status: 'Active'
  }
];

export const INITIAL_SHAJRA_NODES: ShajraNode[] = [
  {
    id: 'SHJ-001',
    fullName: 'Imam Ali ibn Abi Talib (A.S.)',
    fatherName: 'Abu Talib ibn Abd al-Muttalib',
    lineageTitle: 'Amir al-Mu\'minin',
    generation: 1,
    branch: 'Hashimi / Alawi',
    city: 'Najaf',
    district: 'Najaf',
    notes: 'Progenitor of Sadat lineage.',
    childrenIds: ['SHJ-002', 'SHJ-003']
  },
  {
    id: 'SHJ-002',
    fullName: 'Imam Hasan ibn Ali (A.S.)',
    fatherName: 'Imam Ali ibn Abi Talib (A.S.)',
    lineageTitle: 'Hasani Sadat',
    generation: 2,
    branch: 'Hasani',
    city: 'Madina',
    district: 'Madina',
    notes: 'Ancestral origin of Hasani, Tabatabai, and Gillani lineages.',
    childrenIds: []
  },
  {
    id: 'SHJ-003',
    fullName: 'Imam Hussain ibn Ali (A.S.)',
    fatherName: 'Imam Ali ibn Abi Talib (A.S.)',
    lineageTitle: 'Hussaini Sadat',
    generation: 2,
    branch: 'Hussaini',
    city: 'Karbala',
    district: 'Karbala',
    notes: 'Ancestral origin of Zaidi, Naqvi, Rizvi, Kazmi, Gardezi Sadat.',
    childrenIds: ['SHJ-004']
  },
  {
    id: 'SHJ-004',
    fullName: 'Imam Ali ibn Hussain Zain al-Abidin (A.S.)',
    fatherName: 'Imam Hussain ibn Ali (A.S.)',
    lineageTitle: 'Sajjadia Lineage',
    generation: 3,
    branch: 'Sajjadi',
    city: 'Madina',
    district: 'Madina',
    notes: 'Progenitor of Zaidi & Baqiri branches.',
    childrenIds: ['SHJ-005', 'SHJ-006']
  },
  {
    id: 'SHJ-005',
    fullName: 'Zayd ibn Ali (A.S.)',
    fatherName: 'Imam Zain al-Abidin (A.S.)',
    lineageTitle: 'Zaidi Sadat',
    generation: 4,
    branch: 'Zaidi',
    city: 'Kufa',
    district: 'Kufa',
    notes: 'Root ancestor of Zaidi Sadat.',
    childrenIds: []
  },
  {
    id: 'SHJ-006',
    fullName: 'Imam Muhammad al-Baqir (A.S.)',
    fatherName: 'Imam Zain al-Abidin (A.S.)',
    lineageTitle: 'Baqiri / Jafari Lineage',
    generation: 4,
    branch: 'Baqiri',
    city: 'Madina',
    district: 'Madina',
    notes: 'Parent line of Imam Jafar al-Sadiq (A.S.)',
    childrenIds: ['SHJ-007']
  },
  {
    id: 'SHJ-007',
    fullName: 'Imam Ali al-Hadi al-Naqvi (A.S.)',
    fatherName: 'Imam Muhammad al-Taqi al-Jawad (A.S.)',
    lineageTitle: 'Naqvi Sadat',
    generation: 10,
    branch: 'Naqvi',
    city: 'Samarra',
    district: 'Samarra',
    notes: 'Direct root ancestor of Naqvi Al Bukhari Sadat lineage of Syed Muhammad Aamir Naqvi Al Bukhari.',
    childrenIds: []
  }
];

export const INITIAL_DOCUMENTS: DocumentRecord[] = [
  {
    id: 'DOC-2026-001',
    title: 'ISO Constitution & Organizational Framework Manual 2026',
    category: 'Constitution',
    referenceNumber: 'ISO/CENTRAL/2026/CONST-01',
    issueDate: '2026-01-01',
    issuedBy: 'Syed Muhammad Aamir Naqvi Al Bukhari (Chairman IT Support Council)',
    fileType: 'PDF',
    summary: 'Official governance bylaws, structure, and digital library operating rules of International Sadat Organization.',
    tags: ['Bylaws', 'Constitution', 'Rules', 'Central'],
    downloadUrl: '#'
  },
  {
    id: 'DOC-2026-002',
    title: 'Resolution on National Member Verification & QR Membership Cards',
    category: 'Resolution',
    referenceNumber: 'ISO/IT/2026/RES-04',
    issueDate: '2026-02-15',
    issuedBy: 'IT Support Council',
    fileType: 'PDF',
    summary: 'Resolution approving standardized digital QR membership cards and automated database syncing.',
    tags: ['QR Card', 'Verification', 'IT Council'],
    downloadUrl: '#'
  },
  {
    id: 'DOC-2026-003',
    title: 'Central Executive Body Annual Convention Notification',
    category: 'Notification',
    referenceNumber: 'ISO/EXEC/2026/NOTIF-12',
    issueDate: '2026-05-10',
    issuedBy: 'Central President Office',
    fileType: 'DOCX',
    summary: 'Official announcement for the upcoming annual general assembly of all provincial and divisional office bearers.',
    tags: ['Convention', 'Notification', 'Executive'],
    downloadUrl: '#'
  }
];

export const INITIAL_EVENTS: EventRecord[] = [
  {
    id: 'EVT-2026-01',
    title: 'International ISO Sadat Digital Convention & IT Summit 2026',
    location: 'Marriott Hotel Grand Ballroom',
    city: 'Islamabad',
    date: '2026-08-15',
    time: '10:00 AM',
    organizer: 'IT Support Council (Syed Muhammad Aamir Naqvi Al Bukhari)',
    category: 'Convention',
    attendeeCount: 350,
    status: 'Upcoming',
    notes: 'Launching new ISO Digital Library modules and Family Tree lineage portal.'
  },
  {
    id: 'EVT-2026-02',
    title: 'Provincial Office Bearers Executive Meeting Sindh',
    location: 'ISO Regional Office, Defense Phase 2',
    city: 'Karachi',
    date: '2026-06-20',
    time: '04:00 PM',
    organizer: 'Provincial President Sindh (Syed Hasan Zaidi)',
    category: 'Executive Meeting',
    attendeeCount: 45,
    status: 'Completed',
    notes: 'Reviewed district memberships and welfare fund distribution.'
  }
];

export const INITIAL_DONATIONS: DonationRecord[] = [
  {
    id: 'DON-2026-001',
    donorName: 'Syed Muhammad Aamir Naqvi Al Bukhari',
    membershipId: 'ISO-MEM-2026-001',
    amount: 100000,
    currency: 'PKR',
    category: 'IT Support Fund',
    date: '2026-01-10',
    receiptNumber: 'ISO-RCP-2026-001',
    paymentMethod: 'Bank Transfer',
    status: 'Received',
    notes: 'Sponsorship for ISO Digital Library Cloud Server & Development Infrastructure.'
  },
  {
    id: 'DON-2026-002',
    donorName: 'Syed Ghulam Mustafa Shah',
    membershipId: 'ISO-OB-2026-002',
    amount: 50000,
    currency: 'PKR',
    category: 'General Chanda',
    date: '2026-02-01',
    receiptNumber: 'ISO-RCP-2026-002',
    paymentMethod: 'Online',
    status: 'Received',
    notes: 'Annual executive member contribution.'
  },
  {
    id: 'DON-2026-003',
    donorName: 'Syed Ali Raza Rizvi',
    membershipId: 'ISO-OB-2026-003',
    amount: 30000,
    currency: 'PKR',
    category: 'Welfare Fund',
    date: '2026-03-15',
    receiptNumber: 'ISO-RCP-2026-003',
    paymentMethod: 'Cash',
    status: 'Received',
    notes: 'Educational scholarship fund contribution.'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'LOG-1001',
    timestamp: '2026-07-22T08:30:00Z',
    actorName: 'Syed Muhammad Aamir Naqvi Al Bukhari',
    actorRole: 'Super Administrator',
    action: 'System Initialization',
    module: 'System Security',
    details: 'ISO Digital Library Master System booted and synchronized.',
    ipAddress: '127.0.0.1'
  },
  {
    id: 'LOG-1002',
    timestamp: '2026-07-22T09:12:00Z',
    actorName: 'Syed Muhammad Aamir Naqvi Al Bukhari',
    actorRole: 'Super Administrator',
    action: 'Database Backup Created',
    module: 'Backup & Restore',
    details: 'Created full snapshot of 10 Member records and 7 Office Bearer profiles.',
    ipAddress: '192.168.1.100'
  },
  {
    id: 'LOG-1003',
    timestamp: '2026-07-22T09:45:00Z',
    actorName: 'Syed Ali Raza Rizvi',
    actorRole: 'Admin',
    action: 'Member Verified',
    module: 'Members Management',
    details: 'Verified QR Membership ID ISO-MEM-2026-001.',
    ipAddress: '10.0.0.45'
  }
];
