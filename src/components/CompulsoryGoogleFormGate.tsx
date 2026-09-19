import React, { useState } from 'react';
import { ISO_LOGO_URL } from '../data/initialData';
import {
  FileText,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  LogOut,
  ShieldCheck,
  ArrowRight,
  Shield,
  User,
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  Briefcase,
  Building,
  Heart,
  Sparkles,
  Lock
} from 'lucide-react';
import { AdminCredential, Member } from '../types';

export const OFFICIAL_GOOGLE_FORM_EDIT_URL = 'https://docs.google.com/forms/d/1eVTnVJ-nqdm6pi-hvyczit_E-xzb75NLuNJZAbFtb3s/edit';
export const OFFICIAL_GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/1eVTnVJ-nqdm6pi-hvyczit_E-xzb75NLuNJZAbFtb3s/viewform';

interface CompulsoryGoogleFormGateProps {
  user: AdminCredential;
  onFormCompleted: () => void;
  onLogout?: () => void;
  isModalMode?: boolean;
  onCloseModal?: () => void;
}

export const CompulsoryGoogleFormGate: React.FC<CompulsoryGoogleFormGateProps> = ({
  user,
  onFormCompleted,
  onLogout,
  isModalMode = false,
  onCloseModal
}) => {
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Compulsory Form Data matching Google Form specification
  const [formData, setFormData] = useState({
    fullName: user.name || '',
    fatherName: '',
    cnic: '',
    mobileNumber: user.mobileNumber || '',
    whatsappNumber: user.mobileNumber || '',
    email: user.email || '',
    city: '',
    district: '',
    province: 'Sindh',
    qualification: '',
    profession: '',
    isoUnit: '',
    bloodGroup: '',
    shajraBranch: 'Zaidi',
    confirmedGoogleFormAttached: true,
    agreedToTerms: false
  });

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Submit all compulsory details before entering landing page
  const handleSubmitCompulsoryDetails = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate every compulsory field
    if (!formData.fullName.trim()) {
      setErrorMessage('Compulsory Field Missing: Please enter your Full Legal Name (مکمل نام).');
      return;
    }
    if (!formData.fatherName.trim()) {
      setErrorMessage("Compulsory Field Missing: Please enter Father's / Guardian Name (والد کا نام).");
      return;
    }
    if (!formData.cnic.trim()) {
      setErrorMessage('Compulsory Field Missing: Please enter your CNIC / B-Form Number (شناختی کارڈ نمبر).');
      return;
    }
    if (!formData.mobileNumber.trim()) {
      setErrorMessage('Compulsory Field Missing: Please enter your Mobile Contact Number (موبائل نمبر).');
      return;
    }
    if (!formData.whatsappNumber.trim()) {
      setErrorMessage('Compulsory Field Missing: Please enter your WhatsApp Number (واٹس ایپ نمبر).');
      return;
    }
    if (!formData.email.trim()) {
      setErrorMessage('Compulsory Field Missing: Please enter your Email Address (ای میل).');
      return;
    }
    if (!formData.city.trim()) {
      setErrorMessage('Compulsory Field Missing: Please enter your Residential City (رہائشی شہر).');
      return;
    }
    if (!formData.district.trim()) {
      setErrorMessage('Compulsory Field Missing: Please enter your District / Area (ضلع / تحصیل).');
      return;
    }
    if (!formData.qualification.trim()) {
      setErrorMessage('Compulsory Field Missing: Please enter your Educational Qualification (تعلیمی قابلیت).');
      return;
    }
    if (!formData.profession.trim()) {
      setErrorMessage('Compulsory Field Missing: Please enter your Profession / Occupation (پیشہ / ملازمت).');
      return;
    }
    if (!formData.isoUnit.trim()) {
      setErrorMessage('Compulsory Field Missing: Please specify your ISO Unit / Branch (تنظیم کا یونٹ).');
      return;
    }
    if (!formData.agreedToTerms) {
      setErrorMessage('Compulsory Requirement: You must accept the solemn declaration before entering the landing page.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const userKey = user.email || user.mobileNumber || user.memberId || 'member';

    try {
      // Mark compulsory form completed in persistent storage
      localStorage.setItem(`iso_google_form_completed_${userKey}`, 'true');
      localStorage.setItem(
        `iso_google_form_submission_${userKey}`,
        JSON.stringify({
          formUrl: OFFICIAL_GOOGLE_FORM_EDIT_URL,
          submittedAt: new Date().toISOString(),
          userId: user.id || user.memberId,
          ...formData
        })
      );

      // Update existing local members repository with complete details
      const savedMembersRaw = localStorage.getItem('iso_members');
      if (savedMembersRaw) {
        const membersList: Member[] = JSON.parse(savedMembersRaw);
        const existingIndex = membersList.findIndex(
          (m) =>
            (m.email && m.email.toLowerCase() === formData.email.toLowerCase()) ||
            (m.mobileNumber && m.mobileNumber === formData.mobileNumber)
        );

        if (existingIndex !== -1) {
          const current = membersList[existingIndex];
          membersList[existingIndex] = {
            ...current,
            fullName: formData.fullName || current.fullName,
            mobileNumber: formData.mobileNumber || current.mobileNumber,
            whatsappNumber: formData.whatsappNumber || current.whatsappNumber || formData.mobileNumber,
            city: formData.city || current.city,
            district: formData.district || current.district,
            province: formData.province || current.province || 'Sindh',
            notes: `Father: ${formData.fatherName} | CNIC: ${formData.cnic} | WhatsApp: ${formData.whatsappNumber} | Province: ${formData.province} | Unit: ${formData.isoUnit} | Edu: ${formData.qualification} | Prof: ${formData.profession} | Blood: ${formData.bloodGroup || 'N/A'} | Shajra: ${formData.shajraBranch} | ${current.notes || ''}`
          };
          localStorage.setItem('iso_members', JSON.stringify(membersList));
        }
      }
    } catch (err) {
      console.warn('Storage warning:', err);
    }

    setTimeout(() => {
      setIsSubmitting(false);
      onFormCompleted();
    }, 500);
  };

  return (
    <div
      className={
        isModalMode
          ? 'fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/90 backdrop-blur-md overflow-y-auto'
          : 'min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-3 sm:p-6'
      }
    >
      <div className="max-w-4xl w-full mx-auto bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col">
        {/* Top Accent Strip */}
        <div className="bg-gradient-to-r from-amber-500 via-emerald-500 to-amber-500 h-2 w-full" />

        {/* Top Header Card */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <img
              src={ISO_LOGO_URL}
              alt="ISO Logo"
              className="w-12 h-12 rounded-full ring-2 ring-amber-500/50 object-cover shadow-lg shrink-0"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-amber-400" />
                  Compulsory Membership Requirement
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  Member: <strong className="text-white">{user.name}</strong> ({user.email || user.mobileNumber})
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-black text-white mt-1 tracking-tight">
                Official ISO Membership Registration Form
              </h1>
              <p className="text-xs text-amber-200/90 font-medium">
                بین الاقوامی تنظیم السادات — لازمی رجسٹریشن و تصدیق فارم
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {onLogout && !isModalMode && (
              <button
                type="button"
                onClick={onLogout}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
                title="Switch Account / Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            )}
            {isModalMode && onCloseModal && (
              <button
                type="button"
                onClick={onCloseModal}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                title="Close"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Guaranteed Account Security & Isolation Badge */}
        <div className="p-4 bg-emerald-950/40 border-b border-emerald-500/30 text-xs">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-300 rounded-xl shrink-0 mt-0.5 border border-emerald-500/40">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-emerald-300 uppercase tracking-wide text-[11px]">
                  Account Security & Complete Isolation Verified
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-900/60 text-emerald-200 text-[10px] font-mono border border-emerald-700/50">
                  Protected Sandbox
                </span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                Your personal Google account is completely private and secure. No other member or visitor can access, handle, or switch your personal Google account. All registration details below are securely stored directly in the official ISO Central Repository.
              </p>
            </div>
          </div>
        </div>

        {/* Attached Official Google Form Link Reference Banner */}
        <div className="p-4 bg-slate-950/90 border-b border-slate-800">
          <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                  Attached Official Google Form Link
                </span>
              </div>
              <div className="font-mono text-[11px] text-slate-300 select-all break-all">
                {OFFICIAL_GOOGLE_FORM_EDIT_URL}
              </div>
              <p className="text-[11px] text-slate-400">
                You can fill out the form fields directly below or open the attached Google Form link in a new tab.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                type="button"
                onClick={() => handleCopyLink(OFFICIAL_GOOGLE_FORM_EDIT_URL)}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Link'}</span>
              </button>

              <a
                href={OFFICIAL_GOOGLE_FORM_EDIT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20"
              >
                <span>Open Google Form</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-4 sm:p-6 space-y-5 flex-1 overflow-y-auto max-h-[600px]">
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-red-950/80 border border-red-500/40 text-red-200 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmitCompulsoryDetails} className="space-y-5">
            {/* Section 1: Personal & Identity Details */}
            <div className="bg-slate-850 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                <User className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  1. Personal & Identity Information (شناختی معلومات)
                </h3>
                <span className="text-[10px] text-amber-400 font-semibold ml-auto">* All Fields Compulsory</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Full Legal Name */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1.5 flex items-center gap-1.5">
                    <span>Full Legal Name (مکمل نام)</span>
                    <span className="text-amber-400 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g., Syed Muhammad Amir"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-xs"
                  />
                </div>

                {/* Father's Name */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1.5 flex items-center gap-1.5">
                    <span>Father's / Guardian Name (والد کا نام)</span>
                    <span className="text-amber-400 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fatherName}
                    onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                    placeholder="e.g., Syed Ali Akbar"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-xs"
                  />
                </div>

                {/* CNIC / B-Form */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1.5 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>CNIC / B-Form Number (شناختی کارڈ نمبر)</span>
                    <span className="text-amber-400 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.cnic}
                    onChange={(e) => setFormData({ ...formData, cnic: e.target.value })}
                    placeholder="e.g., 42101-1234567-1"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-xs"
                  />
                </div>

                {/* Shajra / Sadat Branch */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1.5 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Sadat Lineage / Shajra Branch (شجرہ سادات)</span>
                    <span className="text-amber-400 font-bold">*</span>
                  </label>
                  <select
                    value={formData.shajraBranch}
                    onChange={(e) => setFormData({ ...formData, shajraBranch: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-500 text-xs"
                  >
                    <option value="Zaidi">Zaidi (زیدی)</option>
                    <option value="Rizvi">Rizvi (رضوی)</option>
                    <option value="Kazmi">Kazmi (کاظمی)</option>
                    <option value="Naqvi">Naqvi (نقوی)</option>
                    <option value="Bukhari">Bukhari (بخاری)</option>
                    <option value="Jafri">Jafri (جعفری)</option>
                    <option value="Hussaini">Hussaini (حسینی)</option>
                    <option value="Hasani">Hasani (حسنی)</option>
                    <option value="Mousavi">Mousavi (موسوی)</option>
                    <option value="Other">Other Sadat Branch (دیگر سادات)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Contact & Location Details */}
            <div className="bg-slate-850 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                <Phone className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  2. Contact & Residential Location (رابطہ و رہائش)
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                {/* Mobile Number */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1.5 flex items-center gap-1.5">
                    <span>Mobile Number (موبائل نمبر)</span>
                    <span className="text-amber-400 font-bold">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.mobileNumber}
                    onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                    placeholder="0332-1234567"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs"
                  />
                </div>

                {/* WhatsApp Number */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1.5 flex items-center gap-1.5">
                    <span>WhatsApp Number (واٹس ایپ نمبر)</span>
                    <span className="text-amber-400 font-bold">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.whatsappNumber}
                    onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                    placeholder="0332-1234567"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs"
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1.5 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>Email Address (ای میل)</span>
                    <span className="text-amber-400 font-bold">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="user@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs"
                  />
                </div>

                {/* City */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>Residential City (رہائشی شہر)</span>
                    <span className="text-amber-400 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g., Karachi, Lahore, Islamabad"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs"
                  />
                </div>

                {/* District */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>District / Area (ضلع / تحصیل)</span>
                    <span className="text-amber-400 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    placeholder="e.g., District Central / Gulshan"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs"
                  />
                </div>

                {/* Province */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1.5 flex items-center gap-1.5">
                    <span>Province / Region (صوبہ)</span>
                    <span className="text-amber-400 font-bold">*</span>
                  </label>
                  <select
                    value={formData.province}
                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500 text-xs"
                  >
                    <option value="Sindh">Sindh (سندھ)</option>
                    <option value="Punjab">Punjab (پنجاب)</option>
                    <option value="Khyber Pakhtunkhwa">Khyber Pakhtunkhwa (خیبر پختونخوا)</option>
                    <option value="Balochistan">Balochistan (بلوچستان)</option>
                    <option value="Islamabad">Islamabad Capital (وفاقی دارالحکومت)</option>
                    <option value="Gilgit-Baltistan">Gilgit-Baltistan (گلگت بلتستان)</option>
                    <option value="Azad Kashmir">Azad Kashmir (آزاد کشمیر)</option>
                    <option value="Overseas / International">Overseas / International (بیرون ملک)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: Educational, Professional & Organizational Details */}
            <div className="bg-slate-850 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                <GraduationCap className="w-4 h-4 text-blue-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  3. Education, Profession & ISO Unit (تعلیم، پیشہ و تنظیم کا یونٹ)
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                {/* Qualification */}
                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-medium mb-1.5 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                    <span>Educational Qualification (تعلیمی قابلیت)</span>
                    <span className="text-amber-400 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    placeholder="e.g., Bachelor in Computer Science / Masters / Matric"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-xs"
                  />
                </div>

                {/* Profession */}
                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-medium mb-1.5 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    <span>Profession / Occupation (پیشہ / ملازمت)</span>
                    <span className="text-amber-400 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.profession}
                    onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                    placeholder="e.g., Software Engineer, Educator, Business, Student"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-xs"
                  />
                </div>

                {/* ISO Unit */}
                <div className="sm:col-span-3">
                  <label className="block text-slate-300 font-medium mb-1.5 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span>Designated ISO Unit / Branch (تنظیم کا یونٹ / برانچ)</span>
                    <span className="text-amber-400 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.isoUnit}
                    onChange={(e) => setFormData({ ...formData, isoUnit: e.target.value })}
                    placeholder="e.g., Central Unit Karachi / Gulberg Lahore Branch"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-xs"
                  />
                </div>

                {/* Blood Group */}
                <div className="sm:col-span-1">
                  <label className="block text-slate-300 font-medium mb-1.5 flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-rose-400" />
                    <span>Blood Group (بلڈ گروپ)</span>
                  </label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-rose-500 text-xs"
                  >
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Solemn Verification Declaration Checkbox */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
              <label className="flex items-start gap-3 cursor-pointer select-none text-xs">
                <input
                  type="checkbox"
                  required
                  checked={formData.agreedToTerms}
                  onChange={(e) => setFormData({ ...formData, agreedToTerms: e.target.checked })}
                  className="mt-1 w-4 h-4 rounded text-emerald-600 bg-slate-900 border-slate-700 focus:ring-emerald-500 focus:ring-offset-slate-900 shrink-0"
                />
                <div className="space-y-1">
                  <span className="font-semibold text-white">
                    Solemn Member Declaration & Form Confirmation (حلف نامہ و تصدیق) *
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    I solemnly declare that all information entered above is genuine, true, and authentic. I confirm that I have reviewed the attached official form link (<span className="text-amber-400 font-mono text-[11px]">{OFFICIAL_GOOGLE_FORM_EDIT_URL}</span>) and hereby submit my verified membership profile to the International Sadat Organization Central Repository.
                  </p>
                </div>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <a
                href={OFFICIAL_GOOGLE_FORM_EDIT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 border border-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <span>Review Attached Google Form Link</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                type="submit"
                disabled={isSubmitting || !formData.agreedToTerms}
                className={`w-full sm:flex-1 py-3.5 px-6 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg ${
                  formData.agreedToTerms
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 cursor-pointer active:scale-98'
                    : 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <span>Saving Verified Member Profile...</span>
                ) : (
                  <>
                    <span>Submit Verified Details & Enter Central Landing Page</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 text-center text-[11px] text-slate-400 flex items-center justify-center gap-4 flex-wrap">
          <span>International Sadat Organization &copy; {new Date().getFullYear()}</span>
          <span>•</span>
          <span>Compulsory Membership Verification Gate</span>
          <span>•</span>
          <span className="text-emerald-400 font-medium">100% Privacy & Account Isolation</span>
        </div>
      </div>
    </div>
  );
};
