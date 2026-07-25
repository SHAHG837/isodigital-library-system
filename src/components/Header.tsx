import React, { useState } from 'react';
import { ISO_LOGO_URL, SUPER_ADMIN_INFO } from '../data/initialData';
import { Search, Sun, Moon, Shield, Bell, Lock, User, KeyRound, CheckCircle2, Menu, Camera, Globe, Building2, Phone, Check, ExternalLink, LogOut } from 'lucide-react';
import { ActiveTab, AdminUser, RegistrationNotification, AdminCredential } from '../types';

interface HeaderProps {
  activeTab?: ActiveTab;
  setActiveTab?: (tab: ActiveTab) => void;
  isDarkMode?: boolean;
  setIsDarkMode?: (val: boolean) => void;
  darkMode?: boolean;
  setDarkMode?: (val: boolean) => void;
  currentUser?: AdminUser;
  currentLoggedInUser?: AdminCredential | null;
  onLogout?: () => void;
  superAdminInfo?: typeof SUPER_ADMIN_INFO;
  onUpdateSuperAdminPhoto?: (newPhoto: string) => void;
  globalSearchTerm?: string;
  setGlobalSearchTerm?: (term: string) => void;
  onOpenGlobalSearch?: () => void;
  onToggleSidebar?: () => void;
  registrationNotifications?: RegistrationNotification[];
  onMarkNotificationRead?: (id: string) => void;
  onClearNotifications?: () => void;
  onOpenPortal?: (defaultPortal?: 'member' | 'official' | 'adminLogin') => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isDarkMode,
  setIsDarkMode,
  darkMode,
  setDarkMode,
  currentUser = {
    id: 'ADMIN-001',
    name: SUPER_ADMIN_INFO.name,
    email: 'admin@iso.org',
    phone: SUPER_ADMIN_INFO.mobileNumber,
    designation: SUPER_ADMIN_INFO.designation,
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
    createdDate: '2026-01-01'
  },
  currentLoggedInUser,
  onLogout,
  superAdminInfo,
  onUpdateSuperAdminPhoto,
  globalSearchTerm = '',
  setGlobalSearchTerm,
  onOpenGlobalSearch,
  onToggleSidebar,
  registrationNotifications = [],
  onMarkNotificationRead,
  onClearNotifications,
  onOpenPortal
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [localSearch, setLocalSearch] = useState('');

  const unreadCount = registrationNotifications.filter((n) => !n.isRead).length;

  const currentDark = isDarkMode !== undefined ? isDarkMode : darkMode !== undefined ? darkMode : true;
  const handleToggleDark = () => {
    if (setIsDarkMode) setIsDarkMode(!currentDark);
    else if (setDarkMode) setDarkMode(!currentDark);
  };


  const isSuperAdmin = currentLoggedInUser?.isSuperAdmin || currentLoggedInUser?.role === 'SuperAdmin';
  const isAdminOrManager = isSuperAdmin || currentLoggedInUser?.role === 'Admin' || currentLoggedInUser?.role === 'Manager';
  const isRegularMember = Boolean(currentLoggedInUser && !isAdminOrManager);

  const displayUserName = currentLoggedInUser?.name || SUPER_ADMIN_INFO.name;
  const displayUserDesignation = currentLoggedInUser?.designation || SUPER_ADMIN_INFO.designation;
  const displayUserRole = currentLoggedInUser?.role || (currentUser.isSuperAdmin ? 'SuperAdmin' : currentUser.role);
  const displayUserMobile = currentLoggedInUser?.mobileNumber || SUPER_ADMIN_INFO.mobileNumber;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onOpenGlobalSearch) {
      onOpenGlobalSearch();
    } else if (setActiveTab) {
      setActiveTab('globalSearch');
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 md:px-8 text-slate-200 shadow-sm transition-colors">
      
      {/* Left: Mobile Sidebar Toggle & Branding */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => setActiveTab && setActiveTab('dashboard')}
        >
          <img
            src={ISO_LOGO_URL}
            alt="International Sadat Organization Logo"
            className="w-10 h-10 rounded-full object-cover shadow-lg ring-2 ring-emerald-500/40 shrink-0"
          />
          <div className="hidden sm:block">
            <h1 className="text-sm font-bold text-white leading-tight">
              INTERNATIONAL SADAT ORGANIZATION
            </h1>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide">
              Digital Library & Central Repository
            </p>
          </div>
        </div>
      </div>

      {/* Center: Global Search Input */}
      <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Advanced Global Search (ID, Name, District...)"
            value={setGlobalSearchTerm ? globalSearchTerm : localSearch}
            onChange={(e) => {
              if (setGlobalSearchTerm) setGlobalSearchTerm(e.target.value);
              else setLocalSearch(e.target.value);
            }}
            className="bg-slate-800/60 border border-slate-700/80 text-xs rounded-full py-2 pl-10 pr-16 w-full focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-100 placeholder-slate-400 transition-all"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] rounded-full transition-colors"
          >
            Search
          </button>
        </div>
      </form>

      {/* Right: Actions, System Status & Admin Profile */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        
        {/* Public Portals & Self-Service Registration Launcher */}
        {onOpenPortal && (
          <button
            onClick={() => onOpenPortal('member')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all scale-100 hover:scale-105"
            title="Open Member & Cabinet Self-Service Registration Portals"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Portals & Login</span>
          </button>
        )}

        {/* System Health Status Indicator */}
        <div className="hidden xl:flex items-center space-x-2 bg-slate-800/40 px-3 py-1.5 rounded-full border border-slate-700/60">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-medium text-slate-300">System Stable</span>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={handleToggleDark}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors"
          title={currentDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {currentDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
        </button>

        {/* Notifications Dropdown (Admin Only) */}
        {!isRegularMember && (
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-lg relative transition-colors"
              title="Real-Time Super Admin Registration Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-bounce shadow-md">
                  {unreadCount}
                </span>
              )}
            </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-88 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Registration Alerts</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    {registrationNotifications.length} Total
                  </span>
                  {onClearNotifications && registrationNotifications.length > 0 && (
                    <button
                      onClick={onClearNotifications}
                      className="text-[10px] text-slate-400 hover:text-red-400 underline"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="divide-y divide-slate-800 mt-2 max-h-80 overflow-y-auto space-y-1">
                {registrationNotifications.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center italic">
                    No new portal logins or registrations yet.
                  </p>
                ) : (
                  registrationNotifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        if (onMarkNotificationRead) onMarkNotificationRead(n.id);
                        if (setActiveTab) {
                          setActiveTab(n.type === 'OfficeBearer' ? 'officeBearers' : 'members');
                        }
                        setShowNotifications(false);
                      }}
                      className={`p-2.5 rounded-xl transition-all cursor-pointer border ${
                        !n.isRead
                          ? 'bg-indigo-950/40 border-indigo-500/30 text-white'
                          : 'bg-slate-800/30 border-transparent text-slate-300 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          {n.type === 'OfficeBearer' ? (
                            <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          ) : (
                            <User className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          )}
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${
                            n.type === 'OfficeBearer' ? 'text-emerald-400' : 'text-indigo-400'
                          }`}>
                            {n.type === 'OfficeBearer' ? 'Cabinet Official' : 'Normal Member'}
                          </span>
                        </div>
                        <span className="text-[9px] text-slate-400 font-mono">
                          {new Date(n.registeredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <p className="text-xs font-bold text-white mt-1">{n.name}</p>
                      
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-300 mt-1">
                        <span className="flex items-center gap-1">
                          📍 <strong>{n.cityName}</strong>
                        </span>
                        <span className="flex items-center gap-1 font-mono text-slate-400">
                          <Phone className="w-3 h-3 text-slate-500" /> {n.mobileNumber}
                        </span>
                        {n.whatsappNumber && (
                          <span className="text-emerald-400 font-mono">
                            WA: {n.whatsappNumber}
                          </span>
                        )}
                      </div>

                      {n.designation && (
                        <p className="text-[10px] text-emerald-300 font-semibold mt-1">
                          Role: {n.designation}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        )}

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserModal(!showUserModal)}
            className="flex items-center space-x-2.5 p-1.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition-all"
          >
            <img
              src={superAdminInfo?.profilePhoto || SUPER_ADMIN_INFO.profilePhoto}
              alt={displayUserName}
              className="w-7 h-7 rounded-full object-cover border border-indigo-400"
            />
            <div className="hidden lg:block text-left pr-1">
              <p className="text-xs font-bold text-white leading-tight truncate max-w-[120px]">
                {displayUserName}
              </p>
              <p className="text-[9px] text-indigo-400 font-semibold uppercase tracking-tight">
                {displayUserRole}
              </p>
            </div>
          </button>

          {showUserModal && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 z-50">
              <div className="text-center pb-4 border-b border-slate-800 relative">
                <div className="relative inline-block group">
                  <img
                    src={superAdminInfo?.profilePhoto || SUPER_ADMIN_INFO.profilePhoto}
                    alt={displayUserName}
                    className="w-16 h-16 rounded-full object-cover mx-auto ring-2 ring-indigo-500/50 shadow-md mb-2"
                  />
                  {onUpdateSuperAdminPhoto && !isRegularMember && (
                    <label
                      title="Upload / Update My Photo"
                      className="absolute bottom-1 right-0 bg-indigo-600 hover:bg-indigo-500 text-white p-1 rounded-full shadow-lg cursor-pointer flex items-center justify-center transition-transform hover:scale-110"
                    >
                      <Camera className="w-3.5 h-3.5" />
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
                </div>
                <h4 className="text-sm font-bold text-white">{displayUserName}</h4>
                <p className="text-xs font-semibold text-indigo-400 mt-0.5">{displayUserDesignation}</p>
                <p className="text-xs text-slate-400 mt-1 font-mono">Mobile: {displayUserMobile}</p>
              </div>

              <div className="py-3 text-xs space-y-2">
                <div className="flex justify-between items-center bg-slate-800/50 p-2.5 rounded-lg border border-slate-700/60">
                  <span className="text-slate-400">Control Privilege:</span>
                  <span className={`font-bold flex items-center gap-1 ${isRegularMember ? 'text-emerald-400' : 'text-indigo-400'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {isRegularMember ? 'Member Gate' : 'Full Admin Access'}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-2">
                {!isRegularMember ? (
                  <button
                    onClick={() => {
                      if (setActiveTab) setActiveTab('superAdmin');
                      setShowUserModal(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors shadow-lg shadow-indigo-500/20"
                  >
                    <Shield className="w-4 h-4" /> Super Admin Control Panel
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (setActiveTab) setActiveTab('members');
                      setShowUserModal(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-colors shadow-lg shadow-emerald-500/20"
                  >
                    <User className="w-4 h-4" /> My Member Particulars
                  </button>
                )}

                {onLogout && (
                  <button
                    onClick={() => {
                      setShowUserModal(false);
                      onLogout();
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold text-red-400 bg-red-950/40 hover:bg-red-900/50 border border-red-800/60 rounded-xl transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Logout Session
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Direct Logout Action Button */}
        {onLogout && (
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold transition-all shadow-sm"
            title="Log Out & Secure Central Repository"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        )}

      </div>
    </header>
  );
};
