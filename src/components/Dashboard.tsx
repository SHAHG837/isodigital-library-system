import React from 'react';
import {
  Users,
  Award,
  MapPin,
  Building2,
  ShieldCheck,
  Search,
  FileDown,
  Plus,
  Phone,
  Mail,
  UserCheck,
  Activity,
  ArrowUpRight,
  Sparkles,
  Network,
  LogOut,
  CheckCircle2,
  ExternalLink,
  FileText
} from 'lucide-react';
import { Member, OfficeBearer, ActiveTab, AuditLog, AdminCredential } from '../types';
import { SUPER_ADMIN_INFO, ISO_LOGO_URL } from '../data/initialData';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from 'recharts';

interface DashboardProps {
  members: Member[];
  officeBearers: OfficeBearer[];
  auditLogs: AuditLog[];
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAddMember: () => void;
  onOpenAddOfficeBearer: () => void;
  superAdminInfo?: typeof SUPER_ADMIN_INFO;
  currentLoggedInUser?: AdminCredential | null;
  welcomeNote?: string | null;
  onDismissWelcomeNote?: () => void;
  onLogout?: () => void;
  onOpenCompulsoryForm?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  members,
  officeBearers,
  auditLogs,
  setActiveTab,
  onOpenAddMember,
  onOpenAddOfficeBearer,
  superAdminInfo,
  currentLoggedInUser,
  welcomeNote,
  onDismissWelcomeNote,
  onLogout,
  onOpenCompulsoryForm
}) => {
  // Compute permissions
  const isSuperAdmin = currentLoggedInUser?.isSuperAdmin || currentLoggedInUser?.role === 'SuperAdmin';
  const isAdminOrManager = isSuperAdmin || currentLoggedInUser?.role === 'Admin' || currentLoggedInUser?.role === 'Manager';
  const isRegularMember = Boolean(currentLoggedInUser && !isAdminOrManager);

  // Compute key stats
  const totalMembers = members.length;
  const totalOfficeBearers = officeBearers.length;

  const districtsSet = new Set([
    ...members.map((m) => m.district).filter(Boolean),
    ...officeBearers.map((o) => o.district).filter(Boolean)
  ]);
  const totalDistricts = districtsSet.size;

  const divisionsSet = new Set([
    ...members.map((m) => m.division).filter(Boolean),
    ...officeBearers.map((o) => o.division).filter(Boolean)
  ]);
  const totalDivisions = divisionsSet.size;

  // Chart 1: Members by Province
  const provinceCounts: { [key: string]: number } = {};
  members.forEach((m) => {
    const prov = m.province || 'Other';
    provinceCounts[prov] = (provinceCounts[prov] || 0) + 1;
  });
  const provinceChartData = Object.keys(provinceCounts).map((prov) => ({
    name: prov,
    count: provinceCounts[prov]
  }));

  // Chart 2: Office Bearers by Level
  const designationCounts: { [key: string]: number } = {};
  officeBearers.forEach((o) => {
    const desg = o.designation || 'Other';
    designationCounts[desg] = (designationCounts[desg] || 0) + 1;
  });
  const designationChartData = Object.keys(designationCounts).map((d) => ({
    name: d.length > 18 ? d.substring(0, 16) + '...' : d,
    fullName: d,
    count: designationCounts[d]
  }));

  const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#06B6D4', '#64748B'];

  return (
    <div className="space-y-6">
      
      {/* Personalized Login Welcome Note Banner */}
      {currentLoggedInUser && welcomeNote && (
        <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900/90 to-indigo-950/80 border-2 border-emerald-500/50 p-5 rounded-2xl shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-2xl shrink-0 shadow-lg">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/40">
                  Authentication Verified
                </span>
                <span className="text-xs text-slate-400 font-mono">Mobile ID: {currentLoggedInUser.mobileNumber}</span>
              </div>
              <h2 className="text-base font-extrabold text-white mt-1 flex items-center gap-2">
                <span>{welcomeNote}</span>
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Role: <strong className="text-emerald-400">{currentLoggedInUser.role}</strong> • Designation: <strong className="text-indigo-300">{currentLoggedInUser.designation}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-center">
            {onLogout && (
              <button
                onClick={onLogout}
                className="px-3.5 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/40 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-sm shrink-0"
              >
                <LogOut className="w-4 h-4" /> Logout Session
              </button>
            )}
            {onDismissWelcomeNote && (
              <button
                onClick={onDismissWelcomeNote}
                className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-xl transition-colors"
                title="Dismiss Welcome Note"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      {/* Compulsory Google Registration Form Banner for All Joined Members */}
      <div className="bg-gradient-to-r from-amber-950/90 via-slate-900 to-amber-950/90 border-2 border-amber-500/80 p-5 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded-xl shrink-0 mt-0.5 shadow-md">
            <FileText className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/40">
                Compulsory Requirement
              </span>
              <span className="text-xs text-amber-200/90 font-bold">Official Registration Form</span>
            </div>
            <h3 className="text-sm font-extrabold text-amber-100">
              Mandatory Member Form: All newly joined members must fill this official Google Form
            </h3>
            <p className="text-xs text-amber-200/80 font-mono text-[11px] break-all">
              Official Form Link:{' '}
              <a
                href="https://forms.gle/kssywCw3z7WWd3516"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-bold text-amber-300 hover:text-white"
              >
                https://forms.gle/kssywCw3z7WWd3516
              </a>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0 self-end md:self-center">
          {onOpenCompulsoryForm && (
            <button
              onClick={onOpenCompulsoryForm}
              className="px-4 py-2.5 bg-slate-850 hover:bg-slate-800 text-amber-300 border border-amber-500/40 font-bold text-xs rounded-xl shadow transition-all cursor-pointer"
            >
              Fill Inside Portal
            </button>
          )}
          <a
            href="https://forms.gle/kssywCw3z7WWd3516"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all uppercase tracking-wider"
          >
            <span>Open Google Form</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Sleek Interface Top Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900/50 border border-slate-800 p-6 text-white shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={ISO_LOGO_URL}
              alt="ISO Logo"
              className="w-14 h-14 rounded-full object-cover shadow-lg ring-2 ring-emerald-500/40 shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30">
                  Central System
                </span>
                <span className="text-xs text-slate-400 font-mono">ID: ISO-2026-PROD</span>
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-white mt-1">
                ISO Digital Library Management System
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Centralized Organizational Repository for Member Records, Office Bearers, and Security Logs.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {!isRegularMember ? (
              <>
                <button
                  onClick={onOpenAddMember}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all"
                >
                  <Plus className="w-4 h-4" /> Add Member
                </button>
                <button
                  onClick={onOpenAddOfficeBearer}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-lg border border-slate-700 flex items-center gap-2 transition-all"
                >
                  <Award className="w-4 h-4 text-indigo-400" /> Add Office Bearer
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setActiveTab('members')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all"
                >
                  <Users className="w-4 h-4" /> My Member Particulars
                </button>
                <button
                  onClick={() => setActiveTab('membershipCard')}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-lg border border-slate-700 flex items-center gap-2 transition-all"
                >
                  <Award className="w-4 h-4 text-emerald-400" /> My Membership Card
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 4-Column Sleek Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Members */}
        <div
          onClick={() => setActiveTab('members')}
          className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between h-32 hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-center">
            <div className="bg-blue-500/10 p-2.5 rounded-lg text-blue-500 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs text-green-400 font-bold">+12%</span>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{totalMembers.toLocaleString()}</div>
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-0.5">Total Members</div>
          </div>
        </div>

        {/* Office Bearers */}
        <div
          onClick={() => setActiveTab('officeBearers')}
          className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between h-32 hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-center">
            <div className="bg-purple-500/10 p-2.5 rounded-lg text-purple-500 group-hover:scale-110 transition-transform">
              <Award className="w-5 h-5" />
            </div>
            <span className="text-xs text-slate-400 font-medium">Stable</span>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{totalOfficeBearers}</div>
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-0.5">Office Bearers</div>
          </div>
        </div>

        {/* Active Divisions */}
        <div
          onClick={() => setActiveTab('hierarchy')}
          className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between h-32 hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-center">
            <div className="bg-orange-500/10 p-2.5 rounded-lg text-orange-500 group-hover:scale-110 transition-transform">
              <Network className="w-5 h-5" />
            </div>
            <span className="text-xs text-indigo-400 font-medium">100% Active</span>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{totalDivisions || 14}</div>
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-0.5">Divisions Active</div>
          </div>
        </div>

        {/* Total Districts */}
        <div
          onClick={() => setActiveTab('hierarchy')}
          className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between h-32 hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-center">
            <div className="bg-indigo-500/10 p-2.5 rounded-lg text-indigo-500 group-hover:scale-110 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="text-xs text-slate-400 font-medium">Nationwide</span>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{totalDistricts || 152}</div>
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-0.5">Total Districts</div>
          </div>
        </div>

      </div>

      {/* Main Content Split (12-column Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (8 cols): Data Table Section */}
        <div className="lg:col-span-8 bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-800/20">
            <h2 className="font-bold text-sm text-white">Recent Member Registrations</h2>
            <div className="flex space-x-2">
              <button
                onClick={onOpenAddMember}
                className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded-md hover:bg-indigo-500 transition-colors shadow-sm"
              >
                + ADD NEW
              </button>
              <button
                onClick={() => setActiveTab('exportImport')}
                className="px-3 py-1 bg-slate-800 text-slate-200 text-[10px] font-bold rounded-md hover:bg-slate-700 border border-slate-700 transition-colors"
              >
                EXPORT DATA
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] text-slate-500 uppercase tracking-widest border-b border-slate-800 bg-slate-900/60">
                  <th className="px-5 py-3 font-semibold">ID</th>
                  <th className="px-5 py-3 font-semibold">Full Name</th>
                  <th className="px-5 py-3 font-semibold">Location</th>
                  <th className="px-5 py-3 font-semibold">Contact</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-slate-800/60">
                {members.slice(0, 5).map((m) => (
                  <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-indigo-400 font-medium">{m.id}</td>
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-200">{m.fullName}</div>
                      <div className="text-[10px] text-slate-500">Joined: {m.joiningDate || '2026-01-01'}</div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-400">{m.city}, {m.province || 'Sindh'}</td>
                    <td className="px-5 py-3.5 text-slate-400 font-mono text-[11px]">{m.mobileNumber}</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-tighter ${
                        m.status === 'Active'
                          ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                          : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                      }`}>
                        {m.status || 'Verified'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column (4 cols): Hierarchy Explorer Panel */}
        <div className="lg:col-span-4 bg-slate-900/50 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <h2 className="font-bold text-sm text-white mb-4">Hierarchy Explorer</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="mt-1 bg-indigo-500/20 text-indigo-400 p-1.5 rounded-md">
                  <Network className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Pakistan HQ (Central)</p>
                  <p className="text-[10px] text-slate-500">Central Management Authority</p>
                </div>
              </div>

              <div className="pl-4 border-l-2 border-slate-800 space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-slate-600"></div>
                  <p className="text-xs font-medium text-slate-300">
                    Sindh Province <span className="text-[10px] text-slate-500 ml-1">(4,120)</span>
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                  <p className="text-xs font-bold text-indigo-400">
                    Punjab Province <span className="text-[10px] text-slate-500 ml-1">(6,842)</span>
                  </p>
                </div>
                <div className="pl-5 border-l-2 border-slate-800 space-y-1.5">
                  <p className="text-[10px] text-slate-400">• Lahore Division</p>
                  <p className="text-[10px] text-indigo-400 font-bold">• Multan Division</p>
                  <p className="text-[10px] text-slate-400">• Faisalabad Division</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-slate-600"></div>
                  <p className="text-xs font-medium text-slate-300">
                    KPK Province <span className="text-[10px] text-slate-500 ml-1">(1,240)</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('hierarchy')}
            className="w-full mt-6 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-bold rounded-lg border border-slate-700/80 transition-colors"
          >
            Explore Full Tree
          </button>
        </div>

      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Super Administrator Spotlight Card */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 border border-slate-800 shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                  Super Administrator
                </h3>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30">
                Full Privilege
              </span>
            </div>

            <div className="flex items-center gap-3 mt-4">
              <img
                src={superAdminInfo?.profilePhoto || SUPER_ADMIN_INFO.profilePhoto}
                alt={SUPER_ADMIN_INFO.name}
                className="w-16 h-16 rounded-xl object-cover ring-2 ring-indigo-500/50 shadow-lg"
              />
              <div>
                <h2 className="text-sm font-extrabold text-white leading-snug">
                  {SUPER_ADMIN_INFO.name}
                </h2>
                <p className="text-xs font-bold text-indigo-400 mt-0.5">
                  {SUPER_ADMIN_INFO.designation}
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-1.5 font-mono text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>Mobile: {SUPER_ADMIN_INFO.mobileNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="truncate">Email: {SUPER_ADMIN_INFO.email}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('superAdmin')}
            className="mt-4 w-full py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-lg shadow-indigo-500/20"
          >
            Manage System Access
          </button>
        </div>

        {/* Chart 1: Members Distribution by Province */}
        <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-white">Members by Region</h3>
                <p className="text-xs text-slate-500">Provincial registration distribution</p>
              </div>
              <span className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                <Activity className="w-4 h-4" />
              </span>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={provinceChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748B' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', color: '#FFF', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" fill="#6366F1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Chart 2: Office Bearers Breakdown */}
        <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-white">Cabinet Breakdown</h3>
                <p className="text-xs text-slate-500">Executive role assignments</p>
              </div>
              <span className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                <Award className="w-4 h-4" />
              </span>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={designationChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="count"
                  >
                    {designationChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', color: '#FFF', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
