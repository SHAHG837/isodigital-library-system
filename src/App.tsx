import React, { useState, useEffect } from 'react';
import {
  Member,
  OfficeBearer,
  Designation,
  AdminUser,
  AuditLog,
  ActiveTab,
  AdminCredential,
  RegistrationNotification
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
import { MembershipCardModule } from './components/MembershipCardModule';
import { ExportImportModule } from './components/ExportImportModule';
import { GoogleSheetsModule } from './components/GoogleSheetsModule';
import { AiAssistantModule } from './components/AiAssistantModule';
import { AuditLogsModule } from './components/AuditLogsModule';
import { Footer } from './components/Footer';
import { PortalModal } from './components/PortalModal';
import { AuthLoginGate } from './components/AuthLoginGate';
import { FileText, ExternalLink } from 'lucide-react';

export function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

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

  // Initial load: Fetch permanent database snapshot from server disk
  useEffect(() => {
    let isMounted = true;
    async function initDatabase() {
      try {
        const serverDb = await loadDatabaseFromServer();
        if (!isMounted) return;

        if (serverDb) {
          // Merge server data with local records so no user entered records are lost
          if (serverDb.members && serverDb.members.length > 0) {
            setMembers((local) => {
              const map = new Map<string, Member>();
              serverDb.members!.forEach((m) => map.set(m.id, m));
              local.forEach((m) => {
                if (!map.has(m.id)) map.set(m.id, m);
              });
              return Array.from(map.values());
            });
          }

          if (serverDb.officeBearers && serverDb.officeBearers.length > 0) {
            setOfficeBearers((local) => {
              const map = new Map<string, OfficeBearer>();
              serverDb.officeBearers!.forEach((ob) => map.set(ob.id, ob));
              local.forEach((ob) => {
                if (!map.has(ob.id)) map.set(ob.id, ob);
              });
              return Array.from(map.values());
            });
          }

          if (serverDb.admins && serverDb.admins.length > 0) {
            setAdmins((local) => {
              const map = new Map<string, AdminUser>();
              serverDb.admins!.forEach((a) => map.set(a.id || a.email, a));
              local.forEach((a) => {
                const key = a.id || a.email;
                if (!map.has(key)) map.set(key, a);
              });
              return Array.from(map.values());
            });
          }

          if (serverDb.adminCredentials && serverDb.adminCredentials.length > 0) {
            setAdminCredentials((local) => {
              const map = new Map<string, AdminCredential>();
              serverDb.adminCredentials!.forEach((c) => map.set(c.mobileNumber, c));
              local.forEach((c) => {
                if (!map.has(c.mobileNumber)) map.set(c.mobileNumber, c);
              });
              return Array.from(map.values());
            });
          }

          if (serverDb.designations && serverDb.designations.length > 0) {
            setDesignations(serverDb.designations);
          }
          if (serverDb.documents && serverDb.documents.length > 0) {
            setDocuments(serverDb.documents);
          }
          if (serverDb.events && serverDb.events.length > 0) {
            setEvents(serverDb.events);
          }
          if (serverDb.donations && serverDb.donations.length > 0) {
            setDonations(serverDb.donations);
          }
          if (serverDb.auditLogs && serverDb.auditLogs.length > 0) {
            setAuditLogs(serverDb.auditLogs);
          }
          if (serverDb.superAdminPhoto) {
            setSuperAdminPhoto(serverDb.superAdminPhoto);
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

  const handleLogout = () => {
    if (currentLoggedInUser) {
      logActivity('User Logout', `${currentLoggedInUser.name} (${currentLoggedInUser.mobileNumber}) logged out.`);
    }
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
    setMembers((prev) => [m, ...prev]);
    logActivity('Member Added', `Registered new member ${m.fullName} (${m.id}) in ${m.city}, ${m.district}`);
  };

  const handleEditMember = (m: Member) => {
    setMembers((prev) => prev.map((item) => (item.id === m.id ? m : item)));
    logActivity('Member Updated', `Modified record for ${m.fullName} (${m.id})`);
  };

  const handleDeleteMember = (id: string) => {
    const target = members.find((m) => m.id === id);
    setMembers((prev) => prev.filter((m) => m.id !== id));
    logActivity('Member Deleted', `Removed record ${target?.fullName || id}`);
  };

  // Office Bearer Handlers
  const handleAddOfficeBearer = (b: OfficeBearer) => {
    setOfficeBearers((prev) => [b, ...prev]);
    logActivity('Office Bearer Appointed', `Appointed ${b.name} as ${b.designation}`);
  };

  const handleEditOfficeBearer = (b: OfficeBearer) => {
    setOfficeBearers((prev) => prev.map((item) => (item.id === b.id ? b : item)));
    logActivity('Office Bearer Updated', `Updated appointment details for ${b.name} (${b.designation})`);
  };

  const handleDeleteOfficeBearer = (id: string) => {
    const target = officeBearers.find((o) => o.id === id);
    setOfficeBearers((prev) => prev.filter((o) => o.id !== id));
    logActivity('Office Bearer Removed', `Vacated appointment for ${target?.name || id}`);
  };

  // Designation Handlers
  const handleAddDesignation = (d: Designation) => {
    setDesignations((prev) => [...prev, d]);
    logActivity('Designation Created', `Added custom designation ${d.title} (${d.level} Tier)`);
  };

  const handleDeleteDesignation = (id: string) => {
    const target = designations.find((d) => d.id === id);
    setDesignations((prev) => prev.filter((d) => d.id !== id));
    logActivity('Designation Removed', `Deleted custom designation ${target?.title || id}`);
  };

  // Admin Handlers
  const handleAddAdmin = (adm: AdminUser) => {
    let updatedAdmins: AdminUser[] = [];
    setAdmins((prev) => {
      const exists = prev.some((a) => a.id === adm.id || (a.email && a.email.toLowerCase() === adm.email.toLowerCase()));
      if (exists) {
        updatedAdmins = prev.map((a) => (a.id === adm.id || (a.email && a.email.toLowerCase() === adm.email.toLowerCase()) ? adm : a));
      } else {
        updatedAdmins = [...prev, adm];
      }
      return updatedAdmins;
    });

    // Auto-create/sync credentials so the newly created admin can log in via mobile password OR email OTP!
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

    let updatedCreds: AdminCredential[] = [];
    setAdminCredentials((prev) => {
      const filtered = prev.filter(
        (c) =>
          (!cleanMobile || c.mobileNumber !== cleanMobile) &&
          (!adm.email || c.email?.toLowerCase() !== adm.email.toLowerCase()) &&
          (c.memberId !== adm.id)
      );
      updatedCreds = [newCred, ...filtered];
      return updatedCreds;
    });

    logActivity('Admin Created', `Granted admin access to ${adm.name} (${adm.designation})`);

    // Immediate permanent server database save
    setTimeout(() => {
      persistDatabaseToServer({
        admins: updatedAdmins.length > 0 ? updatedAdmins : undefined,
        adminCredentials: updatedCreds.length > 0 ? updatedCreds : undefined
      });
    }, 100);
  };

  const handleEditAdmin = (adm: AdminUser) => {
    let updatedAdmins: AdminUser[] = [];
    setAdmins((prev) => {
      updatedAdmins = prev.map((item) => (item.id === adm.id ? adm : item));
      return updatedAdmins;
    });

    let updatedCreds: AdminCredential[] = [];
    setAdminCredentials((prev) => {
      updatedCreds = prev.map((c) => {
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
      return updatedCreds;
    });

    logActivity('Admin Permissions Modified', `Updated RBAC rights for admin ${adm.name}`);

    // Immediate permanent server database save
    setTimeout(() => {
      persistDatabaseToServer({
        admins: updatedAdmins,
        adminCredentials: updatedCreds
      });
    }, 100);
  };

  const handleDeleteAdmin = (id: string) => {
    const target = admins.find((a) => a.id === id);
    let updatedAdmins: AdminUser[] = [];
    setAdmins((prev) => {
      updatedAdmins = prev.filter((a) => a.id !== id);
      return updatedAdmins;
    });

    let updatedCreds: AdminCredential[] = [];
    if (target) {
      setAdminCredentials((prev) => {
        updatedCreds = prev.filter(
          (c) =>
            c.memberId !== id &&
            (!target.phone || c.mobileNumber !== target.phone.trim()) &&
            (!target.email || c.email?.toLowerCase() !== target.email.trim().toLowerCase())
        );
        return updatedCreds;
      });
    }

    logActivity('Admin Removed', `Revoked admin permissions for ${target?.name || id}`);

    // Immediate permanent server database save
    setTimeout(() => {
      persistDatabaseToServer({
        admins: updatedAdmins,
        adminCredentials: updatedCreds.length > 0 ? updatedCreds : undefined
      });
    }, 100);
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

  // Route protection: If regular member attempts to access an admin-only module, route to 'members'
  const allowedMemberTabs: ActiveTab[] = ['dashboard', 'members', 'hierarchy', 'shajra', 'membershipCard', 'events', 'aiAssistant'];
  const effectiveActiveTab = (isRegularMember && !allowedMemberTabs.includes(activeTab)) ? 'members' : activeTab;

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

      {/* Compulsory Registration Form Modal for Joined Members */}
      {showCompulsoryFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border-2 border-amber-500/80 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl space-y-5 relative">
            <button
              onClick={() => setShowCompulsoryFormModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
            >
              ✕
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded-2xl shrink-0">
                <FileText className="w-7 h-7" />
              </div>
              <div>
                <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/40">
                  Compulsory Action Required
                </span>
                <h2 className="text-lg font-bold text-white mt-1">
                  Official Google Registration Form
                </h2>
              </div>
            </div>

            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2 text-xs text-slate-300">
              <p className="font-semibold text-amber-200">
                Welcome to ISO Central Repository!
              </p>
              <p>
                As a newly joined member, you must complete the official membership registration form on Google Forms to finalize your profile and record.
              </p>
              <div className="p-2.5 bg-slate-900 border border-slate-700 rounded-xl font-mono text-[11px] text-amber-400 break-all select-all">
                https://forms.gle/7NiEiCtEr5BFsmkY8
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <a
                href="https://forms.gle/7NiEiCtEr5BFsmkY8"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowCompulsoryFormModal(false)}
                className="w-full sm:flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all uppercase tracking-wider text-center"
              >
                <span>Open Google Form Now</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                type="button"
                onClick={() => setShowCompulsoryFormModal(false)}
                className="w-full sm:w-auto px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all"
              >
                I Have Completed It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
