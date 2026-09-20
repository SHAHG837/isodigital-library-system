import React, { useState, useEffect } from 'react';
import { Member, AdminCredential } from '../types';
import { 
  GitBranch, 
  Plus, 
  Search, 
  User, 
  ChevronRight, 
  Sparkles, 
  Edit3, 
  Trash2, 
  Eye, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCcw,
  ShieldCheck,
  Link as LinkIcon,
  Phone,
  Award,
  Layers,
  Info,
  BookOpen,
  BookMarked
} from 'lucide-react';
import { ShajraReferenceBooksModule } from './ShajraReferenceBooksModule';

export interface ShajraNode {
  id: string;
  name: string;
  title?: string;
  fatherName?: string;
  generation: number;
  branch: string;
  notes?: string;
  memberId?: string;
  children?: ShajraNode[];
}

interface ShajraModuleProps {
  currentLoggedInUser?: AdminCredential | null;
  members?: Member[];
  onLogActivity?: (action: string, details: string) => void;
  initialAdminView?: boolean;
}

const defaultShajraData: ShajraNode = {
  id: 'S-000',
  name: 'Hazrat Muhammad Mustafa (S.A.W.W.)',
  title: 'Khatam un-Nabiyyin / Rasoolullah (S.A.W.W.)',
  fatherName: 'Hazrat Abdullah ibn Abd al-Muttalib',
  generation: 0,
  branch: 'Khatam-un-Nabiyyin',
  notes: 'The Final Prophet & Messenger of Allah (S.W.T.), Source & Origin of all Syed Lineages',
  children: [
    {
      id: 'S-001',
      name: 'Imam Ali ibn Abi Talib (A.S.)',
      title: 'Amir al-Mu\'minin / Asadullah',
      fatherName: 'Hazrat Abu Talib ibn Abd al-Muttalib',
      generation: 1,
      branch: 'Al-Hashemi',
      notes: 'First Imam of Islam, Cousin & Brother of Prophet Muhammad (S.A.W.W.)',
      children: [
        {
          id: 'S-001-F',
          name: 'Hazrat Syeda Fatima Zahra (S.A.)',
          title: 'Khatoon-e-Jannat / Syeda-tul-Nisa-il-Alameen',
          fatherName: 'Hazrat Muhammad Mustafa (S.A.W.W.)',
          generation: 1,
          branch: 'Ahle-Bayt',
          notes: 'Beloved Daughter of Prophet Muhammad (S.A.W.W.) & Leader of the Women of Paradise',
          children: [
            {
              id: 'S-101',
              name: 'Imam Hassan ibn Ali (A.S.)',
              title: 'Al-Mujtaba',
              fatherName: 'Imam Ali ibn Abi Talib (A.S.) & Syeda Fatima Zahra (S.A.)',
              generation: 2,
              branch: 'Hassani',
              notes: 'Second Imam of Islam, Leader of Youth in Paradise',
              children: [
                {
                  id: 'S-102',
                  name: 'Hassan al-Muthanna',
                  title: 'Al-Muthanna',
                  fatherName: 'Imam Hassan ibn Ali (A.S.)',
                  generation: 3,
                  branch: 'Hassani',
                  children: [
                    {
                      id: 'S-103',
                      name: 'Abdullah al-Mahd',
                      title: 'Al-Kamil',
                      fatherName: 'Hassan al-Muthanna',
                      generation: 4,
                      branch: 'Hassani',
                      children: [
                        {
                          id: 'S-104',
                          name: 'Syed Abdul Qadir Jilani Lineage',
                          title: 'Al-Ghawth al-A\'zam Ancestry',
                          fatherName: 'Abdullah al-Mahd Lineage',
                          generation: 18,
                          branch: 'Al Qadari'
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              id: 'S-002',
              name: 'Imam Hussain ibn Ali (A.S.)',
              title: 'Sayyid al-Shuhada',
              fatherName: 'Imam Ali ibn Abi Talib (A.S.) & Syeda Fatima Zahra (S.A.)',
              generation: 2,
              branch: 'Hussaini',
              notes: 'Third Imam of Islam, Hero of Karbala',
              children: [
                {
                  id: 'S-003',
                  name: 'Imam Ali ibn Hussain Zain-ul-Abidin (A.S.)',
                  title: 'Sajjad / Zain-ul-Abidin',
                  fatherName: 'Imam Hussain ibn Ali (A.S.)',
                  generation: 3,
                  branch: 'Zainabi',
                  notes: 'Fourth Imam of Islam',
                  children: [
                    {
                      id: 'S-003-Z',
                      name: 'Zayd ibn Ali (A.S.)',
                      title: 'Shaheed Zayd',
                      fatherName: 'Imam Ali Zain-ul-Abidin (A.S.)',
                      generation: 4,
                      branch: 'Zaidi',
                      notes: 'Progenitor of Zaidi Syed Lineage'
                    },
                    {
                      id: 'S-004',
                      name: 'Imam Muhammad ibn Ali al-Baqir (A.S.)',
                      title: 'Baqir al-Ulum',
                      fatherName: 'Imam Ali Zain-ul-Abidin (A.S.)',
                      generation: 4,
                      branch: 'Baqiri',
                      notes: 'Fifth Imam of Islam',
                      children: [
                        {
                          id: 'S-005',
                          name: 'Imam Ja\'far ibn Muhammad al-Sadiq (A.S.)',
                          title: 'Al-Sadiq',
                          fatherName: 'Imam Muhammad al-Baqir (A.S.)',
                          generation: 5,
                          branch: 'Ja\'fari',
                          notes: 'Sixth Imam, Founder of Ja\'fari Jurisprudence',
                          children: [
                            {
                              id: 'S-006',
                              name: 'Imam Musa ibn Ja\'far al-Kadhim (A.S.)',
                              title: 'Al-Kadhim',
                              fatherName: 'Imam Ja\'far al-Sadiq (A.S.)',
                              generation: 6,
                              branch: 'Kazmi',
                              notes: 'Seventh Imam, Progenitor of Kazmi Syeds',
                              children: [
                                {
                                  id: 'S-007',
                                  name: 'Imam Ali ibn Musa al-Rida (A.S.)',
                                  title: 'Al-Rida / Shahenshah-e-Khorasan',
                                  fatherName: 'Imam Musa al-Kadhim (A.S.)',
                                  generation: 7,
                                  branch: 'Rizvi',
                                  notes: 'Eighth Imam, Progenitor of Rizvi Syeds',
                                  children: [
                                    {
                                      id: 'S-008',
                                      name: 'Imam Muhammad ibn Ali al-Taqi (A.S.)',
                                      title: 'Al-Jawad',
                                      fatherName: 'Imam Ali al-Rida (A.S.)',
                                      generation: 8,
                                      branch: 'Taqvi',
                                      notes: 'Ninth Imam, Progenitor of Taqvi Syeds',
                                      children: [
                                        {
                                          id: 'S-009',
                                          name: 'Imam Ali ibn Muhammad al-Hadi al-Naqvi (A.S.)',
                                          title: 'Al-Naqi',
                                          fatherName: 'Imam Muhammad al-Taqi (A.S.)',
                                          generation: 9,
                                          branch: 'Naqvi',
                                          notes: 'Tenth Imam, Progenitor of Naqvi Syeds',
                                          children: [
                                            {
                                              id: 'S-010-A',
                                              name: 'Imam Hassan al-Askari (A.S.)',
                                              title: 'Al-Askari',
                                              fatherName: 'Imam Ali al-Hadi (A.S.)',
                                              generation: 10,
                                              branch: 'Askari',
                                              children: [
                                                {
                                                  id: 'S-011-M',
                                                  name: 'Imam Muhammad al-Mahdi (A.S.)',
                                                  title: 'Al-Hujjah al-Muntazar (A.F.T.S.)',
                                                  fatherName: 'Imam Hassan al-Askari (A.S.)',
                                                  generation: 11,
                                                  branch: 'Mahdavi'
                                                }
                                              ]
                                            },
                                            {
                                              id: 'S-010-B',
                                              name: 'Syed Sultan Ali Asghar Naqvi Al-Bukhari',
                                              title: 'Al-Bukhari Ancestor',
                                              fatherName: 'Imam Ali al-Hadi (A.S.)',
                                              generation: 10,
                                              branch: 'Naqvi Al Bukhari',
                                              children: [
                                                {
                                                  id: 'S-011-B',
                                                  name: 'Syed Jalaluddin Surkh-Posh Bukhari (R.A.)',
                                                  title: 'Surkh-Posh Bukhari Uch Sharif',
                                                  fatherName: 'Syed Ali Asghar',
                                                  generation: 16,
                                                  branch: 'Bukhari',
                                                  children: [
                                                    {
                                                      id: 'S-012-B',
                                                      name: 'Syed Muhammad Aamir Naqvi Al Bukhari',
                                                      title: 'Chairman IT Support Council - ISO',
                                                      fatherName: 'Syed Lineage',
                                                      generation: 35,
                                                      branch: 'Naqvi Al Bukhari',
                                                      notes: 'Founder & Intellectual Owner of ISO Digital Library'
                                                    }
                                                  ]
                                                }
                                              ]
                                            }
                                          ]
                                        }
                                      ]
                                    }
                                  ]
                                }
                              ]
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};

// Tree Helper Functions
const updateNodeInTree = (node: ShajraNode, targetId: string, updatedFields: Partial<ShajraNode>): ShajraNode => {
  if (node.id === targetId) {
    return { ...node, ...updatedFields };
  }
  if (node.children && node.children.length > 0) {
    return {
      ...node,
      children: node.children.map(child => updateNodeInTree(child, targetId, updatedFields))
    };
  }
  return node;
};

const addChildToTree = (node: ShajraNode, parentId: string, newChild: ShajraNode): ShajraNode => {
  if (node.id === parentId) {
    return {
      ...node,
      children: [...(node.children || []), newChild]
    };
  }
  if (node.children && node.children.length > 0) {
    return {
      ...node,
      children: node.children.map(child => addChildToTree(child, parentId, newChild))
    };
  }
  return node;
};

const deleteNodeFromTree = (node: ShajraNode, targetId: string): ShajraNode | null => {
  if (node.id === targetId) {
    return null;
  }
  if (node.children && node.children.length > 0) {
    const updatedChildren = node.children
      .map(child => deleteNodeFromTree(child, targetId))
      .filter((child): child is ShajraNode => child !== null);
    return {
      ...node,
      children: updatedChildren
    };
  }
  return node;
};

const getAncestralPath = (node: ShajraNode, targetId: string, path: ShajraNode[] = []): ShajraNode[] | null => {
  const currentPath = [...path, node];
  if (node.id === targetId) {
    return currentPath;
  }
  if (node.children && node.children.length > 0) {
    for (const child of node.children) {
      const result = getAncestralPath(child, targetId, currentPath);
      if (result) return result;
    }
  }
  return null;
};

const flattenTree = (node: ShajraNode, list: ShajraNode[] = []): ShajraNode[] => {
  list.push(node);
  if (node.children) {
    node.children.forEach(child => flattenTree(child, list));
  }
  return list;
};

export const ShajraModule: React.FC<ShajraModuleProps> = ({
  currentLoggedInUser,
  members = [],
  onLogActivity,
  initialAdminView = false
}) => {
  const [activeTabMode, setActiveTabMode] = useState<'tree' | 'referenceBooks'>(initialAdminView ? 'referenceBooks' : 'tree');

  // Load tree from local storage or default
  const [shajraData, setShajraData] = useState<ShajraNode>(() => {
    const saved = localStorage.getItem('iso_shajra_tree');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id === 'S-000') {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse saved Shajra tree', e);
      }
    }
    return defaultShajraData;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('All');

  // Modal States
  const [previewNode, setPreviewNode] = useState<ShajraNode | null>(null);
  const [editNodeModal, setEditNodeModal] = useState<ShajraNode | null>(null);
  const [addChildParentNode, setAddChildParentNode] = useState<ShajraNode | null>(null);
  const [deleteConfirmNode, setDeleteConfirmNode] = useState<ShajraNode | null>(null);

  // Form Fields State for Edit/Add
  const [formName, setFormName] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formFatherName, setFormFatherName] = useState('');
  const [formGeneration, setFormGeneration] = useState(1);
  const [formBranch, setFormBranch] = useState('Naqvi');
  const [formNotes, setFormNotes] = useState('');
  const [formMemberId, setFormMemberId] = useState('');

  // Determine user privilege
  const isSuperAdmin = currentLoggedInUser?.isSuperAdmin || currentLoggedInUser?.role === 'SuperAdmin';
  const isAdminOrManager = isSuperAdmin || currentLoggedInUser?.role === 'Admin' || currentLoggedInUser?.role === 'Manager';

  const branches = ['All', 'Khatam-un-Nabiyyin', 'Ahle-Bayt', 'Al-Hashemi', 'Naqvi', 'Rizvi', 'Zaidi', 'Kazmi', 'Taqvi', 'Hassani', 'Hussaini', 'Bukhari', 'Al Qadari'];

  // Save to localStorage whenever shajraData changes
  useEffect(() => {
    localStorage.setItem('iso_shajra_tree', JSON.stringify(shajraData));
  }, [shajraData]);

  // Handle Edit Trigger
  const handleOpenEdit = (node: ShajraNode) => {
    setEditNodeModal(node);
    setFormName(node.name || '');
    setFormTitle(node.title || '');
    setFormFatherName(node.fatherName || '');
    setFormGeneration(node.generation || 1);
    setFormBranch(node.branch || 'Naqvi');
    setFormNotes(node.notes || '');
    setFormMemberId(node.memberId || '');
  };

  // Handle Save Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editNodeModal) return;

    const updatedData: Partial<ShajraNode> = {
      name: formName.trim(),
      title: formTitle.trim() || undefined,
      fatherName: formFatherName.trim() || undefined,
      generation: Number(formGeneration),
      branch: formBranch,
      notes: formNotes.trim() || undefined,
      memberId: formMemberId || undefined
    };

    const newTree = updateNodeInTree(shajraData, editNodeModal.id, updatedData);
    setShajraData(newTree);

    if (onLogActivity) {
      onLogActivity('EDIT_SHAJRA_NODE', `Updated Shajra Node: ${formName} (ID: ${editNodeModal.id})`);
    }

    // Refresh preview if open
    if (previewNode && previewNode.id === editNodeModal.id) {
      setPreviewNode({ ...previewNode, ...updatedData });
    }

    setEditNodeModal(null);
  };

  // Handle Open Add Child
  const handleOpenAddChild = (parent: ShajraNode) => {
    setAddChildParentNode(parent);
    setFormName('');
    setFormTitle('');
    setFormFatherName(parent.name);
    setFormGeneration(parent.generation + 1);
    setFormBranch(parent.branch);
    setFormNotes('');
    setFormMemberId('');
  };

  // Handle Submit Add Child
  const handleSaveAddChild = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addChildParentNode) return;

    const newChild: ShajraNode = {
      id: `S-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: formName.trim(),
      title: formTitle.trim() || undefined,
      fatherName: formFatherName.trim() || undefined,
      generation: Number(formGeneration),
      branch: formBranch,
      notes: formNotes.trim() || undefined,
      memberId: formMemberId || undefined,
      children: []
    };

    const newTree = addChildToTree(shajraData, addChildParentNode.id, newChild);
    setShajraData(newTree);

    if (onLogActivity) {
      onLogActivity('ADD_SHAJRA_CHILD', `Added Shajra Node child '${newChild.name}' under parent '${addChildParentNode.name}'`);
    }

    setAddChildParentNode(null);
  };

  // Handle Delete Confirmation
  const handleConfirmDelete = () => {
    if (!deleteConfirmNode) return;

    if (deleteConfirmNode.id === shajraData.id) {
      alert('Root ancestor node cannot be deleted. You can edit its details.');
      setDeleteConfirmNode(null);
      return;
    }

    const newTree = deleteNodeFromTree(shajraData, deleteConfirmNode.id);
    if (newTree) {
      setShajraData(newTree);
      if (onLogActivity) {
        onLogActivity('DELETE_SHAJRA_NODE', `Deleted Shajra Node: ${deleteConfirmNode.name} (ID: ${deleteConfirmNode.id})`);
      }
    }

    if (previewNode && previewNode.id === deleteConfirmNode.id) {
      setPreviewNode(null);
    }

    setDeleteConfirmNode(null);
  };

  // Handle Reset to Baseline
  const handleResetBaseline = () => {
    if (window.confirm('Are you sure you want to reset the Shajra Tree back to the default original lineage baseline? All custom edits and additions will be restored to default.')) {
      setShajraData(defaultShajraData);
      localStorage.removeItem('iso_shajra_tree');
      if (onLogActivity) {
        onLogActivity('RESET_SHAJRA_TREE', 'Reset Shajra genealogical tree to default baseline');
      }
    }
  };

  // Render Tree Node Component
  const renderTreeNode = (node: ShajraNode, level = 0): React.ReactNode => {
    const query = searchQuery.trim().toLowerCase();
    const matchesQuery = !query || 
      node.name.toLowerCase().includes(query) || 
      node.branch.toLowerCase().includes(query) || 
      (node.title && node.title.toLowerCase().includes(query)) ||
      (node.notes && node.notes.toLowerCase().includes(query));

    const matchesBranch = selectedBranch === 'All' || node.branch.toLowerCase() === selectedBranch.toLowerCase();

    // Find linked member if any
    const linkedMember = node.memberId ? members.find(m => m.id === node.memberId) : null;

    return (
      <div key={node.id} className="relative ml-4 md:ml-8 my-3">
        {/* Connection Line */}
        {level > 0 && (
          <div className="absolute -left-4 top-6 w-4 h-0.5 bg-emerald-500/40" />
        )}

        <div className={`p-4 rounded-2xl border transition-all inline-block min-w-[280px] max-w-md ${
          !matchesQuery || !matchesBranch ? 'opacity-40 grayscale' : ''
        } ${
          node.generation === 0
            ? 'bg-gradient-to-r from-amber-950 via-emerald-950 to-slate-900 border-amber-400/90 text-white shadow-2xl ring-2 ring-amber-400/50'
            : node.id === 'S-001' || node.id === 'S-001-F'
            ? 'bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border-emerald-400 text-white shadow-xl ring-1 ring-emerald-400/50'
            : node.generation === 35
            ? 'bg-gradient-to-r from-emerald-950 to-slate-900 border-emerald-500 text-white shadow-xl ring-2 ring-emerald-500/50'
            : 'bg-white dark:bg-slate-800/90 border-slate-200/80 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 shadow-sm hover:shadow-md'
        }`}>
          {/* Header Row */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                node.generation === 0 ? 'bg-amber-400 text-slate-950 font-black shadow-md' :
                node.generation === 35 ? 'bg-emerald-500 text-white shadow-md' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
              }`}>
                G{node.generation}
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  {node.name}
                  {node.memberId && (
                    <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.2 rounded font-mono font-semibold" title="Linked to ISO Member">
                      Linked
                    </span>
                  )}
                </h4>
                {node.title && <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{node.title}</p>}
              </div>
            </div>

            <span className="shrink-0 px-2 py-0.5 text-[9px] font-mono font-extrabold uppercase bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/80 rounded-md">
              {node.branch}
            </span>
          </div>

          {node.fatherName && (
            <p className="mt-2 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              Father: <strong className="text-slate-700 dark:text-slate-200">{node.fatherName}</strong>
            </p>
          )}

          {linkedMember && (
            <div className="mt-2 p-2 bg-indigo-950/30 border border-indigo-500/30 rounded-xl flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <div className="text-[10px] truncate">
                <span className="text-indigo-300 font-bold">{linkedMember.fullName}</span> ({linkedMember.mobileNumber})
              </div>
            </div>
          )}

          {/* Node Action Buttons */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-1">
            <button
              onClick={() => setPreviewNode(node)}
              className="px-2.5 py-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 rounded-lg flex items-center gap-1 transition-colors"
              title="Preview / Details"
            >
              <Eye className="w-3 h-3" /> Preview
            </button>

            {isAdminOrManager && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenAddChild(node)}
                  className="p-1 text-slate-500 dark:text-slate-400 hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  title="Add Child / Descendant"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleOpenEdit(node)}
                  className="p-1 text-slate-500 dark:text-slate-400 hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  title="Edit Node"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                {node.id !== shajraData.id && (
                  <button
                    onClick={() => setDeleteConfirmNode(node)}
                    className="p-1 text-slate-500 dark:text-slate-400 hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    title="Delete Node"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Render Children Recursively */}
        {node.children && node.children.length > 0 && (
          <div className="pl-2 border-l-2 border-emerald-500/30 my-2">
            {node.children.map((child) => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const allNodesList = flattenTree(shajraData);
  const ancestralPath = previewNode ? getAncestralPath(shajraData, previewNode.id) : null;
  const previewLinkedMember = previewNode?.memberId ? members.find(m => m.id === previewNode.memberId) : null;

  return (
    <div className="space-y-6">
      {/* Admin Sub-navigation Tab Bar - ONLY visible to Admin/SuperAdmin */}
      {isAdminOrManager && (
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 w-fit">
          <button
            onClick={() => setActiveTabMode('tree')}
            className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-all ${
              activeTabMode === 'tree'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <GitBranch className="w-4 h-4" />
            Shajra Genealogy Tree
          </button>
          <button
            onClick={() => setActiveTabMode('referenceBooks')}
            className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-all ${
              activeTabMode === 'referenceBooks'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>Reference Books & AI Verification</span>
            <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] font-black rounded-md border border-amber-500/30">
              Admin Only 🔒
            </span>
          </button>
        </div>
      )}

      {/* When Admin is on Reference Books tab */}
      {isAdminOrManager && activeTabMode === 'referenceBooks' ? (
        <ShajraReferenceBooksModule
          currentLoggedInUser={currentLoggedInUser}
          members={members}
          shajraNodes={allNodesList}
          onLogActivity={onLogActivity}
        />
      ) : (
        <>
          {/* Header Banner */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-2xl">
              <GitBranch className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Shajra Tree (Genealogy Lineage)</h1>
                {isAdminOrManager && (
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] font-bold rounded-md flex items-center gap-1 border border-amber-500/30">
                    <ShieldCheck className="w-3 h-3" /> Admin Edit Mode
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Authentic genealogical directory tracking ancestral lineage, branch ties, and family history.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isAdminOrManager && (
              <>
                <button
                  onClick={() => handleOpenAddChild(shajraData)}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Branch / Descendant
                </button>
                {isSuperAdmin && (
                  <button
                    onClick={handleResetBaseline}
                    className="p-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-amber-400 rounded-xl border border-slate-200 dark:border-slate-600 text-xs transition-colors"
                    title="Reset Shajra to Original Baseline"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
              </>
            )}

            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search Shajra Name or Branch..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>
        </div>

        {/* Branch Filters */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center gap-1.5 overflow-x-auto pb-1">
          <span className="text-[10px] font-bold uppercase text-slate-400 mr-1 shrink-0 flex items-center gap-1">
            <Layers className="w-3 h-3" /> Branch Filter:
          </span>
          {branches.map((b) => (
            <button
              key={b}
              onClick={() => setSelectedBranch(b)}
              className={`px-2.5 py-1 text-[10px] font-bold rounded-lg shrink-0 transition-colors ${
                selectedBranch === b
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* Main Tree Canvas */}
      <div className="bg-slate-50 dark:bg-slate-900/80 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-inner overflow-x-auto min-h-[500px]">
        <div className="min-w-[650px]">
          {renderTreeNode(shajraData)}
        </div>
      </div>

      {/* ================= PREVIEW NODE MODAL ================= */}
      {previewNode && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center font-extrabold text-sm border border-emerald-500/30">
                  G{previewNode.generation}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">{previewNode.name}</h3>
                  {previewNode.title && <p className="text-xs font-bold text-emerald-400">{previewNode.title}</p>}
                </div>
              </div>
              <button
                onClick={() => setPreviewNode(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Key Particulars */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800">
              <div>
                <span className="text-slate-400 block text-[10px]">Branch / Tribe</span>
                <strong className="text-emerald-300 font-extrabold uppercase">{previewNode.branch}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Generation</span>
                <strong className="text-white">Generation {previewNode.generation}</strong>
              </div>
              {previewNode.fatherName && (
                <div className="col-span-2 pt-2 border-t border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Father Name</span>
                  <strong className="text-slate-200">{previewNode.fatherName}</strong>
                </div>
              )}
            </div>

            {/* Ancestral Path */}
            {ancestralPath && ancestralPath.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-1">
                  <GitBranch className="w-3.5 h-3.5 text-emerald-400" /> Ancestral Lineage Chain
                </h4>
                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-2xl text-[11px] space-y-1.5 max-h-40 overflow-y-auto">
                  {ancestralPath.map((item, idx) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-emerald-950 text-emerald-400 font-mono text-[9px] flex items-center justify-center font-bold">
                        G{item.generation}
                      </span>
                      <span className={item.id === previewNode.id ? 'font-black text-emerald-300' : 'text-slate-300'}>
                        {item.name}
                      </span>
                      {idx < ancestralPath.length - 1 && <ChevronRight className="w-3 h-3 text-slate-600 shrink-0 ml-auto" />}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {previewNode.notes && (
              <div>
                <h4 className="text-xs font-bold text-slate-400 mb-1">Historical Remarks / Notes</h4>
                <p className="p-3 bg-slate-950/50 border border-slate-800 rounded-2xl text-xs text-slate-300 italic">
                  {previewNode.notes}
                </p>
              </div>
            )}

            {/* Linked Member Info */}
            {previewLinkedMember && (
              <div className="p-3.5 bg-indigo-950/40 border border-indigo-500/30 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
                  <LinkIcon className="w-4 h-4 text-indigo-400" /> Linked Member Record
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {previewLinkedMember.fullName.charAt(0)}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">{previewLinkedMember.fullName}</h5>
                    <p className="text-[10px] text-slate-300">{previewLinkedMember.designation} ({previewLinkedMember.membershipType})</p>
                    <p className="text-[10px] text-slate-400 font-mono">Mobile: {previewLinkedMember.mobileNumber}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Footer Action Buttons */}
            <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-800">
              <button
                onClick={() => setPreviewNode(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
              >
                Close
              </button>

              {isAdminOrManager && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setActiveTabMode('referenceBooks');
                      setPreviewNode(null);
                    }}
                    className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-purple-600/20"
                    title="Cross-reference this lineage with reference books"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Verify with AI Books
                  </button>
                  <button
                    onClick={() => {
                      const nodeToEdit = previewNode;
                      setPreviewNode(null);
                      handleOpenEdit(nodeToEdit);
                    }}
                    className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit Node
                  </button>
                  <button
                    onClick={() => {
                      const nodeToAddChild = previewNode;
                      setPreviewNode(null);
                      handleOpenAddChild(nodeToAddChild);
                    }}
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Child
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= EDIT NODE MODAL ================= */}
      {editNodeModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-400" /> Edit Shajra Tree Node
              </h3>
              <button onClick={() => setEditNodeModal(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Title / Honorific</label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Al-Sadiq"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Father Name</label>
                  <input
                    type="text"
                    value={formFatherName}
                    onChange={(e) => setFormFatherName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Generation # *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={100}
                    value={formGeneration}
                    onChange={(e) => setFormGeneration(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Branch *</label>
                  <select
                    value={formBranch}
                    onChange={(e) => setFormBranch(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                  >
                    {branches.filter(b => b !== 'All').map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Link to Member Directory (Optional)</label>
                <select
                  value={formMemberId}
                  onChange={(e) => setFormMemberId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                >
                  <option value="">-- No Member Link --</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} ({m.mobileNumber}) - {m.membershipType}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Notes / Historical Remarks</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditNodeModal(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-lg shadow-amber-500/20"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= ADD CHILD MODAL ================= */}
      {addChildParentNode && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-emerald-400" /> Add Descendant / Child
                </h3>
                <p className="text-[11px] text-slate-400">Parent: <strong className="text-emerald-400">{addChildParentNode.name}</strong></p>
              </div>
              <button onClick={() => setAddChildParentNode(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAddChild} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Syed Hassan ibn..."
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Title / Honorific</label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Al-Rida"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Father Name</label>
                  <input
                    type="text"
                    value={formFatherName}
                    onChange={(e) => setFormFatherName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Generation # *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={100}
                    value={formGeneration}
                    onChange={(e) => setFormGeneration(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Branch *</label>
                  <select
                    value={formBranch}
                    onChange={(e) => setFormBranch(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                  >
                    {branches.filter(b => b !== 'All').map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Link to Member Directory (Optional)</label>
                <select
                  value={formMemberId}
                  onChange={(e) => setFormMemberId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                >
                  <option value="">-- No Member Link --</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} ({m.mobileNumber}) - {m.membershipType}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Notes / Remarks</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAddChildParentNode(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20"
                >
                  Add Descendant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= DELETE CONFIRMATION MODAL ================= */}
      {deleteConfirmNode && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 text-white shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 bg-red-500/20 text-red-400 rounded-2xl flex items-center justify-center mx-auto border border-red-500/30">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white">Delete Shajra Node?</h3>
              <p className="text-xs text-slate-300 mt-1">
                Are you sure you want to remove <strong className="text-red-400">{deleteConfirmNode.name}</strong> from the genealogical tree?
              </p>
              {deleteConfirmNode.children && deleteConfirmNode.children.length > 0 && (
                <p className="text-[11px] text-amber-400 mt-2 bg-amber-950/40 p-2 rounded-xl border border-amber-500/30">
                  ⚠️ Warning: Deleting this node will also remove its {deleteConfirmNode.children.length} sub-descendants.
                </p>
              )}
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmNode(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-600/20"
              >
                Delete Node
              </button>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
};
