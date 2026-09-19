import React, { useState } from 'react';
import { ISO_LOGO_URL } from '../data/initialData';
import {
  LayoutDashboard,
  Users,
  Award,
  Network,
  ShieldCheck,
  UserCheck,
  Search,
  FileSpreadsheet,
  GitBranch,
  FileText,
  CreditCard,
  QrCode,
  Calendar,
  Wallet,
  ClipboardList,
  Bot,
  ShieldAlert,
  Database,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  LogOut,
  Briefcase,
  FileCheck2,
  Bookmark,
  Sparkles
} from 'lucide-react';
import { ActiveTab, AdminCredential } from '../types';
import { SUPER_ADMIN_INFO } from '../data/initialData';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isOpen?: boolean;
  onClose?: () => void;
  collapsed?: boolean;
  setCollapsed?: (val: boolean) => void;
  superAdminInfo?: typeof SUPER_ADMIN_INFO;
  currentLoggedInUser?: AdminCredential | null;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen = true,
  onClose,
  collapsed: externalCollapsed,
  setCollapsed: externalSetCollapsed,
  superAdminInfo,
  currentLoggedInUser,
  onLogout
}) => {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const collapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed;
  const setCollapsed = externalSetCollapsed || setInternalCollapsed;

  const isSuperAdmin = currentLoggedInUser?.isSuperAdmin || currentLoggedInUser?.role === 'SuperAdmin';
  const isAdminOrManager = isSuperAdmin || currentLoggedInUser?.role === 'Admin' || currentLoggedInUser?.role === 'Manager';
  const isRegularMember = Boolean(currentLoggedInUser && !isAdminOrManager);

  const fullNavSections = [
    {
      title: 'Career & Opportunities',
      items: [
        { id: 'opportunities' as ActiveTab, label: 'Opportunities & Jobs', icon: Briefcase, badge: 'Supabase' },
        { id: 'myApplications' as ActiveTab, label: 'My Applications', icon: FileCheck2 },
        { id: 'savedOpportunities' as ActiveTab, label: 'Saved Bookmarks', icon: Bookmark },
        { id: 'supabaseConfig' as ActiveTab, label: 'Supabase & SQL', icon: Database, badge: 'Postgres' }
      ]
    },
    {
      title: 'Navigation',
      items: [
        { id: 'dashboard' as ActiveTab, label: isRegularMember ? 'Member Dashboard' : 'Dashboard', icon: LayoutDashboard },
        { id: 'members' as ActiveTab, label: isRegularMember ? 'My Member Particulars' : 'Members Directory', icon: Users, badge: isRegularMember ? 'Personal' : 'Records' },
        ...(isRegularMember ? [] : [{ id: 'officeBearers' as ActiveTab, label: 'Office Bearers', icon: Award }]),
        { id: 'hierarchy' as ActiveTab, label: 'Organization Hierarchy', icon: Network }
      ]
    },
    ...(!isRegularMember ? [
      {
        title: 'Systems & Security',
        items: [
          { id: 'superAdmin' as ActiveTab, label: 'Super Administrator', icon: ShieldCheck, highlight: true },
          { id: 'adminRbac' as ActiveTab, label: 'Admin Security', icon: UserCheck },
          { id: 'globalSearch' as ActiveTab, label: 'Global Search', icon: Search },
          { id: 'exportImport' as ActiveTab, label: 'Import / Export', icon: FileSpreadsheet },
          { id: 'googleSheets' as ActiveTab, label: 'Google Sheets & Drive', icon: FileSpreadsheet, badge: 'Live API' }
        ]
      }
    ] : []),
    {
      title: 'Digital Services',
      items: [
        { id: 'shajra' as ActiveTab, label: 'Shajra Lineage', icon: GitBranch },
        { id: 'membershipCard' as ActiveTab, label: isRegularMember ? 'My Membership Card' : 'Card Generator', icon: CreditCard },
        { id: 'events' as ActiveTab, label: 'Events & Conventions', icon: Calendar },
        { id: 'aiAssistant' as ActiveTab, label: 'AI Search Assistant', icon: Bot, badge: 'Gemini' },
        ...(!isRegularMember ? [
          { id: 'documents' as ActiveTab, label: 'Digital Documents', icon: FileText },
          { id: 'qrGenerator' as ActiveTab, label: 'QR Generator', icon: QrCode },
          { id: 'donations' as ActiveTab, label: 'Donation Ledger', icon: Wallet },
          { id: 'attendance' as ActiveTab, label: 'Attendance Logger', icon: ClipboardList }
        ] : [])
      ]
    },
    ...(!isRegularMember ? [
      {
        title: 'Audit & Backup',
        items: [
          { id: 'auditLogs' as ActiveTab, label: 'Audit Logs & Activity', icon: ShieldAlert },
          { id: 'backupSettings' as ActiveTab, label: 'Database Snapshot', icon: Database }
        ]
      }
    ] : [])
  ];

  const navSections = fullNavSections;

  const handleTabClick = (id: ActiveTab) => {
    setActiveTab(id);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && onClose && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-30 lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 bg-slate-900/90 dark:bg-slate-900/60 backdrop-blur-md text-slate-200 border-r border-slate-800 transition-all duration-300 flex flex-col h-full ${
          collapsed ? 'w-20' : 'w-64'
        } ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Sidebar Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden cursor-pointer" onClick={() => handleTabClick('dashboard')}>
            <img
              src={ISO_LOGO_URL}
              alt="ISO Logo"
              className="w-10 h-10 rounded-full object-cover shadow-lg ring-2 ring-emerald-500/40 shrink-0"
            />
            {!collapsed && (
              <div className="min-w-0">
                <h1 className="text-sm font-bold text-white leading-tight truncate">Digital Library</h1>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest truncate font-medium">Management System</p>
              </div>
            )}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {onClose && (
            <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 p-3 space-y-5 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {!collapsed && (
                <div className="text-[10px] uppercase font-semibold text-slate-400 px-3 mb-1.5 tracking-wider">
                  {section.title}
                </div>
              )}
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-600/20 text-indigo-400 font-bold border border-indigo-500/30 shadow-sm shadow-indigo-500/10'
                        : item.highlight
                        ? 'bg-slate-800/80 text-indigo-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                    {!collapsed && <span className="truncate flex-1 text-left">{item.label}</span>}
                    {!collapsed && item.badge && (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User Status Widget */}
        {!collapsed && (
          <div className="p-3 mt-auto border-t border-slate-800/80">
            <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/80 flex items-center justify-between space-x-2">
              <div className="flex items-center space-x-2.5 min-w-0">
                <img
                  src={currentLoggedInUser?.profilePhoto || superAdminInfo?.profilePhoto || SUPER_ADMIN_INFO.profilePhoto}
                  alt={currentLoggedInUser?.name || SUPER_ADMIN_INFO.name}
                  className="w-8 h-8 rounded-full object-cover border-2 border-indigo-500/80 shadow-md shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate leading-tight">{currentLoggedInUser?.name || SUPER_ADMIN_INFO.name}</p>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5 font-medium">{currentLoggedInUser?.designation || SUPER_ADMIN_INFO.designation}</p>
                </div>
              </div>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/50 border border-red-800/40 rounded-lg transition-colors shrink-0"
                  title="Logout Session"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
