import React, { useState } from 'react';
import { SUPER_ADMIN_INFO, ISO_LOGO_URL } from '../data/initialData';
import {
  ShieldCheck,
  Lock,
  UserPlus,
  Database,
  FileDown,
  FileUp,
  KeyRound,
  CheckCircle2,
  Phone,
  Mail,
  Trash2,
  AlertTriangle,
  Search,
  RefreshCw,
  X,
  Server,
  FileText,
  Calendar,
  Wallet,
  Users,
  Award,
  ShieldAlert,
  Camera
} from 'lucide-react';
import {
  AdminUser,
  Member,
  OfficeBearer,
  DocumentRecord,
  EventRecord,
  DonationRecord,
  AuditLog,
  ActiveTab,
  AdminCredential
} from '../types';
import { CredentialGeneratorModule } from './CredentialGeneratorModule';

interface SuperAdminModuleProps {
  admins: AdminUser[];
  members: Member[];
  officeBearers: OfficeBearer[];
  documents?: DocumentRecord[];
  events?: EventRecord[];
  donations?: DonationRecord[];
  auditLogs?: AuditLog[];
  superAdminPhoto?: string;
  onUpdateSuperAdminPhoto?: (newPhoto: string) => void;
  setActiveTab: (tab: ActiveTab) => void;
  onDeleteMember: (id: string) => void;
  onDeleteOfficeBearer: (id: string) => void;
  onDeleteAdmin: (id: string) => void;
  onDeleteDocument?: (id: string) => void;
  onDeleteEvent?: (id: string) => void;
  onDeleteDonation?: (id: string) => void;
  onDeleteAuditLog?: (id: string) => void;
  onPurgeCategory: (category: string) => void;
  onMasterPurgeAllData: (resetToDefault?: boolean) => void;
  onBackupDatabase: () => void;
  onRestoreDatabase: () => void;
  adminCredentials?: AdminCredential[];
  onGenerateCredential?: (cred: AdminCredential) => void;
  onDeleteCredential?: (mobileNumber: string) => void;
}

export const SuperAdminModule: React.FC<SuperAdminModuleProps> = ({
  admins,
  members,
  officeBearers,
  documents = [],
  events = [],
  donations = [],
  auditLogs = [],
  superAdminPhoto,
  onUpdateSuperAdminPhoto,
  setActiveTab,
  onDeleteMember,
  onDeleteOfficeBearer,
  onDeleteAdmin,
  onDeleteDocument,
  onDeleteEvent,
  onDeleteDonation,
  onDeleteAuditLog,
  onPurgeCategory,
  onMasterPurgeAllData,
  onBackupDatabase,
  onRestoreDatabase,
  adminCredentials = [],
  onGenerateCredential = () => {},
  onDeleteCredential = () => {}
}) => {
  const [activeDeleteTab, setActiveDeleteTab] = useState<
    'search' | 'members' | 'officeBearers' | 'admins' | 'documents' | 'events' | 'donations' | 'auditLogs' | 'masterWipe'
  >('search');

  const [searchTerm, setSearchTerm] = useState('');
  const [itemToDelete, setItemToDelete] = useState<{ type: string; id: string; name: string } | null>(null);
  const [purgeCategoryTarget, setPurgeCategoryTarget] = useState<string | null>(null);
  const [showMasterPurgeModal, setShowMasterPurgeModal] = useState(false);
  const [isResetDefaultMode, setIsResetDefaultMode] = useState(false);

  // Global Quick Search Deletion Filter
  const lowerSearch = searchTerm.toLowerCase();

  const filteredMembers = members.filter(
    (m) =>
      m.id.toLowerCase().includes(lowerSearch) ||
      m.fullName.toLowerCase().includes(lowerSearch) ||
      m.city.toLowerCase().includes(lowerSearch) ||
      m.district.toLowerCase().includes(lowerSearch)
  );

  const filteredOBs = officeBearers.filter(
    (o) =>
      o.id.toLowerCase().includes(lowerSearch) ||
      o.name.toLowerCase().includes(lowerSearch) ||
      o.designation.toLowerCase().includes(lowerSearch) ||
      o.city.toLowerCase().includes(lowerSearch)
  );

  const filteredAdmins = admins.filter(
    (a) =>
      a.id.toLowerCase().includes(lowerSearch) ||
      a.name.toLowerCase().includes(lowerSearch) ||
      a.email.toLowerCase().includes(lowerSearch) ||
      a.role.toLowerCase().includes(lowerSearch)
  );

  const filteredDocs = documents.filter(
    (d) =>
      d.id.toLowerCase().includes(lowerSearch) ||
      d.title.toLowerCase().includes(lowerSearch) ||
      d.category.toLowerCase().includes(lowerSearch)
  );

  const filteredEvents = events.filter(
    (e) =>
      e.id.toLowerCase().includes(lowerSearch) ||
      e.title.toLowerCase().includes(lowerSearch) ||
      e.location.toLowerCase().includes(lowerSearch)
  );

  const filteredDonations = donations.filter(
    (d) =>
      d.id.toLowerCase().includes(lowerSearch) ||
      d.donorName.toLowerCase().includes(lowerSearch) ||
      d.receiptNumber.toLowerCase().includes(lowerSearch)
  );

  const executeItemDelete = () => {
    if (!itemToDelete) return;

    if (itemToDelete.type === 'member') {
      onDeleteMember(itemToDelete.id);
    } else if (itemToDelete.type === 'officeBearer') {
      onDeleteOfficeBearer(itemToDelete.id);
    } else if (itemToDelete.type === 'admin') {
      onDeleteAdmin(itemToDelete.id);
    } else if (itemToDelete.type === 'document' && onDeleteDocument) {
      onDeleteDocument(itemToDelete.id);
    } else if (itemToDelete.type === 'event' && onDeleteEvent) {
      onDeleteEvent(itemToDelete.id);
    } else if (itemToDelete.type === 'donation' && onDeleteDonation) {
      onDeleteDonation(itemToDelete.id);
    } else if (itemToDelete.type === 'auditLog' && onDeleteAuditLog) {
      onDeleteAuditLog(itemToDelete.id);
    }

    setItemToDelete(null);
  };

  const executeCategoryPurge = () => {
    if (!purgeCategoryTarget) return;
    onPurgeCategory(purgeCategoryTarget);
    setPurgeCategoryTarget(null);
  };

  const executeMasterPurge = () => {
    onMasterPurgeAllData(isResetDefaultMode);
    setShowMasterPurgeModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Supreme Authority Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 border border-emerald-800/60 shadow-2xl">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            <div className="relative shrink-0 group">
              {/* Picture 1: Super Admin Portrait */}
              <img
                src={superAdminPhoto || SUPER_ADMIN_INFO.profilePhoto}
                alt={SUPER_ADMIN_INFO.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover ring-4 ring-emerald-500 shadow-2xl"
              />
              {onUpdateSuperAdminPhoto && (
                <label
                  title="Upload / Update My Photo"
                  className="absolute inset-x-0 bottom-0 bg-slate-950/80 backdrop-blur-xs text-emerald-400 hover:text-white py-1 text-[10px] font-bold text-center rounded-b-3xl cursor-pointer flex items-center justify-center gap-1 transition-all opacity-90 hover:opacity-100"
                >
                  <Camera className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Update Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (evt) => {
                          if (evt.target?.result) {
                            onUpdateSuperAdminPhoto(evt.target.result as string);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              )}
              {/* Picture 2: Organization Logo Badge */}
              <img
                src={ISO_LOGO_URL}
                alt="ISO Logo"
                className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full border-2 border-slate-900 object-cover shadow-lg pointer-events-none"
              />
            </div>

            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/40 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Super Administrator Command Center
                </span>
                <span className="text-xs text-slate-400 font-mono">ID: ISO-SUPER-ADMIN-01</span>
              </div>

              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white mt-2">
                {SUPER_ADMIN_INFO.name}
              </h1>
              <p className="text-sm font-bold text-emerald-400 mt-0.5">
                {SUPER_ADMIN_INFO.designation}
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-2 text-xs text-slate-300 font-mono">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" /> {SUPER_ADMIN_INFO.mobileNumber}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-emerald-400" /> {SUPER_ADMIN_INFO.email}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 w-full sm:w-auto shrink-0">
            <button
              onClick={() => setActiveTab('adminRbac')}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all"
            >
              <UserPlus className="w-4 h-4" /> Manage System Admins
            </button>
            <button
              onClick={onBackupDatabase}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-all"
            >
              <Database className="w-4 h-4 text-emerald-400" /> Backup Database Snapshot
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE ID & PASSWORD GENERATOR MODULE */}
      <CredentialGeneratorModule
        adminCredentials={adminCredentials}
        onGenerateCredential={onGenerateCredential}
        onDeleteCredential={onDeleteCredential}
        officeBearers={officeBearers}
      />

      {/* MASTER DELETION & PURGE COMMAND CENTER */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-red-500/30 shadow-xl space-y-6">
        
        {/* Module Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-700/80">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-500/10 text-red-500 rounded-2xl">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                Digital Library Delete & Purge Center
                <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-400 rounded-full border border-red-300 dark:border-red-800">
                  Super Admin Privileged
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Full authority to search, remove individual entries, purge entire categories, or wipe the Digital Library.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setIsResetDefaultMode(false);
              setShowMasterPurgeModal(true);
            }}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all"
          >
            <AlertTriangle className="w-4 h-4" /> Master Library Wipe
          </button>
        </div>

        {/* Delete Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-700/80 pb-3 overflow-x-auto">
          {[
            { id: 'search', label: 'Quick ID & Keyword Search Delete', icon: Search },
            { id: 'members', label: `Members (${members.length})`, icon: Users },
            { id: 'officeBearers', label: `Office Bearers (${officeBearers.length})`, icon: Award },
            { id: 'admins', label: `Admin Users (${admins.length})`, icon: KeyRound },
            { id: 'documents', label: `Documents (${documents.length})`, icon: FileText },
            { id: 'events', label: `Events (${events.length})`, icon: Calendar },
            { id: 'donations', label: `Donations (${donations.length})`, icon: Wallet },
            { id: 'auditLogs', label: `Audit Trail (${auditLogs.length})`, icon: ShieldAlert },
            { id: 'masterWipe', label: 'Master Wipe & Reset', icon: RefreshCw }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeDeleteTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveDeleteTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
                  isActive
                    ? 'bg-red-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: QUICK SEARCH & DIRECT DELETION */}
        {activeDeleteTab === 'search' && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                placeholder="Search by Membership ID, Office Bearer Name, Admin Email, Document Title, Event, or City to delete..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 font-medium"
              />
            </div>

            {searchTerm && (
              <div className="space-y-6">
                {/* Members Search Results */}
                {filteredMembers.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-500" /> Members ({filteredMembers.length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {filteredMembers.map((m) => (
                        <div key={m.id} className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                          <div className="min-w-0 pr-2">
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{m.fullName}</p>
                            <p className="text-[10px] text-slate-500 font-mono">{m.id} • {m.city}</p>
                          </div>
                          <button
                            onClick={() => setItemToDelete({ type: 'member', id: m.id, name: m.fullName })}
                            className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-colors shrink-0"
                            title="Delete Member"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Office Bearers Search Results */}
                {filteredOBs.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Award className="w-4 h-4 text-emerald-500" /> Office Bearers ({filteredOBs.length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {filteredOBs.map((o) => (
                        <div key={o.id} className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                          <div className="min-w-0 pr-2">
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{o.name}</p>
                            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold truncate">{o.designation}</p>
                            <p className="text-[10px] text-slate-500 font-mono">{o.id}</p>
                          </div>
                          <button
                            onClick={() => setItemToDelete({ type: 'officeBearer', id: o.id, name: o.name })}
                            className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-colors shrink-0"
                            title="Delete Office Bearer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Admins Search Results */}
                {filteredAdmins.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-purple-500" /> System Admins ({filteredAdmins.length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {filteredAdmins.map((a) => (
                        <div key={a.id} className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                          <div className="min-w-0 pr-2">
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{a.name}</p>
                            <p className="text-[10px] text-slate-500 font-mono">{a.email}</p>
                          </div>
                          {!a.isSuperAdmin ? (
                            <button
                              onClick={() => setItemToDelete({ type: 'admin', id: a.id, name: a.name })}
                              className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-colors shrink-0"
                              title="Delete Admin Account"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          ) : (
                            <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg">
                              Protected
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Documents Search Results */}
                {filteredDocs.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-amber-500" /> Documents ({filteredDocs.length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {filteredDocs.map((d) => (
                        <div key={d.id} className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                          <div className="min-w-0 pr-2">
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{d.title}</p>
                            <p className="text-[10px] text-amber-600 dark:text-amber-400 font-mono">{d.id} • {d.category}</p>
                          </div>
                          <button
                            onClick={() => setItemToDelete({ type: 'document', id: d.id, name: d.title })}
                            className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-colors shrink-0"
                            title="Delete Document"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Events Search Results */}
                {filteredEvents.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-indigo-500" /> Events ({filteredEvents.length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {filteredEvents.map((e) => (
                        <div key={e.id} className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                          <div className="min-w-0 pr-2">
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{e.title}</p>
                            <p className="text-[10px] text-slate-500 font-mono">{e.id} • {e.city}</p>
                          </div>
                          <button
                            onClick={() => setItemToDelete({ type: 'event', id: e.id, name: e.title })}
                            className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-colors shrink-0"
                            title="Delete Event"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Donations Search Results */}
                {filteredDonations.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Wallet className="w-4 h-4 text-emerald-500" /> Donations ({filteredDonations.length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {filteredDonations.map((dn) => (
                        <div key={dn.id} className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                          <div className="min-w-0 pr-2">
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{dn.donorName}</p>
                            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                              {dn.currency} {dn.amount.toLocaleString()} • {dn.receiptNumber}
                            </p>
                          </div>
                          <button
                            onClick={() => setItemToDelete({ type: 'donation', id: dn.id, name: `Receipt ${dn.receiptNumber} (${dn.donorName})` })}
                            className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-colors shrink-0"
                            title="Delete Donation Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {filteredMembers.length === 0 &&
                  filteredOBs.length === 0 &&
                  filteredAdmins.length === 0 &&
                  filteredDocs.length === 0 &&
                  filteredEvents.length === 0 &&
                  filteredDonations.length === 0 && (
                    <div className="p-8 text-center bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                      <p className="text-xs text-slate-500">No records matching "{searchTerm}" found in Digital Library.</p>
                    </div>
                  )}
              </div>
            )}

            {!searchTerm && (
              <div className="p-6 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
                <Search className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Quick ID & Keyword Direct Deletion</p>
                <p className="text-[11px] text-slate-500 mt-1 max-w-lg mx-auto">
                  Type any member ID (e.g. ISO-MEM-2026-001), office bearer name, email, or receipt number above to filter and delete specific records instantly.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MEMBERS CATEGORY DELETE */}
        {activeDeleteTab === 'members' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Members Directory ({members.length} Registered)</h3>
                <p className="text-xs text-slate-500">Delete individual member profiles or purge all members.</p>
              </div>
              <button
                onClick={() => setPurgeCategoryTarget('members')}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" /> Purge All Members
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
              {members.map((m) => (
                <div key={m.id} className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {m.profilePhoto && (
                      <img src={m.profilePhoto} alt={m.fullName} className="w-8 h-8 rounded-full object-cover" />
                    )}
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{m.fullName}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{m.id} • {m.city}, {m.district}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setItemToDelete({ type: 'member', id: m.id, name: m.fullName })}
                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: OFFICE BEARERS CATEGORY DELETE */}
        {activeDeleteTab === 'officeBearers' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Office Bearers Cabinet ({officeBearers.length} Active)</h3>
                <p className="text-xs text-slate-500">Vacate appointments or purge all office bearers.</p>
              </div>
              <button
                onClick={() => setPurgeCategoryTarget('officeBearers')}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" /> Purge All Office Bearers
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
              {officeBearers.map((o) => (
                <div key={o.id} className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{o.name}</p>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">{o.designation}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{o.id} • {o.city}</p>
                  </div>
                  <button
                    onClick={() => setItemToDelete({ type: 'officeBearer', id: o.id, name: o.name })}
                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: ADMIN USERS DELETE */}
        {activeDeleteTab === 'admins' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">System Admin Accounts ({admins.length})</h3>
                <p className="text-xs text-slate-500">Revoke permissions or purge secondary admin accounts.</p>
              </div>
              <button
                onClick={() => setPurgeCategoryTarget('admins')}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" /> Purge Non-Super Admins
              </button>
            </div>

            <div className="space-y-2">
              {admins.map((a) => (
                <div key={a.id} className="p-3.5 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-extrabold text-slate-900 dark:text-white">{a.name}</p>
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${a.isSuperAdmin ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'}`}>
                        {a.role}
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">{a.designation}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{a.email} • {a.phone}</p>
                  </div>

                  {!a.isSuperAdmin ? (
                    <button
                      onClick={() => setItemToDelete({ type: 'admin', id: a.id, name: a.name })}
                      className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Delete Admin"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  ) : (
                    <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                      Sole Super Admin
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: DOCUMENTS DELETE */}
        {activeDeleteTab === 'documents' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Documents Repository ({documents.length})</h3>
                <p className="text-xs text-slate-500">Delete constitution files, resolutions, or notifications.</p>
              </div>
              <button
                onClick={() => setPurgeCategoryTarget('documents')}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" /> Purge All Documents
              </button>
            </div>

            <div className="space-y-2">
              {documents.map((d) => (
                <div key={d.id} className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{d.title}</p>
                    <p className="text-[10px] text-amber-600 dark:text-amber-400 font-mono">{d.id} • {d.category} • Issued by {d.issuedBy}</p>
                  </div>
                  <button
                    onClick={() => setItemToDelete({ type: 'document', id: d.id, name: d.title })}
                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: EVENTS DELETE */}
        {activeDeleteTab === 'events' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Events & Conventions ({events.length})</h3>
                <p className="text-xs text-slate-500">Delete upcoming or completed conventions.</p>
              </div>
              <button
                onClick={() => setPurgeCategoryTarget('events')}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" /> Purge All Events
              </button>
            </div>

            <div className="space-y-2">
              {events.map((e) => (
                <div key={e.id} className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{e.title}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{e.id} • {e.date} • {e.location}, {e.city}</p>
                  </div>
                  <button
                    onClick={() => setItemToDelete({ type: 'event', id: e.id, name: e.title })}
                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: DONATIONS DELETE */}
        {activeDeleteTab === 'donations' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Donation Ledger ({donations.length})</h3>
                <p className="text-xs text-slate-500">Remove financial transactions or chanda entries.</p>
              </div>
              <button
                onClick={() => setPurgeCategoryTarget('donations')}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" /> Purge All Donations
              </button>
            </div>

            <div className="space-y-2">
              {donations.map((dn) => (
                <div key={dn.id} className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{dn.donorName}</p>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                      {dn.currency} {dn.amount.toLocaleString()} • Receipt: {dn.receiptNumber} ({dn.date})
                    </p>
                  </div>
                  <button
                    onClick={() => setItemToDelete({ type: 'donation', id: dn.id, name: `Receipt ${dn.receiptNumber}` })}
                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 8: AUDIT LOGS DELETE */}
        {activeDeleteTab === 'auditLogs' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Audit Trail Logs ({auditLogs.length})</h3>
                <p className="text-xs text-slate-500">Delete specific audit entries or clear full log history.</p>
              </div>
              <button
                onClick={() => setPurgeCategoryTarget('auditLogs')}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear Audit Logs
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{log.action}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{log.details}</p>
                    <p className="text-[9px] text-slate-400">{new Date(log.timestamp).toLocaleString()} • {log.performedBy}</p>
                  </div>
                  <button
                    onClick={() => setItemToDelete({ type: 'auditLog', id: log.id, name: `Log ${log.action}` })}
                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 9: MASTER WIPE & RESET */}
        {activeDeleteTab === 'masterWipe' && (
          <div className="p-6 bg-red-50 dark:bg-red-950/30 rounded-3xl border border-red-300 dark:border-red-900 space-y-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400 shrink-0" />
              <div>
                <h3 className="text-base font-extrabold text-red-900 dark:text-red-200">
                  Master System Wipe & Reset Controls
                </h3>
                <p className="text-xs text-red-700 dark:text-red-300 mt-0.5">
                  Execute extreme database operations reserved exclusively for Super Administrator Syed Muhammad Aamir Naqvi Al Bukhari.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-red-200 dark:border-red-900/60 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-amber-500" /> Reset to Initial Default Seeds
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Restores default members, office bearers, constitution documents, and initial audit records.
                </p>
                <button
                  onClick={() => {
                    setIsResetDefaultMode(true);
                    setShowMasterPurgeModal(true);
                  }}
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
                >
                  Reset Digital Library Seeds
                </button>
              </div>

              <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-red-200 dark:border-red-900/60 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-red-500" /> Complete Clean Slate Purge
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Permanently deletes ALL members, office bearers, documents, events, and donation records.
                </p>
                <button
                  onClick={() => {
                    setIsResetDefaultMode(false);
                    setShowMasterPurgeModal(true);
                  }}
                  className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
                >
                  Wipe & Purge Entire Library
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Permissions Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Supreme Rights Card */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-700/80 mb-4">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Super Administrator Privileges</h3>
          </div>

          <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
            {[
              'Delete Any Record Across All Modules',
              'Category-Wise Bulk Data Purging',
              'Master Digital Library Wipe & Reset',
              'Create & Manage Secondary Admins',
              'RBAC Matrix & Permission Grants',
              'Full JSON Database Backup & Restore',
              'Intellectual Property & Licensing Control',
              'Audit Trail Oversight & Security Logs'
            ].map((perm, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="font-semibold">{perm}</span>
              </div>
            ))}
          </div>
        </div>

        {/* System Admins Roster */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700/80 mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-emerald-600" /> System Admin Roster
              </h3>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full">
                {admins.length} Accounts
              </span>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {admins.map((adm) => (
                <div key={adm.id} className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">{adm.name}</h4>
                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${adm.isSuperAdmin ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'}`}>
                      {adm.role}
                    </span>
                  </div>
                  <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">{adm.designation}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-1">{adm.phone} • {adm.email}</p>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setActiveTab('adminRbac')}
            className="w-full mt-4 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold text-xs rounded-xl transition-colors"
          >
            RBAC Permission Matrix
          </button>
        </div>

        {/* Multi-Cloud Infrastructure & Backup */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-700/80 mb-4">
              <Server className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Multi-Cloud Storage & Backup</h3>
            </div>

            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 mb-4">
              <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Firestore & PostgreSQL Ready</p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
                Database persistence is synced locally and prepared for Cloud SQL or Firestore deployment.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <button
                onClick={onBackupDatabase}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md"
              >
                <FileDown className="w-4 h-4" /> Download Complete Backup (.json)
              </button>
              <button
                onClick={onRestoreDatabase}
                className="w-full py-2.5 px-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <FileUp className="w-4 h-4" /> Restore Database Snapshot
              </button>
            </div>
          </div>

          <div className="mt-4 text-[10px] text-slate-400 text-center font-mono">
            Command Center: Syed Muhammad Aamir Naqvi Al Bukhari
          </div>
        </div>
      </div>

      {/* CONFIRM INDIVIDUAL ITEM DELETE MODAL */}
      {itemToDelete && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Confirm Deletion</h3>
              </div>
              <button onClick={() => setItemToDelete(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to delete <span className="font-extrabold text-red-500">"{itemToDelete.name}"</span> (ID: {itemToDelete.id}) from the ISO Digital Library database?
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setItemToDelete(null)}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={executeItemDelete}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-lg"
              >
                Yes, Delete Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM CATEGORY PURGE MODAL */}
      {purgeCategoryTarget && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-red-500/40 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Category Purge Warning</h3>
              </div>
              <button onClick={() => setPurgeCategoryTarget(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Super Administrator Action: You are about to purge all records in category <span className="font-extrabold text-red-500 uppercase">"{purgeCategoryTarget}"</span>.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setPurgeCategoryTarget(null)}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={executeCategoryPurge}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-lg"
              >
                Confirm Category Purge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MASTER PURGE MODAL */}
      {showMasterPurgeModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-red-500 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-6 h-6" />
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {isResetDefaultMode ? 'Reset Digital Library to Seeds' : 'MASTER DIGITAL LIBRARY PURGE'}
                </h3>
              </div>
              <button onClick={() => setShowMasterPurgeModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-red-50 dark:bg-red-950/50 rounded-2xl border border-red-200 dark:border-red-900 text-xs text-red-800 dark:text-red-200 leading-relaxed space-y-2">
              <p className="font-extrabold">SUPER ADMINISTRATOR SECURITY NOTICE:</p>
              <p>
                {isResetDefaultMode
                  ? 'This operation will reset all active datasets (Members, Office Bearers, Documents, Events, Donations, Admins) back to default initial seeds.'
                  : 'This operation will execute a complete wipe of all Member records, Office Bearers, Documents, Events, and Donations in the Digital Library!'}
              </p>
              <p className="font-mono text-[10px] text-red-600 dark:text-red-400">
                Authorized by: Syed Muhammad Aamir Naqvi Al Bukhari (Chairman IT Support Council)
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowMasterPurgeModal(false)}
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
              >
                Cancel / Abort
              </button>
              <button
                onClick={executeMasterPurge}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-xl"
              >
                {isResetDefaultMode ? 'Confirm Seed Reset' : 'YES, EXECUTE MASTER PURGE'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
