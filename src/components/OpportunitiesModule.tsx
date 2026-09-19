import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Search,
  Filter,
  Bookmark,
  BookmarkCheck,
  Send,
  Sparkles,
  Bot,
  ExternalLink,
  MapPin,
  Building2,
  Clock,
  DollarSign,
  GraduationCap,
  Award,
  Users,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  FileText,
  Upload,
  X,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  Database
} from 'lucide-react';
import {
  Opportunity,
  OpportunityType,
  OpportunityCategory,
  WorkplaceType,
  Profile,
  ResumeReviewResult
} from '../types';
import {
  getOpportunities,
  createOpportunity,
  toggleSaveOpportunity,
  getSavedOpportunities,
  submitApplication,
  uploadResumeToStorage,
  INITIAL_OPPORTUNITIES,
  SUPABASE_PROJECT_ID
} from '../lib/supabaseClient';

interface OpportunitiesModuleProps {
  currentProfile?: Profile | null;
  onOpenSupabaseConfig?: () => void;
  onOpenMyApplications?: () => void;
  onOpenSavedOpportunities?: () => void;
}

export const OpportunitiesModule: React.FC<OpportunitiesModuleProps> = ({
  currentProfile,
  onOpenSupabaseConfig,
  onOpenMyApplications,
  onOpenSavedOpportunities
}) => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>(INITIAL_OPPORTUNITIES);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedWorkplace, setSelectedWorkplace] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'all' | 'ai_recommended' | 'featured'>('all');

  // Selected Opportunity for Detail Modal
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);

  // Apply Modal State
  const [applyOpp, setApplyOpp] = useState<Opportunity | null>(null);
  const [applicantName, setApplicantName] = useState(currentProfile?.full_name || '');
  const [applicantEmail, setApplicantEmail] = useState(currentProfile?.email || '');
  const [coverLetter, setCoverLetter] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [submittingApp, setSubmittingApp] = useState(false);
  const [appSuccessMessage, setAppSuccessMessage] = useState<string | null>(null);

  // AI Resume Review Modal
  const [aiReviewOpp, setAiReviewOpp] = useState<Opportunity | null>(null);
  const [resumeReviewText, setResumeReviewText] = useState(
    'Experienced Full Stack Engineer with expertise in TypeScript, React, Node.js, and PostgreSQL. Built scalable distributed web systems with automated testing and continuous integration.'
  );
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewResult, setReviewResult] = useState<ResumeReviewResult | null>(null);

  // Post Opportunity Modal
  const [showPostModal, setShowPostModal] = useState(false);
  const [postForm, setPostForm] = useState({
    title: '',
    organization: '',
    type: 'Full-time' as OpportunityType,
    category: 'Engineering' as OpportunityCategory,
    location: 'Karachi, Pakistan',
    workplace_type: 'Remote' as WorkplaceType,
    description: '',
    responsibilities: '',
    requirements: '',
    skills_required: '',
    salary_min: 2000,
    salary_max: 3500,
    currency: 'USD',
    deadline: '',
    contact_email: ''
  });
  const [postingSubmitting, setPostingSubmitting] = useState(false);

  const userId = currentProfile?.id || 'guest-user-001';

  // Load Opportunities & Saved Items
  const loadData = async () => {
    setLoading(true);
    try {
      const list = await getOpportunities({
        type: selectedType,
        category: selectedCategory,
        workplace_type: selectedWorkplace,
        search: searchQuery
      });
      setOpportunities(list);

      const saved = await getSavedOpportunities(userId);
      setSavedIds(new Set(saved.map((s) => s.opportunity_id)));
    } catch (e) {
      console.error('Error loading opportunities:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedType, selectedCategory, selectedWorkplace]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleToggleSave = async (opp: Opportunity, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const isSaved = await toggleSaveOpportunity(userId, opp);
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (isSaved) {
        next.add(opp.id);
      } else {
        next.delete(opp.id);
      }
      return next;
    });
  };

  // Submit Application
  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyOpp) return;

    setSubmittingApp(true);
    try {
      let resumeUrl = '';
      if (resumeFile) {
        const uploadResult = await uploadResumeToStorage(resumeFile, userId);
        resumeUrl = uploadResult.url;
      }

      await submitApplication({
        opportunity_id: applyOpp.id,
        applicant_id: userId,
        resume_url: resumeUrl,
        cover_letter: coverLetter,
        portfolio_url: portfolioUrl,
        opportunity: applyOpp,
        applicant: currentProfile || undefined
      });

      setAppSuccessMessage(
        `Your application for "${applyOpp.title}" has been securely recorded in Supabase PostgreSQL database!`
      );
      setTimeout(() => {
        setApplyOpp(null);
        setAppSuccessMessage(null);
        setCoverLetter('');
        setResumeFile(null);
      }, 2500);
    } catch (err: any) {
      alert('Error submitting application: ' + err.message);
    } finally {
      setSubmittingApp(false);
    }
  };

  // AI Resume Review
  const handleRunAiResumeReview = async (opp: Opportunity) => {
    setAiReviewOpp(opp);
    setReviewLoading(true);
    setReviewResult(null);

    try {
      const res = await fetch('/api/ai/resume-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText: resumeReviewText,
          candidateSkills: currentProfile?.skills || ['TypeScript', 'React', 'PostgreSQL'],
          candidateHeadline: currentProfile?.headline || 'Senior Software Developer',
          targetOpportunity: opp
        })
      });
      const data = await res.json();
      setReviewResult(data);
    } catch (err: any) {
      console.error('AI Review Error:', err);
    } finally {
      setReviewLoading(false);
    }
  };

  // Post Opportunity Submit
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setPostingSubmitting(true);
    try {
      const created = await createOpportunity({
        title: postForm.title,
        organization: postForm.organization,
        type: postForm.type,
        category: postForm.category,
        location: postForm.location,
        workplace_type: postForm.workplace_type,
        description: postForm.description,
        responsibilities: postForm.responsibilities
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
        requirements: postForm.requirements
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
        skills_required: postForm.skills_required
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        salary_min: postForm.salary_min ? Number(postForm.salary_min) : null,
        salary_max: postForm.salary_max ? Number(postForm.salary_max) : null,
        currency: postForm.currency,
        deadline: postForm.deadline ? new Date(postForm.deadline).toISOString() : null,
        status: 'active',
        contact_email: postForm.contact_email,
        is_featured: false
      });

      setOpportunities((prev) => [created, ...prev]);
      setShowPostModal(false);
      setPostForm({
        title: '',
        organization: '',
        type: 'Full-time',
        category: 'Engineering',
        location: 'Karachi, Pakistan',
        workplace_type: 'Remote',
        description: '',
        responsibilities: '',
        requirements: '',
        skills_required: '',
        salary_min: 2000,
        salary_max: 3500,
        currency: 'USD',
        deadline: '',
        contact_email: ''
      });
    } catch (e: any) {
      alert('Error creating opportunity: ' + e.message);
    } finally {
      setPostingSubmitting(false);
    }
  };

  // Filtered List based on tab
  const displayedOpportunities = opportunities.filter((opp) => {
    if (activeTab === 'featured') return opp.is_featured;
    return true;
  });

  // Calculate Metrics
  const totalCount = opportunities.length;
  const remoteCount = opportunities.filter((o) => o.workplace_type === 'Remote').length;
  const scholarshipCount = opportunities.filter((o) => o.type === 'Scholarship' || o.type === 'Fellowship').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner & Supabase Status Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5" />
                <span>Supabase PostgreSQL Backend</span>
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Project: {SUPABASE_PROJECT_ID}
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
              Opportunities, Careers & Fellowships Hub
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Verified career openings, global academic scholarships, fellowships, and tech internships. Backed by Supabase with Row Level Security, full-text search, and AI resume evaluation.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {onOpenSupabaseConfig && (
              <button
                onClick={onOpenSupabaseConfig}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all shadow-sm"
              >
                <Database className="w-4 h-4 text-emerald-400" />
                <span>Supabase SQL & RLS</span>
              </button>
            )}

            <button
              onClick={() => setShowPostModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-950"
            >
              <Plus className="w-4 h-4" />
              <span>Post Opportunity</span>
            </button>
          </div>
        </div>

        {/* 4 Metric Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/80">
          <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
              <Briefcase className="w-4 h-4 text-emerald-400" />
              <span>Total Opportunities</span>
            </div>
            <div className="text-2xl font-bold text-white">{totalCount}</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
              <MapPin className="w-4 h-4 text-blue-400" />
              <span>Remote / Global</span>
            </div>
            <div className="text-2xl font-bold text-white">{remoteCount}</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
              <GraduationCap className="w-4 h-4 text-amber-400" />
              <span>Scholarships & Grants</span>
            </div>
            <div className="text-2xl font-bold text-white">{scholarshipCount}</div>
          </div>

          <div
            onClick={onOpenSavedOpportunities}
            className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/50 cursor-pointer hover:border-slate-600 transition-colors"
          >
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
              <Bookmark className="w-4 h-4 text-purple-400" />
              <span>Bookmarked</span>
            </div>
            <div className="text-2xl font-bold text-white">{savedIds.size}</div>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 shadow-md space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, organization, technologies (e.g. React, PostgreSQL), or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Search className="w-4 h-4 text-emerald-400" />
            <span>Search Database</span>
          </button>
        </form>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400 font-medium mr-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
            <span>Filters:</span>
          </div>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="All">All Types (Jobs, Scholarships, Internships)</option>
            <option value="Full-time">Full-time Job</option>
            <option value="Part-time">Part-time</option>
            <option value="Internship">Internship</option>
            <option value="Scholarship">Scholarship</option>
            <option value="Fellowship">Fellowship</option>
            <option value="Mentorship">Mentorship</option>
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="All">All Categories</option>
            <option value="Engineering">Engineering</option>
            <option value="Data & AI">Data & AI</option>
            <option value="Design">Design</option>
            <option value="Product">Product</option>
            <option value="Education">Education</option>
            <option value="Social Welfare">Social Welfare</option>
          </select>

          {/* Workplace Filter */}
          <select
            value={selectedWorkplace}
            onChange={(e) => setSelectedWorkplace(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="All">All Workplace (Remote, Hybrid, On-site)</option>
            <option value="Remote">Remote Only</option>
            <option value="Hybrid">Hybrid</option>
            <option value="On-site">On-site</option>
          </select>

          {(selectedType !== 'All' || selectedCategory !== 'All' || selectedWorkplace !== 'All' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedType('All');
                setSelectedCategory('All');
                setSelectedWorkplace('All');
                setSearchQuery('');
              }}
              className="ml-auto text-xs text-amber-400 hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Sub-tabs: All vs Featured */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 border-b border-slate-800 w-full">
          <button
            onClick={() => setActiveTab('all')}
            className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'all'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>All Listings ({opportunities.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('featured')}
            className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'featured'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Featured & Scholarships</span>
          </button>
        </div>
      </div>

      {/* Opportunities List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
          <span className="text-sm">Fetching opportunities from Supabase PostgreSQL...</span>
        </div>
      ) : displayedOpportunities.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400">
          <Briefcase className="w-10 h-10 mx-auto text-slate-600 mb-3" />
          <h3 className="text-base font-semibold text-slate-300">No opportunities found</h3>
          <p className="text-xs text-slate-500 mt-1">Try resetting your filters or post a new opportunity.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {displayedOpportunities.map((opp) => {
            const isSaved = savedIds.has(opp.id);
            return (
              <div
                key={opp.id}
                onClick={() => setSelectedOpp(opp)}
                className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  {/* Top Row: Organization, Badges & Save Button */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5" />
                          {opp.organization}
                        </span>
                        {opp.is_featured && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            Featured
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                        {opp.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={(e) => handleToggleSave(opp, e)}
                        className={`p-2 rounded-xl border transition-colors ${
                          isSaved
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                            : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white'
                        }`}
                        title={isSaved ? 'Remove from Saved' : 'Save / Bookmark Opportunity'}
                      >
                        {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Pills & Meta */}
                  <div className="flex flex-wrap items-center gap-2 my-3 text-xs">
                    <span className="px-2.5 py-1 rounded-lg font-medium bg-slate-800 text-slate-300 border border-slate-700/60">
                      {opp.type}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg font-medium bg-blue-500/10 text-blue-300 border border-blue-500/30">
                      {opp.category}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg font-medium bg-purple-500/10 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {opp.workplace_type} ({opp.location})
                    </span>
                    {opp.salary_min && (
                      <span className="px-2.5 py-1 rounded-lg font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {opp.currency} {opp.salary_min.toLocaleString()}
                        {opp.salary_max ? ` - ${opp.salary_max.toLocaleString()}` : ''}
                      </span>
                    )}
                  </div>

                  {/* Description Preview */}
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {opp.description}
                  </p>

                  {/* Skills tags */}
                  {opp.skills_required && opp.skills_required.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {opp.skills_required.slice(0, 5).map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded text-[11px] bg-slate-800/90 text-slate-400 border border-slate-700/50"
                        >
                          {skill}
                        </span>
                      ))}
                      {opp.skills_required.length > 5 && (
                        <span className="text-[11px] text-slate-500 self-center">
                          +{opp.skills_required.length - 5} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom Row Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-800/80">
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {opp.application_count} applicants
                    </span>
                    {opp.deadline && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Deadline: {new Date(opp.deadline).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* AI Resume Review Trigger */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRunAiResumeReview(opp);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      title="Analyze your resume match with Gemini AI"
                    >
                      <Bot className="w-3.5 h-3.5 text-indigo-400" />
                      <span>AI Resume Review</span>
                    </button>

                    {/* Apply Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setApplyOpp(opp);
                      }}
                      className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md"
                    >
                      <span>Apply Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================================== */}
      {/* MODAL 1: Opportunity Details Modal */}
      {/* ============================================================================== */}
      {selectedOpp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
            {/* Header */}
            <div className="p-6 border-b border-slate-800 flex items-start justify-between bg-slate-900/90">
              <div>
                <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1 mb-1">
                  <Building2 className="w-3.5 h-3.5" />
                  {selectedOpp.organization}
                </div>
                <h2 className="text-xl font-bold text-white">{selectedOpp.title}</h2>
                <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {selectedOpp.type}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/30">
                    {selectedOpp.category}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30">
                    {selectedOpp.workplace_type} ({selectedOpp.location})
                  </span>
                  {selectedOpp.salary_min && (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                      {selectedOpp.currency} {selectedOpp.salary_min.toLocaleString()} - {selectedOpp.salary_max?.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => setSelectedOpp(null)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-slate-300">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Overview</h4>
                <p className="leading-relaxed text-slate-200">{selectedOpp.description}</p>
              </div>

              {selectedOpp.responsibilities && selectedOpp.responsibilities.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Key Responsibilities</h4>
                  <ul className="space-y-1.5 list-disc pl-5 text-slate-200">
                    {selectedOpp.responsibilities.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedOpp.requirements && selectedOpp.requirements.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Candidate Requirements</h4>
                  <ul className="space-y-1.5 list-disc pl-5 text-slate-200">
                    {selectedOpp.requirements.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedOpp.skills_required && selectedOpp.skills_required.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Required Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedOpp.skills_required.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 text-emerald-300 border border-slate-700 text-xs font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
              <button
                onClick={() => {
                  const opp = selectedOpp;
                  setSelectedOpp(null);
                  handleRunAiResumeReview(opp);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold"
              >
                <Bot className="w-4 h-4 text-indigo-400" />
                <span>AI Resume Match Check</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedOpp(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const opp = selectedOpp;
                    setSelectedOpp(null);
                    setApplyOpp(opp);
                  }}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg"
                >
                  Apply Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================== */}
      {/* MODAL 2: Apply to Opportunity Modal */}
      {/* ============================================================================== */}
      {applyOpp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden text-slate-100">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-base">Apply for {applyOpp.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{applyOpp.organization} • {applyOpp.location}</p>
              </div>
              <button onClick={() => setApplyOpp(null)} className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {appSuccessMessage ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-white">Application Submitted!</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{appSuccessMessage}</p>
              </div>
            ) : (
              <form onSubmit={handleApplySubmit} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    placeholder="Syed Muhammad..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={applicantEmail}
                    onChange={(e) => setApplicantEmail(e.target.value)}
                    placeholder="applicant@example.com"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Resume Upload */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Resume / CV (PDF or DOCX)</label>
                  <div className="border-2 border-dashed border-slate-700 rounded-xl p-4 text-center bg-slate-800/40 hover:bg-slate-800/70 transition-colors cursor-pointer relative">
                    <input
                      type="file"
                      accept=".pdf,.docx,.doc"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setResumeFile(e.target.files[0]);
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <Upload className="w-5 h-5 mx-auto text-slate-400 mb-1" />
                    <span className="text-xs font-semibold text-slate-200">
                      {resumeFile ? resumeFile.name : 'Click or Drag & Drop Resume File'}
                    </span>
                    <p className="text-[10px] text-slate-500 mt-0.5">Uploaded directly to Supabase Storage 'resumes' bucket</p>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Cover Letter / Statement</label>
                  <textarea
                    rows={3}
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Briefly describe your background, why you're interested, and key qualifications..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Portfolio or GitHub URL (Optional)</label>
                  <input
                    type="url"
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setApplyOpp(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingApp}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 shadow-md"
                  >
                    {submittingApp ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Submitting to Supabase...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Application</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ============================================================================== */}
      {/* MODAL 3: AI Resume Review & Optimization Modal */}
      {/* ============================================================================== */}
      {aiReviewOpp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Gemini AI Resume Review & Match</h3>
                  <p className="text-xs text-slate-400">Target Role: {aiReviewOpp.title} ({aiReviewOpp.organization})</p>
                </div>
              </div>
              <button onClick={() => setAiReviewOpp(null)} className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
              {reviewLoading ? (
                <div className="py-16 text-center space-y-3">
                  <RefreshCw className="w-8 h-8 animate-spin text-indigo-400 mx-auto" />
                  <p className="text-sm font-semibold text-slate-200">Analyzing resume with Gemini 2.5 Flash...</p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Comparing candidate competencies, requirements, and keyword density against {aiReviewOpp.title}.
                  </p>
                </div>
              ) : reviewResult ? (
                <div className="space-y-5">
                  {/* Score Card */}
                  <div className="p-5 rounded-xl bg-indigo-950/30 border border-indigo-500/30 flex items-center justify-between">
                    <div>
                      <span className="text-xs uppercase font-semibold text-indigo-300">Match Evaluation</span>
                      <h4 className="text-xl font-bold text-white mt-0.5">{reviewResult.fitLevel} Compatibility</h4>
                      <p className="text-xs text-slate-300 mt-1 max-w-md">{reviewResult.summary}</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-indigo-500/20 border border-indigo-500/40 shrink-0">
                      <div className="text-3xl font-black text-indigo-300">{reviewResult.matchScore}%</div>
                      <span className="text-[10px] font-semibold text-indigo-200 uppercase">Match Score</span>
                    </div>
                  </div>

                  {/* Strengths */}
                  <div>
                    <h5 className="font-bold text-white mb-2 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Candidate Strengths
                    </h5>
                    <div className="space-y-1.5">
                      {reviewResult.strengths?.map((str, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-200">
                          {str}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Missing ATS Keywords */}
                  <div>
                    <h5 className="font-bold text-white mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      Recommended Keywords to Boost ATS Score
                    </h5>
                    <div className="flex flex-wrap gap-1.5">
                      {reviewResult.missingKeywords?.map((kw, idx) => (
                        <span key={idx} className="px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/30 font-mono">
                          +{kw}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Items */}
                  <div>
                    <h5 className="font-bold text-white mb-2 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-blue-400" />
                      Actionable Resume Improvements
                    </h5>
                    <ul className="space-y-1.5 list-disc pl-5 text-slate-300">
                      {reviewResult.actionItems?.map((act, idx) => (
                        <li key={idx}>{act}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs">
              <span className="text-slate-400">Powered by Gemini 2.5 Flash Model</span>
              <button
                onClick={() => setAiReviewOpp(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================== */}
      {/* MODAL 4: Post New Opportunity Modal */}
      {/* ============================================================================== */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-base">Post New Opportunity</h3>
                <p className="text-xs text-slate-400">Stored directly in Supabase PostgreSQL 'opportunities' table</p>
              </div>
              <button onClick={() => setShowPostModal(false)} className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Opportunity Title</label>
                  <input
                    type="text"
                    required
                    value={postForm.title}
                    onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                    placeholder="e.g. Lead Software Architect"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Organization / Trust</label>
                  <input
                    type="text"
                    required
                    value={postForm.organization}
                    onChange={(e) => setPostForm({ ...postForm, organization: e.target.value })}
                    placeholder="e.g. ISO Global Welfare Trust"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Type</label>
                  <select
                    value={postForm.type}
                    onChange={(e) => setPostForm({ ...postForm, type: e.target.value as OpportunityType })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                    <option value="Scholarship">Scholarship</option>
                    <option value="Fellowship">Fellowship</option>
                    <option value="Mentorship">Mentorship</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Category</label>
                  <select
                    value={postForm.category}
                    onChange={(e) => setPostForm({ ...postForm, category: e.target.value as OpportunityCategory })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Data & AI">Data & AI</option>
                    <option value="Design">Design</option>
                    <option value="Product">Product</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Education">Education</option>
                    <option value="Social Welfare">Social Welfare</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Workplace</label>
                  <select
                    value={postForm.workplace_type}
                    onChange={(e) => setPostForm({ ...postForm, workplace_type: e.target.value as WorkplaceType })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Detailed Description</label>
                <textarea
                  rows={3}
                  required
                  value={postForm.description}
                  onChange={(e) => setPostForm({ ...postForm, description: e.target.value })}
                  placeholder="Provide a comprehensive summary of the opportunity, project context, and mission..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Required Skills (Comma-separated)</label>
                <input
                  type="text"
                  value={postForm.skills_required}
                  onChange={(e) => setPostForm({ ...postForm, skills_required: e.target.value })}
                  placeholder="React, TypeScript, PostgreSQL, Docker, Git"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Salary / Grant Min</label>
                  <input
                    type="number"
                    value={postForm.salary_min}
                    onChange={(e) => setPostForm({ ...postForm, salary_min: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Salary / Grant Max</label>
                  <input
                    type="number"
                    value={postForm.salary_max}
                    onChange={(e) => setPostForm({ ...postForm, salary_max: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={postForm.contact_email}
                    onChange={(e) => setPostForm({ ...postForm, contact_email: e.target.value })}
                    placeholder="recruiter@org.com"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPostModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={postingSubmitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 shadow-md"
                >
                  {postingSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Publishing to Supabase...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Publish Opportunity</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
