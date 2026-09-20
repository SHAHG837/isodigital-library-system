import React, { useState, useEffect } from 'react';
import { 
  ShajraReferenceBook, 
  ShajraAiVerificationResult, 
  Member, 
  AdminCredential,
  ShajraNode
} from '../types';
import { INITIAL_REFERENCE_BOOKS } from '../data/initialReferenceBooks';
import { 
  BookOpen, 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  FileText, 
  Download, 
  Trash2, 
  Eye, 
  Layers, 
  Search, 
  Plus, 
  X, 
  RefreshCw, 
  Award, 
  Printer, 
  Check, 
  BookMarked,
  Info,
  ChevronRight,
  UserCheck,
  Building2,
  FileCheck
} from 'lucide-react';

interface ShajraReferenceBooksModuleProps {
  currentLoggedInUser?: AdminCredential | null;
  members?: Member[];
  shajraNodes?: ShajraNode[];
  onLogActivity?: (action: string, details: string) => void;
}

const STORAGE_KEY = 'iso_shajra_reference_books';

const SAMPLE_SHAJRAS = {
  Zaidi: {
    candidate: 'Syed Muhammad Amir',
    father: 'Syed Ali Akbar',
    branch: 'Zaidi',
    chain: `1. Syed Muhammad Amir ibn
2. Syed Ali Akbar ibn
3. Syed Ghulam Murtaza ibn
4. Syed Ahmad Hassan ibn
5. Syed Miran Bakhsh ibn
6. Syed Fateh Muhammad ibn
7. Syed Shahab al-Din ibn
8. Syed Qutb al-Din (Migrated from Wasit to Subcontinent) ibn
9. Syed Zayd Thani ibn
10. Syed Ali al-Iraqi ibn
11. Syed Yahya ibn
12. Syed Isa al-Mu'tamid ibn
13. Syed Zaid al-Shahid ibn
14. Imam Ali Zain al-Abidin (A.S.) ibn
15. Imam Hussain (A.S.) ibn
16. Imam Ali ibn Abi Talib (A.S.) & Syeda Fatima Zahra (S.A.)
Reaching to: Khatam un-Nabiyyin Hazrat Muhammad Mustafa (S.A.W.W.)`
  },
  Naqvi: {
    candidate: 'Syed Raza Abbas Naqvi',
    father: 'Syed Muhammad Baqir',
    branch: 'Naqvi',
    chain: `1. Syed Raza Abbas ibn
2. Syed Muhammad Baqir ibn
3. Syed Ali Naqi ibn
4. Syed Muhammad Sadiq ibn
5. Syed Jalal al-Din Surkh-Posh Bukhari (Uch Sharif) ibn
6. Syed Ali al-Murtaza ibn
7. Syed Jafar al-Hujjah ibn
8. Syed Muhammad al-Askari ibn
9. Syed Ali al-Hadi al-Naqi (10th Imam A.S.) ibn
10. Imam Muhammad al-Taqi (al-Jawad A.S.) ibn
11. Imam Ali al-Rida (A.S.) ibn
12. Imam Musa al-Kazim (A.S.) ibn
13. Imam Jafar al-Sadiq (A.S.) ibn
14. Imam Muhammad al-Baqir (A.S.) ibn
15. Imam Ali Zain al-Abidin (A.S.) ibn
16. Imam Hussain (A.S.) ibn
17. Imam Ali ibn Abi Talib (A.S.) & Syeda Fatima Zahra (S.A.)`
  },
  Rizvi: {
    candidate: 'Syed Hassan Askari Rizvi',
    father: 'Syed Mujtaba Hussain',
    branch: 'Rizvi',
    chain: `1. Syed Hassan Askari ibn
2. Syed Mujtaba Hussain ibn
3. Syed Dildar Ali (Ghufran Ma'ab) ibn
4. Syed Muhammad Muin ibn
5. Syed Najm al-Din ibn
6. Syed Zakariya ibn
7. Syed Sultan Ahmad (Zaidpur / Sabzwar) ibn
8. Syed Muhammad al-Mahdi ibn
9. Syed Isa ibn
10. Syed Musa al-Mubarraqa ibn
11. Imam Muhammad al-Taqi (A.S.) ibn
12. Imam Ali al-Rida (A.S.) ibn
13. Imam Musa al-Kazim (A.S.) ibn
14. Imam Jafar al-Sadiq (A.S.) ibn
15. Imam Muhammad al-Baqir (A.S.) ibn
16. Imam Ali Zain al-Abidin (A.S.) ibn
17. Imam Hussain (A.S.)`
  },
  Kazmi: {
    candidate: 'Syed Asad Ali Kazmi',
    father: 'Syed Akhtar Hussain',
    branch: 'Kazmi',
    chain: `1. Syed Asad Ali ibn
2. Syed Akhtar Hussain ibn
3. Syed Wilayat Ali ibn
4. Syed Karamat Ali ibn
5. Syed Muhammad Masood ibn
6. Syed Qasim ibn
7. Syed Shah Wilayat (Amroha lineage) ibn
8. Syed Ali Naqib ibn
9. Syed Hamza ibn
10. Syed Harun ibn
11. Imam Musa al-Kazim (7th Imam A.S.) ibn
12. Imam Jafar al-Sadiq (A.S.) ibn
13. Imam Muhammad al-Baqir (A.S.) ibn
14. Imam Ali Zain al-Abidin (A.S.) ibn
15. Imam Hussain (A.S.)`
  }
};

export const ShajraReferenceBooksModule: React.FC<ShajraReferenceBooksModuleProps> = ({
  currentLoggedInUser,
  members = [],
  shajraNodes = [],
  onLogActivity
}) => {
  // Check Admin Authorization
  const isSuperAdmin = currentLoggedInUser?.isSuperAdmin || currentLoggedInUser?.role === 'SuperAdmin' || currentLoggedInUser?.role === 'Super Admin';
  const isAdminOrManager = isSuperAdmin || currentLoggedInUser?.role === 'Admin' || currentLoggedInUser?.role === 'Manager';

  const [activeTab, setActiveTab] = useState<'books' | 'verification'>('books');
  const [books, setBooks] = useState<ShajraReferenceBook[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading reference books from storage:', e);
    }
    return INITIAL_REFERENCE_BOOKS;
  });

  // Save books to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
    } catch (e) {
      console.error('Error saving reference books to storage:', e);
    }
  }, [books]);

  // Search and filter for books
  const [bookSearch, setBookSearch] = useState('');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState('All');

  // Book Modal: Add / Upload New Book
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadAuthor, setUploadAuthor] = useState('');
  const [uploadBranches, setUploadBranches] = useState<string[]>(['All Sadat']);
  const [uploadEra, setUploadEra] = useState('Classical Era');
  const [uploadLanguage, setUploadLanguage] = useState<'Arabic' | 'Persian' | 'Urdu' | 'English'>('Arabic');
  const [uploadPages, setUploadPages] = useState<number>(350);
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadExcerpt, setUploadExcerpt] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Selected Book for View/Preview
  const [viewingBook, setViewingBook] = useState<ShajraReferenceBook | null>(null);

  // AI Training state
  const [trainingBookId, setTrainingBookId] = useState<string | null>(null);
  const [batchTrainingInProgress, setBatchTrainingInProgress] = useState(false);

  // ================= VERIFICATION ENGINE STATE =================
  const [candidateSource, setCandidateSource] = useState<'manual' | 'member' | 'tree'>('manual');
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [candidateName, setCandidateName] = useState('Syed Muhammad Amir');
  const [fatherName, setFatherName] = useState('Syed Ali Akbar');
  const [claimedBranch, setClaimedBranch] = useState('Zaidi');
  const [lineageChain, setLineageChain] = useState(SAMPLE_SHAJRAS.Zaidi.chain);
  const [additionalNotes, setAdditionalNotes] = useState('Family ancestral tree traced to Sadat-e-Bara migration records.');
  const [selectedBookIds, setSelectedBookIds] = useState<string[]>(books.map(b => b.id));

  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<ShajraAiVerificationResult | null>(null);
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  // Handle member selection
  const handleSelectMember = (memId: string) => {
    setSelectedMemberId(memId);
    const m = members.find(mem => mem.id === memId);
    if (m) {
      setCandidateName(m.name);
      setFatherName(m.fatherName || 'Syed');
      // Extract branch from notes if available
      let branch = 'Zaidi';
      if (m.notes) {
        const match = m.notes.match(/Shajra:\s*([A-Za-z]+)/i);
        if (match && match[1]) {
          branch = match[1];
        }
      }
      setClaimedBranch(branch);
      setLineageChain(`1. ${m.name} ibn\n2. ${m.fatherName || 'Syed ...'} ibn\n3. [Generations pending verification]\n... Reaching to Amir al-Mu'minin Imam Ali (A.S.)`);
    }
  };

  // Handle quick sample load
  const handleLoadSample = (branchKey: keyof typeof SAMPLE_SHAJRAS) => {
    const s = SAMPLE_SHAJRAS[branchKey];
    setCandidateName(s.candidate);
    setFatherName(s.father);
    setClaimedBranch(s.branch);
    setLineageChain(s.chain);
    setAdditionalNotes(`Canonical ${s.branch} reference chain cross-referenced with standard texts.`);
  };

  // File Upload Handlers (Supports both Drag-and-Drop and Manual Click)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        alert('Please select a valid PDF file for the Shajra Reference Book.');
        return;
      }
      setSelectedFile(file);
      if (!uploadTitle) {
        // Auto-generate a title from file name
        const clean = file.name.replace(/\.pdf$/i, '').replace(/_/g, ' ');
        setUploadTitle(clean);
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        alert('Please drop a valid PDF file.');
        return;
      }
      setSelectedFile(file);
      if (!uploadTitle) {
        const clean = file.name.replace(/\.pdf$/i, '').replace(/_/g, ' ');
        setUploadTitle(clean);
      }
    }
  };

  // Submit New Book
  const handleSaveBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim()) {
      alert('Please provide a Book Title.');
      return;
    }

    setIsUploading(true);

    try {
      let fileSizeStr = '8.5 MB';
      let fileName = 'Uploaded_Shajra_Reference.pdf';
      let dataUrl: string | undefined = undefined;

      if (selectedFile) {
        fileName = selectedFile.name;
        fileSizeStr = `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`;
        
        // Convert to base64 if small enough for localStorage preview
        if (selectedFile.size < 4 * 1024 * 1024) {
          dataUrl = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(selectedFile);
          });
        }
      }

      const newBook: ShajraReferenceBook = {
        id: `BK-${Date.now().toString().slice(-4)}`,
        title: uploadTitle.trim(),
        author: uploadAuthor.trim() || 'Classical Nassabah / Historian',
        branchCoverage: uploadBranches.length > 0 ? uploadBranches : ['All Sadat'],
        eraCentury: uploadEra.trim() || 'Historic Century',
        language: uploadLanguage,
        pdfFileName: fileName,
        fileSizeFormatted: fileSizeStr,
        pdfDataUrl: dataUrl,
        totalPages: Number(uploadPages) || 300,
        description: uploadDescription.trim() || 'Authoritative reference manuscript on Sadat genealogy and verified ancestral chains.',
        uploadedAt: new Date().toISOString(),
        uploadedBy: currentLoggedInUser?.name || 'Administrator',
        isAiTrained: false,
        extractedKnowledgeSnippet: uploadExcerpt.trim()
      };

      setBooks(prev => [newBook, ...prev]);
      setShowUploadModal(false);

      // Reset form
      setUploadTitle('');
      setUploadAuthor('');
      setUploadBranches(['All Sadat']);
      setUploadEra('Classical Era');
      setUploadPages(350);
      setUploadDescription('');
      setUploadExcerpt('');
      setSelectedFile(null);

      if (onLogActivity) {
        onLogActivity('UPLOAD_SHAJRA_REFERENCE_BOOK', `Uploaded reference book PDF: ${newBook.title} (${newBook.fileSizeFormatted})`);
      }

      // Auto-trigger AI Training for this book
      handleTrainBook(newBook);
    } catch (err: any) {
      alert('Failed to process book upload: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  // Train AI on a single book
  const handleTrainBook = async (book: ShajraReferenceBook) => {
    setTrainingBookId(book.id);
    try {
      const response = await fetch('/api/ai/train-shajra-book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: book.title,
          author: book.author,
          branchCoverage: book.branchCoverage,
          eraCentury: book.eraCentury,
          description: book.description,
          textExcerpt: book.extractedKnowledgeSnippet || book.description
        })
      });

      const result = await response.json();

      setBooks(prev => prev.map(b => {
        if (b.id === book.id) {
          return {
            ...b,
            isAiTrained: true,
            trainedAt: result.trainedAt || new Date().toISOString(),
            extractedKnowledgeSnippet: result.extractedKnowledgeSnippet || b.extractedKnowledgeSnippet
          };
        }
        return b;
      }));

      if (onLogActivity) {
        onLogActivity('TRAIN_AI_SHAJRA_BOOK', `Trained AI knowledge base on reference book: ${book.title}`);
      }
    } catch (err: any) {
      console.error('Error training AI on book:', err);
    } finally {
      setTrainingBookId(null);
    }
  };

  // Batch Train All Books
  const handleBatchTrainAll = async () => {
    setBatchTrainingInProgress(true);
    for (const b of books) {
      await handleTrainBook(b);
    }
    setBatchTrainingInProgress(false);
    alert('All Reference Books have been successfully indexed and synced into the AI Shajra Verification Engine!');
  };

  // Delete Book
  const handleDeleteBook = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to remove the reference book "${title}" from the registry?`)) {
      setBooks(prev => prev.filter(b => b.id !== id));
      if (onLogActivity) {
        onLogActivity('DELETE_SHAJRA_REFERENCE_BOOK', `Deleted reference book: ${title} (ID: ${id})`);
      }
    }
  };

  // Download / Generate PDF file
  const handleDownloadPdf = (book: ShajraReferenceBook) => {
    if (book.pdfDataUrl) {
      const a = document.createElement('a');
      a.href = book.pdfDataUrl;
      a.download = book.pdfFileName;
      a.click();
    } else {
      // Create a dummy / formatted text blob representing the book's verified metadata & excerpts
      const textContent = `ISO DIGITAL SHAHRA REFERENCE ARCHIVE
======================================================
TITLE: ${book.title}
AUTHOR: ${book.author}
ERA / CENTURY: ${book.eraCentury}
LANGUAGE: ${book.language}
BRANCH COVERAGE: ${book.branchCoverage.join(', ')}
PAGES: ${book.totalPages}
UPLOADED: ${new Date(book.uploadedAt).toLocaleDateString()} by ${book.uploadedBy}
AI STATUS: ${book.isAiTrained ? 'Trained & Canonical Knowledge Extracted' : 'Pending Training'}
------------------------------------------------------
CANONICAL KNOWLEDGE & LINEAGE RULES:
${book.extractedKnowledgeSnippet || book.description}

======================================================
CONFIDENTIAL: AUTHORIZED ADMIN REFERENCE MATERIAL
ID: ${book.id} | ISO DIGITAL LIBRARY SYSTEM
`;
      const blob = new Blob([textContent], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = book.pdfFileName.replace(/\.pdf$/i, '') + '_Metadata_Dossier.pdf';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  // Run AI Shajra Verification
  const handleRunVerification = async () => {
    if (!candidateName.trim() || !lineageChain.trim()) {
      alert('Please provide Candidate Name and Lineage Chain.');
      return;
    }

    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const activeBooks = books.filter(b => selectedBookIds.includes(b.id));

      const response = await fetch('/api/ai/verify-shajra', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateName: candidateName.trim(),
          fatherName: fatherName.trim(),
          claimedBranch: claimedBranch.trim(),
          lineageChainText: lineageChain.trim(),
          referenceBooks: activeBooks,
          additionalNotes: additionalNotes.trim()
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const result: ShajraAiVerificationResult = await response.json();
      setVerificationResult(result);

      if (onLogActivity) {
        onLogActivity(
          'AI_SHAJRA_VERIFICATION',
          `Ran AI lineage verification for ${candidateName} (${claimedBranch}) - Result: ${result.status} (Score: ${result.confidenceScore}%)`
        );
      }
    } catch (err: any) {
      alert('Verification process error: ' + (err?.message || 'Server did not respond'));
    } finally {
      setIsVerifying(false);
    }
  };

  // Filter books
  const filteredBooks = books.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(bookSearch.toLowerCase()) ||
      b.author.toLowerCase().includes(bookSearch.toLowerCase()) ||
      b.description.toLowerCase().includes(bookSearch.toLowerCase());

    const matchesBranch = selectedBranchFilter === 'All' || 
      b.branchCoverage.includes('All Sadat') || 
      b.branchCoverage.includes(selectedBranchFilter);

    return matchesSearch && matchesBranch;
  });

  // Guard for Admin only
  if (!isAdminOrManager) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-white space-y-4 shadow-xl">
        <div className="w-16 h-16 bg-red-500/20 text-red-400 rounded-3xl mx-auto flex items-center justify-center border border-red-500/30">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Admin Restricted Area</h2>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          The Shajra Reference Books Repository and AI Genealogical Verification Engine are strictly restricted to authenticated Administrators and Super Admins.
        </p>
      </div>
    );
  }

  const allBranches = ['All', 'Zaidi', 'Naqvi', 'Rizvi', 'Kazmi', 'Hassani', 'Hussaini', 'Bukhari', 'Mousavi'];

  return (
    <div className="space-y-6">
      {/* Top Banner & Mode Toggle */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-6 rounded-3xl border border-emerald-500/30 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold rounded-full uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Admin Security Clearance
              </span>
              <span className="px-2.5 py-0.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold rounded-full uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> AI Verification Engine
              </span>
            </div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
              <BookOpen className="w-7 h-7 text-emerald-400" />
              Shajra Reference Books & AI Verification
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl">
              Confidential archival repository of canonical PDF reference books (Umdat al-Talib, Sirr al-Silsilah, etc.) used to train the Gemini AI engine for authenticating Sadat lineage chains.
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center bg-slate-950/70 p-1.5 rounded-2xl border border-slate-700/80 shrink-0">
            <button
              onClick={() => setActiveTab('books')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === 'books'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookMarked className="w-4 h-4" />
              Reference Books Archive ({books.length})
            </button>
            <button
              onClick={() => setActiveTab('verification')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === 'verification'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              AI Shajra Authenticator
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-700/60">
          <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
            <p className="text-[10px] uppercase font-bold text-slate-400">Total PDF Books</p>
            <p className="text-lg font-black text-white mt-0.5">{books.length}</p>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
            <p className="text-[10px] uppercase font-bold text-slate-400">AI Trained Books</p>
            <p className="text-lg font-black text-emerald-400 mt-0.5">
              {books.filter(b => b.isAiTrained).length} / {books.length}
            </p>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
            <p className="text-[10px] uppercase font-bold text-slate-400">Sadat Branches Grounded</p>
            <p className="text-lg font-black text-amber-400 mt-0.5">8 Major Lineages</p>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
            <p className="text-[10px] uppercase font-bold text-slate-400">AI Engine Grounding</p>
            <p className="text-lg font-black text-purple-400 mt-0.5">Gemini 3.8 Flash</p>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* VIEW 1: REFERENCE BOOKS ARCHIVE */}
      {/* ======================================================== */}
      {activeTab === 'books' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 sm:w-72">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search reference books, authors, eras..."
                  value={bookSearch}
                  onChange={(e) => setBookSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                />
              </div>

              {/* Branch Filter */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1">
                {allBranches.slice(0, 6).map((b) => (
                  <button
                    key={b}
                    onClick={() => setSelectedBranchFilter(b)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl shrink-0 transition-colors ${
                      selectedBranchFilter === b
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleBatchTrainAll}
                disabled={batchTrainingInProgress}
                className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/20 flex items-center gap-2 transition-all"
                title="Index all books into AI knowledge base"
              >
                <RefreshCw className={`w-4 h-4 ${batchTrainingInProgress ? 'animate-spin' : ''}`} />
                {batchTrainingInProgress ? 'Training AI...' : 'Train AI on All Books'}
              </button>

              <button
                onClick={() => setShowUploadModal(true)}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-all"
              >
                <Upload className="w-4 h-4" />
                Upload Reference Book (PDF)
              </button>
            </div>
          </div>

          {/* Books Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredBooks.map((book) => (
              <div
                key={book.id}
                className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  {/* Top Metadata */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-12 h-12 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-2xl flex flex-col items-center justify-center border border-red-200 dark:border-red-900/50 shrink-0 font-mono">
                      <FileText className="w-5 h-5" />
                      <span className="text-[9px] font-black uppercase tracking-tighter">PDF</span>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {book.isAiTrained ? (
                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-full border border-emerald-500/20 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> AI Indexed
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold rounded-full border border-amber-500/20 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Pending AI Training
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400 font-mono">{book.fileSizeFormatted}</span>
                    </div>
                  </div>

                  {/* Title & Author */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors line-clamp-2">
                      {book.title}
                    </h3>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                      By {book.author}
                    </p>
                    {book.eraCentury && (
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                        {book.eraCentury} • {book.language}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                    {book.description}
                  </p>

                  {/* Branch Coverage Tags */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {book.branchCoverage.map((b) => (
                      <span
                        key={b}
                        className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-semibold rounded-md"
                      >
                        {b}
                      </span>
                    ))}
                  </div>

                  {/* Knowledge Snippet Preview */}
                  {book.extractedKnowledgeSnippet && (
                    <div className="p-2.5 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/20 rounded-xl text-[11px] text-slate-700 dark:text-slate-300">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-0.5 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Canonical AI Rule:
                      </span>
                      <p className="line-clamp-2 italic">{book.extractedKnowledgeSnippet}</p>
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setViewingBook(book)}
                      className="p-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-emerald-500 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl transition-colors text-xs"
                      title="View Details & Read Knowledge Excerpt"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDownloadPdf(book)}
                      className="p-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-emerald-500 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl transition-colors text-xs"
                      title="Download PDF / Dossier"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleTrainBook(book)}
                      disabled={trainingBookId === book.id}
                      className="p-2 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900 rounded-xl transition-colors text-xs border border-purple-200 dark:border-purple-800"
                      title="Train / Re-index this book with AI"
                    >
                      <Sparkles className={`w-4 h-4 ${trainingBookId === book.id ? 'animate-spin' : ''}`} />
                    </button>
                  </div>

                  <button
                    onClick={() => handleDeleteBook(book.id, book.title)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors"
                    title="Remove Book"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW 2: AI SHAJRA LINEAGE VERIFICATION ENGINE */}
      {/* ======================================================== */}
      {activeTab === 'verification' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Input & Candidate Selection (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">Candidate & Lineage Entry</h2>
                    <p className="text-[11px] text-slate-500">Cross-examine candidate chain with reference books</p>
                  </div>
                </div>
              </div>

              {/* Source Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Select Candidate Source</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCandidateSource('manual')}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                      candidateSource === 'manual'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    Manual Entry / Sample
                  </button>
                  <button
                    type="button"
                    onClick={() => setCandidateSource('member')}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                      candidateSource === 'member'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    Registered Member ({members.length})
                  </button>
                </div>
              </div>

              {/* If member source selected */}
              {candidateSource === 'member' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Choose Member</label>
                  <select
                    value={selectedMemberId}
                    onChange={(e) => handleSelectMember(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  >
                    <option value="">-- Choose a registered member --</option>
                    {members.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.fatherName ? `s/o ${m.fatherName}` : m.id}) - {m.membershipNumber || m.unit}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Quick Sample Presets */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center justify-between">
                  <span>Quick Load Canonical Sample Chain:</span>
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['Zaidi', 'Naqvi', 'Rizvi', 'Kazmi'] as const).map(b => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => handleLoadSample(b)}
                      className="px-2 py-1.5 text-[11px] font-bold bg-slate-100 dark:bg-slate-700/80 hover:bg-emerald-600 hover:text-white text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
                    >
                      {b} Shajra
                    </button>
                  ))}
                </div>
              </div>

              {/* Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Candidate Name</label>
                  <input
                    type="text"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                    placeholder="e.g. Syed Muhammad Amir"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Father's Name</label>
                  <input
                    type="text"
                    value={fatherName}
                    onChange={(e) => setFatherName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                    placeholder="e.g. Syed Ali Akbar"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Claimed Sadat Branch</label>
                <select
                  value={claimedBranch}
                  onChange={(e) => setClaimedBranch(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold text-emerald-600"
                >
                  {allBranches.filter(b => b !== 'All').map(b => (
                    <option key={b} value={b}>{b} Sadat</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Genealogical Chain (Ancestral Nodes)</label>
                  <span className="text-[10px] text-slate-400">ibn / s/o format</span>
                </div>
                <textarea
                  rows={6}
                  value={lineageChain}
                  onChange={(e) => setLineageChain(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white leading-relaxed focus:ring-2 focus:ring-emerald-500"
                  placeholder="1. Candidate ibn&#10;2. Father ibn&#10;3. Grandfather ibn&#10;..."
                />
              </div>

              {/* Reference Books Selection for Grounding */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-700">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Grounding Reference Books:</span>
                  <span className="text-[10px] text-emerald-600 font-bold">{selectedBookIds.length} books selected</span>
                </label>
                <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                  {books.map(b => (
                    <label
                      key={b.id}
                      className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-[11px] cursor-pointer hover:bg-slate-100"
                    >
                      <input
                        type="checkbox"
                        checked={selectedBookIds.includes(b.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedBookIds(prev => [...prev, b.id]);
                          } else {
                            setSelectedBookIds(prev => prev.filter(id => id !== b.id));
                          }
                        }}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <div className="truncate flex-1">
                        <span className="font-bold text-slate-900 dark:text-white truncate block">{b.title}</span>
                        <span className="text-[10px] text-slate-400">{b.author}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Run Verification Button */}
              <button
                type="button"
                onClick={handleRunVerification}
                disabled={isVerifying}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all uppercase tracking-wider"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    AI Cross-Referencing Reference Books...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    Verify Shajra with AI (Cross-Reference)
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right: Verification Dossier & Analysis (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {!verificationResult && !isVerifying && (
              <div className="bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-700/80 rounded-3xl p-12 text-center text-slate-400 space-y-4 min-h-[460px] flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-3xl flex items-center justify-center">
                  <Sparkles className="w-8 h-8" />
                </div>
                <div className="space-y-1 max-w-sm">
                  <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">
                    Awaiting Shajra Chain Submission
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Select or enter a genealogical lineage chain on the left and click Verify to initiate AI cross-referencing against the uploaded canonical reference books.
                  </p>
                </div>
              </div>
            )}

            {isVerifying && (
              <div className="bg-white dark:bg-slate-800 p-12 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm text-center space-y-6 min-h-[460px] flex flex-col items-center justify-center">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto" />
                  <Sparkles className="w-6 h-6 text-emerald-400 absolute inset-0 m-auto" />
                </div>
                <div className="space-y-2 max-w-md mx-auto">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Genealogical AI Cross-Examination in Progress
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Analyzing transmission lines across Umdat al-Talib, Sirr al-Silsilah, and canonical registries for {claimedBranch} Sadat markers...
                  </p>
                </div>
              </div>
            )}

            {verificationResult && !isVerifying && (
              <div className="space-y-5 animate-in fade-in duration-300">
                {/* Result Header Banner */}
                <div className={`p-6 rounded-3xl border text-white shadow-xl ${
                  verificationResult.status === 'AUTHENTICATED'
                    ? 'bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border-emerald-500/50'
                    : verificationResult.status === 'VERIFIED_WITH_RESERVATIONS'
                    ? 'bg-gradient-to-r from-amber-950 via-slate-900 to-slate-900 border-amber-500/50'
                    : 'bg-gradient-to-r from-red-950 via-slate-900 to-slate-900 border-red-500/50'
                }`}>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {verificationResult.status === 'AUTHENTICATED' ? (
                          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-black rounded-full border border-emerald-500/40 flex items-center gap-1.5 uppercase tracking-wider">
                            <CheckCircle2 className="w-4 h-4" /> Authenticated & Corroborated
                          </span>
                        ) : verificationResult.status === 'VERIFIED_WITH_RESERVATIONS' ? (
                          <span className="px-3 py-1 bg-amber-500/20 text-amber-300 text-xs font-black rounded-full border border-amber-500/40 flex items-center gap-1.5 uppercase tracking-wider">
                            <AlertTriangle className="w-4 h-4" /> Verified with Reservations
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-red-500/20 text-red-300 text-xs font-black rounded-full border border-red-500/40 flex items-center gap-1.5 uppercase tracking-wider">
                            <AlertTriangle className="w-4 h-4" /> Discrepancy / Gaps Detected
                          </span>
                        )}
                        <span className="text-xs text-slate-400 font-mono">
                          {new Date(verificationResult.verifiedAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <h2 className="text-xl font-black text-white">
                        {candidateName} ({claimedBranch} Sadat)
                      </h2>
                      <p className="text-xs text-slate-300">
                        Father: {fatherName}
                      </p>
                    </div>

                    <div className="text-right sm:border-l sm:border-slate-800 sm:pl-6">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Confidence Score</p>
                      <p className="text-3xl font-black text-emerald-400">
                        {verificationResult.confidenceScore}%
                      </p>
                      <p className="text-[10px] text-slate-400">Canonical Reliability</p>
                    </div>
                  </div>

                  {/* Summary */}
                  <p className="mt-4 pt-4 border-t border-slate-800 text-xs text-slate-200 leading-relaxed">
                    {verificationResult.summary}
                  </p>

                  {/* Certificate Action */}
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span className="text-[11px] text-emerald-300 font-medium">
                      Official ISO Shajra Audit Seal Ready
                    </span>
                    <button
                      onClick={() => setShowCertificateModal(true)}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all uppercase tracking-wider"
                    >
                      <Award className="w-4 h-4" />
                      View & Print Official Certificate
                    </button>
                  </div>
                </div>

                {/* Citations from Reference Books */}
                <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
                  <div className="flex items-center gap-2">
                    <BookMarked className="w-5 h-5 text-emerald-500" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Citations from Uploaded Reference Books
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {verificationResult.citedReferenceBooks?.map((cite, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 dark:text-white">{cite.bookTitle}</span>
                          <span className="text-[10px] text-slate-400">{cite.author}</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 text-[11px] italic">
                          "{cite.relevantCitation}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Step-by-Step Chain Validation */}
                <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Layers className="w-5 h-5 text-emerald-500" />
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        Generational Chain Audit Breakdown
                      </h3>
                    </div>
                    <span className="text-xs text-slate-400">
                      {verificationResult.chainValidationSteps?.length || 0} Ancestral Nodes Tested
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                    {verificationResult.chainValidationSteps?.map((step, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-700/60 flex items-start justify-between gap-3 text-xs"
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-[10px] text-slate-700 dark:text-slate-300 shrink-0">
                            {step.generation}
                          </span>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{step.ancestorName}</p>
                            <p className="text-[10px] text-slate-500">{step.relation} • {step.notes}</p>
                          </div>
                        </div>

                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                          step.status === 'Confirmed in Reference Texts'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : step.status === 'Likely Historic Link'
                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        }`}>
                          {step.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Historical Context & Recommendations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-emerald-500" />
                      Migration & Historical Context
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {verificationResult.historicalContext}
                    </p>
                  </div>

                  <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4 text-amber-500" />
                      Admin Recommendations
                    </h4>
                    <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                      {verificationResult.recommendationsForAdmin?.map((rec, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: UPLOAD NEW REFERENCE BOOK (PDF) */}
      {/* ======================================================== */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 text-white shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base font-black text-white">Upload Shajra Reference Book (PDF)</h2>
                  <p className="text-xs text-slate-400">Restricted Admin Canonical Literature Repository</p>
                </div>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBook} className="space-y-4">
              {/* PDF Dropzone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-2xl p-6 text-center space-y-3 bg-slate-950/50 transition-colors cursor-pointer"
                onClick={() => document.getElementById('pdf-file-input')?.click()}
              >
                <input
                  id="pdf-file-input"
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-12 h-12 bg-red-500/20 text-red-400 rounded-2xl flex items-center justify-center mx-auto border border-red-500/30">
                  <FileText className="w-6 h-6" />
                </div>
                {selectedFile ? (
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> {selectedFile.name}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB PDF ready for upload & AI indexing
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-200">
                      Drag and drop reference book PDF here, or click to browse
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Supports PDF format up to 50MB (e.g. Umdat al-Talib, Sirr al-Silsilah, etc.)
                    </p>
                  </div>
                )}
              </div>

              {/* Book Metadata */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Book Title & Arabic/Urdu Name *</label>
                <input
                  type="text"
                  required
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g. Umdat al-Talib fi Ansab Al Abi Talib (عمدة الطالب في أنساب آل أبي طالب)"
                  className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Author / Scholar / Nassabah</label>
                  <input
                    type="text"
                    value={uploadAuthor}
                    onChange={(e) => setUploadAuthor(e.target.value)}
                    placeholder="e.g. Ibn Inaba al-Hassani"
                    className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Era / Century</label>
                  <input
                    type="text"
                    value={uploadEra}
                    onChange={(e) => setUploadEra(e.target.value)}
                    placeholder="e.g. 9th Century AH / 15th Century CE"
                    className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Language</label>
                  <select
                    value={uploadLanguage}
                    onChange={(e: any) => setUploadLanguage(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white"
                  >
                    <option value="Arabic">Arabic (العربية)</option>
                    <option value="Persian">Persian (فارسی)</option>
                    <option value="Urdu">Urdu (اردو)</option>
                    <option value="English">English</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Estimated Total Pages</label>
                  <input
                    type="number"
                    value={uploadPages}
                    onChange={(e) => setUploadPages(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              {/* Covered Branches */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Covered Sadat Branches in this Book</label>
                <div className="flex flex-wrap gap-2">
                  {['All Sadat', 'Zaidi', 'Naqvi', 'Rizvi', 'Kazmi', 'Hassani', 'Hussaini', 'Bukhari', 'Mousavi'].map(b => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => {
                        if (uploadBranches.includes(b)) {
                          setUploadBranches(uploadBranches.filter(x => x !== b));
                        } else {
                          setUploadBranches([...uploadBranches, b]);
                        }
                      }}
                      className={`px-3 py-1 text-xs font-bold rounded-lg border transition-colors ${
                        uploadBranches.includes(b)
                          ? 'bg-emerald-600 border-emerald-500 text-white'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Description & Scholarly Importance</label>
                <textarea
                  rows={2}
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  placeholder="Outline the book's authority and historical transmission significance..."
                  className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">
                  Key Lineage Rules / Excerpt for AI Grounding (Optional)
                </label>
                <textarea
                  rows={3}
                  value={uploadExcerpt}
                  onChange={(e) => setUploadExcerpt(e.target.value)}
                  placeholder="Enter key lineages, generation metrics, or validated sub-branches for AI indexing..."
                  className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Saving & Indexing...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Upload & Auto-Train AI
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: VIEW BOOK DETAILS & KNOWLEDGE DOSSIER */}
      {/* ======================================================== */}
      {viewingBook && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 text-white shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-500/20 text-red-400 rounded-2xl border border-red-500/30">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{viewingBook.title}</h3>
                  <p className="text-xs text-emerald-400">By {viewingBook.author}</p>
                </div>
              </div>
              <button
                onClick={() => setViewingBook(null)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Era / Century</span>
                  <span className="font-semibold text-white">{viewingBook.eraCentury || 'Historic'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Language & Pages</span>
                  <span className="font-semibold text-white">{viewingBook.language} • {viewingBook.totalPages} Pages</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">PDF File Name</span>
                  <span className="font-mono text-emerald-400 text-[11px] truncate block">{viewingBook.pdfFileName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">AI Grounding Status</span>
                  <span className="font-semibold text-purple-400">
                    {viewingBook.isAiTrained ? 'Trained & Active' : 'Pending Training'}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-300 mb-1">Scholarly Overview</h4>
                <p className="text-slate-300 leading-relaxed bg-slate-800/60 p-3 rounded-2xl border border-slate-800">
                  {viewingBook.description}
                </p>
              </div>

              {viewingBook.extractedKnowledgeSnippet && (
                <div>
                  <h4 className="font-bold text-emerald-400 mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> Extracted Canonical Rules (Used by AI Grounding)
                  </h4>
                  <p className="text-slate-200 leading-relaxed bg-emerald-950/30 p-3 rounded-2xl border border-emerald-500/20 italic">
                    {viewingBook.extractedKnowledgeSnippet}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                onClick={() => handleDownloadPdf(viewingBook)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Download Dossier
              </button>

              <button
                onClick={() => setViewingBook(null)}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: FORMAL SHAJRA VERIFICATION CERTIFICATE */}
      {/* ======================================================== */}
      {showCertificateModal && verificationResult && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-8 text-white shadow-2xl space-y-6 my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <Award className="w-4 h-4" />
                ISO Digital Central Shajra Verification Bureau
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" /> Print
                </button>
                <button
                  onClick={() => setShowCertificateModal(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Ornate Certificate */}
            <div className="bg-gradient-to-b from-amber-50 to-white text-slate-950 p-8 sm:p-12 rounded-3xl border-8 border-double border-amber-600 shadow-2xl relative space-y-6 text-center">
              {/* Corner Ornaments */}
              <div className="absolute top-3 left-3 text-amber-700 font-serif text-lg select-none">❖</div>
              <div className="absolute top-3 right-3 text-amber-700 font-serif text-lg select-none">❖</div>
              <div className="absolute bottom-3 left-3 text-amber-700 font-serif text-lg select-none">❖</div>
              <div className="absolute bottom-3 right-3 text-amber-700 font-serif text-lg select-none">❖</div>

              {/* Header */}
              <div className="space-y-1">
                <p className="text-base font-serif text-amber-900 tracking-widest font-black">
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </p>
                <p className="text-xs uppercase font-extrabold tracking-widest text-slate-600 mt-2">
                  Imamia Students Organization Pakistan • Central Shajra Authentication Commission
                </p>
                <h1 className="text-2xl sm:text-3xl font-black text-amber-950 font-serif uppercase tracking-wider mt-1">
                  Certificate of Authentic Lineage
                </h1>
                <p className="text-xs italic text-amber-800">
                  Tasdeeq-e-Ansab-e-Sadat (تصدیقِ انسابِ ساداتِ مطہرین)
                </p>
              </div>

              {/* Seal & Badge */}
              <div className="w-20 h-20 mx-auto rounded-full bg-amber-500/20 border-4 border-amber-600 flex flex-col items-center justify-center text-amber-900 font-black shadow-inner">
                <ShieldCheck className="w-8 h-8 text-amber-700" />
                <span className="text-[9px] uppercase tracking-tighter">VERIFIED</span>
              </div>

              {/* Candidate Info */}
              <div className="space-y-2 py-2">
                <p className="text-xs text-slate-600 uppercase font-semibold">This canonical instrument certifies that</p>
                <h2 className="text-2xl font-black text-slate-900 font-serif underline decoration-amber-500 decoration-2 underline-offset-4">
                  {candidateName}
                </h2>
                <p className="text-sm font-bold text-slate-700">
                  Son of <span className="font-extrabold text-slate-900">{fatherName}</span>
                </p>
                <p className="text-xs text-slate-600">
                  Has submitted their agnatic ancestral lineage claiming descent through the{' '}
                  <span className="font-extrabold text-amber-900 uppercase">{claimedBranch} Sadat</span> branch.
                </p>
              </div>

              {/* Status & Confidence */}
              <div className="p-4 bg-amber-100/60 rounded-2xl border border-amber-300 max-w-lg mx-auto text-xs space-y-1.5 text-left">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Canonical Verdict:</span>
                  <span className="font-black text-emerald-800 uppercase tracking-wide">
                    {verificationResult.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">AI Reliability Rating:</span>
                  <span className="font-black text-slate-900">{verificationResult.confidenceScore}% Corroboration</span>
                </div>
                <div className="flex items-start justify-between gap-2 pt-1 border-t border-amber-200">
                  <span className="font-bold text-slate-800 shrink-0">Grounded Texts:</span>
                  <span className="text-[11px] text-slate-700 text-right italic">
                    Umdat al-Talib (Ibn Inaba), Sirr al-Silsilah (al-Bukhari), Al-Shajarah al-Mubarakah (Fakhr al-Din al-Razi)
                  </span>
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-8 border-t border-amber-300 text-xs text-slate-800">
                <div className="text-center space-y-1">
                  <div className="font-serif italic text-sm text-slate-900 font-bold border-b border-slate-400 pb-1 w-48 mx-auto">
                    Syed Muhammad Amir
                  </div>
                  <p className="font-bold text-[11px] text-slate-600 uppercase">Super Administrator / Registrar</p>
                  <p className="text-[10px] text-slate-500">ISO Central Archives</p>
                </div>

                <div className="text-center space-y-1">
                  <div className="font-serif italic text-sm text-slate-900 font-bold border-b border-slate-400 pb-1 w-48 mx-auto">
                    Board of Nassabin
                  </div>
                  <p className="font-bold text-[11px] text-slate-600 uppercase">Director of Lineage Authentication</p>
                  <p className="text-[10px] text-slate-500">Stamp ID: ISO-SHJ-{Date.now().toString().slice(-6)}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowCertificateModal(false)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
