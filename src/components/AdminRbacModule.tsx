import React, { useState } from 'react';
import { AdminUser, AdminPermissions, AdminCredential } from '../types';
import { UserCheck, ShieldCheck, Plus, Check, X, Trash2, Edit2, KeyRound, AlertTriangle, Lock, ShieldAlert } from 'lucide-react';

interface AdminRbacModuleProps {
  admins: AdminUser[];
  onAddAdmin: (admin: AdminUser) => void;
  onEditAdmin: (admin: AdminUser) => void;
  onDeleteAdmin: (id: string) => void;
  isSuperAdmin?: boolean;
  currentLoggedInUser?: AdminCredential | null;
}

export const AdminRbacModule: React.FC<AdminRbacModuleProps> = ({
  admins,
  onAddAdmin,
  onEditAdmin,
  onDeleteAdmin,
  isSuperAdmin = false,
  currentLoggedInUser
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [deletingAdmin, setDeletingAdmin] = useState<AdminUser | null>(null);

  const defaultPermissions: AdminPermissions = {
    manageMembers: true,
    manageOfficeBearers: true,
    manageHierarchy: true,
    importData: true,
    exportData: true,
    backupDatabase: false,
    restoreDatabase: false,
    manageAdmins: false,
    manageSystemSettings: false,
    viewAuditLogs: true
  };

  const [formData, setFormData] = useState<Partial<AdminUser>>({
    name: '',
    email: '',
    phone: '',
    designation: 'Regional Secretary',
    role: 'Admin',
    isSuperAdmin: false,
    permissions: { ...defaultPermissions }
  });

  // Calculate next available admin ID without collisions
  const getNextAdminId = () => {
    const numericIds = admins
      .map((a) => {
        const match = a.id?.match(/\d+/);
        return match ? parseInt(match[0], 10) : 0;
      })
      .filter((n) => !isNaN(n));
    const nextNum = (numericIds.length > 0 ? Math.max(...numericIds) : 0) + 1;
    return `ADM-${String(nextNum).padStart(4, '0')}`;
  };

  const handleOpenAdd = () => {
    if (!isSuperAdmin) {
      alert('Access Denied: Only the Super Administrator has authority to add or increase admin accounts.');
      return;
    }
    setEditingAdmin(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      designation: 'Regional Secretary',
      role: 'Admin',
      isSuperAdmin: false,
      permissions: { ...defaultPermissions }
    });
    setShowModal(true);
  };

  const handleOpenEdit = (adm: AdminUser) => {
    if (!isSuperAdmin) {
      alert('Access Denied: Only the Super Administrator has authority to modify admin permissions.');
      return;
    }
    setEditingAdmin(adm);
    setFormData({ ...adm });
    setShowModal(true);
  };

  const togglePermission = (permKey: keyof AdminPermissions) => {
    if (!isSuperAdmin) return;
    if (formData.isSuperAdmin) return; // Super admin always has all permissions
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...(prev.permissions as AdminPermissions),
        [permKey]: !prev.permissions?.[permKey]
      }
    }));
  };

  const setAllPermissions = (grant: boolean) => {
    if (!isSuperAdmin || formData.isSuperAdmin) return;
    const newPerms: AdminPermissions = { ...defaultPermissions };
    (Object.keys(newPerms) as Array<keyof AdminPermissions>).forEach((key) => {
      newPerms[key] = grant;
    });
    setFormData((prev) => ({
      ...prev,
      permissions: newPerms
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      alert('Unauthorized: Only Super Administrator has authority to increase or modify admin accounts.');
      return;
    }
    if (!formData.name?.trim() || !formData.email?.trim()) {
      alert('Name and Email Address are required.');
      return;
    }

    if (editingAdmin) {
      onEditAdmin({
        ...editingAdmin,
        ...(formData as AdminUser),
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone?.trim() || ''
      });
    } else {
      const assignedId = getNextAdminId();
      const newAdmin: AdminUser = {
        id: assignedId,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone?.trim() || '',
        designation: formData.designation?.trim() || 'Regional Secretary',
        role: formData.role || 'Admin',
        isSuperAdmin: false,
        permissions: formData.permissions || { ...defaultPermissions },
        createdDate: new Date().toISOString().split('T')[0],
        lastActive: new Date().toISOString()
      };
      onAddAdmin(newAdmin);
    }

    setShowModal(false);
  };

  const handleConfirmDelete = () => {
    if (!isSuperAdmin) {
      alert('Unauthorized: Only Super Administrator has authority to delete or decrease admin accounts.');
      return;
    }
    if (deletingAdmin) {
      if (deletingAdmin.isSuperAdmin || deletingAdmin.id === 'ADM-0001') {
        alert('Cannot remove the Central Super Administrator.');
        setDeletingAdmin(null);
        return;
      }
      onDeleteAdmin(deletingAdmin.id);
      setDeletingAdmin(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Super Admin Authority Notice Banner */}
      {!isSuperAdmin ? (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-amber-500 uppercase tracking-wide">
              Super Administrator Exclusive Authority
            </h4>
            <p className="text-xs text-amber-200/90 mt-0.5">
              Under organization security governance, only the Central Super Administrator (Syed Muhammad Aamir Naqvi Al Bukhari) has authority to <strong>increase (create)</strong> or <strong>decrease (remove)</strong> System Admins and RBAC Matrix permissions. You are viewing this matrix in <strong>Read-Only Mode</strong> ({currentLoggedInUser?.role || 'Admin'}).
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-500 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                Super Administrator Executive Authority Active
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                You have exclusive authority to increase (add new admins), decrease (remove admins), and adjust granular RBAC permission matrices.
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex px-3 py-1 bg-emerald-600 text-white text-[11px] font-extrabold rounded-xl shadow-sm uppercase tracking-wider">
            Full Authority
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Admin Management & RBAC</h1>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-full">
              {admins.length} Admin Users
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Super Administrator Controlled Role-Based Access Control (RBAC) System.
          </p>
        </div>

        {isSuperAdmin ? (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" /> Create New Admin
          </button>
        ) : (
          <div className="px-3.5 py-2 bg-slate-100 dark:bg-slate-700/50 text-slate-400 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-not-allowed border border-slate-200 dark:border-slate-700" title="Only Super Administrator has authority to increase admins">
            <Lock className="w-3.5 h-3.5" /> Super Admin Only
          </div>
        )}
      </div>

      {/* Admin Users Cards List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {admins.map((adm) => (
          <div
            key={adm.id}
            className={`bg-white dark:bg-slate-800 rounded-3xl p-6 border shadow-sm flex flex-col justify-between ${
              adm.isSuperAdmin
                ? 'border-emerald-500/50 dark:border-emerald-500/50 bg-gradient-to-br from-emerald-950/10 to-slate-900/10'
                : 'border-slate-200/80 dark:border-slate-700/80'
            }`}
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{adm.name}</h3>
                    {adm.isSuperAdmin && (
                      <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase bg-emerald-500 text-white rounded-full flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Supreme
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{adm.designation}</p>
                  <p className="text-[11px] text-slate-400 font-mono mt-1">{adm.phone} • {adm.email}</p>
                </div>

                <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-lg">
                  {adm.id}
                </span>
              </div>

              {/* Permissions Checklist */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-700">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Granted Permissions</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  {Object.entries(adm.permissions).map(([key, val]) => (
                    <div key={key} className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                      {val || adm.isSuperAdmin ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 shrink-0" />
                      )}
                      <span className={val || adm.isSuperAdmin ? 'font-semibold' : 'text-slate-400'}>
                        {key.replace(/([A-Z])/g, ' $1')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-100 dark:border-slate-700/80 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">Created: {adm.createdDate}</span>
              {!adm.isSuperAdmin && (
                <div className="flex items-center gap-1">
                  {isSuperAdmin ? (
                    <>
                      <button
                        onClick={() => handleOpenEdit(adm)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        title="Edit Admin Permissions (Super Admin Authority)"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingAdmin(adm)}
                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        title="Remove Admin Account (Super Admin Authority)"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                      <Lock className="w-3 h-3" /> Managed by Super Admin
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Admin Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {editingAdmin ? 'Edit Admin Permissions' : 'Create New System Admin'}
                  </h3>
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    System ID: {editingAdmin ? editingAdmin.id : getNextAdminId()} • Super Admin Control
                  </span>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Admin Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Syed Ali Raza"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Email Address (Login / OTP) *</label>
                  <input
                    type="email"
                    required
                    placeholder="admin@iso.org.pk"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Mobile Number (Login Password)</label>
                  <input
                    type="text"
                    placeholder="03001234567"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Designation Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Provincial Secretary"
                    value={formData.designation || ''}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">System Role Tier</label>
                  <select
                    value={formData.role || 'Admin'}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 font-medium"
                  >
                    <option value="Admin">Admin (Full Operational RBAC Control)</option>
                    <option value="Manager">Manager (Regional Management)</option>
                    <option value="Viewer">Viewer (Auditor / Read-Only View)</option>
                  </select>
                </div>
              </div>

              {/* Permissions Checkboxes */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-slate-800 dark:text-slate-200 font-extrabold">
                    Customizable Permissions Matrix
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setAllPermissions(true)}
                      className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-bold"
                    >
                      Grant All
                    </button>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <button
                      type="button"
                      onClick={() => setAllPermissions(false)}
                      className="text-[11px] text-slate-500 hover:underline font-bold"
                    >
                      Revoke All
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                  {Object.keys(defaultPermissions).map((pKey) => {
                    const isChecked = Boolean(formData.permissions?.[pKey as keyof AdminPermissions]);
                    return (
                      <label key={pKey} className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:text-emerald-600 transition-colors">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => togglePermission(pKey as keyof AdminPermissions)}
                          className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                        />
                        <span>{pKey.replace(/([A-Z])/g, ' $1')}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md transition-all">
                  {editingAdmin ? 'Save Permissions Matrix' : 'Create Admin Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Admin Confirmation Modal */}
      {deletingAdmin && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Confirm Account Removal</h3>
              </div>
              <button
                onClick={() => setDeletingAdmin(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to remove admin privileges for account{' '}
              <span className="font-extrabold text-red-500">{deletingAdmin.name}</span> ({deletingAdmin.email})?
            </p>
            <p className="text-[11px] text-slate-400">
              This action is strictly authorized under Super Administrator executive control and will revoke credentials immediately.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingAdmin(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" /> Remove Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
