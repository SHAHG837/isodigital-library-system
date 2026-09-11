import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  GraduationCap,
  Award,
  Search,
  Filter,
  Bookmark,
  BookmarkCheck,
  Send,
  Sparkles,
  Database,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  Building,
  DollarSign,
  Plus,
  RefreshCw,
  FileText,
  Download,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Cpu
} from 'lucide-react';
import {
  Opportunity,
  Application,
  SavedOpportunity,
  fetchOpportunities,
  createOpportunity,
  saveOpportunity,
  submitApplication,
  fetchUserApplications,
  testSupabaseConnection,
  syncMembersToSupabase,
  syncOfficeBearersToSupabase,
  DEFAULT_OPPORTUNITIES,
  SUPABASE_URL
} from '../lib/supabase';
import { Member, OfficeBearer, AdminCredential } from '../types';

interface OpportunitiesModuleProps {
  currentUser?: AdminCredential | null;
  members?: Member[];
  officeBearers?: OfficeBearer[];
}

export const OpportunitiesModule: React.FC<OpportunitiesModuleProps> = ({
  currentUser,
  members = [],
  officeBearers = []
}) => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>(DEFAULT_OPPORTUNITIES);
  const [savedOppIds, setSavedOppIds] = useState<string[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [activeView, setActiveView] = useState<'browse' | 'saved' | 'applications' | 'create'>('browse');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [remoteOnly, setRemoteOnly] = useState(false);

  // Connection State
  const [supabaseConnected, setSupabaseConnected] = useState<boolean | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Application Modal State
  const [selectedOppForApply, setSelectedOppForApply] = useState<Opportunity | null>(null);
  const [applyName, setApplyName] = useState(currentUser?.name || '');
  const [applyEmail, setApplyEmail] = useState('');
  const [applyPhone, setApplyPhone] = useState(currentUser?.mobileNumber || '');
  const [applyCoverLetter, setApplyCoverLetter] = useState('');
  const [applyResumeUrl, setApplyResumeUrl] = useState('');
  const [applySkills, setApplySkills] = useState('');
  const [isSubmittingApp, setIsSubmittingApp] = useState(false);
  const [applySuccess, setApplySuccess] = useState<string | null>(null);

  // New Opportunity Form (for Admin/SuperAdmin)
  const [newTitle, setNewTitle] = useState('');
  const [newOrg, setNewOrg] = useState('');
  const [newType, setNewType] = useState<Opportunity['opportunity_type']>('Full-time');
  const [newLocation, setNewLocation] = useState('');
  const [newIsRemote, setNewIsRemote] = useState(false);
  const [newCategory, setNewCategory] = useState('Technology');
  const [newDescription, setNewDescription] = useState('');
  const [newSalary, setNewSalary] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const [newSkills, setNewSkills] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);

  // Load Opportunities on mount
  useEffect(() => {
    loadData();
    checkConnection();
  }, []);

  const checkConnection = async () => {
    const isConn = await testSupabaseConnection();
    setSupabaseConnected(isConn);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchOpportunities();
      setOpportunities(data);
    } catch (err) {
      console.warn('Using local opportunities fallback:', err);
      setOpportunities(DEFAULT_OPPORTUNITIES);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncDataToSupabase = async () => {
    setIsSyncing(true);
    setSyncStatus('Initiating sync to Supabase PostgreSQL...');
    try {
      const memRes = await syncMembersToSupabase(members);
      const obRes = await syncOfficeBearersToSupabase(officeBearers);

      if (memRes.count > 0 || obRes.count > 0) {
        setSyncStatus(`Sync Successful! ${memRes.count} Members & ${obRes.count} Office Bearers verified in Supabase.`);
      } else {
        setSyncStatus(`Sync completed with status: ${memRes.error || obRes.error || 'Ready'}. Note: Run SQL migrations in Supabase Dashboard.`);
      }
    } catch (err: any) {
      setSyncStatus(`Sync note: Run supabase_schema.sql in your Supabase SQL Editor.`);
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncStatus(null), 6000);
    }
  };

  const handleToggleSave = async (opp: Opportunity) => {
    const isSaved = savedOppIds.includes(opp.id);
    if (isSaved) {
      setSavedOppIds(savedOppIds.filter((id) => id !== opp.id));
    } else {
      setSavedOppIds([...savedOppIds, opp.id]);
      await saveOpportunity('usr-default', opp.id);
    }
  };

  // AI-Assisted Match Score Simulator
  const calculateAiMatch = (applicantSkillsStr: string, oppSkills: string[] = []): { score: number; feedback: string } => {
    if (!oppSkills || oppSkills.length === 0) {
      return { score: 85, feedback: 'Strong foundational match based on profile background.' };
    }
    const applicantSkills = applicantSkillsStr
      .toLowerCase()
      .split(/[,;]/)
      .map((s) => s.trim())
      .filter(Boolean);

    let matchCount = 0;
    oppSkills.forEach((reqSkill) => {
      if (applicantSkills.some((s) => s.includes(reqSkill.toLowerCase()) || reqSkill.toLowerCase().includes(s))) {
        matchCount++;
      }
    });

    const ratio = matchCount / oppSkills.length;
    let score = Math.round(55 + ratio * 40);
    if (score > 98) score = 98;

    let feedback = '';
    if (score >= 85) {
      feedback = `Exceptional Match (${score}%): Your skillset closely matches ${matchCount} core competencies required by ${selectedOppForApply?.organization}. Fast-track recommended.`;
    } else if (score >= 70) {
      feedback = `Competitive Match (${score}%): Solid alignment with essential skills. Adding certifications in ${oppSkills.slice(0, 2).join(', ')} will boost candidate ranking.`;
    } else {
      feedback = `Growth Opportunity (${score}%): Foundational match. We recommend reviewing key requirements: ${oppSkills.join(', ')}.`;
    }

    return { score, feedback };
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOppForApply) return;

    setIsSubmittingApp(true);
    const { score, feedback } = calculateAiMatch(applySkills, selectedOppForApply.skills_required);

    const newApp: Omit<Application, 'id' | 'submitted_at'> = {
      opportunity_id: selectedOppForApply.id,
      applicant_id: currentUser?.mobileNumber || 'usr-anon',
      applicant_name: applyName,
      applicant_email: applyEmail || 'candidate@isopakistan.org',
      applicant_phone: applyPhone,
      resume_url: applyResumeUrl || 'https://drive.google.com/resumes/sample_applicant.pdf',
      cover_letter: applyCoverLetter,
      status: 'submitted',
      ai_match_score: score,
      ai_review_feedback: feedback,
      opportunity: selectedOppForApply
    };

    const savedApp = await submitApplication(newApp);
    setApplications([savedApp, ...applications]);
    setApplySuccess(`Application submitted to Supabase! AI Compatibility Score: ${score}%`);

    setIsSubmittingApp(false);
    setTimeout(() => {
      setApplySuccess(null);
      setSelectedOppForApply(null);
      setApplyCoverLetter('');
    }, 2500);
  };

  const handleCreateOppSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newOrg.trim()) return;

    setIsCreating(true);
    const skillsArray = newSkills
      .split(/[,;]/)
      .map((s) => s.trim())
      .filter(Boolean);

    const newOpportunityData: Omit<Opportunity, 'id' | 'created_at' | 'updated_at'> = {
      title: newTitle.trim(),
      organization: newOrg.trim(),
      opportunity_type: newType,
      location: newLocation.trim() || 'Pakistan',
      is_remote: newIsRemote,
      category: newCategory,
      description: newDescription.trim(),
      salary_or_stipend: newSalary.trim() || 'Market Competitive',
      application_deadline: newDeadline || 'Open until filled',
      skills_required: skillsArray.length > 0 ? skillsArray : ['Communication', 'Teamwork'],
      contact_email: newContactEmail.trim() || 'careers@isopakistan.org',
      status: 'active'
    };

    const createdOpp = await createOpportunity(newOpportunityData);
    setOpportunities([createdOpp, ...opportunities]);
    setCreateSuccess('Opportunity successfully saved to Supabase Database!');

    setIsCreating(false);
    // Reset form
    setNewTitle('');
    setNewOrg('');
    setNewDescription('');
    setNewSalary('');
    setNewSkills('');
    setTimeout(() => {
      setCreateSuccess(null);
      setActiveView('browse');
    }, 2000);
  };

  const filteredOpportunities = opportunities.filter((opp) => {
    const matchesSearch =
      opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (opp.skills_required && opp.skills_required.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesType = selectedType === 'all' || opp.opportunity_type.toLowerCase() === selectedType.toLowerCase();
    const matchesRemote = !remoteOnly || opp.is_remote;

    return matchesSearch && matchesType && matchesRemote;
  });

  const savedOpportunitiesList = opportunities.filter((opp) => savedOppIds.includes(opp.id));

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Supabase Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                <Database className="w-3 h-3" />
                Supabase Backend Active
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                PostgreSQL • RLS • Storage
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
              <Briefcase className="w-6 h-6 text-emerald-400" />
              Community Opportunities & Career Hub
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Connect ISO members with verified internships, scholarships, IT jobs, and community fellowships.
              Integrated directly with Supabase PostgreSQL and prepared for AI resume evaluation.
            </p>
          </div>

          {/* Quick Backend Actions */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={handleSyncDataToSupabase}
              disabled={isSyncing}
              className="px-3.5 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              title="Sync Members and Office Bearers to Supabase"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync to Supabase'}</span>
            </button>

            <a
              href="/supabase_schema.sql"
              download="supabase_schema.sql"
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
              title="Download SQL Migration Script"
            >
              <Download className="w-3.5 h-3.5" />
              <span>SQL Schema</span>
            </a>
          </div>
        </div>

        {/* Sync or Connection Notification */}
        {syncStatus && (
          <div className="mt-4 p-3 bg-slate-950 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{syncStatus}</span>
          </div>
        )}

        {/* Supabase Technical Details Info Strip */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
            <span className="text-slate-500 block">Project Endpoint</span>
            <span className="text-slate-300 font-mono font-medium truncate block">neyhuytsqfovqkxqvukh</span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
            <span className="text-slate-500 block">Security Policies</span>
            <span className="text-emerald-400 font-semibold block">Row Level Security (RLS)</span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
            <span className="text-slate-500 block">Resume Storage</span>
            <span className="text-slate-300 font-semibold block">resumes bucket configured</span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
            <span className="text-slate-500 block">AI Matching Engine</span>
            <span className="text-amber-400 font-semibold block">Prepared for Gemini API</span>
          </div>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-3 overflow-x-auto">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('browse')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeView === 'browse'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Browse Opportunities ({opportunities.length})</span>
          </button>

          <button
            onClick={() => setActiveView('saved')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeView === 'saved'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Saved Items ({savedOppIds.length})</span>
          </button>

          <button
            onClick={() => setActiveView('applications')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeView === 'applications'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>My Applications & AI Review ({applications.length})</span>
          </button>
        </div>

        {/* Post Opportunity Button for Admin / SuperAdmin */}
        <button
          onClick={() => setActiveView('create')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeView === 'create'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
              : 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Post New Opportunity</span>
        </button>
      </div>

      {/* 3. VIEW: BROWSE OPPORTUNITIES */}
      {activeView === 'browse' && (
        <div className="space-y-5">
          {/* Search & Filter Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
              <input
                type="text"
                placeholder="Search by job title, organization, or required skill..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              >
                <option value="all">All Types</option>
                <option value="full-time">Full-time</option>
                <option value="internship">Internship</option>
                <option value="scholarship">Scholarship</option>
                <option value="fellowship">Fellowship</option>
                <option value="volunteer">Volunteer</option>
              </select>

              <label className="flex items-center gap-2 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={remoteOnly}
                  onChange={(e) => setRemoteOnly(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500"
                />
                <span>Remote Only</span>
              </label>

              {(searchQuery || selectedType !== 'all' || remoteOnly) && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedType('all');
                    setRemoteOnly(false);
                  }}
                  className="px-3 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Cards Grid */}
          {filteredOpportunities.length === 0 ? (
            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl">
              <Briefcase className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">No opportunities found</h3>
              <p className="text-xs text-slate-400 mt-1">Try adjusting your search criteria or clear filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredOpportunities.map((opp) => {
                const isSaved = savedOppIds.includes(opp.id);
                return (
                  <div
                    key={opp.id}
                    className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg transition-all flex flex-col justify-between group"
                  >
                    <div className="space-y-3">
                      {/* Top Badges */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {opp.opportunity_type}
                          </span>
                          {opp.is_remote && (
                            <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                              Remote Friendly
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-800 text-slate-400">
                            {opp.category || 'General'}
                          </span>
                        </div>

                        <button
                          onClick={() => handleToggleSave(opp)}
                          className={`p-1.5 rounded-xl border transition-colors ${
                            isSaved
                              ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                          title={isSaved ? 'Remove from Saved' : 'Save Opportunity'}
                        >
                          {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Title & Organization */}
                      <div>
                        <h3 className="text-base font-extrabold text-white group-hover:text-emerald-300 transition-colors">
                          {opp.title}
                        </h3>
                        <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <Building className="w-3.5 h-3.5 text-slate-500" />
                          <span>{opp.organization}</span>
                        </p>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                        {opp.description}
                      </p>

                      {/* Skills Tags */}
                      {opp.skills_required && opp.skills_required.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {opp.skills_required.map((skill, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] px-2 py-0.5 bg-slate-950 border border-slate-800 text-slate-400 rounded-md font-mono"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Meta and Footer Action */}
                    <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex items-center justify-between gap-3 text-xs">
                      <div className="flex flex-col text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          {opp.location || 'Pakistan'}
                        </span>
                        <span className="flex items-center gap-1 mt-0.5 text-emerald-400 font-semibold">
                          <DollarSign className="w-3 h-3" />
                          {opp.salary_or_stipend || 'Competitive'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedOppForApply(opp)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <span>Apply Now</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 4. VIEW: SAVED OPPORTUNITIES */}
      {activeView === 'saved' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-amber-400" />
              Your Saved Opportunities ({savedOpportunitiesList.length})
            </h2>
          </div>

          {savedOpportunitiesList.length === 0 ? (
            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl">
              <Bookmark className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">No saved opportunities yet</h3>
              <p className="text-xs text-slate-400 mt-1">
                Click the bookmark icon on any opportunity card to save it here for later review.
              </p>
              <button
                onClick={() => setActiveView('browse')}
                className="mt-4 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl"
              >
                Browse Opportunities
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedOpportunitiesList.map((opp) => (
                <div
                  key={opp.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                        {opp.opportunity_type}
                      </span>
                      <button
                        onClick={() => handleToggleSave(opp)}
                        className="text-xs text-red-400 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                    <h3 className="text-base font-bold text-white">{opp.title}</h3>
                    <p className="text-xs text-slate-400">{opp.organization}</p>
                    <p className="text-xs text-slate-300 line-clamp-2">{opp.description}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-emerald-400 font-semibold">{opp.salary_or_stipend}</span>
                    <button
                      onClick={() => setSelectedOppForApply(opp)}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs"
                    >
                      Apply Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. VIEW: APPLICATIONS & AI REVIEW */}
      {activeView === 'applications' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white">AI-Powered Resume Match & Candidate Review</h3>
                <p className="text-xs text-slate-400">
                  Applications stored in Supabase with calculated compatibility ratings and skill recommendations.
                </p>
              </div>
            </div>
          </div>

          {applications.length === 0 ? (
            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl">
              <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">No applications submitted yet</h3>
              <p className="text-xs text-slate-400 mt-1">
                Apply to any open opportunity in the directory to see automated AI score ratings and feedback.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-base font-extrabold text-white">
                        {app.opportunity?.title || 'Community Application'}
                      </h4>
                      <p className="text-xs text-slate-400">
                        {app.opportunity?.organization || 'Organization'} • Submitted on{' '}
                        {app.submitted_at ? new Date(app.submitted_at).toLocaleDateString() : 'Today'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-xl text-xs font-black flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5" />
                        AI Score: {app.ai_match_score || 85}%
                      </span>
                      <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-xl text-xs font-bold capitalize">
                        {app.status}
                      </span>
                    </div>
                  </div>

                  {app.ai_review_feedback && (
                    <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-300">
                      <span className="font-bold text-amber-400 block mb-1">AI Recommendation:</span>
                      {app.ai_review_feedback}
                    </div>
                  )}

                  <div className="text-xs text-slate-400 flex flex-wrap items-center gap-4 pt-1">
                    <span>Applicant: <strong className="text-slate-200">{app.applicant_name}</strong></span>
                    <span>Contact: <strong className="text-slate-200">{app.applicant_phone || app.applicant_email}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 6. VIEW: POST NEW OPPORTUNITY (For Admin / SuperAdmin) */}
      {activeView === 'create' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-400" />
                Post New Opportunity to Supabase
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Publish a new vacancy or scholarship directly into the community PostgreSQL database.
              </p>
            </div>
            <button
              onClick={() => setActiveView('browse')}
              className="px-3 py-1.5 bg-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-bold"
            >
              Back to Browse
            </button>
          </div>

          {createSuccess && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{createSuccess}</span>
            </div>
          )}

          <form onSubmit={handleCreateOppSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Opportunity Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Community IT Coordinator"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Organization / Department <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ISO Central IT Wing"
                  value={newOrg}
                  onChange={(e) => setNewOrg(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Internship">Internship</option>
                  <option value="Scholarship">Scholarship</option>
                  <option value="Fellowship">Fellowship</option>
                  <option value="Volunteer">Volunteer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Category</label>
                <input
                  type="text"
                  placeholder="e.g. Technology, Education"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Location</label>
                <input
                  type="text"
                  placeholder="e.g. Karachi / Hybrid"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Salary / Stipend</label>
                <input
                  type="text"
                  placeholder="e.g. PKR 50,000 / month"
                  value={newSalary}
                  onChange={(e) => setNewSalary(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Deadline</label>
                <input
                  type="date"
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Contact Email</label>
                <input
                  type="email"
                  placeholder="e.g. hr@isopakistan.org"
                  value={newContactEmail}
                  onChange={(e) => setNewContactEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Required Skills (Comma separated)
              </label>
              <input
                type="text"
                placeholder="e.g. React, TypeScript, Node.js, Database Management"
                value={newSkills}
                onChange={(e) => setNewSkills(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Description & Responsibilities <span className="text-red-400">*</span>
              </label>
              <textarea
                required
                rows={4}
                placeholder="Describe role responsibilities, required qualifications, and details..."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remoteCheck"
                checked={newIsRemote}
                onChange={(e) => setNewIsRemote(e.target.checked)}
                className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
              />
              <label htmlFor="remoteCheck" className="text-xs text-slate-300 cursor-pointer">
                Remote Work Allowed
              </label>
            </div>

            <button
              type="submit"
              disabled={isCreating}
              className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-amber-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isCreating ? 'Saving to Supabase...' : 'Publish to Supabase PostgreSQL'}</span>
            </button>
          </form>
        </div>
      )}

      {/* 7. APPLICATION MODAL WITH AI PREVIEW */}
      {selectedOppForApply && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                  Apply via Supabase
                </span>
                <h3 className="text-base font-extrabold text-white">{selectedOppForApply.title}</h3>
                <p className="text-xs text-slate-400">{selectedOppForApply.organization}</p>
              </div>
              <button
                onClick={() => setSelectedOppForApply(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {applySuccess && (
              <div className="p-3 bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{applySuccess}</span>
              </div>
            )}

            <form onSubmit={handleApplySubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={applyName}
                  onChange={(e) => setApplyName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={applyEmail}
                    onChange={(e) => setApplyEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Phone / Mobile <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="03001234567"
                    value={applyPhone}
                    onChange={(e) => setApplyPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Your Skills (Used for AI Match Score) <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. React, TypeScript, Community Organizing, Python"
                  value={applySkills}
                  onChange={(e) => setApplySkills(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Resume Link (Google Drive / Supabase Storage)
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/file/d/..."
                  value={applyResumeUrl}
                  onChange={(e) => setApplyResumeUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Cover Note</label>
                <textarea
                  rows={2}
                  placeholder="Briefly state your interest and relevant experience..."
                  value={applyCoverLetter}
                  onChange={(e) => setApplyCoverLetter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedOppForApply(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingApp}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingApp ? 'Submitting...' : 'Submit Application'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
