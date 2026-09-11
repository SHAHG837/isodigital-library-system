import React, { useState } from 'react';
import { Member, OfficeBearer } from '../types';
import {
  FileDown,
  FileUp,
  FileSpreadsheet,
  FileCode,
  FileText,
  Presentation,
  CheckCircle2,
  Database
} from 'lucide-react';
import {
  exportToExcel,
  exportToCSV,
  exportToJSON,
  exportToWord,
  exportToPowerPoint,
  exportToPDFReport
} from '../utils/exportImport';

interface ExportImportModuleProps {
  members: Member[];
  officeBearers: OfficeBearer[];
  onImportMembers: (importedMembers: Member[]) => void;
  onOpenGoogleSheets?: () => void;
}

export const ExportImportModule: React.FC<ExportImportModuleProps> = ({
  members,
  officeBearers,
  onImportMembers,
  onOpenGoogleSheets
}) => {
  const [targetDataset, setTargetDataset] = useState<'Members' | 'OfficeBearers'>('Members');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const activeRecords = targetDataset === 'Members' ? members : officeBearers;

  const handleJSONImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed)) {
            onImportMembers(parsed);
            setStatusMessage(`Successfully imported ${parsed.length} records into Members directory!`);
          } else {
            alert('Invalid JSON file format. Must contain an array of member objects.');
          }
        } catch (err) {
          alert('Failed to parse JSON file.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-2xl">
            <FileDown className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Central Export & Data Import Hub</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Export complete ISO organizational archives to Word, PDF, Excel, PowerPoint, CSV, JSON, and Google Sheets.
            </p>
          </div>
        </div>

        {onOpenGoogleSheets && (
          <button
            type="button"
            onClick={onOpenGoogleSheets}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all shrink-0"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Open Google Sheets & Drive Sync</span>
          </button>
        )}
      </div>

      {/* Target Dataset Selection */}
      <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Select Dataset:</span>
        <button
          onClick={() => setTargetDataset('Members')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            targetDataset === 'Members'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
          }`}
        >
          Members Directory ({members.length})
        </button>
        <button
          onClick={() => setTargetDataset('OfficeBearers')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            targetDataset === 'OfficeBearers'
              ? 'bg-amber-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
          }`}
        >
          Office Bearers Cabinet ({officeBearers.length})
        </button>
      </div>

      {statusMessage && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {statusMessage}
        </div>
      )}

      {/* Export Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Excel Export */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Excel Spreadsheet (.xlsx)</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Structured multi-column workbook formatted for data analysis and filtering.
            </p>
          </div>
          <button
            onClick={() => exportToExcel(activeRecords, `ISO_${targetDataset}_Archive.xlsx`)}
            className="mt-6 w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
          >
            Export XLSX Workbook
          </button>
        </div>

        {/* Word Document Export */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Microsoft Word (.docx)</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Formatted official document report with ISO header, metadata, and record tables.
            </p>
          </div>
          <button
            onClick={() => exportToWord(activeRecords, `ISO ${targetDataset} Official Report`)}
            className="mt-6 w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
          >
            Export DOCX Document
          </button>
        </div>

        {/* PDF Report Export */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mb-3">
              <FileDown className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">PDF Official Report (.pdf)</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              High-resolution printable PDF report with letterhead and security metadata.
            </p>
          </div>
          <button
            onClick={() => exportToPDFReport(activeRecords, `ISO_${targetDataset}_Official_Directory`)}
            className="mt-6 w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
          >
            Generate PDF Document
          </button>
        </div>

        {/* PowerPoint Presentation */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
              <Presentation className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">PowerPoint Slide Deck (.pptx)</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Executive presentation deck detailing organizational statistics and record profiles.
            </p>
          </div>
          <button
            onClick={() => exportToPowerPoint(activeRecords, `ISO ${targetDataset} Executive Presentation`)}
            className="mt-6 w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
          >
            Export PPTX Deck
          </button>
        </div>

        {/* CSV Format */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Comma Separated CSV (.csv)</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Lightweight standard CSV dataset compatible with all database tools and spreadsheets.
            </p>
          </div>
          <button
            onClick={() => exportToCSV(activeRecords, `ISO_${targetDataset}.csv`)}
            className="mt-6 w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
          >
            Export CSV File
          </button>
        </div>

        {/* JSON Raw Archive */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-3">
              <FileCode className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">JSON Database Dump (.json)</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Complete raw JSON database backup file ready for restoration or cloud sync.
            </p>
          </div>
          <button
            onClick={() => exportToJSON(activeRecords, `ISO_${targetDataset}_Full_Backup.json`)}
            className="mt-6 w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
          >
            Export JSON Dump
          </button>
        </div>

      </div>

      {/* Import Section */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
          <FileUp className="w-5 h-5 text-emerald-600" /> Data Import Panel
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Restore records or import member lists from a valid JSON dataset backup.
        </p>

        <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-700">
          <input
            type="file"
            accept=".json"
            onChange={handleJSONImport}
            className="text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
          />
          <span className="text-[11px] text-slate-400">Accepts ISO standard .json export files.</span>
        </div>
      </div>
    </div>
  );
};
