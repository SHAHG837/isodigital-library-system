import React, { useState, useEffect } from 'react';
import {
  Member,
  OfficeBearer,
  Designation,
  AdminUser,
  AuditLog,
  ActiveTab,
  AdminCredential,
  RegistrationNotification,
  Profile
} from './types';
import {
  INITIAL_MEMBERS,
  INITIAL_OFFICE_BEARERS,
  INITIAL_DESIGNATIONS,
  INITIAL_ADMINS,
  INITIAL_AUDIT_LOGS,
  INITIAL_DOCUMENTS,
  INITIAL_EVENTS,
  INITIAL_DONATIONS,
  SUPER_ADMIN_INFO
} from './data/initialData';
import { DocumentRecord, EventRecord, DonationRecord } from './types';
import {
  loadDatabaseFromServer,
  persistDatabaseToServer,
  scheduleDatabaseSync,
  flushPendingSync,
  safeSetLocalStorage,
  safeGetLocalStorage,
  subscribeToDatabaseSync
} from './services/databaseService';

import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { MembersModule } from './components/MembersModule';
import { OfficeBearersModule } from './components/OfficeBearersModule';
import { HierarchyModule } from './components/HierarchyModule';
import { SuperAdminModule } from './components/SuperAdminModule';
import { AdminRbacModule } from './components/AdminRbacModule';
import { GlobalSearchModule } from './components/GlobalSearchModule';
import { ShajraModule } from './components/ShajraModule';
import { ShajraReferenceBooksModule } from './components/ShajraReferenceBooksModule';
import { MembershipCardModule } from './components/MembershipCardModule';
import { ExportImportModule } from './components/ExportImportModule';
import { GoogleSheetsModule } from './components/GoogleSheetsModule';
import { AiAssistantModule } from './components/AiAssistantModule';
import { AuditLogsModule } from './components/AuditLogsModule';
import { OpportunitiesModule } from './components/OpportunitiesModule';
import { ApplicationsModule } from './components/ApplicationsModule';
import { SavedOpportunitiesModule } from './components/SavedOpportunitiesModule';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';
import {
  SUPABASE_PROJECT_ID,
  getSupabaseSession,
  onSupabaseAuthStateChange,
  signOutSupabase,
  getProfile
} from './lib/supabaseClient';
import { Footer } from './components/Footer';
import { PortalModal } from './components/PortalModal';
import { AuthLoginGate } from './components/AuthLoginGate';
import { CompulsoryGoogleFormGate } from './components/CompulsoryGoogleFormGate';
import { FileText, ExternalLink } from 'lucide-react';

export function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<ActiveTab>('opportunities');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSupabaseConfigOpen, setIsSupabaseConfigOpen] = useState(false);

  // Portal & Auth Modal State
  const [isPortalOpen, setIsPortalOpen] = useState(false);
  const [portalDefaultTab, setPortalDefaultTab] = useState<'member' | 'official' | 'adminLogin'>('member');

  // Core Data States
  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem('iso_members');
    if (saved) {
      try {
        const parsed: Member[] = JSON.parse(saved);
        return parsed.map((m) => {
          if (m.notes?.includes('Registered via Email OTP') && m.status === 'Active') {
            return { ...m, status: 'Pending' as const };
          }
          return m;
        });
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_MEMBERS;
  });

  const [superAdminPhoto, setSuperAdminPhoto] = useState<string>(() => {
    return localStorage.getItem('iso_super_admin_photo') || SUPER_ADMIN_INFO.profilePhoto;
  });

  const handleUpdateSuperAdminPhoto = (newPhoto: string) => {
    setSuperAdminPhoto(newPhoto);
    localStorage.setItem('iso_super_admin_photo', newPhoto);
    logActivity('Super Admin Photo Updated', 'Updated profile photo for Syed Muhammad Aamir Naqvi Al Bukhari');
  };

  const superAdminInfo = {
    ...SUPER_ADMIN_INFO,
    profilePhoto: superAdminPhoto
  };

  const [officeBearers, setOfficeBearers] = useState<OfficeBearer[]>(() => {
    const saved = localStorage.getItem('iso_office_bearers');
    return saved ? JSON.parse(saved) : INITIAL_OFFICE_BEARERS;
  });

  const [designations, setDesignations] = useState<Designation[]>(() => {
    const saved = localStorage.getItem('iso_designations');
    return saved ? JSON.parse(saved) : INITIAL_DESIGNATIONS;
  });

  const [admins, setAdmins] = useState<AdminUser[]>(() => {
    const saved = localStorage.getItem('iso_admins');
    return saved ? JSON.parse(saved) : INITIAL_ADMINS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('iso_audit_logs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const seen = new Set<string>();
        return parsed.map((log: AuditLog, idx: number) => {
          if (!log.id || seen.has(log.id)) {
            const uniqueId = `LOG-${Date.now()}-${idx}-${Math.floor(Math.random() * 10000)}`;
            seen.add(uniqueId);
            return { ...log, id: uniqueId };
          }
          seen.add(log.id);
          return log;
        });
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_AUDIT_LOGS;
  });

  const [documents, setDocuments] = useState<DocumentRecord[]>(() => {
    const saved = localStorage.getItem('iso_documents');
    return saved ? JSON.parse(saved) : INITIAL_DOCUMENTS;
  });

  const [events, setEvents] = useState<EventRecord[]>(() => {
    const saved = localStorage.getItem('iso_events');
    return saved ? JSON.parse(saved) : INITIAL_EVENTS;
  });

  const [donations, setDonations] = useState<DonationRecord[]>(() => {
    const saved = localStorage.getItem('iso_donations');
    return saved ? JSON.parse(saved) : INITIAL_DONATIONS;
  });

  // Admin Mobile Credentials Engine (Mobile User ID + Password)
  const [adminCredentials, setAdminCredentials] = useState<AdminCredential[]>(() => {
    const saved = localStorage.getItem('iso_admin_credentials');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [
      {
        mobileNumber: '03323475431',
        password: 'admin123',
        name: 'Syed Muhammad Aamir Naqvi Al Bukhari',
        designation: 'Chairman IT Support Council',
        role: 'SuperAdmin',
        isSuperAdmin: true,
        createdDate: '2026-01-01'
      }
    ];
  });

  // Live Registration Notifications
  const [registrationNotifications, setRegistrationNotifications] = useState<RegistrationNotification[]>(() => {
    const saved = localStorage.getItem('iso_registration_notifications');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [
      {
        id: 'NOTIF-001',
        type: 'Member',
        name: 'Syed Ali Raza Naqvi',
        cityName: 'Karachi',
        mobileNumber: '03001234567',
        whatsappNumber: '03001234567',
        registeredAt: new Date().toISOString(),
        isRead: false,
        recordId: 'ISO-MEM-0001'
      },
      {
        id: 'NOTIF-002',
        type: 'OfficeBearer',
        name: 'Syed Hassan Abbas Naqvi',
        cityName: 'Lahore',
        mobileNumber: '03009876543',
        whatsappNumber: '03009876543',
        designation: 'Central IT Secretary',
        registeredAt: new Date(Date.now() - 3600000).toISOString(),
        isRead: false,
        recordId: 'ISO-OB-0001'
      }
    ];
  });

  // Current Logged In Admin - Preserves active session across page reloads
  const [currentLoggedInUser, setCurrentLoggedInUser] = useState<AdminCredential | null>(() => {
    const saved = localStorage.getItem('iso_current_logged_in_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing stored logged-in session:', e);
      }
    }
    return null;
  });

  // Permanent Server Database Synchronization State
  const [serverSyncStatus, setServerSyncStatus] = useState<{
    syncing: boolean;
    lastSavedAt: string | null;
    error: string | null;
  }>({
    syncing: false,
    lastSavedAt: null,
    error: null
  });

  const [dbLoadedFromServer, setDbLoadedFromServer] = useState(false);

  // Subscribe to real-time server database synchronization status
  useEffect(() => {
    return subscribeToDatabaseSync(setServerSyncStatus);
  }, []);

  // Listen to Supabase Auth state changes & sync session
  useEffect(() => {
    let isMounted = true;

    // Check existing Supabase session
    getSupabaseSession().then(async (session) => {
      if (!isMounted || !session?.user) return;
      
      const saved = localStorage.getItem('iso_current_logged_in_user');
      if (!saved) {
        const profile = await getProfile(session.user.id);
        const cred: AdminCredential = {
          mobileNumber: profile?.phone || '03000000000',
          password: 'supabase_auth_session',
          name: profile?.full_name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
          designation: profile?.role === 'admin' ? 'System Administrator' : 'Opportunities Candidate',
          role: profile?.role === 'admin' ? 'Admin' : 'Viewer',
          isSuperAdmin: profile?.role === 'admin',
          createdDate: new Date().toISOString().split('T')[0],
          email: session.user.email,
          memberId: session.user.id
        };
        setCurrentLoggedInUser(cred);
        localStorage.setItem('iso_current_logged_in_user', JSON.stringify(cred));
      }
    });

    const { data: authListener } = onSupabaseAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      if (event === 'SIGNED_IN' && session?.user) {
        const profile = await getProfile(session.user.id);
        const cred: AdminCredential = {
          mobileNumber: profile?.phone || '03000000000',
          password: 'supabase_auth_session',
          name: profile?.full_name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
          designation: profile?.role === 'admin' ? 'System Administrator' : 'Opportunities Candidate',
          role: profile?.role === 'admin' ? 'Admin' : 'Viewer',
          isSuperAdmin: profile?.role === 'admin',
          createdDate: new Date().toISOString().split('T')[0],
          email: session.user.email,
          memberId: session.user.id
        };
        setCurrentLoggedInUser(cred);
        localStorage.setItem('iso_current_logged_in_user', JSON.stringify(cred));
      }
    });

    return () => {
      isMounted = false;
      authListener?.subscription?.unsubscribe?.();
    };
  }, []);

  // Initial load: Fetch permanent database snapshot from server disk
  useEffect(() => {
    let isMounted = true;
    async function initDatabase() {
      try {
        const serverDb = await loadDatabaseFromServer();
        if (!isMounted) return;

        if (serverDb) {
          // Authoritative Server Database Hydration:
          // Directly apply server records to state and localStorage.
          // Never perform union merge with stale local state which causes deleted records to resurrect!
          if (Array.isArray(serverDb.members)) {
            setMembers(serverDb.members);
            safeSetLocalStorage('iso_members', serverDb.members);
          }

          if (Array.isArray(serverDb.officeBearers)) {
            setOfficeBearers(serverDb.officeBearers);
            safeSetLocalStorage('iso_office_bearers', serverDb.officeBearers);
          }

          if (Array.isArray(serverDb.admins)) {
            setAdmins(serverDb.admins);
            safeSetLocalStorage('iso_admins', serverDb.admins);
          }

          if (Array.isArray(serverDb.adminCredentials)) {
            setAdminCredentials(serverDb.adminCredentials);
            safeSetLocalStorage('iso_admin_credentials', serverDb.adminCredentials);
          }

          if (Array.isArray(serverDb.designations)) {
            setDesignations(serverDb.designations);
            safeSetLocalStorage('iso_designations', serverDb.designations);
          }
          if (Array.isArray(serverDb.documents)) {
            setDocuments(serverDb.documents);
            safeSetLocalStorage('iso_documents', serverDb.documents);
          }
          if (Array.isArray(serverDb.events)) {
            setEvents(serverDb.events);
            safeSetLocalStorage('iso_events', serverDb.events);
          }
          if (Array.isArray(serverDb.donations)) {
            setDonations(serverDb.donations);
            safeSetLocalStorage('iso_donations', serverDb.donations);
          }
          if (Array.isArray(serverDb.auditLogs)) {
            setAuditLogs(serverDb.auditLogs);
            safeSetLocalStorage('iso_audit_logs', serverDb.auditLogs);
          }
          if (Array.isArray(serverDb.registrationNotifications)) {
            setRegistrationNotifications(serverDb.registrationNotifications);
            safeSetLocalStorage('iso_registration_notifications', serverDb.registrationNotifications);
          }
          if (serverDb.superAdminPhoto) {
            setSuperAdminPhoto(serverDb.superAdminPhoto);
            localStorage.setItem('iso_super_admin_photo', serverDb.superAdminPhoto);
          }
        } else {
          // If server file did not exist yet, persist initial state to initialize permanent storage
          persistDatabaseToServer({
            members,
            officeBearers,
            designations,
            admins,
            adminCredentials,
            auditLogs,
            documents,
            events,
            donations,
            registrationNotifications,
            superAdminPhoto
          });
        }
      } catch (e) {
        console.error('Error during initial database hydration:', e);
      } finally {
        if (isMounted) {
          setDbLoadedFromServer(true);
        }
      }
    }

    initDatabase();
    return () => {
      isMounted = false;
    };
  }, []);

  // Welcome Note State
  const [welcomeNote, setWelcomeNote] = useState<string | null>(null);

  const handleLoginSuccess = (user: AdminCredential, message?: string) => {
    setCurrentLoggedInUser(user);
    safeSetLocalStorage('iso_current_logged_in_user', user);
    const note = message || `Welcome back, ${user.name}! Authenticated as ${user.designation} (${user.role}).`;
    setWelcomeNote(note);
    logActivity('User Authentication', `${user.name} (${user.mobileNumber}) logged into system as ${user.role}`);
  };

  const handleLogout = async () => {
    if (currentLoggedInUser) {
      logActivity('User Logout', `${currentLoggedInUser.name} (${currentLoggedInUser.mobileNumber}) logged out.`);
    }
    // Flush any pending updates and guarantee latest database snapshot is safely saved to server disk
    await flushPendingSync();
    await persistDatabaseToServer({
      members,
      officeBearers,
      designations,
      admins,
      adminCredentials,
      auditLogs,
      documents,
      events,
      donations,
      registrationNotifications,
      superAdminPhoto
    });

    signOutSupabase().catch((err) => console.warn('Notice signing out of Supabase:', err));
    localStorage.removeItem('iso_current_logged_in_user');
    setCurrentLoggedInUser(null);
    setWelcomeNote(null);
  };

  // Manual trigger to force-save database immediately to server disk
  const handleForceSaveDatabase = async (): Promise<boolean> => {
    const success = await persistDatabaseToServer({
      members,
      officeBearers,
      designations,
      admins,
      adminCredentials,
      auditLogs,
      documents,
      events,
      donations,
      registrationNotifications,
      superAdminPhoto
    });
    if (success) {
      logActivity('Permanent Storage Saved', 'Full system database permanently written to server disk.');
    }
    return success;
  };

  // Modal triggers
  const [showAddMemberDirectly, setShowAddMemberDirectly] = useState(false);
  const [showAddOBDirectly, setShowAddOBDirectly] = useState(false);
  const [showCompulsoryFormModal, setShowCompulsoryFormModal] = useState(false);

  // Compulsory Google Form completion state for logged in member
  const [hasCompletedGoogleForm, setHasCompletedGoogleForm] = useState<boolean>(() => {
    const savedUser = localStorage.getItem('iso_current_logged_in_user');
    if (!savedUser) return false;
    try {
      const u = JSON.parse(savedUser);
      const key = u.email || u.mobileNumber || u.memberId || 'member';
      return localStorage.getItem(`iso_google_form_completed_${key}`) === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (!currentLoggedInUser) {
      setHasCompletedGoogleForm(false);
      return;
    }
    const key = currentLoggedInUser.email || currentLoggedInUser.mobileNumber || currentLoggedInUser.memberId || 'member';
    setHasCompletedGoogleForm(localStorage.getItem(`iso_google_form_completed_${key}`) === 'true');
  }, [currentLoggedInUser]);

  // Sync state to localStorage & permanent server database
  useEffect(() => {
    safeSetLocalStorage('iso_members', members);
    if (dbLoadedFromServer) {
      scheduleDatabaseSync({ members });
    }
  }, [members, dbLoadedFromServer]);

  useEffect(() => {
    safeSetLocalStorage('iso_office_bearers', officeBearers);
    if (dbLoadedFromServer) {
      scheduleDatabaseSync({ officeBearers });
    }
  }, [officeBearers, dbLoadedFromServer]);

  useEffect(() => {
    safeSetLocalStorage('iso_designations', designations);
    if (dbLoadedFromServer) {
      scheduleDatabaseSync({ designations });
    }
  }, [designations, dbLoadedFromServer]);

  useEffect(() => {
    safeSetLocalStorage('iso_admins', admins);
    if (dbLoadedFromServer) {
      scheduleDatabaseSync({ admins });
    }
  }, [admins, dbLoadedFromServer]);

  useEffect(() => {
    safeSetLocalStorage('iso_admin_credentials', adminCredentials);
    if (dbLoadedFromServer) {
      scheduleDatabaseSync({ adminCredentials });
    }
  }, [adminCredentials, dbLoadedFromServer]);

  useEffect(() => {
    safeSetLocalStorage('iso_registration_notifications', registrationNotifications);
    if (dbLoadedFromServer) {
      scheduleDatabaseSync({ registrationNotifications });
    }
  }, [registrationNotifications, dbLoadedFromServer]);

  useEffect(() => {
    safeSetLocalStorage('iso_audit_logs', auditLogs);
    if (dbLoadedFromServer) {
      scheduleDatabaseSync({ auditLogs });
    }
  }, [auditLogs, dbLoadedFromServer]);

  useEffect(() => {
    safeSetLocalStorage('iso_documents', documents);
    if (dbLoadedFromServer) {
      scheduleDatabaseSync({ documents });
    }
  }, [documents, dbLoadedFromServer]);

  useEffect(() => {
    safeSetLocalStorage('iso_events', events);
    if (dbLoadedFromServer) {
      scheduleDatabaseSync({ events });
    }
  }, [events, dbLoadedFromServer]);

  useEffect(() => {
    safeSetLocalStorage('iso_donations', donations);
    if (dbLoadedFromServer) {
      scheduleDatabaseSync({ donations });
    }
  }, [donations, dbLoadedFromServer]);

  useEffect(() => {
    if (currentLoggedInUser) {
      safeSetLocalStorage('iso_current_logged_in_user', currentLoggedInUser);
    } else {
      localStorage.removeItem('iso_current_logged_in_user');
    }
  }, [currentLoggedInUser]);

  // Dark mode handler
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Audit Logging Helper
  const logActivity = (action: string, details: string) => {
    const newLog: AuditLog = {
      id: `LOG-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
      action,
      performedBy: currentLoggedInUser ? currentLoggedInUser.name : SUPER_ADMIN_INFO.name,
      timestamp: new Date().toISOString(),
      details,
      ipAddress: '127.0.0.1'
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Member Handlers
  const handleAddMember = (m: Member) => {
    setMembers((prev) => {
      const updated = [m, ...prev.filter((item) => item.id !== m.id)];
      safeSetLocalStorage('iso_members', updated);
      persistDatabaseToServer({ members: updated });
      return updated;
    });
    logActivity('Member Added', `Registered new member ${m.fullName} (${m.id}) in ${m.city}, ${m.district}`);
  };

  const handleEditMember = (m: Member) => {
    setMembers((prev) => {
      const updated = prev.map((item) => (item.id === m.id ? m : item));
      safeSetLocalStorage('iso_members', updated);
      persistDatabaseToServer({ members: updated });
      return updated;
    });
    logActivity('Member Updated', `Modified record for ${m.fullName} (${m.id})`);
  };

  const handleDeleteMember = (id: string) => {
    const target = members.find((m) => m.id === id);
    setMembers((prev) => {
      const updated = prev.filter((m) => m.id !== id);
      safeSetLocalStorage('iso_members', updated);
      persistDatabaseToServer({ members: updated });
      return updated;
    });
    logActivity('Member Deleted', `Removed record ${target?.fullName || id}`);
  };

  // Office Bearer Handlers
  const handleAddOfficeBearer = (b: OfficeBearer) => {
    setOfficeBearers((prev) => {
      const updated = [b, ...prev.filter((o) => o.id !== b.id)];
      safeSetLocalStorage('iso_office_bearers', updated);
      persistDatabaseToServer({ officeBearers: updated });
      return updated;
    });
    logActivity('Office Bearer Appointed', `Appointed ${b.name} as ${b.designation}`);
  };

  const handleEditOfficeBearer = (b: OfficeBearer) => {
    setOfficeBearers((prev) => {
      const updated = prev.map((item) => (item.id === b.id ? b : item));
      safeSetLocalStorage('iso_office_bearers', updated);
      persistDatabaseToServer({ officeBearers: updated });
      return updated;
    });
    logActivity('Office Bearer Updated', `Updated appointment details for ${b.name} (${b.designation})`);
  };

  const handleDeleteOfficeBearer = (id: string) => {
    const target = officeBearers.find((o) => o.id === id);
    setOfficeBearers((prev) => {
      const updated = prev.filter((o) => o.id !== id);
      safeSetLocalStorage('iso_office_bearers', updated);
      persistDatabaseToServer({ officeBearers: updated });
      return updated;
    });
    logActivity('Office Bearer Removed', `Vacated appointment for ${target?.name || id}`);
  };

  // Designation Handlers
  const handleAddDesignation = (d: Designation) => {
    setDesignations((prev) => {
      const updated = [...prev, d];
      safeSetLocalStorage('iso_designations', updated);
      persistDatabaseToServer({ designations: updated });
      return updated;
    });
    logActivity('Designation Created', `Added custom designation ${d.title} (${d.level} Tier)`);
  };

  const handleDeleteDesignation = (id: string) => {
    const target = designations.find((d) => d.id === id);
    setDesignations((prev) => {
      const updated = prev.filter((d) => d.id !== id);
      safeSetLocalStorage('iso_designations', updated);
      persistDatabaseToServer({ designations: updated });
      return updated;
    });
    logActivity('Designation Removed', `Deleted custom designation ${target?.title || id}`);
  };

  // Admin Handlers
  const handleAddAdmin = (adm: AdminUser) => {
    let updatedAdminsList: AdminUser[] = [];
    setAdmins((prev) => {
      const exists = prev.some((a) => a.id === adm.id || (a.email && a.email.toLowerCase() === adm.email.toLowerCase()));
      updatedAdminsList = exists
        ? prev.map((a) => (a.id === adm.id || (a.email && a.email.toLowerCase() === adm.email.toLowerCase()) ? adm : a))
        : [...prev, adm];
      safeSetLocalStorage('iso_admins', updatedAdminsList);
      return updatedAdminsList;
    });

    const cleanMobile = adm.phone?.trim() || '';
    const newCred: AdminCredential = {
      mobileNumber: cleanMobile || '0300' + Math.floor(1000000 + Math.random() * 9000000),
      password: 'admin123',
      name: adm.name,
      designation: adm.designation,
      role: (adm.role as any) || 'Admin',
      isSuperAdmin: Boolean(adm.isSuperAdmin),
      createdDate: adm.createdDate || new Date().toISOString().split('T')[0],
      email: adm.email?.trim().toLowerCase(),
      memberId: adm.id
    };

    let updatedCredsList: AdminCredential[] = [];
    setAdminCredentials((prev) => {
      const filtered = prev.filter(
        (c) =>
          (!cleanMobile || c.mobileNumber !== cleanMobile) &&
          (!adm.email || c.email?.toLowerCase() !== adm.email.toLowerCase()) &&
          (c.memberId !== adm.id)
      );
      updatedCredsList = [newCred, ...filtered];
      safeSetLocalStorage('iso_admin_credentials', updatedCredsList);
      return updatedCredsList;
    });

    // Immediate permanent server database save
    persistDatabaseToServer({
      admins: updatedAdminsList,
      adminCredentials: updatedCredsList
    });

    logActivity('Admin Created', `Granted admin access to ${adm.name} (${adm.designation})`);
  };

  const handleEditAdmin = (adm: AdminUser) => {
    let updatedAdminsList: AdminUser[] = [];
    setAdmins((prev) => {
      updatedAdminsList = prev.map((item) => (item.id === adm.id ? adm : item));
      safeSetLocalStorage('iso_admins', updatedAdminsList);
      return updatedAdminsList;
    });

    let updatedCredsList: AdminCredential[] = [];
    setAdminCredentials((prev) => {
      updatedCredsList = prev.map((c) => {
        if (
          (adm.phone && c.mobileNumber === adm.phone.trim()) ||
          (adm.email && c.email?.toLowerCase() === adm.email.trim().toLowerCase()) ||
          (c.memberId === adm.id)
        ) {
          return {
            ...c,
            name: adm.name,
            designation: adm.designation,
            role: (adm.role as any) || c.role,
            isSuperAdmin: Boolean(adm.isSuperAdmin),
            email: adm.email?.trim().toLowerCase() || c.email,
            mobileNumber: adm.phone?.trim() || c.mobileNumber
          };
        }
        return c;
      });
      safeSetLocalStorage('iso_admin_credentials', updatedCredsList);
      return updatedCredsList;
    });

    // Immediate permanent server database save
    persistDatabaseToServer({
      admins: updatedAdminsList,
      adminCredentials: updatedCredsList
    });

    logActivity('Admin Permissions Modified', `Updated RBAC rights for admin ${adm.name}`);
  };

  const handleDeleteAdmin = (id: string) => {
    const target = admins.find((a) => a.id === id);
    let updatedAdminsList: AdminUser[] = [];
    setAdmins((prev) => {
      updatedAdminsList = prev.filter((a) => a.id !== id);
      safeSetLocalStorage('iso_admins', updatedAdminsList);
      return updatedAdminsList;
    });

    let updatedCredsList: AdminCredential[] = [];
    setAdminCredentials((prev) => {
      updatedCredsList = target
        ? prev.filter(
            (c) =>
              c.memberId !== id &&
              (!target.phone || c.mobileNumber !== target.phone.trim()) &&
              (!target.email || c.email?.toLowerCase() !== target.email.trim().toLowerCase())
          )
        : prev.filter((c) => c.memberId !== id);
      safeSetLocalStorage('iso_admin_credentials', updatedCredsList);
      return updatedCredsList;
    });

    // Immediate permanent server database save
    persistDatabaseToServer({
      admins: updatedAdminsList,
      adminCredentials: updatedCredsList
    });

    logActivity('Admin Removed', `Revoked admin permissions for ${target?.name || id}`);
  };

  const handleDeleteDocument = (id: string) => {
    const target = documents.find((d) => d.id === id);
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    logActivity('Document Deleted', `Deleted document record ${target?.title || id}`);
  };

  const handleDeleteEvent = (id: string) => {
    const target = events.find((e) => e.id === id);
    setEvents((prev) => prev.filter((e) => e.id !== id));
    logActivity('Event Deleted', `Deleted event record ${target?.title || id}`);
  };

  const handleDeleteDonation = (id: string) => {
    const target = donations.find((d) => d.id === id);
    setDonations((prev) => prev.filter((d) => d.id !== id));
    logActivity('Donation Deleted', `Deleted donation entry ${target?.receiptNumber || id}`);
  };

  const handleDeleteAuditLog = (id: string) => {
    setAuditLogs((prev) => prev.filter((l) => l.id !== id));
  };

  const handlePurgeCategory = (category: string) => {
    if (category === 'members') {
      setMembers([]);
      logActivity('Category Purged', 'Purged all Member records');
    } else if (category === 'officeBearers') {
      setOfficeBearers([]);
      logActivity('Category Purged', 'Purged all Office Bearer records');
    } else if (category === 'documents') {
      setDocuments([]);
      logActivity('Category Purged', 'Purged all Document records');
    } else if (category === 'events') {
      setEvents([]);
      logActivity('Category Purged', 'Purged all Event records');
    } else if (category === 'donations') {
      setDonations([]);
      logActivity('Category Purged', 'Purged all Donation records');
    } else if (category === 'auditLogs') {
      setAuditLogs([]);
    } else if (category === 'admins') {
      setAdmins((prev) => prev.filter((a) => a.isSuperAdmin));
      logActivity('Category Purged', 'Purged all secondary Admin accounts');
    }
  };

  const handleMasterPurgeAllData = (resetToDefault = false) => {
    if (resetToDefault) {
      setMembers(INITIAL_MEMBERS);
      setOfficeBearers(INITIAL_OFFICE_BEARERS);
      setDesignations(INITIAL_DESIGNATIONS);
      setAdmins(INITIAL_ADMINS);
      setDocuments(INITIAL_DOCUMENTS);
      setEvents(INITIAL_EVENTS);
      setDonations(INITIAL_DONATIONS);
      setAuditLogs(INITIAL_AUDIT_LOGS);
      logActivity('Master System Reset', 'Reset Digital Library database to default initial seeds.');
    } else {
      setMembers([]);
      setOfficeBearers([]);
      setDesignations([]);
      setAdmins((prev) => prev.filter((a) => a.isSuperAdmin));
      setDocuments([]);
      setEvents([]);
      setDonations([]);
      logActivity('Master Library Purged', 'EXECUTED MASTER PURGE: Wiped all records across all modules.');
    }
  };

  // Bulk Import Handler
  const handleImportMembers = (importedList: Member[]) => {
    setMembers((prev) => [...importedList, ...prev]);
    logActivity('Data Bulk Imported', `Imported ${importedList.length} member records into central database`);
  };

  // Backup Database
  const handleBackupDatabase = () => {
    const fullBackup = {
      timestamp: new Date().toISOString(),
      superAdmin: SUPER_ADMIN_INFO,
      members,
      officeBearers,
      designations,
      admins,
      auditLogs
    };
    const jsonStr = JSON.stringify(fullBackup, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ISO_Full_Database_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    logActivity('Database Snapshot Exported', 'Full multi-table JSON database backup exported');
  };

  // Restore Database
  const handleRestoreDatabase = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          try {
            const data = JSON.parse(evt.target?.result as string);
            if (data.members && data.officeBearers) {
              setMembers(data.members);
              setOfficeBearers(data.officeBearers);
              if (data.designations) setDesignations(data.designations);
              if (data.admins) setAdmins(data.admins);
              logActivity('Database Restored', 'Restored complete database snapshot from JSON backup');
              alert('ISO Database restored successfully!');
            } else {
              alert('Invalid backup file structure.');
            }
          } catch (err) {
            alert('Error parsing database backup file.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  // Mobile Credentials & Portal Handlers
  const handleGenerateCredential = (newCred: AdminCredential) => {
    setAdminCredentials((prev) => {
      const existingIdx = prev.findIndex((c) => c.mobileNumber === newCred.mobileNumber);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = newCred;
        return updated;
      }
      return [newCred, ...prev];
    });
    logActivity('Mobile Credential Issued', `Issued Mobile User ID ${newCred.mobileNumber} (${newCred.name}) - Role: ${newCred.role}`);
  };

  const handleDeleteCredential = (mobileNumber: string) => {
    if (mobileNumber === '03323475431') {
      alert('Cannot delete primary Super Admin Mobile ID.');
      return;
    }
    setAdminCredentials((prev) => prev.filter((c) => c.mobileNumber !== mobileNumber));
    logActivity('Mobile Credential Revoked', `Revoked access for Mobile ID ${mobileNumber}`);
  };

  const handleRegisterMemberFromPortal = (memberData: Omit<Member, 'id' | 'joiningDate' | 'status'>) => {
    if (memberData.email) {
      const normalizedEmail = memberData.email.trim().toLowerCase();
      const existing = members.find((m) => m.email?.trim().toLowerCase() === normalizedEmail);
      if (existing) {
        alert(`This email is already registered with Member ID: ${existing.id} (${existing.fullName}). In accordance with ISO policy, one email is strictly reserved for one ID only.`);
        return;
      }
    }

    const newMember: Member = {
      ...memberData,
      id: `ISO-MEM-${Date.now().toString().slice(-4)}`,
      joiningDate: new Date().toISOString().split('T')[0],
      status: 'Pending'
    };

    let updatedMembers: Member[] = [];
    setMembers((prev) => {
      updatedMembers = [newMember, ...prev];
      return updatedMembers;
    });

    // Save login credentials so the new user can immediately log in
    let updatedCreds: AdminCredential[] = [];
    if (newMember.mobileNumber || newMember.email) {
      const cleanMobile = newMember.mobileNumber?.trim() || '';
      const memberCred: AdminCredential = {
        mobileNumber: cleanMobile || '0300' + Math.floor(1000000 + Math.random() * 9000000),
        password: 'email_otp_verified',
        name: newMember.fullName,
        designation: 'ISO General Member',
        role: 'Viewer',
        isSuperAdmin: false,
        createdDate: newMember.joiningDate,
        email: newMember.email?.trim().toLowerCase(),
        memberId: newMember.id
      };

      setAdminCredentials((prev) => {
        const filtered = prev.filter(
          (c) =>
            (!cleanMobile || c.mobileNumber !== cleanMobile) &&
            (!memberCred.email || c.email?.toLowerCase() !== memberCred.email)
        );
        updatedCreds = [memberCred, ...filtered];
        return updatedCreds;
      });
    }

    const notif: RegistrationNotification = {
      id: `NOTIF-${Date.now()}`,
      type: 'Member',
      name: newMember.fullName,
      cityName: newMember.city,
      mobileNumber: newMember.mobileNumber,
      whatsappNumber: newMember.whatsappNumber,
      registeredAt: new Date().toISOString(),
      isRead: false,
      recordId: newMember.id
    };

    setRegistrationNotifications((prev) => [notif, ...prev]);

    logActivity('Member Registration (Pending)', `${newMember.fullName} registered from ${newMember.city} (Card Status: Pending Approval)`);

    // Immediate permanent server database save
    setTimeout(() => {
      persistDatabaseToServer({
        members: updatedMembers.length > 0 ? updatedMembers : undefined,
        adminCredentials: updatedCreds.length > 0 ? updatedCreds : undefined
      });
    }, 100);
  };

  const handleRegisterOfficeBearerFromPortal = (bearerData: Omit<OfficeBearer, 'id' | 'appointmentDate' | 'status'>) => {
    const newOb: OfficeBearer = {
      ...bearerData,
      id: `ISO-OB-${Date.now().toString().slice(-4)}`,
      appointmentDate: new Date().toISOString().split('T')[0],
      status: 'Active'
    };

    let updatedObs: OfficeBearer[] = [];
    setOfficeBearers((prev) => {
      updatedObs = [newOb, ...prev];
      return updatedObs;
    });

    let updatedCreds: AdminCredential[] = [];
    if (newOb.mobileNumber || newOb.email) {
      const cleanMobile = newOb.mobileNumber?.trim() || '';
      const bearerCred: AdminCredential = {
        mobileNumber: cleanMobile || '0300' + Math.floor(1000000 + Math.random() * 9000000),
        password: 'admin123',
        name: newOb.name,
        designation: newOb.designation,
        role: 'Manager',
        isSuperAdmin: false,
        createdDate: newOb.appointmentDate,
        email: newOb.email?.trim().toLowerCase(),
        memberId: newOb.id
      };

      setAdminCredentials((prev) => {
        const filtered = prev.filter(
          (c) =>
            (!cleanMobile || c.mobileNumber !== cleanMobile) &&
            (!bearerCred.email || c.email?.toLowerCase() !== bearerCred.email)
        );
        updatedCreds = [bearerCred, ...filtered];
        return updatedCreds;
      });
    }

    const notif: RegistrationNotification = {
      id: `NOTIF-${Date.now()}`,
      type: 'OfficeBearer',
      name: newOb.name,
      cityName: newOb.city,
      mobileNumber: newOb.mobileNumber,
      whatsappNumber: newOb.whatsapp,
      designation: newOb.designation,
      registeredAt: new Date().toISOString(),
      isRead: false,
      recordId: newOb.id
    };

    setRegistrationNotifications((prev) => [notif, ...prev]);
    logActivity('Cabinet Official Self-Registration', `${newOb.name} appointed as ${newOb.designation} from ${newOb.city} (Mobile: ${newOb.mobileNumber})`);

    // Immediate permanent server database save
    setTimeout(() => {
      persistDatabaseToServer({
        officeBearers: updatedObs.length > 0 ? updatedObs : undefined,
        adminCredentials: updatedCreds.length > 0 ? updatedCreds : undefined
      });
    }, 100);
  };

  const handleMarkNotificationRead = (id: string) => {
    setRegistrationNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleClearNotifications = () => {
    setRegistrationNotifications([]);
  };

  const handleOpenPortal = (tab: 'member' | 'official' | 'adminLogin' = 'member') => {
    setPortalDefaultTab(tab);
    setIsPortalOpen(true);
  };

  // If user is not logged in, enforce security gate login screen
  if (!currentLoggedInUser) {
    return (
      <AuthLoginGate
        adminCredentials={adminCredentials}
        members={members}
        admins={admins}
        onLoginSuccess={handleLoginSuccess}
        onRegisterMember={handleRegisterMemberFromPortal}
        onRegisterOfficeBearer={handleRegisterOfficeBearerFromPortal}
      />
    );
  }

  const isSuperAdmin = currentLoggedInUser?.isSuperAdmin || currentLoggedInUser?.role === 'SuperAdmin';
  const isAdminOrManager = isSuperAdmin || currentLoggedInUser?.role === 'Admin' || currentLoggedInUser?.role === 'Manager';
  const isRegularMember = Boolean(currentLoggedInUser && !isAdminOrManager);

  // Compulsory Google Form Gate: Any member logging in who has not completed the compulsory form must fill every compulsory detail before entering landing page
  const mustCompleteForm = Boolean(currentLoggedInUser && !isSuperAdmin && !hasCompletedGoogleForm);
  if (mustCompleteForm) {
    return (
      <CompulsoryGoogleFormGate
        user={currentLoggedInUser}
        onFormCompleted={() => setHasCompletedGoogleForm(true)}
        onLogout={handleLogout}
      />
    );
  }

  // Route protection: If regular member attempts to access an admin-only module, route to 'members'
  const allowedMemberTabs: ActiveTab[] = [
    'dashboard',
    'members',
    'hierarchy',
    'shajra',
    'membershipCard',
    'events',
    'aiAssistant',
    'opportunities',
    'myApplications',
    'savedOpportunities',
    'supabaseConfig'
  ];
  const effectiveActiveTab = (isRegularMember && !allowedMemberTabs.includes(activeTab)) ? 'members' : activeTab;

  const currentProfile: Profile = {
    id: currentLoggedInUser?.username || 'user-syed-amir',
    email: currentLoggedInUser?.email || 'syedmuhammadamir837@gmail.com',
    full_name: currentLoggedInUser?.name || 'Syed Muhammad Aamir Naqvi',
    role: isSuperAdmin ? 'admin' : 'applicant',
    headline: 'Senior Solutions Architect & Full-Stack Engineer',
    skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Supabase', 'Tailwind CSS', 'Docker', 'Git'],
    experience_level: 'senior',
    target_roles: ['Software Architect', 'Senior Full Stack Engineer', 'Technical Lead'],
    preferred_location_type: 'any',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Top Fixed Header */}
      <Header
        activeTab={effectiveActiveTab}
        setActiveTab={setActiveTab}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        currentLoggedInUser={currentLoggedInUser}
        onLogout={handleLogout}
        superAdminInfo={superAdminInfo}
        onUpdateSuperAdminPhoto={handleUpdateSuperAdminPhoto}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        registrationNotifications={registrationNotifications}
        onMarkNotificationRead={handleMarkNotificationRead}
        onClearNotifications={handleClearNotifications}
        onOpenPortal={handleOpenPortal}
        serverSyncStatus={serverSyncStatus}
        onForceSaveDatabase={handleForceSaveDatabase}
        onOpenSupabaseConfig={() => setIsSupabaseConfigOpen(true)}
        onOpenCompulsoryForm={() => setShowCompulsoryFormModal(true)}
      />


      {/* Main Layout Body */}
      <div className="flex pt-16 min-h-[calc(100vh-4rem)]">
        
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={effectiveActiveTab}
          setActiveTab={setActiveTab}
          isOpen={isSidebarOpen}
          superAdminInfo={superAdminInfo}
          currentLoggedInUser={currentLoggedInUser}
          onLogout={handleLogout}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Content View Container */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full transition-all duration-300">
          
          {effectiveActiveTab === 'dashboard' && (
            <Dashboard
              members={members}
              officeBearers={officeBearers}
              auditLogs={auditLogs}
              setActiveTab={setActiveTab}
              superAdminInfo={superAdminInfo}
              currentLoggedInUser={currentLoggedInUser}
              welcomeNote={welcomeNote}
              onDismissWelcomeNote={() => setWelcomeNote(null)}
              onLogout={handleLogout}
              onOpenCompulsoryForm={() => setShowCompulsoryFormModal(true)}
              onOpenAddMember={() => {
                setShowAddMemberDirectly(true);
                setActiveTab('members');
              }}
              onOpenAddOfficeBearer={() => {
                setShowAddOBDirectly(true);
                setActiveTab('officeBearers');
              }}
            />
          )}

          {effectiveActiveTab === 'members' && (
            <MembersModule
              members={members}
              onAddMember={handleAddMember}
              onEditMember={handleEditMember}
              onDeleteMember={handleDeleteMember}
              showAddModalDirectly={showAddMemberDirectly}
              setShowAddModalDirectly={setShowAddMemberDirectly}
              currentLoggedInUser={currentLoggedInUser}
            />
          )}

          {effectiveActiveTab === 'officeBearers' && (
            <OfficeBearersModule
              officeBearers={officeBearers}
              designations={designations}
              onAddOfficeBearer={handleAddOfficeBearer}
              onEditOfficeBearer={handleEditOfficeBearer}
              onDeleteOfficeBearer={handleDeleteOfficeBearer}
              onAddDesignation={handleAddDesignation}
              onDeleteDesignation={handleDeleteDesignation}
              showAddModalDirectly={showAddOBDirectly}
              setShowAddModalDirectly={setShowAddOBDirectly}
              currentLoggedInUser={currentLoggedInUser}
            />
          )}

          {effectiveActiveTab === 'hierarchy' && (
            <HierarchyModule members={members} officeBearers={officeBearers} isSuperAdmin={isSuperAdmin} />
          )}

          {effectiveActiveTab === 'superAdmin' && (
            <SuperAdminModule
              admins={admins}
              members={members}
              officeBearers={officeBearers}
              documents={documents}
              events={events}
              donations={donations}
              auditLogs={auditLogs}
              superAdminPhoto={superAdminPhoto}
              onUpdateSuperAdminPhoto={handleUpdateSuperAdminPhoto}
              setActiveTab={setActiveTab}
              onDeleteMember={handleDeleteMember}
              onDeleteOfficeBearer={handleDeleteOfficeBearer}
              onDeleteAdmin={handleDeleteAdmin}
              onDeleteDocument={handleDeleteDocument}
              onDeleteEvent={handleDeleteEvent}
              onDeleteDonation={handleDeleteDonation}
              onDeleteAuditLog={handleDeleteAuditLog}
              onPurgeCategory={handlePurgeCategory}
              onMasterPurgeAllData={handleMasterPurgeAllData}
              onBackupDatabase={handleBackupDatabase}
              onRestoreDatabase={handleRestoreDatabase}
              adminCredentials={adminCredentials}
              onGenerateCredential={handleGenerateCredential}
              onDeleteCredential={handleDeleteCredential}
            />
          )}

          {effectiveActiveTab === 'adminRbac' && (
            <AdminRbacModule
              admins={admins}
              onAddAdmin={handleAddAdmin}
              onEditAdmin={handleEditAdmin}
              onDeleteAdmin={handleDeleteAdmin}
            />
          )}

          {effectiveActiveTab === 'globalSearch' && (
            <GlobalSearchModule
              members={members}
              officeBearers={officeBearers}
              admins={admins}
            />
          )}

          {effectiveActiveTab === 'shajra' && (
            <ShajraModule
              currentLoggedInUser={currentLoggedInUser}
              members={members}
              onLogActivity={logActivity}
            />
          )}

          {effectiveActiveTab === 'shajraAuth' && (
            <ShajraReferenceBooksModule
              currentLoggedInUser={currentLoggedInUser}
              members={members}
              onLogActivity={logActivity}
            />
          )}

          {effectiveActiveTab === 'membershipCard' && (
            <MembershipCardModule
              members={members}
              officeBearers={officeBearers}
              currentLoggedInUser={currentLoggedInUser}
              onUpdateMember={(updated) => {
                let updatedList: Member[] = [];
                setMembers((prev) => {
                  updatedList = prev.map((m) => (m.id === updated.id ? updated : m));
                  return updatedList;
                });
                setTimeout(() => {
                  persistDatabaseToServer({ members: updatedList });
                }, 100);
                logActivity('Member Card Status Updated', `Updated status for ${updated.fullName} to ${updated.status}`);
              }}
            />
          )}

          {effectiveActiveTab === 'exportImport' && (
            <ExportImportModule
              members={members}
              officeBearers={officeBearers}
              onImportMembers={handleImportMembers}
              onOpenGoogleSheets={() => setActiveTab('googleSheets')}
            />
          )}

          {effectiveActiveTab === 'googleSheets' && (
            <GoogleSheetsModule
              members={members}
              setMembers={setMembers}
              officeBearers={officeBearers}
              onLogActivity={logActivity}
              isSuperAdmin={isSuperAdmin}
            />
          )}

          {effectiveActiveTab === 'aiAssistant' && (
            <AiAssistantModule
              members={members}
              officeBearers={officeBearers}
            />
          )}

          {effectiveActiveTab === 'auditLogs' && <AuditLogsModule logs={auditLogs} />}

          {effectiveActiveTab === 'opportunities' && (
            <OpportunitiesModule
              currentProfile={currentProfile}
              onOpenSupabaseConfig={() => setIsSupabaseConfigOpen(true)}
              onOpenMyApplications={() => setActiveTab('myApplications')}
              onOpenSavedOpportunities={() => setActiveTab('savedOpportunities')}
            />
          )}

          {effectiveActiveTab === 'myApplications' && (
            <ApplicationsModule
              currentProfile={currentProfile}
              onExploreOpportunities={() => setActiveTab('opportunities')}
            />
          )}

          {effectiveActiveTab === 'savedOpportunities' && (
            <SavedOpportunitiesModule
              currentProfile={currentProfile}
              onExploreOpportunities={() => setActiveTab('opportunities')}
              onSelectOpportunity={(opp) => {
                setActiveTab('opportunities');
              }}
            />
          )}

          {effectiveActiveTab === 'supabaseConfig' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <div>
                  <h1 className="text-2xl font-bold text-white tracking-tight">Supabase & PostgreSQL Architecture</h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Project: <span className="font-mono text-emerald-400">{SUPABASE_PROJECT_ID}</span> • Real-time DB, Auth, RLS Policies, Storage & AI Engine
                  </p>
                </div>
                <button
                  onClick={() => setIsSupabaseConfigOpen(true)}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all"
                >
                  Open Migration & Diagnostics Inspector
                </button>
              </div>

              <OpportunitiesModule
                currentProfile={currentProfile}
                onOpenSupabaseConfig={() => setIsSupabaseConfigOpen(true)}
                onOpenMyApplications={() => setActiveTab('myApplications')}
                onOpenSavedOpportunities={() => setActiveTab('savedOpportunities')}
              />
            </div>
          )}

          {/* Running Footer */}
          <Footer />
        </main>
      </div>

      {/* Public Self-Service Registration & Super Admin Login Modal */}
      <PortalModal
        isOpen={isPortalOpen}
        onClose={() => setIsPortalOpen(false)}
        defaultPortal={portalDefaultTab}
        onRegisterMember={handleRegisterMemberFromPortal}
        onRegisterOfficeBearer={handleRegisterOfficeBearerFromPortal}
        adminCredentials={adminCredentials}
        onAdminLoginSuccess={(user) => {
          setCurrentLoggedInUser(user);
          setIsPortalOpen(false);
          setActiveTab('superAdmin');
        }}
        currentLoggedInUser={currentLoggedInUser}
        onLogout={() => setCurrentLoggedInUser(null)}
      />

      {/* Official Compulsory Google Registration Form Modal */}
      {showCompulsoryFormModal && currentLoggedInUser && (
        <CompulsoryGoogleFormGate
          isModalMode={true}
          user={currentLoggedInUser}
          onFormCompleted={() => {
            const key = currentLoggedInUser.email || currentLoggedInUser.mobileNumber || currentLoggedInUser.memberId || 'member';
            try {
              localStorage.setItem(`iso_google_form_completed_${key}`, 'true');
            } catch {}
            setHasCompletedGoogleForm(true);
            setShowCompulsoryFormModal(false);
          }}
          onCloseModal={() => setShowCompulsoryFormModal(false)}
        />
      )}

      {/* Supabase Architecture & SQL Migration Modal */}
      <SupabaseConfigModal
        isOpen={isSupabaseConfigOpen}
        onClose={() => setIsSupabaseConfigOpen(false)}
      />
    </div>
  );
}

export default App;
