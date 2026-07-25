import React, { useState } from 'react';
import { AdminCredential } from '../types';
import {
  KeyRound,
  ShieldCheck,
  Phone,
  User,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  Sparkles
} from 'lucide-react';

interface CredentialGeneratorModuleProps {
  adminCredentials: AdminCredential[];
  onGenerateCredential: (cred: AdminCredential) => void;
  onDeleteCredential: (mobileNumber: string) => void;
}

export const CredentialGeneratorModule: React.FC<CredentialGeneratorModuleProps> = ({
  adminCredentials,
  onGenerateCredential,
  onDeleteCredential
}) => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('Provincial IT Secretary');
  const [role, setRole] = useState<'SuperAdmin' | 'Admin' | 'Manager' | 'Viewer'>('Admin');
  const [showPassword, setShowPassword] = useState(false);
  const [copiedMobile, setCopiedMobile] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Super Admin Password Update state
  const [superAdminPass, setSuperAdminPass] = useState('admin123');
  const [superAdminSuccess, setSuperAdminSuccess] = useState('');

  const superAdminCred = adminCredentials.find((c) => c.mobileNumber === '03323475431') || {
    mobileNumber: '03323475431',
    password: 'admin123',
    name: 'Syed Muhammad Aamir Naqvi Al Bukhari',
    designation: 'Chairman IT Support Council',
    role: 'SuperAdmin' as const,
    isSuperAdmin: true,
    createdDate: '2026-01-01'
  };

  const handleUpdateSuperAdminPass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!superAdminPass.trim()) return;

    onGenerateCredential({
      ...superAdminCred,
      password: superAdminPass.trim()
    });

    setSuperAdminSuccess('Super Admin password successfully updated!');
    setTimeout(() => setSuperAdminSuccess(''), 3000);
  };

  const handleCreateCredential = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileNumber.trim() || !password.trim() || !name.trim()) {
      alert('Please enter Mobile Number, Password, and Full Name.');
      return;
    }

    const cleanMobile = mobileNumber.trim();
    const isSuper = role === 'SuperAdmin';

    const newCred: AdminCredential = {
      mobileNumber: cleanMobile,
      password: password.trim(),
      name: name.trim(),
      designation: designation.trim() || 'Council Admin',
      role,
      isSuperAdmin: isSuper,
      createdDate: new Date().toISOString().split('T')[0]
    };

    onGenerateCredential(newCred);

    setSuccessMessage(`Mobile ID ${cleanMobile} credential generated successfully!`);
    setTimeout(() => setSuccessMessage(''), 3500);

    // Reset fields
    setMobileNumber('');
    setPassword('');
    setName('');
  };

  const handleCopyCredential = (cred: AdminCredential) => {
    const text = `ISO System Login Details:\nMobile User ID: ${cred.mobileNumber}\nPassword: ${cred.password}\nName: ${cred.name}\nRole: ${cred.role}`;
    navigator.clipboard.writeText(text);
    setCopiedMobile(cred.mobileNumber);
    setTimeout(() => setCopiedMobile(null), 2500);
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#@!';
    let pass = '';
    for (let i = 0; i < 8; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pass);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
      
      {/* Module Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
              Mobile ID & Password Generator Panel
              <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/30">
                Super Admin Access
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Issue login credentials anytime against ANY mobile number or manage Super Admin passwords.
            </p>
          </div>
        </div>
      </div>

      {/* Grid: 1. Primary Super Admin Credentials, 2. Generator Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. PRIMARY SUPER ADMIN CREDENTIAL CONTROL (Syed Muhammad Aamir) */}
        <div className="bg-slate-950/80 border border-amber-500/30 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Super Admin Primary Credential</h3>
            </div>
            <span className="text-[10px] font-extrabold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              Syed Muhammad Aamir
            </span>
          </div>

          {superAdminSuccess && (
            <div className="p-2.5 bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{superAdminSuccess}</span>
            </div>
          )}

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center bg-slate-900 p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-400">Mobile User ID:</span>
              <span className="font-extrabold text-amber-400 font-mono text-sm">03323475431</span>
            </div>

            <div className="flex justify-between items-center bg-slate-900 p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-400">Holder Name:</span>
              <span className="font-bold text-white">Syed Muhammad Aamir Naqvi Al Bukhari</span>
            </div>

            <form onSubmit={handleUpdateSuperAdminPass} className="space-y-2 pt-1">
              <label className="block text-xs font-bold text-slate-300">
                Update Super Admin Password
              </label>
              <div className="flex gap-2">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={superAdminPass}
                  onChange={(e) => setSuperAdminPass(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs"
                  title="Toggle Password Visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
                >
                  Save Password
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* 2. GENERATE NEW MOBILE CREDENTIAL FORM */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Generate ID for Mobile Number</h3>
            </div>
            <button
              type="button"
              onClick={generateRandomPassword}
              className="text-[10px] text-indigo-400 hover:text-indigo-300 underline flex items-center gap-1 font-bold"
            >
              <RefreshCw className="w-3 h-3" /> Auto Password
            </button>
          </div>

          {successMessage && (
            <div className="p-2.5 bg-indigo-950/60 border border-indigo-800 text-indigo-300 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleCreateCredential} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Target Mobile Number (ID) <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 03001234567"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Assign Password <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. pass123"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Syed Hassan Raza"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Designation</label>
                <input
                  type="text"
                  placeholder="e.g. District Secretary"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Access Role Level</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Admin">Admin (Full Operational Controls)</option>
                <option value="Manager">Manager (Directory & Record Editor)</option>
                <option value="Viewer">Viewer (Read Only Access)</option>
                <option value="SuperAdmin">Super Admin (Master Privileges)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
            >
              <KeyRound className="w-4 h-4" />
              <span>Generate & Issue Mobile Credential</span>
            </button>
          </form>
        </div>

      </div>

      {/* 3. ACTIVE GENERATED MOBILE CREDENTIALS TABLE */}
      <div className="pt-2">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center justify-between">
          <span>Active Issued Mobile ID Credentials ({adminCredentials.length})</span>
          <span className="text-xs text-slate-400 font-normal">Stored in local secure database</span>
        </h3>

        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800">
          {adminCredentials.map((cred) => (
            <div key={cred.mobileNumber} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/40 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl text-white ${cred.isSuperAdmin ? 'bg-amber-600/20 text-amber-400 border border-amber-500/30' : 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'}`}>
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white font-mono">{cred.mobileNumber}</span>
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                      cred.isSuperAdmin ? 'bg-amber-500/20 text-amber-300' : 'bg-indigo-500/20 text-indigo-300'
                    }`}>
                      {cred.role}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">{cred.name} • <span className="text-slate-400">{cred.designation}</span></p>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">Password: <span className="text-slate-300">{cred.password}</span></p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  onClick={() => handleCopyCredential(cred)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                  title="Copy Login Info to Clipboard"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedMobile === cred.mobileNumber ? 'Copied!' : 'Copy'}</span>
                </button>

                {!cred.isSuperAdmin && (
                  <button
                    onClick={() => onDeleteCredential(cred.mobileNumber)}
                    className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-xs transition-colors"
                    title="Revoke Mobile ID Credential"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
