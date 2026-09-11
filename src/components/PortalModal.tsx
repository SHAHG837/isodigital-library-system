import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  Building2,
  Phone,
  MapPin,
  MessageSquare,
  Lock,
  KeyRound,
  CheckCircle2,
  X,
  Share2,
  Copy,
  ExternalLink,
  Sparkles,
  QrCode,
  AlertCircle,
  ShieldAlert
} from 'lucide-react';
import { Member, OfficeBearer, AdminCredential } from '../types';
import { SUPER_ADMIN_INFO, INITIAL_DESIGNATIONS } from '../data/initialData';
import { supabaseSignIn, supabaseSignUp, fetchProfile } from '../lib/supabase';
import { Loader2, Database } from 'lucide-react';

interface PortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPortal?: 'member' | 'official' | 'adminLogin';
  onRegisterMember: (memberData: Omit<Member, 'id' | 'joiningDate' | 'status'>) => void;
  onRegisterOfficeBearer: (bearerData: Omit<OfficeBearer, 'id' | 'appointmentDate' | 'status'>) => void;
  adminCredentials: AdminCredential[];
  onAdminLoginSuccess: (credential: AdminCredential) => void;
  currentLoggedInUser: AdminCredential | null;
  onLogout: () => void;
}

export const PortalModal: React.FC<PortalModalProps> = ({
  isOpen,
  onClose,
  defaultPortal = 'member',
  onRegisterMember,
  onRegisterOfficeBearer,
  adminCredentials,
  onAdminLoginSuccess,
  currentLoggedInUser,
  onLogout
}) => {
  const [activePortalTab, setActivePortalTab] = useState<'member' | 'official' | 'adminLogin'>(defaultPortal);

  // Member Registration State
  const [memName, setMemName] = useState('');
  const [memCity, setMemCity] = useState('');
  const [memMobile, setMemMobile] = useState('');
  const [memWhatsapp, setMemWhatsapp] = useState('');
  const [memDistrict, setMemDistrict] = useState('');
  const [memAddress, setMemAddress] = useState('');
  const [memNotes, setMemNotes] = useState('');
  const [memSubmitted, setMemSubmitted] = useState<Member | null>(null);

  // Office Bearer Registration State
  const [obName, setObName] = useState('');
  const [obDesignation, setObDesignation] = useState('Central Executive Member');
  const [obCustomDesignation, setObCustomDesignation] = useState('');
  const [obCity, setObCity] = useState('');
  const [obMobile, setObMobile] = useState('');
  const [obWhatsapp, setObWhatsapp] = useState('');
  const [obDistrict, setObDistrict] = useState('');
  const [obProvince, setObProvince] = useState('Sindh');
  const [obNotes, setObNotes] = useState('');
  const [obSubmitted, setObSubmitted] = useState<OfficeBearer | null>(null);

  // Admin Login State
  const [loginMobile, setLoginMobile] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [showCabinetOptionBelowAdmin, setShowCabinetOptionBelowAdmin] = useState<boolean>(false);

  if (!isOpen) return null;

  // Link copy helpers
  const handleCopyLink = (type: string) => {
    const url = window.location.origin + window.location.pathname + `?portal=${type}`;
    navigator.clipboard.writeText(url);
    setCopySuccess(type);
    setTimeout(() => setCopySuccess(null), 2500);
  };

  // Submit Normal Member
  const handleMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memName.trim() || !memCity.trim() || !memMobile.trim()) {
      alert('Please enter Name, City Name, and Mobile Number.');
      return;
    }

    const cleanMobile = memMobile.trim();
    const effectiveEmail = `${cleanMobile.replace(/[^0-9]/g, '')}@isopakistan.org`;

    // 1. Supabase Auth registration
    try {
      await supabaseSignUp({
        email: effectiveEmail,
        password: 'memberPass123',
        fullName: memName.trim(),
        role: 'member',
        phone: cleanMobile,
        city: memCity.trim()
      });
    } catch (err) {
      console.warn('Supabase Auth signup notice:', err);
    }

    const newMemData = {
      fullName: memName.trim(),
      mobileNumber: cleanMobile,
      whatsappNumber: memWhatsapp.trim() || cleanMobile,
      city: memCity.trim(),
      district: memDistrict.trim() || memCity.trim(),
      division: memCity.trim(),
      province: 'Sindh',
      country: 'Pakistan',
      address: memAddress.trim(),
      profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
      notes: memNotes.trim(),
      status: 'Active' as const
    };

    onRegisterMember(newMemData);

    const simulatedMember: Member = {
      ...newMemData,
      id: `ISO-MEM-${Date.now().toString().slice(-4)}`,
      joiningDate: new Date().toISOString().split('T')[0]
    };

    setMemSubmitted(simulatedMember);
  };

  // Submit Cabinet Official
  const handleOfficialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!obName.trim() || !obCity.trim() || !obMobile.trim()) {
      alert('Please enter Name, City Name, and Mobile Number.');
      return;
    }

    const cleanMobile = obMobile.trim();
    const finalDesignation = obDesignation === 'Other' ? obCustomDesignation.trim() || 'Cabinet Officer' : obDesignation;
    const effectiveEmail = `${cleanMobile.replace(/[^0-9]/g, '')}@isopakistan.org`;

    // 1. Supabase Auth registration with office_bearer role
    try {
      await supabaseSignUp({
        email: effectiveEmail,
        password: 'officialPass123',
        fullName: obName.trim(),
        role: 'office_bearer',
        phone: cleanMobile,
        city: obCity.trim()
      });
    } catch (err) {
      console.warn('Supabase Auth signup notice:', err);
    }

    const newObData = {
      name: obName.trim(),
      designation: finalDesignation,
      mobileNumber: cleanMobile,
      whatsapp: obWhatsapp.trim() || cleanMobile,
      city: obCity.trim(),
      district: obDistrict.trim() || obCity.trim(),
      division: obCity.trim(),
      province: obProvince,
      country: 'Pakistan',
      profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
      notes: obNotes.trim(),
      status: 'Active' as const
    };

    onRegisterOfficeBearer(newObData);

    const simulatedOb: OfficeBearer = {
      ...newObData,
      id: `ISO-OB-${Date.now().toString().slice(-4)}`,
      appointmentDate: new Date().toISOString().split('T')[0]
    };

    setObSubmitted(simulatedOb);
  };

  // Handle Admin Login (Supabase Auth + Credentials)
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const cleanInput = loginMobile.trim();
    const cleanPass = loginPassword.trim();

    try {
      // 1. Supabase Auth Email Sign-In
      if (cleanInput.includes('@')) {
        const authRes = await supabaseSignIn(cleanInput, cleanPass);
        if (authRes.success && authRes.user) {
          const profile = await fetchProfile(authRes.user.id);
          const isSuper =
            profile?.role === 'super_admin' ||
            cleanInput.toLowerCase() === 'syedmuhammadamir837@gmail.com';
          const matched: AdminCredential = {
            mobileNumber: profile?.phone || authRes.user.phone || cleanInput,
            password: '***',
            name: profile?.full_name || authRes.user.user_metadata?.full_name || cleanInput.split('@')[0],
            designation: isSuper ? 'Super Administrator' : 'Authorized Administrator',
            role: isSuper ? 'SuperAdmin' : 'Admin',
            isSuperAdmin: isSuper,
            createdDate: new Date().toISOString().split('T')[0]
          };
          onAdminLoginSuccess(matched);
          onClose();
          return;
        } else if (authRes.error && !cleanInput.endsWith('@isopakistan.org')) {
          setLoginError(`Supabase Auth: ${authRes.error}`);
          return;
        }
      }

      // 2. Check local credentials
      const matched = adminCredentials.find(
        (acc) => acc.mobileNumber === cleanInput && acc.password === cleanPass
      );

      if (matched) {
        if (!matched.isSuperAdmin && matched.role !== 'SuperAdmin' && matched.role !== 'Admin' && matched.role !== 'Manager') {
          setLoginError('Access Denied: Regular member credentials cannot unlock Super Administrator Control Panel.');
          return;
        }
        onAdminLoginSuccess(matched);
        onClose();
        return;
      }

      // 3. Fallback Super Admin
      if (cleanInput === '03323475431' && cleanPass === 'admin123') {
        const defaultSuperAdmin: AdminCredential = {
          mobileNumber: '03323475431',
          password: 'admin123',
          name: 'Syed Muhammad Aamir Naqvi Al Bukhari',
          designation: 'Chairman IT Support Council',
          role: 'SuperAdmin',
          isSuperAdmin: true,
          createdDate: '2026-01-01'
        };
        onAdminLoginSuccess(defaultSuperAdmin);
        onClose();
        return;
      }

      setLoginError('Authentication failed. Invalid Mobile ID / Email or Password. Access denied.');
    } catch (err: any) {
      setLoginError(err?.message || 'Authentication error.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-auto">
        
        {/* Header Tabs */}
        <div className="bg-slate-950/80 p-4 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => {
                setActivePortalTab('member');
                setMemSubmitted(null);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activePortalTab === 'member'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Member Portal</span>
            </button>

            <button
              onClick={() => setActivePortalTab('adminLogin')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activePortalTab === 'adminLogin'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Panel Login</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Portal Body */}
        <div className="p-5 sm:p-6 space-y-5">

          {/* 1. MEMBER SELF REGISTRATION & LOGIN PORTAL */}
          {activePortalTab === 'member' && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <User className="w-5 h-5 text-indigo-400" />
                    Member Login & Public Registration Portal
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Enter Name, City, and Mobile Number to register as an official ISO Member.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopyLink('member')}
                  className="px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{copySuccess === 'member' ? 'Link Copied!' : 'Copy Direct Link'}</span>
                </button>
              </div>

              {memSubmitted ? (
                <div className="mt-5 space-y-4 text-center bg-indigo-950/30 border border-indigo-500/30 rounded-2xl p-6">
                  <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center mx-auto shadow-xl">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">Member Login & Registration Successful!</h4>
                    <p className="text-xs text-slate-300 mt-1">
                      Welcome, <strong className="text-indigo-400">{memSubmitted.fullName}</strong> from{' '}
                      <strong className="text-indigo-400">{memSubmitted.city}</strong>.
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Super Admin (Syed Muhammad Aamir) has been notified of your login. Your Record ID: <span className="font-mono text-indigo-300 font-bold">{memSubmitted.id}</span>
                    </p>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl max-w-sm mx-auto text-left space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Mobile Number:</span>
                      <span className="font-bold text-white font-mono">{memSubmitted.mobileNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">WhatsApp:</span>
                      <span className="font-bold text-emerald-400 font-mono">{memSubmitted.whatsappNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">City / District:</span>
                      <span className="font-bold text-white">{memSubmitted.city}, {memSubmitted.district}</span>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-center gap-3">
                    <button
                      onClick={() => setMemSubmitted(null)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl"
                    >
                      Register Another Member
                    </button>
                    <button
                      onClick={onClose}
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleMemberSubmit} className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        City Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Karachi, Lahore, Quetta"
                        value={memCity}
                        onChange={(e) => setMemCity(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

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
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        WhatsApp Number <span className="text-slate-400">(Optional)</span>
                      </label>
                      <input
                        type="tel"
                        placeholder="e.g. 03001234567"
                        value={memWhatsapp}
                        onChange={(e) => setMemWhatsapp(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">District / Sub-Division</label>
                      <input
                        type="text"
                        placeholder="e.g. Karachi Central"
                        value={memDistrict}
                        onChange={(e) => setMemDistrict(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Address / Area</label>
                      <input
                        type="text"
                        placeholder="e.g. Nazimabad Block 3"
                        value={memAddress}
                        onChange={(e) => setMemAddress(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Additional Information / Notes</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Education, Profession, Special Skills..."
                      value={memNotes}
                      onChange={(e) => setMemNotes(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all"
                    >
                      <User className="w-4 h-4" />
                      <span>Submit & Register Member</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* 2. OFFICE BEARERS (CABINET OFFICIALS) REGISTRATION PORTAL */}
          {activePortalTab === 'official' && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-emerald-400" />
                    Office Bearer / Cabinet Official Portal
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Dedicated registration for Cabinet Officers and Organizational Appointees. Records are stored separately in the Office Bearers Cabinet Registry.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopyLink('official')}
                  className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{copySuccess === 'official' ? 'Link Copied!' : 'Copy Direct Link'}</span>
                </button>
              </div>

              {obSubmitted ? (
                <div className="mt-5 space-y-4 text-center bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-6">
                  <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-xl">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">Cabinet Official Registered Successfully!</h4>
                    <p className="text-xs text-slate-300 mt-1">
                      Appointed <strong className="text-emerald-400">{obSubmitted.name}</strong> as{' '}
                      <strong className="text-emerald-300">{obSubmitted.designation}</strong> in{' '}
                      <strong className="text-emerald-400">{obSubmitted.city}</strong>.
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Record automatically added to the Cabinet Registry. Record ID: <span className="font-mono text-emerald-300 font-bold">{obSubmitted.id}</span>
                    </p>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl max-w-sm mx-auto text-left space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Cabinet Office:</span>
                      <span className="font-bold text-emerald-400">{obSubmitted.designation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Mobile Number:</span>
                      <span className="font-bold text-white font-mono">{obSubmitted.mobileNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">City / Province:</span>
                      <span className="font-bold text-white">{obSubmitted.city}, {obSubmitted.province}</span>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-center gap-3">
                    <button
                      onClick={() => setObSubmitted(null)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl"
                    >
                      Register Another Official
                    </button>
                    <button
                      onClick={onClose}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleOfficialSubmit} className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Official Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Syed Hassan Abbas Naqvi"
                        value={obName}
                        onChange={(e) => setObName(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Cabinet Designation <span className="text-red-400">*</span>
                      </label>
                      <select
                        value={obDesignation}
                        onChange={(e) => setObDesignation(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      >
                        {INITIAL_DESIGNATIONS.map((d) => (
                          <option key={d.id} value={d.title}>
                            {d.title} ({d.level})
                          </option>
                        ))}
                        <option value="Other">Custom Designation...</option>
                      </select>
                    </div>
                  </div>

                  {obDesignation === 'Other' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Enter Custom Designation Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Divisional IT Secretary"
                        value={obCustomDesignation}
                        onChange={(e) => setObCustomDesignation(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        City Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Lahore, Karachi"
                        value={obCity}
                        onChange={(e) => setObCity(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">WhatsApp Number</label>
                      <input
                        type="tel"
                        placeholder="e.g. 03009876543"
                        value={obWhatsapp}
                        onChange={(e) => setObWhatsapp(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">District / Area</label>
                      <input
                        type="text"
                        placeholder="e.g. Gulberg, Lahore"
                        value={obDistrict}
                        onChange={(e) => setObDistrict(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Province</label>
                      <select
                        value={obProvince}
                        onChange={(e) => setObProvince(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      >
                        <option value="Sindh">Sindh</option>
                        <option value="Punjab">Punjab</option>
                        <option value="Khyber Pakhtunkhwa">Khyber Pakhtunkhwa</option>
                        <option value="Balochistan">Balochistan</option>
                        <option value="Gilgit-Baltistan">Gilgit-Baltistan</option>
                        <option value="Azad Kashmir">Azad Kashmir</option>
                        <option value="Islamabad Capital Territory">Islamabad Capital Territory</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Appointment Notes / Responsibilities</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Assigned to oversee Central Youth Affairs..."
                      value={obNotes}
                      onChange={(e) => setObNotes(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all"
                    >
                      <Building2 className="w-4 h-4" />
                      <span>Submit & Appoint Office Bearer</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* 3. SUPER ADMIN / ADMIN CONTROL PANEL LOGIN */}
          {activePortalTab === 'adminLogin' && (
            <div>
              <div className="pb-4 border-b border-slate-800">
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-400" />
                  Super Administrator Control Panel Login
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Enter your Mobile Number ID and Password to unlock the Super Admin Control Panel.
                </p>
              </div>

              {currentLoggedInUser && (currentLoggedInUser.isSuperAdmin || currentLoggedInUser.role === 'SuperAdmin' || currentLoggedInUser.role === 'Admin' || currentLoggedInUser.role === 'Manager') ? (
                <div className="mt-5 text-center bg-amber-950/30 border border-amber-500/30 rounded-2xl p-6 space-y-4">
                  <div className="w-12 h-12 bg-amber-600 text-white rounded-full flex items-center justify-center mx-auto shadow-xl">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">Authenticated as Administrator</h4>
                    <p className="text-xs text-amber-400 font-extrabold mt-0.5">{currentLoggedInUser.name}</p>
                    <p className="text-xs text-slate-300 mt-0.5">{currentLoggedInUser.designation} ({currentLoggedInUser.role})</p>
                    <p className="text-xs text-slate-400 font-mono mt-1">Mobile ID: {currentLoggedInUser.mobileNumber}</p>
                  </div>

                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-left text-xs text-slate-300 space-y-1">
                    <p className="font-bold text-amber-400 flex items-center justify-between">
                      <span>Saved Super Admin Direct Login Link:</span>
                      <button
                        type="button"
                        onClick={() => handleCopyLink('superAdmin')}
                        className="text-amber-400 hover:underline flex items-center gap-1 font-mono text-[11px]"
                      >
                        <Copy className="w-3 h-3" /> {copySuccess === 'superAdmin' ? 'Copied Link!' : 'Copy Saved Link'}
                      </button>
                    </p>
                    <p className="font-mono text-[11px] text-emerald-400 truncate">
                      {window.location.origin}{window.location.pathname}?portal=superAdmin
                    </p>
                  </div>

                  <div className="pt-2 flex justify-center gap-3">
                    <button
                      onClick={onLogout}
                      className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 text-xs font-bold rounded-xl transition-colors"
                    >
                      Logout Session
                    </button>
                    <button
                      onClick={onClose}
                      className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow-lg"
                    >
                      Continue to Panel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-5 space-y-4 max-w-md mx-auto">
                  {currentLoggedInUser && (
                    <div className="p-3.5 bg-red-950/70 border border-red-500/50 text-red-200 text-xs rounded-xl flex items-start gap-2.5 shadow-lg">
                      <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-extrabold text-red-400 text-xs mb-0.5 uppercase tracking-wide">
                          Super Administrator Access Restricted
                        </div>
                        <div>
                          Logged in as General Member: <strong>{currentLoggedInUser.name}</strong> ({currentLoggedInUser.mobileNumber}). Member accounts do NOT have access to Super Admin Control Panel. Enter authorized Super Admin credentials to switch to Administrator mode.
                        </div>
                      </div>
                    </div>
                  )}

                  {loginError && (
                    <div className="p-3 bg-red-950/60 border border-red-800 text-red-200 text-xs rounded-xl flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <span>{loginError}</span>
                    </div>
                  )}

                  <form onSubmit={handleAdminLogin} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Mobile Number (User ID) <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-500" />
                        <input
                          type="text"
                          required
                          placeholder="Enter Registered Mobile Number ID"
                          value={loginMobile}
                          onChange={(e) => setLoginMobile(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Login Password <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-500" />
                        <input
                          type="password"
                          required
                          placeholder="Enter Password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                        />
                      </div>
                    </div>

                    <div className="pt-3 flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-700"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-amber-600/30 flex items-center gap-2 transition-all"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Authenticate & Access Control Panel</span>
                      </button>
                    </div>
                  </form>

                  {/* Official Cabinet Option - strictly shown ONLY for Super Admin inside portal */}
                  {(currentLoggedInUser?.role === 'SuperAdmin' || currentLoggedInUser?.isSuperAdmin) && (
                    <div className="pt-4 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => setShowCabinetOptionBelowAdmin(!showCabinetOptionBelowAdmin)}
                        className="w-full py-2.5 px-3.5 bg-slate-950/80 hover:bg-slate-800 border border-slate-700/60 hover:border-emerald-500/40 rounded-xl text-xs font-semibold text-slate-400 hover:text-emerald-300 flex items-center justify-between transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-emerald-400" />
                          <span>Cabinet Official Authorization & Enrollment (Super Admin Only)</span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full">
                          {showCabinetOptionBelowAdmin ? 'Hide Option ▲' : 'Open Option ▼'}
                        </span>
                      </button>

                      {showCabinetOptionBelowAdmin && (
                        <div className="mt-4 p-4 bg-slate-950/90 border border-emerald-500/40 rounded-2xl space-y-4">
                          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                            <span className="text-xs font-bold text-emerald-400">
                              Cabinet Official Registration & Authentication
                            </span>
                            <span className="text-[10px] bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30 font-bold">
                              Super Admin Authorization
                            </span>
                          </div>
                          <form onSubmit={handleOfficialSubmit} className="space-y-3">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                                Official Full Name <span className="text-red-400">*</span>
                              </label>
                              <input
                                type="text"
                                required
                                placeholder="Enter official full name..."
                                value={obName}
                                onChange={(e) => setObName(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                                  Designation <span className="text-red-400">*</span>
                                </label>
                                <input
                                  type="text"
                                  required
                                  placeholder="e.g. Central IT Secretary"
                                  value={obDesignation}
                                  onChange={(e) => setObDesignation(e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                                  Mobile Number <span className="text-red-400">*</span>
                                </label>
                                <input
                                  type="tel"
                                  required
                                  placeholder="Enter mobile number..."
                                  value={obMobile}
                                  onChange={(e) => setObMobile(e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                                City Name <span className="text-red-400">*</span>
                              </label>
                              <input
                                type="text"
                                required
                                placeholder="Enter city name..."
                                value={obCity}
                                onChange={(e) => setObCity(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                              />
                            </div>

                            <button
                              type="submit"
                              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                            >
                              <Building2 className="w-4 h-4" />
                              <span>Enroll & Authorize Cabinet Official</span>
                            </button>
                          </form>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
