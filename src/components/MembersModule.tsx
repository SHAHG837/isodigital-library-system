import React, { useState } from 'react';
import { Member, AdminCredential } from '../types';
import {
  Users,
  Search,
  Plus,
  Filter,
  Download,
  Printer,
  Eye,
  Edit2,
  Trash2,
  Phone,
  MessageSquare,
  Mail,
  MapPin,
  Calendar,
  X,
  CheckCircle2,
  User,
  Image as ImageIcon,
  AlertTriangle,
  Lock,
  ShieldAlert,
  UserCheck,
  Sparkles
} from 'lucide-react';
import { exportToExcel, exportToCSV, exportToJSON, printElement, printMemberDirectoryTable } from '../utils/exportImport';

interface MembersModuleProps {
  members: Member[];
  onAddMember: (member: Member) => void;
  onEditMember: (member: Member) => void;
  onDeleteMember: (id: string) => void;
  showAddModalDirectly?: boolean;
  setShowAddModalDirectly?: (val: boolean) => void;
  currentLoggedInUser?: AdminCredential | null;
}

export const MembersModule: React.FC<MembersModuleProps> = ({
  members,
  onAddMember,
  onEditMember,
  onDeleteMember,
  showAddModalDirectly,
  setShowAddModalDirectly,
  currentLoggedInUser
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [provinceFilter, setProvinceFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showModal, setShowModal] = useState(showAddModalDirectly || false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [deletingMember, setDeletingMember] = useState<Member | null>(null);

  // Compute permissions
  const isSuperAdmin = currentLoggedInUser?.isSuperAdmin || currentLoggedInUser?.role === 'SuperAdmin';
  const isAdminOrManager = isSuperAdmin || currentLoggedInUser?.role === 'Admin' || currentLoggedInUser?.role === 'Manager';
  const isRegularMember = Boolean(currentLoggedInUser && !isAdminOrManager);

  // Find logged in member's record
  const myMemberRecord = members.find((m) =>
    (currentLoggedInUser?.mobileNumber && m.mobileNumber === currentLoggedInUser.mobileNumber) ||
    (currentLoggedInUser?.name && m.fullName.toLowerCase() === currentLoggedInUser.name.toLowerCase())
  );

  // Form State
  const [formData, setFormData] = useState<Partial<Member>>({
    fullName: currentLoggedInUser?.name || '',
    mobileNumber: currentLoggedInUser?.mobileNumber || '',
    whatsappNumber: currentLoggedInUser?.mobileNumber || '',
    city: 'Karachi',
    district: 'Karachi Central',
    division: 'Karachi',
    province: 'Sindh',
    country: 'Pakistan',
    email: '',
    address: '',
    joiningDate: new Date().toISOString().split('T')[0],
    profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    notes: 'Member Registered via Security Gateway',
    status: 'Active'
  });

  const provincesList = ['All', 'Sindh', 'Punjab', 'Khyber Pakhtunkhwa', 'Balochistan', 'Islamabad Capital Territory', 'Gilgit-Baltistan', 'Azad Jammu & Kashmir', 'Overseas'];

  // Filter logic: If regular member, restrict strictly to myMemberRecord
  const visibleMembersList = isRegularMember
    ? (myMemberRecord ? [myMemberRecord] : [])
    : members;

  const filteredMembers = visibleMembersList.filter((m) => {
    const matchesSearch =
      m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.mobileNumber.includes(searchTerm) ||
      m.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.district.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesProvince = provinceFilter === 'All' || m.province === provinceFilter;
    const matchesStatus = statusFilter === 'All' || m.status === statusFilter;

    return matchesSearch && matchesProvince && matchesStatus;
  });

  const handleOpenAdd = () => {
    setEditingMember(null);
    const nextId = `ISO-MEM-2026-${String(members.length + 1).padStart(3, '0')}`;
    setFormData({
      fullName: '',
      mobileNumber: '',
      whatsappNumber: '',
      city: 'Karachi',
      district: 'Karachi Central',
      division: 'Karachi',
      province: 'Sindh',
      country: 'Pakistan',
      email: '',
      address: '',
      joiningDate: new Date().toISOString().split('T')[0],
      profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      notes: '',
      status: 'Active'
    });
    setShowModal(true);
  };

  const handleOpenEdit = (m: Member) => {
    setEditingMember(m);
    setFormData({ ...m });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.mobileNumber) return;

    if (editingMember) {
      onEditMember({
        ...editingMember,
        ...(formData as Member)
      });
    } else {
      const newMember: Member = {
        id: `ISO-MEM-2026-${String(members.length + 1).padStart(3, '0')}`,
        fullName: formData.fullName || '',
        mobileNumber: formData.mobileNumber || '',
        whatsappNumber: formData.whatsappNumber || formData.mobileNumber || '',
        city: formData.city || 'Karachi',
        district: formData.district || 'Karachi Central',
        division: formData.division || 'Karachi',
        province: formData.province || 'Sindh',
        country: formData.country || 'Pakistan',
        email: formData.email,
        address: formData.address,
        joiningDate: formData.joiningDate || new Date().toISOString().split('T')[0],
        profilePhoto: formData.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
        notes: formData.notes,
        status: (formData.status as any) || 'Active'
      };
      onAddMember(newMember);
    }

    setShowModal(false);
    if (setShowAddModalDirectly) setShowAddModalDirectly(false);
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
      {/* General Member Security Notice Banner */}
      {isRegularMember && (
        <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-indigo-950/80 p-4 rounded-2xl border border-emerald-500/40 text-xs text-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-xl shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <p className="font-extrabold text-white text-sm flex items-center gap-2">
                <span>Personal Member Gateway</span>
                <span className="px-2 py-0.5 text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
                  Protected Member Gate
                </span>
              </p>
              <p className="text-slate-300 text-xs mt-0.5">
                Logged in as <strong>{currentLoggedInUser?.name}</strong> ({currentLoggedInUser?.mobileNumber}). You can enter, view, and update your personal record. Systemic add, edit, or delete operations on other records are restricted.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Top Header & Search Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              {isRegularMember ? 'My Member Particulars & Profile' : 'Members Directory'}
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-full">
              {filteredMembers.length} {isRegularMember ? 'Personal Record' : 'Members'}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isRegularMember
              ? 'View and manage your personal membership details registered in the ISO Central Repository.'
              : 'Store, search, filter, and print ISO organizational membership records.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {(!isRegularMember || !myMemberRecord) && (
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" /> {isRegularMember ? 'Enter My Member Particulars' : 'Add New Member'}
            </button>
          )}
          {isRegularMember && myMemberRecord && (
            <button
              onClick={() => handleOpenEdit(myMemberRecord)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all"
            >
              <Edit2 className="w-4 h-4" /> Update My Particulars
            </button>
          )}
          <button
            onClick={() => exportToExcel(filteredMembers, 'ISO_Members_Directory.xlsx')}
            className="px-3.5 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4" /> Excel
          </button>
          <button
            onClick={() => printMemberDirectoryTable(filteredMembers, 'ISO Central Members Directory')}
            className="px-3.5 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>
      </div>

      {/* Member Self-Registration Prompt if record missing */}
      {isRegularMember && !myMemberRecord && (
        <div className="bg-slate-900 border-2 border-emerald-500/50 rounded-3xl p-6 text-white shadow-2xl space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">Enter Your Official Member Particulars</h2>
              <p className="text-xs text-slate-400">
                You are authenticated as <strong>{currentLoggedInUser?.name}</strong> ({currentLoggedInUser?.mobileNumber}). Submit your profile details below to generate your official record.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Full Name <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Mobile Number <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.mobileNumber}
                  onChange={(e) => setFormData((prev) => ({ ...prev, mobileNumber: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">WhatsApp Number</label>
                <input
                  type="text"
                  value={formData.whatsappNumber}
                  onChange={(e) => setFormData((prev) => ({ ...prev, whatsappNumber: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">City Name <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">District</label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) => setFormData((prev) => ({ ...prev, district: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Province</label>
                <select
                  value={formData.province}
                  onChange={(e) => setFormData((prev) => ({ ...prev, province: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:ring-2 focus:ring-emerald-500"
                >
                  {provincesList.filter((p) => p !== 'All').map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Address</label>
              <input
                type="text"
                placeholder="e.g. Block 4, Federal B Area"
                value={formData.address}
                onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2"
            >
              <UserCheck className="w-4 h-4" /> Save & Submit My Particulars
            </button>
          </form>
        </div>
      )}

      {/* Filter & Search Toolbar (Only if admin or if member has record) */}
      {!isRegularMember && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search Name, ID, Phone, City..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <select
              value={provinceFilter}
              onChange={(e) => setProvinceFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 font-medium"
            >
              <option value="All">All Provinces / Regions</option>
              {provincesList.filter((p) => p !== 'All').map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 font-medium"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          <div className="flex items-center justify-end text-xs text-slate-500 dark:text-slate-400 font-semibold px-2">
            Showing {filteredMembers.length} of {members.length} records
          </div>
        </div>
      )}

      {/* Members Table */}
      {filteredMembers.length > 0 && (
        <div id="members-printable-table" className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-900/80 uppercase text-[10px] font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3.5 px-4">Member Info</th>
                  <th className="py-3.5 px-4">Membership ID</th>
                  <th className="py-3.5 px-4">Contact Details</th>
                  <th className="py-3.5 px-4">Location Hierarchy</th>
                  <th className="py-3.5 px-4">Joining Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right no-print">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-medium">
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={member.profilePhoto}
                          alt={member.fullName}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/30 shadow-sm shrink-0"
                        />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-xs">{member.fullName}</p>
                          {member.email && <p className="text-[11px] text-slate-400">{member.email}</p>}
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                        {member.id}
                      </span>
                    </td>

                    <td className="py-3 px-4 space-y-0.5">
                      <p className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                        <Phone className="w-3 h-3 text-emerald-500" /> {member.mobileNumber}
                      </p>
                      <p className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px]">
                        <MessageSquare className="w-3 h-3 text-emerald-500" /> WhatsApp: {member.whatsappNumber}
                      </p>
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{member.city}, {member.district}</p>
                      <p className="text-[11px] text-slate-400">{member.division}, {member.province}, {member.country}</p>
                    </td>

                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-mono">
                      {member.joiningDate}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          member.status === 'Active'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {member.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right no-print">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setSelectedMember(member);
                            setShowDetailModal(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                          title="View Full Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(member)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                          title={isRegularMember ? "Update My Details" : "Edit Member"}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {!isRegularMember && (
                          <button
                            onClick={() => setDeletingMember(member)}
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            title="Delete Member"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View Detail Modal */}
      {showDetailModal && selectedMember && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-600" /> Member Official Record
              </h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-5 text-center">
              <img
                src={selectedMember.profilePhoto}
                alt={selectedMember.fullName}
                className="w-24 h-24 rounded-full object-cover mx-auto ring-4 ring-emerald-500/40 shadow-md mb-3"
              />
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">{selectedMember.fullName}</h2>
              <span className="inline-block mt-1 px-3 py-1 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono text-xs font-bold rounded-full border border-emerald-200 dark:border-emerald-800">
                {selectedMember.id}
              </span>
            </div>

            <div className="mt-6 space-y-3 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between border-b border-slate-200/60 dark:border-slate-800 pb-2">
                <span className="text-slate-400">Mobile Number:</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedMember.mobileNumber}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 dark:border-slate-800 pb-2">
                <span className="text-slate-400">WhatsApp:</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedMember.whatsappNumber}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 dark:border-slate-800 pb-2">
                <span className="text-slate-400">Email Address:</span>
                <span className="font-medium text-slate-900 dark:text-white">{selectedMember.email || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 dark:border-slate-800 pb-2">
                <span className="text-slate-400">Location:</span>
                <span className="font-bold text-slate-900 dark:text-white text-right">
                  {selectedMember.city}, {selectedMember.district}, {selectedMember.division}, {selectedMember.province}, {selectedMember.country}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 dark:border-slate-800 pb-2">
                <span className="text-slate-400">Joining Date:</span>
                <span className="font-mono text-slate-900 dark:text-white">{selectedMember.joiningDate}</span>
              </div>
              {selectedMember.notes && (
                <div>
                  <span className="text-slate-400 block mb-1">Notes:</span>
                  <p className="text-slate-700 dark:text-slate-200 italic">{selectedMember.notes}</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-5 py-2 bg-slate-800 text-white font-bold text-xs rounded-xl hover:bg-slate-700 transition-colors"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Member Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                {editingMember ? 'Edit Member Record' : 'Add New ISO Member'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
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
                    placeholder="e.g. Syed Murtaza Ali Naqvi"
                    value={formData.fullName || ''}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Mobile Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="03331234567"
                    value={formData.mobileNumber || ''}
                    onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value, whatsappNumber: formData.whatsappNumber || e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">WhatsApp Number</label>
                  <input
                    type="text"
                    placeholder="03331234567"
                    value={formData.whatsappNumber || ''}
                    onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    placeholder="member@gmail.com"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">City *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Karachi"
                    value={formData.city || ''}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">District *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Karachi Central"
                    value={formData.district || ''}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Division *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Karachi"
                    value={formData.division || ''}
                    onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Province *</label>
                  <select
                    value={formData.province || 'Sindh'}
                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
                  >
                    {provincesList.filter((p) => p !== 'All').map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Country *</label>
                  <input
                    type="text"
                    required
                    placeholder="Pakistan"
                    value={formData.country || 'Pakistan'}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Joining Date</label>
                  <input
                    type="date"
                    value={formData.joiningDate || ''}
                    onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Profile Photo Upload</label>
                <div className="flex items-center gap-3">
                  <img
                    src={formData.profilePhoto}
                    alt="Preview"
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-500/40"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Additional Notes</label>
                <textarea
                  rows={2}
                  placeholder="Volunteer role, community activities, etc."
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md"
                >
                  {editingMember ? 'Save Changes' : 'Create Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Member Confirmation Modal */}
      {deletingMember && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Confirm Member Deletion</h3>
              </div>
              <button
                onClick={() => setDeletingMember(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to delete member record for{' '}
              <span className="font-extrabold text-red-500">{deletingMember.fullName}</span> (ID:{' '}
              <span className="font-mono">{deletingMember.id}</span>) from the ISO Central Member Directory?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingMember(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteMember(deletingMember.id);
                  setDeletingMember(null);
                }}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" /> Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
