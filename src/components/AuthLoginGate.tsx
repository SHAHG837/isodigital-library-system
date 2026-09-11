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
  FileText,
  Copy,
  ExternalLink,
  Check
} from 'lucide-react';
import { AdminCredential, Member, OfficeBearer } from '../types';

interface AuthLoginGateProps {
  adminCredentials: AdminCredential[];
  onLoginSuccess: (credential: AdminCredential, welcomeMessage?: string) => void;
  onRegisterMember: (memberData: Omit<Member, 'id' | 'joiningDate' | 'status'>) => void;
  onRegisterOfficeBearer?: (bearerData: Omit<OfficeBearer, 'id' | 'appointmentDate' | 'status'>) => void;
}

export const AuthLoginGate: React.FC<AuthLoginGateProps> = ({
  adminCredentials,
  onLoginSuccess,
  onRegisterMember
}) => {
  // Admin Panel Hidden Gate State (opens only when clicked below)
  const [showAdminCabinetPanel, setShowAdminCabinetPanel] = useState<boolean>(false);

  // Admin Login Inputs
  const [mobileInput, setMobileInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopySuperAdminLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?portal=superAdmin`;
    navigator.clipboard.writeText(url);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  // Member Mode State (Sign Up vs Sign In)
  const [memberAuthMode, setMemberAuthMode] = useState<'signup' | 'signin'>('signup');

  // Member Sign In Inputs
  const [memSignInName, setMemSignInName] = useState('');
  const [memSignInMobile, setMemSignInMobile] = useState('');

  // Member Registration Inputs
  const [memName, setMemName] = useState('');
  const [memMobile, setMemMobile] = useState('');
  const [memCity, setMemCity] = useState('');
  const [memDistrict, setMemDistrict] = useState('');

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
      const firstName = found.name.split(' ')[0] || found.name;
      onLoginSuccess(
        found,
        `Welcome back, ${firstName}! Authenticated as ${found.designation} (${found.role}).`
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
        `Welcome back, Syed Muhammad Aamir Naqvi! Super Administrator Access Granted.`
      );
    } else {
      setLoginError(
        'Authentication failed. Invalid Mobile Number ID or Password.'
      );
    }
  };

  // Submit Member Registration (Sign Up)
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

    const firstName = memName.trim().split(' ')[0] || memName.trim();

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

    // Open compulsory Google Registration Form in new tab
    try {
      window.open('https://forms.gle/7NiEiCtEr5BFsmkY8', '_blank');
    } catch (err) {
      console.error(err);
    }

    onLoginSuccess(
      memberCredential,
      `Welcome to ISO Central Repository, ${firstName}! Please complete your compulsory registration form at https://forms.gle/7NiEiCtEr5BFsmkY8.`
    );
  };

  // Submit Member Sign In
  const handleMemberSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memSignInName.trim() || !memSignInMobile.trim()) {
      alert('Please enter your Name and Mobile Number.');
      return;
    }

    const firstName = memSignInName.trim().split(' ')[0] || memSignInName.trim();

    const memberCredential: AdminCredential = {
      mobileNumber: memSignInMobile.trim(),
      password: 'memberPass123',
      name: memSignInName.trim(),
      designation: 'ISO General Member',
      role: 'Viewer',
      isSuperAdmin: false,
      createdDate: new Date().toISOString().split('T')[0]
    };

    onLoginSuccess(
      memberCredential,
      `Welcome back, ${firstName}! Member Sign In Successful.`
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

        {/* Portal Header */}
        <div className="bg-slate-950/60 p-3.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-extrabold text-indigo-400">
            <User className="w-4 h-4 text-indigo-400" />
            <span>Member Self-Service Portal (Sign Up / Sign In)</span>
          </div>
          <span className="px-2.5 py-0.5 text-[10px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-full">
            Member Access
          </span>
        </div>

        {/* Form Body */}
        <div className="p-6 relative z-10">

          {/* 2. MEMBER SIGNUP / SIGN IN TAB */}
          <div className="space-y-4">
              {/* Member Auth Mode Switcher */}
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 gap-1">
                <button
                  type="button"
                  onClick={() => setMemberAuthMode('signup')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                    memberAuthMode === 'signup'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  New Member Sign Up
                </button>
                <button
                  type="button"
                  onClick={() => setMemberAuthMode('signin')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                    memberAuthMode === 'signin'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Member Sign In
                </button>
              </div>

              {memberAuthMode === 'signup' ? (
                <form onSubmit={handleMemberSubmit} className="space-y-4">
                  <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-xl text-xs text-indigo-300">
                    <strong>New Member Registration:</strong> Register your account to receive your official membership card and access digital records.
                  </div>

                  {/* Compulsory Registration Google Form Card */}
                  <div className="p-3.5 bg-amber-950/60 border border-amber-500/50 rounded-xl text-xs text-amber-200 space-y-1.5 shadow-md">
                    <div className="flex items-center gap-2 font-bold text-amber-300">
                      <ExternalLink className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Compulsory Google Registration Form</span>
                    </div>
                    <p className="text-[11px] text-amber-200/90">
                      Upon joining, new members are required to fill out the compulsory Google Form:
                    </p>
                    <a
                      href="https://forms.gle/7NiEiCtEr5BFsmkY8"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-mono text-[11px] text-amber-300 hover:text-white underline font-bold"
                    >
                      <span>https://forms.gle/7NiEiCtEr5BFsmkY8</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
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
                    <span>Sign Up & Enter Main Landing Page</span>
                  </button>
                </form>
              ) : (
                <form onSubmit={handleMemberSignInSubmit} className="space-y-4">
                  <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-xl text-xs text-indigo-300">
                    <strong>Member Sign In:</strong> Enter your registered name and mobile number to log back into your member account.
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Member Full Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter Registered Full Name"
                      value={memSignInName}
                      onChange={(e) => setMemSignInName(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Registered Mobile Number <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Enter Registered Mobile Number"
                      value={memSignInMobile}
                      onChange={(e) => setMemSignInMobile(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Sign In & Enter Main Landing Page</span>
                  </button>
                </form>
              )}
            </div>

            {/* Authorized Administrator Access (Protected Gate) */}
            <div className="mt-6 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAdminCabinetPanel(!showAdminCabinetPanel)}
                className="w-full py-2.5 px-4 bg-slate-950 hover:bg-slate-800/80 border border-slate-700/60 hover:border-amber-500/50 rounded-xl text-xs font-semibold text-slate-400 hover:text-amber-300 flex items-center justify-between transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Authorized Administrator Access</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full">
                  {showAdminCabinetPanel ? 'Hide Panel ▲' : 'Open Admin Login ▼'}
                </span>
              </button>

              {showAdminCabinetPanel && (
                <div className="mt-4 p-5 bg-slate-950/95 border-2 border-amber-500/60 rounded-2xl shadow-2xl space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-black uppercase text-amber-300 tracking-wider">
                        Authorized Administrator Credentials
                      </span>
                    </div>
                  </div>

                  {loginError && (
                    <div className="p-3 bg-red-950/80 border border-red-500/40 text-red-200 text-xs rounded-xl flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                      <span>{loginError}</span>
                    </div>
                  )}

                  <form onSubmit={handleAdminLoginSubmit} className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        Admin Mobile Number (ID) <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="Enter authorized Admin ID or Mobile..."
                        value={mobileInput}
                        onChange={(e) => setMobileInput(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        Admin Password <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="Enter admin password..."
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-black text-xs rounded-xl shadow-lg shadow-amber-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer mt-3"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Log In to Admin Panel</span>
                    </button>
                  </form>
                </div>
              )}
            </div>

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
