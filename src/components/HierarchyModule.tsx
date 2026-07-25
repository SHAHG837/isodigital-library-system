import React, { useState, useEffect } from 'react';
import { Member, OfficeBearer, HierarchyNode } from '../types';
import {
  Network,
  Globe,
  MapPin,
  Building2,
  Users,
  Award,
  ChevronRight,
  ChevronDown,
  Plus,
  Edit2,
  Trash2,
  FolderPlus,
  Shield,
  Layers,
  X,
  AlertTriangle,
  CheckCircle2,
  Search,
  Eye,
  Settings
} from 'lucide-react';

interface HierarchyModuleProps {
  members: Member[];
  officeBearers: OfficeBearer[];
  isSuperAdmin?: boolean;
}

const INITIAL_HIERARCHY_NODES: HierarchyNode[] = [
  // Country Level
  { id: 'NODE-PAK', name: 'Pakistan', level: 'Country', code: 'PK', headName: 'Central Supreme Cabinet', status: 'Active' },

  // Provinces under Pakistan
  { id: 'NODE-SINDH', name: 'Sindh', level: 'Province', parentId: 'NODE-PAK', code: 'SD', headName: 'Provincial President Sindh', status: 'Active' },
  { id: 'NODE-PUNJAB', name: 'Punjab', level: 'Province', parentId: 'NODE-PAK', code: 'PB', headName: 'Provincial President Punjab', status: 'Active' },
  { id: 'NODE-KPK', name: 'Khyber Pakhtunkhwa', level: 'Province', parentId: 'NODE-PAK', code: 'KPK', headName: 'Provincial President KPK', status: 'Active' },
  { id: 'NODE-BALOCH', name: 'Balochistan', level: 'Province', parentId: 'NODE-PAK', code: 'BA', headName: 'Provincial President Balochistan', status: 'Active' },
  { id: 'NODE-ICT', name: 'Islamabad Capital Territory', level: 'Province', parentId: 'NODE-PAK', code: 'ICT', headName: 'Capital Secretary', status: 'Active' },
  { id: 'NODE-GB', name: 'Gilgit-Baltistan', level: 'Province', parentId: 'NODE-PAK', code: 'GB', headName: 'Regional President GB', status: 'Active' },
  { id: 'NODE-AJK', name: 'Azad Jammu & Kashmir', level: 'Province', parentId: 'NODE-PAK', code: 'AJK', headName: 'Regional President AJK', status: 'Active' },
  { id: 'NODE-OVERSEAS', name: 'Overseas International Chapter', level: 'Province', parentId: 'NODE-PAK', code: 'OVS', headName: 'Overseas Affairs Secretary', status: 'Active' },

  // Divisions under Sindh
  { id: 'NODE-KARACHI-DIV', name: 'Karachi Division', level: 'Division', parentId: 'NODE-SINDH', code: 'KHI', headName: 'Divisional President Karachi', status: 'Active' },
  { id: 'NODE-HYD-DIV', name: 'Hyderabad Division', level: 'Division', parentId: 'NODE-SINDH', code: 'HYD', headName: 'Divisional Incharge Hyderabad', status: 'Active' },
  { id: 'NODE-SUKKUR-DIV', name: 'Sukkur Division', level: 'Division', parentId: 'NODE-SINDH', code: 'SKR', headName: 'Divisional Incharge Sukkur', status: 'Active' },

  // Divisions under Punjab
  { id: 'NODE-LAHORE-DIV', name: 'Lahore Division', level: 'Division', parentId: 'NODE-PUNJAB', code: 'LHR', headName: 'Divisional President Lahore', status: 'Active' },
  { id: 'NODE-RWP-DIV', name: 'Rawalpindi Division', level: 'Division', parentId: 'NODE-PUNJAB', code: 'RWP', headName: 'Divisional President Rawalpindi', status: 'Active' },
  { id: 'NODE-MULTAN-DIV', name: 'Multan Division', level: 'Division', parentId: 'NODE-PUNJAB', code: 'MUX', headName: 'Divisional Incharge Multan', status: 'Active' },

  // Districts under Karachi
  { id: 'NODE-KHI-CENTRAL', name: 'Karachi Central District', level: 'District', parentId: 'NODE-KARACHI-DIV', code: 'KC', headName: 'District President Karachi Central', status: 'Active' },
  { id: 'NODE-KHI-EAST', name: 'Karachi East District', level: 'District', parentId: 'NODE-KARACHI-DIV', code: 'KE', headName: 'District President Karachi East', status: 'Active' },
  { id: 'NODE-LHR-DIST', name: 'Lahore District', level: 'District', parentId: 'NODE-LAHORE-DIV', code: 'LD', headName: 'District President Lahore', status: 'Active' },

  // Cabinet Units & Councils
  { id: 'NODE-IT-COUNCIL', name: 'Central IT Support Council', level: 'CabinetUnit', parentId: 'NODE-PAK', headName: 'Syed M. Aamir Naqvi Al Bukhari', contactNumber: '03323475431', status: 'Active' },
  { id: 'NODE-SHURA', name: 'Central Supreme Shura Council', level: 'CabinetUnit', parentId: 'NODE-PAK', headName: 'Central Chief Patron', status: 'Active' }
];

export const HierarchyModule: React.FC<HierarchyModuleProps> = ({
  members,
  officeBearers,
  isSuperAdmin = true
}) => {
  // State for Hierarchy Nodes
  const [nodes, setNodes] = useState<HierarchyNode[]>(() => {
    const saved = localStorage.getItem('iso_hierarchy_nodes');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_HIERARCHY_NODES;
  });

  useEffect(() => {
    localStorage.setItem('iso_hierarchy_nodes', JSON.stringify(nodes));
  }, [nodes]);

  // View state: 'flow' | 'fullTree'
  const [viewMode, setViewMode] = useState<'flow' | 'fullTree'>('fullTree');
  const [expandedNodeIds, setExpandedNodeIds] = useState<Set<string>>(new Set(['NODE-PAK', 'NODE-SINDH', 'NODE-PUNJAB', 'NODE-KARACHI-DIV']));
  const [treeSearchTerm, setTreeSearchTerm] = useState('');

  // Drilldown filter state
  const [selectedCountry, setSelectedCountry] = useState<string>('Pakistan');
  const [selectedProvince, setSelectedProvince] = useState<string>('Sindh');
  const [selectedDivision, setSelectedDivision] = useState<string>('Karachi Division');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Karachi Central District');

  // Modal State for ADD / EDIT Node
  const [showNodeModal, setShowNodeModal] = useState(false);
  const [editingNode, setEditingNode] = useState<HierarchyNode | null>(null);
  const [deletingNode, setDeletingNode] = useState<HierarchyNode | null>(null);

  const [formData, setFormData] = useState<Partial<HierarchyNode>>({
    name: '',
    level: 'District',
    parentId: 'NODE-KARACHI-DIV',
    code: '',
    headName: '',
    contactNumber: '',
    description: '',
    status: 'Active'
  });

  // Toggle expand/collapse
  const toggleNodeExpand = (id: string) => {
    setExpandedNodeIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleExpandAll = () => {
    setExpandedNodeIds(new Set(nodes.map((n) => n.id)));
  };

  const handleCollapseAll = () => {
    setExpandedNodeIds(new Set(['NODE-PAK']));
  };

  // Open Add Modal
  const handleOpenAdd = (parent?: HierarchyNode) => {
    setEditingNode(null);
    setFormData({
      name: '',
      level: parent
        ? parent.level === 'Country'
          ? 'Province'
          : parent.level === 'Province'
          ? 'Division'
          : parent.level === 'Division'
          ? 'District'
          : 'CabinetUnit'
        : 'District',
      parentId: parent ? parent.id : 'NODE-PAK',
      code: '',
      headName: '',
      contactNumber: '',
      description: '',
      status: 'Active'
    });
    setShowNodeModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (node: HierarchyNode) => {
    setEditingNode(node);
    setFormData({ ...node });
    setShowNodeModal(true);
  };

  // Submit Add / Edit
  const handleSubmitNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (editingNode) {
      setNodes((prev) =>
        prev.map((n) => (n.id === editingNode.id ? { ...editingNode, ...(formData as HierarchyNode) } : n))
      );
    } else {
      const newNode: HierarchyNode = {
        id: `NODE-${Date.now().toString().slice(-5)}`,
        name: formData.name || 'New Unit',
        level: formData.level || 'District',
        parentId: formData.parentId || 'NODE-PAK',
        code: formData.code || '',
        headName: formData.headName || '',
        contactNumber: formData.contactNumber || '',
        description: formData.description || '',
        status: (formData.status as any) || 'Active'
      };
      setNodes((prev) => [...prev, newNode]);
    }

    setShowNodeModal(false);
  };

  // Delete Node
  const handleDeleteNodeConfirm = () => {
    if (!deletingNode) return;
    setNodes((prev) => prev.filter((n) => n.id !== deletingNode.id && n.parentId !== deletingNode.id));
    setDeletingNode(null);
  };

  // Render recursive hierarchy node item
  const renderNodeTreeItem = (node: HierarchyNode, depth = 0) => {
    const children = nodes.filter((n) => n.parentId === node.id);
    const isExpanded = expandedNodeIds.has(node.id);
    const matchesSearch = treeSearchTerm
      ? node.name.toLowerCase().includes(treeSearchTerm.toLowerCase()) ||
        node.code?.toLowerCase().includes(treeSearchTerm.toLowerCase()) ||
        node.headName?.toLowerCase().includes(treeSearchTerm.toLowerCase())
      : true;

    if (treeSearchTerm && !matchesSearch && children.length === 0) return null;

    const levelBadgeColor =
      node.level === 'Country'
        ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
        : node.level === 'Province'
        ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
        : node.level === 'Division'
        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
        : node.level === 'District'
        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
        : 'bg-rose-500/20 text-rose-300 border-rose-500/40';

    const LevelIcon =
      node.level === 'Country'
        ? Globe
        : node.level === 'Province'
        ? MapPin
        : node.level === 'Division'
        ? Building2
        : node.level === 'District'
        ? Network
        : Shield;

    return (
      <div key={node.id} className="space-y-2">
        <div
          className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl border transition-all ${
            depth === 0
              ? 'bg-slate-900 border-emerald-500/50 text-white shadow-lg'
              : depth === 1
              ? 'bg-slate-800/90 border-slate-700 text-slate-100 ml-4 sm:ml-6'
              : depth === 2
              ? 'bg-slate-800/60 border-slate-700/80 text-slate-200 ml-8 sm:ml-12'
              : 'bg-slate-900/40 border-slate-800 text-slate-300 ml-12 sm:ml-16'
          }`}
        >
          <div className="flex items-center gap-3">
            {children.length > 0 ? (
              <button
                onClick={() => toggleNodeExpand(node.id)}
                className="p-1 hover:bg-slate-700 rounded-lg text-emerald-400 transition-colors"
              >
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            ) : (
              <span className="w-6" />
            )}

            <div className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-emerald-400">
              <LevelIcon className="w-4 h-4" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-extrabold text-white">{node.name}</h4>
                <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-md border ${levelBadgeColor}`}>
                  {node.level}
                </span>
                {node.code && (
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                    [{node.code}]
                  </span>
                )}
              </div>

              {node.headName && (
                <p className="text-[11px] text-slate-400 font-medium mt-0.5 flex items-center gap-1">
                  <Award className="w-3 h-3 text-amber-400" /> Incharge: <strong className="text-slate-200">{node.headName}</strong>
                  {node.contactNumber && <span className="font-mono text-emerald-400 ml-2">({node.contactNumber})</span>}
                </p>
              )}
            </div>
          </div>

          {/* Super Admin Actions */}
          <div className="flex items-center gap-1.5 mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800 justify-end">
            {isSuperAdmin && (
              <>
                <button
                  onClick={() => handleOpenAdd(node)}
                  className="px-2.5 py-1.5 bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 border border-emerald-500/40"
                  title="Add Child Sub-Unit"
                >
                  <Plus className="w-3.5 h-3.5" /> Sub-Unit
                </button>
                <button
                  onClick={() => handleOpenEdit(node)}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] rounded-lg transition-colors border border-slate-700"
                  title="Edit Node"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                {node.id !== 'NODE-PAK' && (
                  <button
                    onClick={() => setDeletingNode(node)}
                    className="p-1.5 bg-red-950/40 hover:bg-red-600 text-red-400 hover:text-white text-[11px] rounded-lg transition-colors border border-red-500/30"
                    title="Delete Node"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Child Nodes */}
        {children.length > 0 && isExpanded && (
          <div className="space-y-2 pt-1">
            {children.map((child) => renderNodeTreeItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const rootNodes = nodes.filter((n) => !n.parentId);

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-2xl">
              <Network className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Organization Hierarchy</h1>
                {isSuperAdmin && (
                  <span className="px-2.5 py-0.5 text-[10px] font-extrabold bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 rounded-full border border-red-300 dark:border-red-800">
                    SUPER ADMIN EDIT CONTROL ACTIVE
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Country → Province → Division → District → Cabinet Units → Members
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'fullTree' ? 'flow' : 'fullTree')}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all border border-slate-700"
            >
              <Layers className="w-4 h-4 text-emerald-400" />
              {viewMode === 'fullTree' ? 'Switch to Drilldown Flow' : 'See Complete Hierarchy Tree'}
            </button>

            {isSuperAdmin && (
              <button
                onClick={() => handleOpenAdd()}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all"
              >
                <FolderPlus className="w-4 h-4" /> + Add Hierarchy Unit
              </button>
            )}
          </div>
        </div>
      </div>

      {/* FULL ORGANIZATION HIERARCHY TREE VIEW */}
      {viewMode === 'fullTree' ? (
        <div className="bg-slate-950 text-white p-6 rounded-3xl border border-slate-800 shadow-2xl space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-emerald-400" />
                Complete Organization Hierarchy Structure
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Interactive nested tree with direct Add, Edit, and Delete controls for Super Administrator.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search hierarchy tree..."
                  value={treeSearchTerm}
                  onChange={(e) => setTreeSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 text-white"
                />
              </div>

              <button
                onClick={handleExpandAll}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl"
              >
                Expand All
              </button>
              <button
                onClick={handleCollapseAll}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl"
              >
                Collapse All
              </button>
            </div>
          </div>

          {/* Tree Node Container */}
          <div className="space-y-3 pt-2 max-h-[650px] overflow-y-auto pr-2">
            {rootNodes.map((rootNode) => renderNodeTreeItem(rootNode, 0))}
          </div>
        </div>
      ) : (
        /* DRILLDOWN FLOW VIEW */
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Country</label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
              >
                {nodes.filter((n) => n.level === 'Country').map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Province / State</label>
              <select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
              >
                {nodes.filter((n) => n.level === 'Province').map((p) => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Division Zone</label>
              <select
                value={selectedDivision}
                onChange={(e) => setSelectedDivision(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
              >
                {nodes.filter((n) => n.level === 'Division').map((d) => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">District</label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
              >
                {nodes.filter((n) => n.level === 'District').map((dst) => (
                  <option key={dst.id} value={dst.name}>{dst.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT HIERARCHY NODE MODAL */}
      {showNodeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Network className="w-5 h-5 text-emerald-600" />
                {editingNode ? 'Edit Hierarchy Unit' : 'Add New Hierarchy Node'}
              </h3>
              <button
                onClick={() => setShowNodeModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitNode} className="mt-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Node / Unit Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sukkur Division or Central Youth Cell"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Hierarchy Level *</label>
                  <select
                    value={formData.level || 'District'}
                    onChange={(e: any) => setFormData({ ...formData, level: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 font-bold"
                  >
                    <option value="Country">Country</option>
                    <option value="Province">Province / Region</option>
                    <option value="Division">Division Zone</option>
                    <option value="District">District</option>
                    <option value="CabinetUnit">Cabinet Council / Unit</option>
                    <option value="Position">Designation Post</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Parent Level Unit</label>
                  <select
                    value={formData.parentId || ''}
                    onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 font-bold"
                  >
                    <option value="">None (Top Level Root)</option>
                    {nodes
                      .filter((n) => n.id !== editingNode?.id)
                      .map((n) => (
                        <option key={n.id} value={n.id}>
                          {n.name} ({n.level})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Code / Abbreviation</label>
                  <input
                    type="text"
                    placeholder="e.g. SKR"
                    value={formData.code || ''}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Incharge / Head Officer</label>
                  <input
                    type="text"
                    placeholder="e.g. Syed Hassan Raza"
                    value={formData.headName || ''}
                    onChange={(e) => setFormData({ ...formData, headName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Contact Number</label>
                <input
                  type="text"
                  placeholder="03001234567"
                  value={formData.contactNumber || ''}
                  onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowNodeModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md"
                >
                  {editingNode ? 'Save Hierarchy Node' : 'Create Hierarchy Node'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingNode && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Delete Hierarchy Node</h3>
              </div>
              <button
                onClick={() => setDeletingNode(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to delete hierarchy node{' '}
              <span className="font-extrabold text-red-500">{deletingNode.name}</span> ({deletingNode.level})? Any child sub-units under this node will also be removed.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingNode(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteNodeConfirm}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" /> Delete Node
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
