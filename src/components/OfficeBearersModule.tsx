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
  ShieldAlert
} from 'lucide-react';
import { exportToExcel, printElement } from '../utils/exportImport';

interface OfficeBearersModuleProps {
  officeBearers: OfficeBearer[];
  designations: Designation[];
  onAddOfficeBearer: (bearer: OfficeBearer) => void;
  onEditOfficeBearer: (bearer: OfficeBearer) => void;
  onDeleteOfficeBearer: (id: string) => void;
  onAddDesignation: (desg: Designation) => void;
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

  // Compute permissions
  const isSuperAdmin = currentLoggedInUser?.isSuperAdmin || currentLoggedInUser?.role === 'SuperAdmin';
  const isAdminOrManager = isSuperAdmin || currentLoggedInUser?.role === 'Admin' || currentLoggedInUser?.role === 'Manager';
  const isRegularMember = Boolean(currentLoggedInUser && !isAdminOrManager);

  // Designation Manager Modal
  const [showDesgModal, setShowDesgModal] = useState(false);
  const [newDesgTitle, setNewDesgTitle] = useState('');
  const [newDesgLevel, setNewDesgLevel] = useState<'Central' | 'Provincial' | 'Divisional' | 'District' | 'City'>('Central');

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
        id: `ISO-OB-2026-${String(officeBearers.length + 1).padStart(3, '0')}`,
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
        notes: formData.notes,
        status: (formData.status as any) || 'Active'
      };
      onAddOfficeBearer(newBearer);
    }

    setShowModal(false);
    if (setShowAddModalDirectly) setShowAddModalDirectly(false);
  };

  const handleAddDesgSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesgTitle) return;

    const newDesg: Designation = {
      id: `DESG-${Date.now()}`,
      title: newDesgTitle,
      level: newDesgLevel
    };

    onAddDesignation(newDesg);
    setNewDesgTitle('');
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, profilePhoto: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Read-Only Notice for General Members */}
      {isRegularMember && (
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
                <Plus className="w-4 h-4" /> Add Office Bearer
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
        {filteredBearers.map((bearer) => (
          <div
            key={bearer.id}
            className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
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
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">{bearer.name}</h3>
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

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/80 flex items-center justify-between no-print">
              <span className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                {bearer.status}
              </span>
              {!isRegularMember && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(bearer)}
                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingBearer(bearer)}
                    className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
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

            <div className="mt-5 max-h-60 overflow-y-auto space-y-2 pr-1">
              {designations.map((d) => (
                <div key={d.id} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-900/50 rounded-xl text-xs border border-slate-100 dark:border-slate-800">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{d.title}</p>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">{d.level} Tier</span>
                  </div>
                  <button
                    onClick={() => onDeleteDesignation(d.id)}
                    className="p-1 text-slate-400 hover:text-red-500"
                    title="Delete Designation"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-700 text-right">
              <button onClick={() => setShowDesgModal(false)} className="px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-xl">
                Done
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
    </div>
  );
};
