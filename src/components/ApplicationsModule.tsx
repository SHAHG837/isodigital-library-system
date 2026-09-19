import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Building2,
  Calendar,
  Eye,
  ExternalLink,
  MessageSquare,
  RefreshCw,
  Search,
  Filter,
  UserCheck,
  Award,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Application, ApplicationStatus, Profile } from '../types';
import {
  getUserApplications,
  getAllApplications,
  updateApplicationStatus,
  SUPABASE_PROJECT_ID
} from '../lib/supabaseClient';

interface ApplicationsModuleProps {
  currentProfile?: Profile | null;
  onExploreOpportunities?: () => void;
}

export const ApplicationsModule: React.FC<ApplicationsModuleProps> = ({
  currentProfile,
  onExploreOpportunities
}) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  // Status update state for admin / reviewer mode
  const [feedbackNote, setFeedbackNote] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const userId = currentProfile?.id || 'guest-user-001';
  const isAdmin = currentProfile?.role === 'admin' || currentProfile?.role === 'recruiter';

  const fetchApps = async () => {
    setLoading(true);
    try {
      if (isAdmin) {
        const all = await getAllApplications();
        setApplications(all);
      } else {
        const userApps = await getUserApplications(userId);
        setApplications(userApps);
      }
    } catch (err) {
      console.error('Error loading applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, [userId, isAdmin]);

  const handleUpdateStatus = async (status: ApplicationStatus) => {
    if (!selectedApp) return;
    setUpdatingStatus(true);
    try {
      await updateApplicationStatus(selectedApp.id, status, feedbackNote);
      setApplications((prev) =>
        prev.map((a) => (a.id === selectedApp.id ? { ...a, status, feedback: feedbackNote } : a))
      );
      setSelectedApp((prev) => (prev ? { ...prev, status, feedback: feedbackNote } : null));
    } catch (e: any) {
      alert('Error updating status: ' + e.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'submitted':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Submitted
          </span>
        );
      case 'under_review':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Under Review
          </span>
        );
      case 'interviewing':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
            <UserCheck className="w-3 h-3" /> Interviewing
          </span>
        );
      case 'accepted':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Accepted
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-300 border border-red-500/30 flex items-center gap-1">
            <XCircle className="w-3 h-3" /> Not Selected
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300">
            {status}
          </span>
        );
    }
  };

  const filteredApplications = applications.filter((app) => {
    if (selectedStatus !== 'All' && app.status !== selectedStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const oppTitle = app.opportunity?.title?.toLowerCase() || '';
      const org = app.opportunity?.organization?.toLowerCase() || '';
      const applicant = app.applicant?.full_name?.toLowerCase() || '';
      return oppTitle.includes(q) || org.includes(q) || applicant.includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Supabase 'applications' Table
            </span>
            <span className="text-xs text-slate-400 font-mono">Project: {SUPABASE_PROJECT_ID}</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {isAdmin ? 'All Submitted Applications' : 'My Applications & Pipeline'}
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Track stage progress, review feedback, and view candidate submissions with Row Level Security.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchApps}
            disabled={loading}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
            title="Refresh applications"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
          {onExploreOpportunities && (
            <button
              onClick={onExploreOpportunities}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md"
            >
              Explore More Roles
            </button>
          )}
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search application by title, org, or applicant..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs w-full sm:w-auto">
          {['All', 'submitted', 'under_review', 'interviewing', 'accepted', 'rejected'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-xl font-medium capitalize transition-all ${
                selectedStatus === st
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
          <span className="text-sm">Loading applications from Supabase PostgreSQL...</span>
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400">
          <FileCheck2 className="w-10 h-10 mx-auto text-slate-600 mb-3" />
          <h3 className="text-base font-semibold text-slate-300">No applications found</h3>
          <p className="text-xs text-slate-500 mt-1">
            Browse active jobs or scholarships to submit your first application.
          </p>
          {onExploreOpportunities && (
            <button
              onClick={onExploreOpportunities}
              className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
            >
              Browse Open Opportunities
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredApplications.map((app) => (
            <div
              key={app.id}
              onClick={() => setSelectedApp(app)}
              className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer group transition-all"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" />
                    {app.opportunity?.organization || 'Organization'}
                  </span>
                  <span className="text-xs text-slate-500">•</span>
                  <span className="text-xs text-slate-400">
                    Applied {new Date(app.applied_at).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                  {app.opportunity?.title || 'Opportunity'}
                </h3>

                {app.applicant && (
                  <p className="text-xs text-slate-400">
                    Applicant: <span className="text-slate-200 font-medium">{app.applicant.full_name}</span> ({app.applicant.email})
                  </p>
                )}

                {app.cover_letter && (
                  <p className="text-xs text-slate-400 line-clamp-1 italic max-w-xl">
                    "{app.cover_letter}"
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {getStatusBadge(app.status)}
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail & Review Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Application Details</h3>
                <p className="text-xs text-slate-400">{selectedApp.opportunity?.title} • {selectedApp.opportunity?.organization}</p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs text-slate-300">
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div>
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">Current Pipeline Status</span>
                  <div className="mt-1">{getStatusBadge(selectedApp.status)}</div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">Submission Timestamp</span>
                  <div className="text-slate-200 font-mono mt-1">
                    {new Date(selectedApp.applied_at).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Resume link */}
              {selectedApp.resume_url && (
                <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-white">Submitted Resume Attachment</span>
                    <p className="text-slate-400 mt-0.5">Stored in Supabase Storage 'resumes' bucket</p>
                  </div>
                  <a
                    href={selectedApp.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                  >
                    <span>View Resume</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {/* Cover Letter */}
              {selectedApp.cover_letter && (
                <div>
                  <h4 className="font-bold text-white mb-1.5">Cover Letter / Candidate Statement</h4>
                  <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700 text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {selectedApp.cover_letter}
                  </div>
                </div>
              )}

              {/* Portfolio */}
              {selectedApp.portfolio_url && (
                <div>
                  <h4 className="font-bold text-white mb-1.5">Portfolio Link</h4>
                  <a
                    href={selectedApp.portfolio_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:underline flex items-center gap-1 font-mono"
                  >
                    {selectedApp.portfolio_url} <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {/* Feedback */}
              {selectedApp.feedback && (
                <div>
                  <h4 className="font-bold text-white mb-1.5">Recruiter / Reviewer Feedback</h4>
                  <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/30 text-indigo-200 leading-relaxed">
                    {selectedApp.feedback}
                  </div>
                </div>
              )}

              {/* Status Update Controls (for Admin / Reviewer) */}
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <h4 className="font-bold text-white">Update Pipeline Status (Supabase RLS Enforced)</h4>
                <div className="flex flex-wrap gap-2">
                  {(['submitted', 'under_review', 'interviewing', 'accepted', 'rejected'] as ApplicationStatus[]).map(
                    (st) => (
                      <button
                        key={st}
                        onClick={() => handleUpdateStatus(st)}
                        disabled={updatingStatus}
                        className={`px-3 py-1.5 rounded-xl font-semibold capitalize transition-all ${
                          selectedApp.status === st
                            ? 'bg-emerald-600 text-white ring-2 ring-emerald-400'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {st.replace('_', ' ')}
                      </button>
                    )
                  )}
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Feedback / Notes</label>
                  <input
                    type="text"
                    value={feedbackNote}
                    onChange={(e) => setFeedbackNote(e.target.value)}
                    placeholder="Add interviewer notes or constructive applicant feedback..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end">
              <button
                onClick={() => setSelectedApp(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
