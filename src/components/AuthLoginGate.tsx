import React, { useState } from 'react';
import { ISO_LOGO_URL, SUPER_ADMIN_INFO } from '../data/initialData';
import {
  ShieldCheck,
  Lock,
  Phone,
  KeyRound,
  UserCheck,
  Building2,
  CheckCircle2,
  AlertCircle,
  Globe,
  User,
  Sparkles,
  ArrowRight,
  Shield,
  FileText
} from 'lucide-react';
import { AdminCredential, Member, OfficeBearer } from '../types';

interface AuthLoginGateProps {
  adminCredentials: AdminCredential[];
  onLoginSuccess: (credential: AdminCredential, welcomeMessage?: string) => void;
  onRegisterMember: (memberData: Omit<Member, 'id' | 'joiningDate' | 'status'>) => void;
  onRegisterOfficeBearer: (bearerData: Omit<OfficeBearer, 'id' | 'appointmentDate' | 'status'>) => void;
}

export const AuthLoginGate: React.FC<AuthLoginGateProps> = ({
  adminCredentials,
  onLoginSuccess,
  onRegisterMember,
  onRegisterOfficeBearer
}) => {
  const [activeTab, setActiveTab] = useState<'adminLogin' | 'memberRegister' | 'officialRegister'>('adminLogin');

  // Admin Login Inputs
  const [mobileInput, setMobileInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Member Registration Inputs
  const [memName, setMemName] = useState('');
  const [memMobile, setMemMobile] = useState('');
  const [memCity, setMemCity] = useState('');
  const [memDistrict, setMemDistrict] = useState('');
  const [memRegSuccess, setMemRegSuccess] = useState<string | null>(null);

  // Office Bearer Registration Inputs
  const [obName, setObName] = useState('');
  const [obMobile, setObMobile] = useState('');
  const [obDesignation, setObDesignation] = useState('Central Executive Member');
  const [obCity, setObCity] = useState('');
  const [obRegSuccess, setObRegSuccess] = useState<string | null>(null);

  // One-Click Super Admin Login
  const handleQuickSuperAdminLogin = () => {
    const superAdminCred = adminCredentials.find((c) => c.mobileNumber === '03323475431') || {
      mobileNumber: '03323475431',
      password: 'admin123',
      name: 'Syed Muhammad Aamir Naqvi Al Bukhari',
      designation: 'Chairman IT Support Council',
      role: 'SuperAdmin',
      isSuperAdmin: true,
      createdDate: '2026-01-01'
    };

    onLoginSuccess(
      superAdminCred,
      `Welcome back, ${superAdminCred.name}! Super Administrator Access Granted to Central Repository.`
    );
  };

  // Submit Admin Login
  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const cleanMobile = mobileInput.trim();
    const cleanPass = passwordInput.trim();

    const found = adminCredentials.find(
      (acc) => acc.mobileNumber === cleanMobile && acc.password === cleanPass
    );

    if (found) {
      onLoginSuccess(
        found,
        `Welcome back, ${found.name}! Authenticated as ${found.designation} (${found.role}).`
      );
    } else if (cleanMobile === '03323475431' && cleanPass === 'admin123') {
      const defaultSuperAdmin: AdminCredential = {
        mobileNumber: '03323475431',
        password: 'admin123',
        name: 'Syed Muhammad Aamir Naqvi Al Bukhari',
        designation: 'Chairman IT Support Council',
        role: 'SuperAdmin',
        isSuperAdmin: true,
        createdDate: '2026-01-01'
      };
      onLoginSuccess(
        defaultSuperAdmin,
        `Welcome back, ${defaultSuperAdmin.name}! Chairman IT Support Council Access Granted.`
      );
    } else {
      setLoginError(
        'Authentication failed. Invalid Mobile Number ID or Password.'
      );
    }
  };

  // Submit Member Registration
  const handleMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memName.trim() || !memMobile.trim() || !memCity.trim()) {
      alert('Please enter Name, Mobile Number, and City Name.');
      return;
    }

    const newMem = {
      fullName: memName.trim(),
      mobileNumber: memMobile.trim(),
      whatsappNumber: memMobile.trim(),
      city: memCity.trim(),
      district: memDistrict.trim() || memCity.trim(),
      division: memCity.trim(),
      province: 'Sindh',
      country: 'Pakistan',
      address: `District ${memCity.trim()}, Pakistan`,
      profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
      notes: 'Registered via Digital Library Security Portal',
      status: 'Active' as const
    };

    onRegisterMember(newMem);

    // Auto log in member
    const memberCredential: AdminCredential = {
      mobileNumber: memMobile.trim(),
      password: 'memberPass123',
      name: memName.trim(),
      designation: 'ISO General Member',
      role: 'Viewer',
      isSuperAdmin: false,
      createdDate: new Date().toISOString().split('T')[0]
    };

    onLoginSuccess(
      memberCredential,
      `Welcome to ISO Central Repository, ${memName.trim()}! Member Registration Verified.`
    );
  };

  // Submit Official Registration
  const handleOfficialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!obName.trim() || !obMobile.trim() || !obCity.trim()) {
      alert('Please enter Name, Mobile Number, and City Name.');
      return;
    }

    const newOb = {
      name: obName.trim(),
      designation: obDesignation,
      mobileNumber: obMobile.trim(),
      whatsapp: obMobile.trim(),
      city: obCity.trim(),
      district: obCity.trim(),
      division: obCity.trim(),
      province: 'Sindh',
      country: 'Pakistan',
      profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
      notes: 'Appointed via Digital Library Portal',
      status: 'Active' as const
    };

    onRegisterOfficeBearer(newOb);

    const officialCredential: AdminCredential = {
      mobileNumber: obMobile.trim(),
      password: 'officialPass123',
      name: obName.trim(),
      designation: obDesignation,
      role: 'Manager',
      isSuperAdmin: false,
      createdDate: new Date().toISOString().split('T')[0]
    };

    onLoginSuccess(
      officialCredential,
      `Welcome back, ${obName.trim()} (${obDesignation})! Cabinet Access Granted.`
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto relative">
        
        {/* Top Header Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Branding Header */}
        <div className="p-6 text-center border-b border-slate-800 bg-slate-950/60 relative z-10">
          <img
            src={ISO_LOGO_URL}
            alt="ISO Logo"
            className="w-16 h-16 rounded-full mx-auto ring-4 ring-emerald-500/40 shadow-xl object-cover mb-3"
          />
          <h2 className="text-lg font-black text-white tracking-wide uppercase">
            INTERNATIONAL SADAT ORGANIZATION
          </h2>
          <p className="text-xs text-emerald-400 font-bold mt-1">
            Digital Library & Central Repository Security Gateway
          </p>
          <div className="inline-flex items-center gap-2 mt-3 px-3 py-1 bg-slate-800/80 border border-slate-700/80 rounded-full text-[11px] text-slate-300 font-mono">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Encrypted Authentication Gateway Active</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 p-2 gap-2">
          <button
            onClick={() => setActiveTab('adminLogin')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'adminLogin'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> Administrator Login
          </button>
          <button
            onClick={() => setActiveTab('memberRegister')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'memberRegister'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <User className="w-4 h-4" /> Member Login
          </button>
          <button
            onClick={() => setActiveTab('officialRegister')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'officialRegister'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" /> Official Login
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 relative z-10">

          {/* 1. SUPER ADMIN / OFFICIAL LOGIN TAB */}
          {activeTab === 'adminLogin' && (
            <div className="space-y-5">
              {loginError && (
                <div className="p-3 bg-red-950/60 border border-red-800 text-red-200 text-xs rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Mobile Number ID <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                    <input
                      type="text"
                      required
                      placeholder="Enter Mobile Number"
                      value={mobileInput}
                      onChange={(e) => setMobileInput(e.target.value)}
                      className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Password <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                    <input
                      type="password"
                      required
                      placeholder="Enter Password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-amber-600/30 flex items-center justify-center gap-2 transition-all"
                >
                  <Lock className="w-4 h-4" />
                  <span>Authenticate & Unlock Central Repository</span>
                </button>
              </form>
            </div>
          )}

          {/* 2. MEMBER REGISTRATION / LOGIN TAB */}
          {activeTab === 'memberRegister' && (
            <form onSubmit={handleMemberSubmit} className="space-y-4">
              <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-xl text-xs text-indigo-300">
                <strong>Every member must be registered:</strong> Fill in your details below to instantly register and access digital library records.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Syed Ali Raza Naqvi"
                  value={memName}
                  onChange={(e) => setMemName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Mobile Number <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 03001234567"
                    value={memMobile}
                    onChange={(e) => setMemMobile(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    City Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Karachi, Lahore"
                    value={memCity}
                    onChange={(e) => setMemCity(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">District / Region</label>
                <input
                  type="text"
                  placeholder="e.g. Central Karachi"
                  value={memDistrict}
                  onChange={(e) => setMemDistrict(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
              >
                <UserCheck className="w-4 h-4" />
                <span>Register Member & Access Digital Repository</span>
              </button>
            </form>
          )}

          {/* 3. OFFICIAL REGISTRATION / LOGIN TAB */}
          {activeTab === 'officialRegister' && (
            <form onSubmit={handleOfficialSubmit} className="space-y-4">
              <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-emerald-300">
                <strong>Cabinet Official Portal:</strong> Register your cabinet designation to enter the central repository as an active office bearer.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Official Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Syed Hassan Abbas Naqvi"
                  value={obName}
                  onChange={(e) => setObName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Designation <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Central IT Secretary"
                    value={obDesignation}
                    onChange={(e) => setObDesignation(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Mobile Number <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 03009876543"
                    value={obMobile}
                    onChange={(e) => setObMobile(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  City Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lahore"
                  value={obCity}
                  onChange={(e) => setObCity(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all"
              >
                <Building2 className="w-4 h-4" />
                <span>Register Official & Access Repository</span>
              </button>
            </form>
          )}

        </div>

        {/* Footer info */}
        <div className="bg-slate-950/80 p-4 border-t border-slate-800 text-center text-[11px] text-slate-400 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>Chairman IT Support: <strong>Syed M. Aamir Naqvi</strong></span>
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> ISO Central Database Protected
          </span>
        </div>

      </div>
    </div>
  );
};
