import React, { useState } from 'react';
import { Member, OfficeBearer, AdminUser } from '../types';
import { Search, Users, Award, UserCheck, Filter, Phone, MapPin, CheckCircle2 } from 'lucide-react';

interface GlobalSearchModuleProps {
  members: Member[];
  officeBearers: OfficeBearer[];
  admins: AdminUser[];
}

export const GlobalSearchModule: React.FC<GlobalSearchModuleProps> = ({ members, officeBearers, admins }) => {
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'All' | 'Members' | 'OfficeBearers' | 'Admins'>('All');
  const [provinceFilter, setProvinceFilter] = useState('All');

  const provincesList = ['All', 'Sindh', 'Punjab', 'Khyber Pakhtunkhwa', 'Balochistan', 'Islamabad Capital Territory', 'Gilgit-Baltistan', 'Azad Jammu & Kashmir', 'Overseas'];

  // Filter Members
  const searchLower = query.toLowerCase().trim();

  const matchingMembers = members.filter((m) => {
    if (categoryFilter === 'OfficeBearers' || categoryFilter === 'Admins') return false;
    const matchesProv = provinceFilter === 'All' || m.province === provinceFilter;
    if (!searchLower) return matchesProv;

    return (
      matchesProv &&
      (m.fullName.toLowerCase().includes(searchLower) ||
        m.id.toLowerCase().includes(searchLower) ||
        m.mobileNumber.includes(searchLower) ||
        m.whatsappNumber.includes(searchLower) ||
        m.city.toLowerCase().includes(searchLower) ||
        m.district.toLowerCase().includes(searchLower) ||
        m.division.toLowerCase().includes(searchLower) ||
        m.province.toLowerCase().includes(searchLower))
    );
  });

  // Filter Office Bearers
  const matchingOfficeBearers = officeBearers.filter((ob) => {
    if (categoryFilter === 'Members' || categoryFilter === 'Admins') return false;
    const matchesProv = provinceFilter === 'All' || ob.province === provinceFilter;
    if (!searchLower) return matchesProv;

    return (
      matchesProv &&
      (ob.name.toLowerCase().includes(searchLower) ||
        ob.id.toLowerCase().includes(searchLower) ||
        ob.designation.toLowerCase().includes(searchLower) ||
        ob.mobileNumber.includes(searchLower) ||
        ob.city.toLowerCase().includes(searchLower) ||
        ob.district.toLowerCase().includes(searchLower) ||
        ob.province.toLowerCase().includes(searchLower))
    );
  });

  // Filter Admins
  const matchingAdmins = admins.filter((a) => {
    if (categoryFilter === 'Members' || categoryFilter === 'OfficeBearers') return false;
    if (!searchLower) return true;

    return (
      a.name.toLowerCase().includes(searchLower) ||
      a.id.toLowerCase().includes(searchLower) ||
      a.email.toLowerCase().includes(searchLower) ||
      a.phone.includes(searchLower) ||
      a.designation.toLowerCase().includes(searchLower)
    );
  });

  const totalResults = matchingMembers.length + matchingOfficeBearers.length + matchingAdmins.length;

  return (
    <div className="space-y-6">
      {/* Search Bar Header */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-2xl">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Global Directory Search</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Instant query across all ISO Members, Office Bearers, and Administrator accounts.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Type Name, ID, Mobile, City, District, or Designation..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 font-medium"
            />
          </div>

          <div>
            <select
              value={categoryFilter}
              onChange={(e: any) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 font-semibold"
            >
              <option value="All">All Categories</option>
              <option value="Members">Members Only</option>
              <option value="OfficeBearers">Office Bearers Only</option>
              <option value="Admins">Admins Only</option>
            </select>
          </div>

          <div>
            <select
              value={provinceFilter}
              onChange={(e) => setProvinceFilter(e.target.value)}
              className="w-full px-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 font-semibold"
            >
              {provincesList.map((p) => (
                <option key={p} value={p}>{p === 'All' ? 'All Provinces' : p}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 px-2">
          <span>Found {totalResults} Matching Records</span>
          <span>Query: "{query || 'All Records'}"</span>
        </div>

        {/* Office Bearers Results */}
        {matchingOfficeBearers.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4 pb-2 border-b border-slate-100 dark:border-slate-700">
              <Award className="w-4 h-4 text-amber-500" /> Office Bearers ({matchingOfficeBearers.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {matchingOfficeBearers.map((ob) => (
                <div key={ob.id} className="p-3.5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                  <img src={ob.profilePhoto} alt={ob.name} className="w-12 h-12 rounded-2xl object-cover ring-2 ring-amber-500/30 shrink-0" />
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">{ob.name}</h4>
                    <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400">{ob.designation}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{ob.id} • {ob.city}, {ob.district}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Members Results */}
        {matchingMembers.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4 pb-2 border-b border-slate-100 dark:border-slate-700">
              <Users className="w-4 h-4 text-emerald-500" /> Registered Members ({matchingMembers.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {matchingMembers.map((m) => (
                <div key={m.id} className="p-3.5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                  <img src={m.profilePhoto} alt={m.fullName} className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-500/30 shrink-0" />
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">{m.fullName}</h4>
                    <p className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">{m.id}</p>
                    <p className="text-[10px] text-slate-400">{m.mobileNumber} • {m.city}, {m.province}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Admin Users Results */}
        {matchingAdmins.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4 pb-2 border-b border-slate-100 dark:border-slate-700">
              <UserCheck className="w-4 h-4 text-blue-500" /> Admin Users ({matchingAdmins.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {matchingAdmins.map((a) => (
                <div key={a.id} className="p-3.5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                    ADM
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">{a.name}</h4>
                    <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400">{a.designation}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{a.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
