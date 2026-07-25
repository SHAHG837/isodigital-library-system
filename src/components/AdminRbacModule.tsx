import React, { useState } from 'react';
import { AdminUser, AdminPermissions } from '../types';
import { UserCheck, ShieldCheck, Plus, Check, X, Trash2, Edit2, KeyRound, AlertTriangle } from 'lucide-react';

interface AdminRbacModuleProps {
  admins: AdminUser[];
  onAddAdmin: (admin: AdminUser) => void;
  onEditAdmin: (admin: AdminUser) => void;
  onDeleteAdmin: (id: string) => void;
}

export const AdminRbacModule: React.FC<AdminRbacModuleProps> = ({
  admins,
  onAddAdmin,
  onEditAdmin,
  onDeleteAdmin
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
    designation: 'Provincial Admin',
    role: 'Admin',
    isSuperAdmin: false,
    permissions: { ...defaultPermissions }
  });

  const handleOpenAdd = () => {
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
    setEditingAdmin(adm);
    setFormData({ ...adm });
    setShowModal(true);
  };

  const togglePermission = (permKey: keyof AdminPermissions) => {
    if (formData.isSuperAdmin) return; // Super admin always has all permissions
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...(prev.permissions as AdminPermissions),
        [permKey]: !prev.permissions?.[permKey]
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    if (editingAdmin) {
      onEditAdmin({
        ...editingAdmin,
        ...(formData as AdminUser)
      });
    } else {
      const newAdmin: AdminUser = {
        id: `ADM-${String(admins.length + 1).padStart(4, '0')}`,
        name: formData.name || '',
        email: formData.email || '',
        phone: formData.phone || '',
        designation: formData.designation || 'Admin',
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

  return (
    <div className="space-y-6">
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

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" /> Create New Admin
        </button>
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
                  <button
                    onClick={() => handleOpenEdit(adm)}
                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingAdmin(adm)}
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

      {/* Add / Edit Admin Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-emerald-600" />
                {editingAdmin ? 'Edit Admin Permissions' : 'Create New System Admin'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Admin Name *</label>
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
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Email Address *</label>
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
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="03001234567"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Designation / Role</label>
                  <input
                    type="text"
                    placeholder="e.g. Provincial Secretary"
                    value={formData.designation || ''}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Permissions Checkboxes */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-700">
                <label className="block text-slate-800 dark:text-slate-200 font-extrabold mb-2">Customizable Permissions</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                  {Object.keys(defaultPermissions).map((pKey) => {
                    const isChecked = formData.permissions?.[pKey as keyof AdminPermissions];
                    return (
                      <label key={pKey} className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
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
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 font-semibold rounded-xl">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md">
                  {editingAdmin ? 'Save Permissions' : 'Create Admin Account'}
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

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingAdmin(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteAdmin(deletingAdmin.id);
                  setDeletingAdmin(null);
                }}
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
