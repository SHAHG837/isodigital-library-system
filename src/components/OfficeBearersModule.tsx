import React, { useState } from 'react';
import { OfficeBearer, Designation, AdminCredential } from '../types';
import {
  Award,
  Search,
  Plus,
  Edit2,
  Trash2,
  Phone,
  MessageSquare,
  MapPin,
  Calendar,
  X,
  Settings,
  Shield,
  UserCheck,
  AlertTriangle,
  Lock,
  ShieldAlert,
  Printer,
  Download,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Check
} from 'lucide-react';
import { exportToExcel, printElement } from '../utils/exportImport';
import { OfficeBearerCardModal } from './OfficeBearerCardModal';
import { compressImage } from '../utils/imageUtils';

interface OfficeBearersModuleProps {
  officeBearers: OfficeBearer[];
  designations: Designation[];
  onAddOfficeBearer: (bearer: OfficeBearer) => void;
  onEditOfficeBearer: (bearer: OfficeBearer) => void;
  onDeleteOfficeBearer: (id: string) => void;
  onAddDesignation: (desg: Designation) => void;
  onEditDesignation?: (desg: Designation, oldTitle?: string) => void;
  onDeleteDesignation: (id: string) => void;
  showAddModalDirectly?: boolean;
  setShowAddModalDirectly?: (val: boolean) => void;
  currentLoggedInUser?: AdminCredential | null;
}

export const OfficeBearersModule: React.FC<OfficeBearersModuleProps> = ({
  officeBearers,
  designations,
  onAddOfficeBearer,
  onEditOfficeBearer,
  onDeleteOfficeBearer,
  onAddDesignation,
  onEditDesignation,
  onDeleteDesignation,
  showAddModalDirectly,
  setShowAddModalDirectly,
  currentLoggedInUser
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [designationFilter, setDesignationFilter] = useState('All');
  
  const [showModal, setShowModal] = useState(showAddModalDirectly || false);
  const [editingBearer, setEditingBearer] = useState<OfficeBearer | null>(null);
  const [deletingBearer, setDeletingBearer] = useState<OfficeBearer | null>(null);
  const [cardViewingBearer, setCardViewingBearer] = useState<OfficeBearer | null>(null);

  // Compute permissions
  const isSuperAdmin = currentLoggedInUser?.isSuperAdmin || currentLoggedInUser?.role === 'SuperAdmin';
  const isAdminOrManager = isSuperAdmin || currentLoggedInUser?.role === 'Admin' || currentLoggedInUser?.role === 'Manager';
  const isRegularMember = Boolean(currentLoggedInUser && !isAdminOrManager);

  // Identify if the logged in user is an appointed office bearer
  const myOfficeBearerRecord = officeBearers.find((b) =>
    (currentLoggedInUser?.mobileNumber && b.mobileNumber === currentLoggedInUser.mobileNumber) ||
    (currentLoggedInUser?.name && b.name.toLowerCase() === currentLoggedInUser.name.toLowerCase())
  );

  // Designation Manager Modal
  const [showDesgModal, setShowDesgModal] = useState(false);
  const [newDesgTitle, setNewDesgTitle] = useState('');
  const [newDesgLevel, setNewDesgLevel] = useState<'Central' | 'Provincial' | 'Divisional' | 'District' | 'City'>('Central');
  const [editingDesgId, setEditingDesgId] = useState<string | null>(null);
  const [editDesgTitle, setEditDesgTitle] = useState('');
  const [editDesgLevel, setEditDesgLevel] = useState<'Central' | 'Provincial' | 'Divisional' | 'District' | 'City'>('Central');
  const [deletingDesg, setDeletingDesg] = useState<Designation | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<OfficeBearer>>({
    name: '',
    designation: designations[0]?.title || 'Central President',
    mobileNumber: '',
    whatsapp: '',
    city: 'Islamabad',
    district: 'Islamabad',
    division: 'Islamabad',
    province: 'Islamabad Capital Territory',
    country: 'Pakistan',
    profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    appointmentDate: new Date().toISOString().split('T')[0],
    notes: '',
    status: 'Active'
  });

  const filteredBearers = officeBearers.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.mobileNumber.includes(searchTerm);

    const matchesDesignation = designationFilter === 'All' || b.designation === designationFilter;

    return matchesSearch && matchesDesignation;
  });

  // Calculate next available Office Bearer ID without collisions
  const getNextBearerId = () => {
    const numericIds = officeBearers
      .map((b) => {
        const match = b.id?.match(/\d+$/);
        return match ? parseInt(match[0], 10) : 0;
      })
      .filter((n) => !isNaN(n));
    const nextNum = (numericIds.length > 0 ? Math.max(...numericIds) : 0) + 1;
    return `ISO-OB-2026-${String(nextNum).padStart(3, '0')}`;
  };

  const handleOpenAdd = () => {
    setEditingBearer(null);
    setFormData({
      name: '',
      designation: designations[0]?.title || 'Central President',
      mobileNumber: '',
      whatsapp: '',
      city: 'Islamabad',
      district: 'Islamabad',
      division: 'Islamabad',
      province: 'Islamabad Capital Territory',
      country: 'Pakistan',
      profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
      appointmentDate: new Date().toISOString().split('T')[0],
      notes: '',
      status: 'Active'
    });
    setShowModal(true);
  };

  const handleOpenEdit = (b: OfficeBearer) => {
    setEditingBearer(b);
    setFormData({ ...b });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.mobileNumber) return;

    if (editingBearer) {
      onEditOfficeBearer({
        ...editingBearer,
        ...(formData as OfficeBearer)
      });
    } else {
      const newBearer: OfficeBearer = {
        id: getNextBearerId(),
        name: formData.name || '',
        designation: formData.designation || 'Central President',
        mobileNumber: formData.mobileNumber || '',
        whatsapp: formData.whatsapp || formData.mobileNumber || '',
        city: formData.city || 'Islamabad',
        district: formData.district || 'Islamabad',
        division: formData.division || 'Islamabad',
        province: formData.province || 'Islamabad Capital Territory',
        country: formData.country || 'Pakistan',
        profilePhoto: formData.profilePhoto || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
        appointmentDate: formData.appointmentDate || new Date().toISOString().split('T')[0],
        notes: formData.notes || '',
        status: (formData.status as any) || 'Active'
      };
      onAddOfficeBearer(newBearer);
      // Immediately open card preview for Super Admin so they can print or download the card
      setCardViewingBearer(newBearer);
    }

    setShowModal(false);
    if (setShowAddModalDirectly) setShowAddModalDirectly(false);
  };

  const handleAddDesgSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesgTitle.trim()) return;

    const newDesg: Designation = {
      id: `DESG-${Date.now()}`,
      title: newDesgTitle.trim(),
      level: newDesgLevel
    };

    onAddDesignation(newDesg);
    setNewDesgTitle('');
  };

  const handleStartEditDesg = (d: Designation) => {
    setEditingDesgId(d.id);
    setEditDesgTitle(d.title);
    setEditDesgLevel(d.level);
  };

  const handleCancelEditDesg = () => {
    setEditingDesgId(null);
    setEditDesgTitle('');
  };

  const handleSaveEditDesg = (e: React.FormEvent, originalDesg: Designation) => {
    e.preventDefault();
    if (!editDesgTitle.trim()) return;

    const oldTitle = originalDesg.title;
    const updated: Designation = {
      ...originalDesg,
      title: editDesgTitle.trim(),
      level: editDesgLevel
    };

    if (onEditDesignation) {
      onEditDesignation(updated, oldTitle);
    }
    setEditingDesgId(null);
    setEditDesgTitle('');
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 500, 500, 0.82);
        setFormData((prev) => ({ ...prev, profilePhoto: compressed }));
      } catch (err) {
        console.error('Error compressing uploaded photo:', err);
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData((prev) => ({ ...prev, profilePhoto: reader.result as string }));
        };
        reader.readAsDataURL(file);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Super Admin Full Control Hub Banner */}
      {isSuperAdmin && (
        <div className="bg-gradient-to-r from-amber-950/90 via-slate-900 to-slate-900 p-5 rounded-3xl border-2 border-amber-500/60 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-3 bg-amber-500/20 text-amber-400 border border-amber-500/50 rounded-2xl shrink-0 mt-0.5">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <span>سپر ایڈمن مکمل کنٹرول (Super Admin Control Hub)</span>
                </h2>
                <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/40">
                  Full Authority
                </span>
              </div>
              <p className="text-xs text-amber-200/90 leading-relaxed" dir="rtl">
                سپر ایڈمن (سید محمد عامر نقوی البخاری) کو مکمل کنٹرول حاصل ہے: آپ کسی بھی عہدیدار کا کارڈ بنا سکتے ہیں، تفصیلات ایڈٹ کر سکتے ہیں، کارڈ پرنٹ یا ڈاؤن لوڈ کر سکتے ہیں اور ریکارڈ ڈیلیٹ کر سکتے ہیں۔
              </p>
              <p className="text-[11px] text-slate-400">
                You have unrestricted administrative authority: create, edit, print/download, and delete any office bearer card.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
            <button
              type="button"
              onClick={handleOpenAdd}
              className="w-full md:w-auto px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>نیا کارڈ و عہدیدار بنائیں (Issue Card)</span>
            </button>
          </div>
        </div>
      )}

      {/* Official Card Download Notice for Logged-In Office Bearer */}
      {myOfficeBearerRecord && (
        <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 p-4 rounded-2xl border-2 border-emerald-500/60 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-xl shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="font-extrabold text-white text-sm flex items-center gap-2">
                <span>محترم {myOfficeBearerRecord.name} ({myOfficeBearerRecord.designation})</span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
                  Verified Official
                </span>
              </p>
              <p className="text-slate-300 text-xs mt-0.5" dir="rtl">
                آپ اپنے اکاؤنٹ سے اپنا آفیشل شناختی کارڈ براہِ راست ڈاؤن لوڈ اور پرنٹ کر سکتے ہیں۔
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setCardViewingBearer(myOfficeBearerRecord)}
            className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
          >
            <Printer className="w-4 h-4" />
            <span>میرا آفیشل کارڈ پرنٹ / ڈاؤن لوڈ کریں</span>
          </button>
        </div>
      )}

      {/* Read-Only Notice for General Members */}
      {isRegularMember && !myOfficeBearerRecord && (
        <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-slate-900 p-4 rounded-2xl border border-amber-500/40 text-xs text-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded-xl shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <p className="font-extrabold text-white text-sm flex items-center gap-2">
                <span>Cabinet Directory (Read-Only Mode)</span>
                <span className="px-2 py-0.5 text-[10px] font-mono uppercase bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">
                  Restricted Access
                </span>
              </p>
              <p className="text-slate-300 text-xs mt-0.5">
                Logged in as <strong>{currentLoggedInUser?.name}</strong>. General members can view the official ISO Executive Cabinet directory. Adding, editing, or deleting cabinet appointments is restricted.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Top Header & Designation Toolbar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-500" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Office Bearers Cabinet</h1>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded-full">
              {filteredBearers.length} Executives
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Central, provincial, divisional, and district office bearers directory.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {!isRegularMember && (
            <>
              <button
                onClick={handleOpenAdd}
                className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all"
              >
                <Plus className="w-4 h-4" /> Add Office Bearer / Issue Card
              </button>
              <button
                onClick={() => setShowDesgModal(true)}
                className="px-3.5 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <Settings className="w-4 h-4 text-amber-500" /> Designations Manager
              </button>
            </>
          )}
          <button
            onClick={() => exportToExcel(filteredBearers, 'ISO_Office_Bearers.xlsx')}
            className="px-3.5 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
          >
            Export Excel
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
        <div className="relative col-span-2">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search Name, Designation, City, Phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-slate-100"
          />
        </div>

        <div>
          <select
            value={designationFilter}
            onChange={(e) => setDesignationFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-slate-100 font-medium"
          >
            <option value="All">All Designations</option>
            {designations.map((d) => (
              <option key={d.id} value={d.title}>{d.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Office Bearers Grid View */}
      <div id="office-bearers-printable" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBearers.map((bearer) => {
          const isThisUser = Boolean(
            currentLoggedInUser &&
            ((currentLoggedInUser.mobileNumber && bearer.mobileNumber === currentLoggedInUser.mobileNumber) ||
             (currentLoggedInUser.name && bearer.name.toLowerCase() === currentLoggedInUser.name.toLowerCase()))
          );

          return (
            <div
              key={bearer.id}
              className={`bg-white dark:bg-slate-800 rounded-3xl p-5 border shadow-sm hover:shadow-md transition-all flex flex-col justify-between group ${
                isThisUser
                  ? 'border-amber-500/80 ring-2 ring-amber-500/20'
                  : 'border-slate-200/80 dark:border-slate-700/80'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <img
                    src={bearer.profilePhoto}
                    alt={bearer.name}
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-amber-500/30 shadow-md shrink-0"
                  />
                  <div className="text-right">
                    <span className="font-mono text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800">
                      {bearer.id}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1">Appointed: {bearer.appointmentDate}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">{bearer.name}</h3>
                    {isThisUser && (
                      <span className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 rounded text-[9px] font-bold">
                        ★ You
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mt-0.5">{bearer.designation}</p>
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>{bearer.mobileNumber}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>WhatsApp: {bearer.whatsapp}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="truncate">{bearer.city}, {bearer.district}, {bearer.province}</span>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/80 flex items-center justify-between gap-2 no-print flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                    {bearer.status}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 ml-auto">
                  {/* Print/Download Card Button - Available for everyone / self */}
                  <button
                    type="button"
                    onClick={() => setCardViewingBearer(bearer)}
                    className="px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 rounded-xl font-bold text-[11px] flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                    title="Print or Download Official ID Card"
                  >
                    <Printer className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>{isThisUser ? 'My Card' : 'Print Card'}</span>
                  </button>

                  {/* Super Admin Full Control Actions: Edit & Delete */}
                  {isSuperAdmin && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(bearer)}
                        className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 rounded-xl transition-colors border border-blue-200 dark:border-blue-900/50 cursor-pointer"
                        title="Super Admin: Edit Bearer Details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingBearer(bearer)}
                        className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/60 rounded-xl transition-colors border border-red-200 dark:border-red-900/50 cursor-pointer"
                        title="Super Admin: Delete Bearer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}

                  {/* Non-Super Admin manager/admin */}
                  {!isSuperAdmin && !isRegularMember && (
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(bearer)}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                      title="Edit Details"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Office Bearer Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                {editingBearer ? 'Edit Office Bearer' : 'Appoint New Office Bearer'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Syed Ghulam Mustafa Shah"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Designation *</label>
                  <select
                    value={formData.designation || designations[0]?.title}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-slate-100 font-semibold"
                  >
                    {designations.map((d) => (
                      <option key={d.id} value={d.title}>{d.title} ({d.level})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Mobile Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="03001234567"
                    value={formData.mobileNumber || ''}
                    onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value, whatsapp: formData.whatsapp || e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">WhatsApp Number</label>
                  <input
                    type="text"
                    placeholder="03001234567"
                    value={formData.whatsapp || ''}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">City *</label>
                  <input
                    type="text"
                    required
                    placeholder="Islamabad"
                    value={formData.city || ''}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">District *</label>
                  <input
                    type="text"
                    required
                    placeholder="Islamabad"
                    value={formData.district || ''}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Division *</label>
                  <input
                    type="text"
                    required
                    placeholder="Islamabad"
                    value={formData.division || ''}
                    onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Province *</label>
                  <input
                    type="text"
                    required
                    placeholder="Islamabad Capital Territory"
                    value={formData.province || ''}
                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Appointment Date</label>
                  <input
                    type="date"
                    value={formData.appointmentDate || ''}
                    onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Profile Photo Upload</label>
                <div className="flex items-center gap-3">
                  <img src={formData.profilePhoto} alt="Preview" className="w-12 h-12 rounded-full object-cover ring-2 ring-amber-500/40" />
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-amber-800" />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Appointment Notes</label>
                <textarea
                  rows={2}
                  placeholder="Key responsibilities or jurisdiction notes..."
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-md">
                  {editingBearer ? 'Save Changes' : 'Appoint Office Bearer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Designation Manager Modal */}
      {showDesgModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-amber-500" /> Designation Manager
              </h3>
              <button onClick={() => setShowDesgModal(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDesgSubmit} className="mt-4 flex gap-2">
              <input
                type="text"
                required
                placeholder="New Designation Title (e.g. Media Secretary)"
                value={newDesgTitle}
                onChange={(e) => setNewDesgTitle(e.target.value)}
                className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-slate-100"
              />
              <select
                value={newDesgLevel}
                onChange={(e: any) => setNewDesgLevel(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-slate-100"
              >
                <option value="Central">Central</option>
                <option value="Provincial">Provincial</option>
                <option value="Divisional">Divisional</option>
                <option value="District">District</option>
                <option value="City">City</option>
              </select>
              <button type="submit" className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl">
                Add
              </button>
            </form>

            <div className="mt-5 max-h-72 overflow-y-auto space-y-2 pr-1">
              {designations.map((d) => {
                const isEditing = editingDesgId === d.id;

                if (isEditing) {
                  return (
                    <form
                      key={d.id}
                      onSubmit={(e) => handleSaveEditDesg(e, d)}
                      className="p-2.5 bg-amber-500/10 dark:bg-amber-950/30 rounded-xl text-xs border border-amber-500/40 space-y-2"
                    >
                      <div className="flex gap-2">
                        <input
                          type="text"
                          required
                          value={editDesgTitle}
                          onChange={(e) => setEditDesgTitle(e.target.value)}
                          className="flex-1 px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-amber-400 dark:border-amber-600 rounded-lg text-slate-900 dark:text-slate-100 font-bold focus:ring-1 focus:ring-amber-500"
                          placeholder="Designation Title"
                        />
                        <select
                          value={editDesgLevel}
                          onChange={(e: any) => setEditDesgLevel(e.target.value)}
                          className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-amber-400 dark:border-amber-600 rounded-lg text-slate-900 dark:text-slate-100 font-semibold"
                        >
                          <option value="Central">Central</option>
                          <option value="Provincial">Provincial</option>
                          <option value="Divisional">Divisional</option>
                          <option value="District">District</option>
                          <option value="City">City</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={handleCancelEditDesg}
                          className="px-3 py-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-3.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow flex items-center gap-1 transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" /> Save Changes
                        </button>
                      </div>
                    </form>
                  );
                }

                return (
                  <div
                    key={d.id}
                    className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-900/50 rounded-xl text-xs border border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                  >
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{d.title}</p>
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">{d.level} Tier</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleStartEditDesg(d)}
                        className="p-1.5 text-slate-400 hover:text-amber-500 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-colors"
                        title="Edit Designation"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingDesg(d)}
                        className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                        title="Delete Designation"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-700 text-right">
              <button
                type="button"
                onClick={() => {
                  setShowDesgModal(false);
                  handleCancelEditDesg();
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Designation Confirmation Modal */}
      {deletingDesg && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Delete Designation</h3>
              </div>
              <button
                onClick={() => setDeletingDesg(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to remove designation <span className="font-extrabold text-red-500">{deletingDesg.title}</span> ({deletingDesg.level} Tier)? This designation will be permanently removed from the cabinet hierarchy.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingDesg(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteDesignation(deletingDesg.id);
                  setDeletingDesg(null);
                }}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" /> Delete Designation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Office Bearer Confirmation Modal */}
      {deletingBearer && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Confirm Bearer Removal</h3>
              </div>
              <button
                onClick={() => setDeletingBearer(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to remove office bearer record for{' '}
              <span className="font-extrabold text-red-500">{deletingBearer.name}</span> ({deletingBearer.designation}) from the ISO Leadership Registry?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingBearer(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteOfficeBearer(deletingBearer.id);
                  setDeletingBearer(null);
                }}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" /> Remove Bearer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Office Bearer Card Modal (Print & Download) */}
      <OfficeBearerCardModal
        isOpen={Boolean(cardViewingBearer)}
        bearer={cardViewingBearer}
        onClose={() => setCardViewingBearer(null)}
        onEdit={(b) => handleOpenEdit(b)}
        onDelete={(id) => {
          const target = officeBearers.find((o) => o.id === id);
          if (target) setDeletingBearer(target);
        }}
        isSuperAdmin={isSuperAdmin}
        isOwnRecord={Boolean(
          cardViewingBearer &&
          ((currentLoggedInUser?.mobileNumber && cardViewingBearer.mobileNumber === currentLoggedInUser.mobileNumber) ||
           (currentLoggedInUser?.name && cardViewingBearer.name.toLowerCase() === currentLoggedInUser.name.toLowerCase()))
        )}
      />
    </div>
  );
};
