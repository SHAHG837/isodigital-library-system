import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Upload,
  Download,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  FolderOpen,
  FileText,
  Search,
  Plus,
  Users,
  Award,
  Layers,
  ArrowRight,
  LogOut
} from 'lucide-react';
import { Member, OfficeBearer } from '../types';
import {
  initAuth,
  googleSignIn,
  googleSignOut,
  getAccessToken
} from '../lib/googleAuth';
import {
  listGoogleSpreadsheets,
  createGoogleSpreadsheet,
  updateSheetValues,
  readSheetValues,
  formatMembersForGoogleSheets,
  formatOfficeBearersForGoogleSheets,
  parseSheetRowsToMembers,
  GoogleDriveFile
} from '../lib/googleSheetsService';
import { User } from 'firebase/auth';

interface GoogleSheetsModuleProps {
  members: Member[];
  setMembers?: React.Dispatch<React.SetStateAction<Member[]>>;
  officeBearers: OfficeBearer[];
  onLogActivity?: (action: string, details: string) => void;
  isSuperAdmin?: boolean;
}

export const GoogleSheetsModule: React.FC<GoogleSheetsModuleProps> = ({
  members,
  setMembers,
  officeBearers,
  onLogActivity,
  isSuperAdmin = false
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Drive sheets list
  const [driveSheets, setDriveSheets] = useState<GoogleDriveFile[]>([]);
  const [isLoadingSheets, setIsLoadingSheets] = useState<boolean>(false);

  // Status message
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string; link?: string } | null>(null);

  // Export state
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [customSheetTitle, setCustomSheetTitle] = useState<string>(
    `ISO Central Repository - ${new Date().toISOString().split('T')[0]}`
  );

  // Import / Read state
  const [sheetInputIdOrUrl, setSheetInputIdOrUrl] = useState<string>('');
  const [sheetRange, setSheetRange] = useState<string>('Sheet1!A1:Z500');
  const [previewRows, setPreviewRows] = useState<any[][] | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState<boolean>(false);
  const [isImportingRows, setIsImportingRows] = useState<boolean>(false);

  // Confirmation Modal State (MANDATORY for Mutating/Writing Operations)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    actionType: 'exportMembers' | 'exportCabinet' | 'importMembers';
    targetId?: string;
  } | null>(null);

  // Initialize Firebase Auth listener
  useEffect(() => {
    setIsLoadingAuth(true);
    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        setAccessTokenState(token);
        setIsLoadingAuth(false);
        if (token) {
          loadDriveSpreadsheets(token);
        }
      },
      () => {
        setCurrentUser(null);
        setAccessTokenState(null);
        setIsLoadingAuth(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  const handleGoogleLogin = async () => {
    setAuthError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setCurrentUser(result.user);
        setAccessTokenState(result.accessToken);
        setStatusMessage({
          type: 'success',
          text: `Google Account Connected: ${result.user.email}`
        });
        loadDriveSpreadsheets(result.accessToken);
        if (onLogActivity) {
          onLogActivity('Google Account Connected', `Connected account: ${result.user.email}`);
        }
      }
    } catch (err: any) {
      console.error(err);
      setAuthError(err?.message || 'Google authentication failed.');
    }
  };

  const handleGoogleLogout = async () => {
    try {
      await googleSignOut();
      setCurrentUser(null);
      setAccessTokenState(null);
      setDriveSheets([]);
      setPreviewRows(null);
      setStatusMessage({
        type: 'info',
        text: 'Signed out of Google Workspace account.'
      });
    } catch (err: any) {
      console.error(err);
    }
  };

  const loadDriveSpreadsheets = async (token?: string) => {
    const tokenToUse = token || accessToken || getAccessToken();
    if (!tokenToUse) return;

    setIsLoadingSheets(true);
    try {
      const files = await listGoogleSpreadsheets(tokenToUse);
      setDriveSheets(files);
    } catch (err: any) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        text: `Unable to fetch spreadsheets: ${err.message}`
      });
    } finally {
      setIsLoadingSheets(false);
    }
  };

  const extractSpreadsheetId = (input: string): string => {
    const trimmed = input.trim();
    if (trimmed.includes('docs.google.com/spreadsheets/d/')) {
      const match = trimmed.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (match && match[1]) return match[1];
    }
    return trimmed;
  };

  // Perform Export to New Google Sheet
  const executeExportMembers = async () => {
    const token = accessToken || getAccessToken();
    if (!token) {
      setStatusMessage({ type: 'error', text: 'Please sign in with Google first.' });
      return;
    }

    setIsExporting(true);
    setStatusMessage(null);

    try {
      const title = customSheetTitle.trim() || `ISO Members Directory - ${new Date().toLocaleDateString()}`;
      const newSheet = await createGoogleSpreadsheet(
        title,
        ['Members Directory', 'Office Bearers'],
        token
      );

      const memberRows = formatMembersForGoogleSheets(members);
      await updateSheetValues(newSheet.spreadsheetId, 'Members Directory!A1', memberRows, token);

      if (officeBearers.length > 0) {
        const obRows = formatOfficeBearersForGoogleSheets(officeBearers);
        await updateSheetValues(newSheet.spreadsheetId, 'Office Bearers!A1', obRows, token);
      }

      const sheetUrl = newSheet.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${newSheet.spreadsheetId}/edit`;

      setStatusMessage({
        type: 'success',
        text: `Successfully exported ${members.length} members and ${officeBearers.length} office bearers to Google Sheets!`,
        link: sheetUrl
      });

      if (onLogActivity) {
        onLogActivity('Google Sheets Export', `Created spreadsheet "${title}" with ${members.length} members`);
      }

      loadDriveSpreadsheets(token);
    } catch (err: any) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        text: `Export failed: ${err.message}`
      });
    } finally {
      setIsExporting(false);
      setConfirmModal(null);
    }
  };

  // Preview rows from Google Sheet
  const handlePreviewSheet = async () => {
    const token = accessToken || getAccessToken();
    if (!token) {
      setStatusMessage({ type: 'error', text: 'Please sign in with Google first.' });
      return;
    }

    const sheetId = extractSpreadsheetId(sheetInputIdOrUrl);
    if (!sheetId) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid Google Sheet ID or URL.' });
      return;
    }

    setIsLoadingPreview(true);
    setStatusMessage(null);
    try {
      const rows = await readSheetValues(sheetId, sheetRange.trim() || 'Sheet1!A1:Z500', token);
      setPreviewRows(rows);
      if (rows.length === 0) {
        setStatusMessage({ type: 'info', text: 'Range returned 0 rows. Please verify tab name.' });
      } else {
        setStatusMessage({
          type: 'success',
          text: `Loaded ${rows.length} rows from Google Sheet.`
        });
      }
    } catch (err: any) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        text: `Could not load sheet: ${err.message}`
      });
    } finally {
      setIsLoadingPreview(false);
    }
  };

  // Execute Import of previewed rows into Members
  const executeImportMembers = () => {
    if (!previewRows || previewRows.length < 2) {
      setStatusMessage({ type: 'error', text: 'No rows available to import.' });
      return;
    }

    setIsImportingRows(true);
    try {
      const parsedMembers = parseSheetRowsToMembers(previewRows);
      if (parsedMembers.length === 0) {
        setStatusMessage({
          type: 'error',
          text: 'No valid member rows found. Check column headers (Name, Mobile, City).'
        });
        return;
      }

      if (setMembers) {
        const newMembersList: Member[] = parsedMembers.map((item, idx) => ({
          ...item,
          id: `ISO-MEM-${new Date().getFullYear()}-${String(members.length + idx + 1).padStart(3, '0')}`
        }));

        setMembers((prev) => [...newMembersList, ...prev]);

        setStatusMessage({
          type: 'success',
          text: `Successfully imported ${newMembersList.length} members from Google Sheets into the Central Repository!`
        });

        if (onLogActivity) {
          onLogActivity(
            'Google Sheets Member Import',
            `Imported ${newMembersList.length} new members from Google Sheet`
          );
        }
      }
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: `Import failed: ${err.message}` });
    } finally {
      setIsImportingRows(false);
      setConfirmModal(null);
      setPreviewRows(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950/90 via-slate-900 to-teal-950/90 border border-emerald-500/40 p-6 text-white shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-2xl shrink-0 shadow-lg">
              <FileSpreadsheet className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-3 py-0.5 text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/40">
                  Google Workspace Connected
                </span>
                <span className="text-xs text-emerald-200/90 font-mono">Google Sheets API v4</span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-white">
                Google Sheets & Drive Integration
              </h1>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                Seamlessly synchronize ISO Central Repository member records, cabinet designations, and registration responses directly with your Google Sheets and Google Drive with permission from the app's users.
              </p>
            </div>
          </div>

          {/* Account Status / Login */}
          <div className="shrink-0">
            {currentUser ? (
              <div className="flex items-center gap-3 bg-slate-800/90 border border-slate-700 px-4 py-2.5 rounded-2xl shadow-xl">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'Google User'}
                    className="w-9 h-9 rounded-full ring-2 ring-emerald-500 object-cover"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-emerald-700 flex items-center justify-center text-white font-bold text-xs">
                    {(currentUser.displayName || currentUser.email || 'G')[0]}
                  </div>
                )}
                <div className="text-left">
                  <p className="text-xs font-bold text-white truncate max-w-[160px]">
                    {currentUser.displayName || 'Connected User'}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate max-w-[160px]">
                    {currentUser.email}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleGoogleLogout}
                  className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700/60 rounded-xl transition-colors ml-1"
                  title="Disconnect Google Account"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* Official Google Sign-in Button Style */
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="flex items-center gap-3 px-5 py-3 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-2xl shadow-xl transition-all border border-slate-200 transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <svg className="w-5 h-5" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                <span>Sign in with Google</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notifications / Alerts */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center justify-between gap-3 border shadow-lg ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-200'
              : statusMessage.type === 'error'
              ? 'bg-red-950/70 border-red-500/40 text-red-200'
              : 'bg-blue-950/70 border-blue-500/40 text-blue-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : statusMessage.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-blue-400 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>

          {statusMessage.link && (
            <a
              href={statusMessage.link}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl flex items-center gap-1.5 transition-colors shrink-0"
            >
              <span>Open in Google Sheets</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      )}

      {authError && (
        <div className="p-4 bg-red-950/80 border border-red-500/40 text-red-200 text-xs rounded-2xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{authError}</span>
        </div>
      )}

      {/* Google Forms Link Banner */}
      <div className="p-5 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
              Linked Google Forms Registration
            </span>
            <h3 className="text-sm font-bold text-white">
              Official ISO Membership Registration Google Form
            </h3>
            <p className="text-xs text-amber-200/80 mt-0.5">
              Forms submissions populate directly into your Google Sheets. Open form link or sync response sheet below:
            </p>
            <p className="text-[11px] font-mono text-amber-300 underline mt-0.5">
              https://docs.google.com/forms/d/1eVTnVJ-nqdm6pi-hvyczit_E-xzb75NLuNJZAbFtb3s/edit
            </p>
          </div>
        </div>

        <a
          href="https://docs.google.com/forms/d/1eVTnVJ-nqdm6pi-hvyczit_E-xzb75NLuNJZAbFtb3s/edit"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 transition-colors shrink-0"
        >
          <span>Open Google Form</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* Main Feature Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 1. EXPORT TO GOOGLE SHEETS */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-2xl">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Export to Google Sheets</h2>
                <p className="text-xs text-slate-400">
                  Export repository records to your Google Drive
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 text-[10px] font-bold bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30">
              {members.length} Members
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-bold mb-1">
                Spreadsheet Title
              </label>
              <input
                type="text"
                value={customSheetTitle}
                onChange={(e) => setCustomSheetTitle(e.target.value)}
                placeholder="Enter spreadsheet title..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="p-3.5 bg-slate-800/40 rounded-2xl border border-slate-700/60 space-y-2">
              <span className="font-bold text-slate-200">Included Tabs in Export:</span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>1. Members Directory ({members.length} records)</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>2. Office Bearers ({officeBearers.length} records)</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled={isExporting || !currentUser}
              onClick={() =>
                setConfirmModal({
                  isOpen: true,
                  title: 'Create & Export to Google Sheets',
                  description: `This will create a new Google Spreadsheet titled "${customSheetTitle}" in your Google Drive and write ${members.length} member records and ${officeBearers.length} cabinet records with permission from your Google account. Do you wish to proceed?`,
                  actionType: 'exportMembers'
                })
              }
              className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                currentUser
                  ? 'bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white shadow-lg shadow-indigo-600/30 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              {isExporting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Generating Google Spreadsheet...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>
                    {currentUser ? 'Export All to New Google Sheet' : 'Sign in with Google to Export'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 2. IMPORT & SYNC FROM GOOGLE SHEETS */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-2xl">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Import / Sync from Google Sheets</h2>
                <p className="text-xs text-slate-400">
                  Read spreadsheet rows and import into Central Repository
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">
              Live Read
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-bold mb-1">
                Google Sheet URL or Spreadsheet ID <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={sheetInputIdOrUrl}
                onChange={(e) => setSheetInputIdOrUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/... or Sheet ID"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">
                Sheet Tab Name & Range
              </label>
              <input
                type="text"
                value={sheetRange}
                onChange={(e) => setSheetRange(e.target.value)}
                placeholder="e.g. Members Directory!A1:Z or Form Responses 1!A1:Z"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={isLoadingPreview || !currentUser}
                onClick={handlePreviewSheet}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 border border-slate-700 transition-colors"
              >
                {isLoadingPreview ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                ) : (
                  <Search className="w-4 h-4 text-emerald-400" />
                )}
                <span>Read & Preview Rows</span>
              </button>

              {previewRows && previewRows.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setConfirmModal({
                      isOpen: true,
                      title: 'Import Members into Central Repository',
                      description: `This will parse and import ${previewRows.length - 1} data rows from the Google Sheet into the central ISO members repository. Do you want to proceed?`,
                      actionType: 'importMembers'
                    })
                  }
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Import {previewRows.length - 1} Records</span>
                </button>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Preview Table of Read Rows */}
      {previewRows && previewRows.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                Google Sheet Live Data Preview ({previewRows.length} total rows)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                First row is detected as column headers
              </p>
            </div>
            <button
              onClick={() => setPreviewRows(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Close Preview
            </button>
          </div>

          <div className="overflow-x-auto max-h-72 border border-slate-800 rounded-2xl scrollbar-none">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-200 sticky top-0 font-bold">
                <tr>
                  {previewRows[0].map((col: any, idx: number) => (
                    <th key={idx} className="p-3 border-b border-slate-700 whitespace-nowrap">
                      {String(col || `Col ${idx + 1}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {previewRows.slice(1, 15).map((row: any[], rIdx: number) => (
                  <tr key={rIdx} className="hover:bg-slate-800/40 transition-colors">
                    {previewRows[0].map((_: any, cIdx: number) => (
                      <td key={cIdx} className="p-3 whitespace-nowrap">
                        {String(row[cIdx] || '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. USER'S GOOGLE DRIVE SPREADSHEETS BROWSER */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-2xl">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Your Google Drive Spreadsheets</h2>
              <p className="text-xs text-slate-400">
                Direct access to spreadsheets in your Google Drive
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={!currentUser || isLoadingSheets}
            onClick={() => loadDriveSpreadsheets()}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 border border-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSheets ? 'animate-spin text-blue-400' : ''}`} />
            <span>Refresh Drive Files</span>
          </button>
        </div>

        {currentUser ? (
          driveSheets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {driveSheets.map((file) => (
                <div
                  key={file.id}
                  className="p-4 bg-slate-800/40 hover:bg-slate-800/70 border border-slate-700/60 rounded-2xl transition-all space-y-2 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
                        <h4 className="text-xs font-bold text-white truncate max-w-[200px]" title={file.name}>
                          {file.name}
                        </h4>
                      </div>
                    </div>
                    {file.modifiedTime && (
                      <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Modified: {new Date(file.modifiedTime).toLocaleDateString()}</span>
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-700/40 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSheetInputIdOrUrl(file.id);
                        setSheetRange('Sheet1!A1:Z500');
                        handlePreviewSheet();
                      }}
                      className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 underline"
                    >
                      Select & Preview
                    </button>

                    <a
                      href={file.webViewLink || `https://docs.google.com/spreadsheets/d/${file.id}/edit`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-slate-700/60 hover:bg-slate-600 text-white text-[10px] font-bold rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <span>Open Sheet</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400 bg-slate-800/20 rounded-2xl border border-dashed border-slate-800">
              {isLoadingSheets ? (
                <div className="flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                  <span>Loading files from your Google Drive...</span>
                </div>
              ) : (
                <p>No spreadsheets found in your Google Drive or access not yet granted.</p>
              )}
            </div>
          )
        ) : (
          <div className="p-8 text-center text-xs text-slate-400 bg-slate-800/20 rounded-2xl border border-dashed border-slate-800 space-y-3">
            <p>Connect your Google Account above to browse and manage spreadsheets directly.</p>
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs inline-flex items-center gap-2 transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Connect Google Drive</span>
            </button>
          </div>
        )}
      </div>

      {/* USER CONFIRMATION MODAL FOR DESTRUCTIVE / MUTATING OPERATIONS (MANDATORY) */}
      {confirmModal && confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-emerald-500/60 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-xl shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">
                  User Confirmation Required
                </span>
                <h3 className="text-base font-bold text-white mt-1">
                  {confirmModal.title}
                </h3>
              </div>
            </div>

            <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl text-xs text-slate-300 leading-relaxed">
              {confirmModal.description}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => {
                  if (confirmModal.actionType === 'exportMembers') {
                    executeExportMembers();
                  } else if (confirmModal.actionType === 'importMembers') {
                    executeImportMembers();
                  }
                }}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Proceed</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
