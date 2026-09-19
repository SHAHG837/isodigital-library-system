import React, { useState, useEffect } from 'react';
import {
  Bookmark,
  BookmarkCheck,
  Building2,
  MapPin,
  DollarSign,
  ArrowRight,
  Trash2,
  RefreshCw,
  ExternalLink,
  Briefcase
} from 'lucide-react';
import { Opportunity, Profile } from '../types';
import { getSavedOpportunities, toggleSaveOpportunity, SUPABASE_PROJECT_ID } from '../lib/supabaseClient';

interface SavedOpportunitiesModuleProps {
  currentProfile?: Profile | null;
  onExploreOpportunities?: () => void;
  onSelectOpportunity?: (opp: Opportunity) => void;
}

export const SavedOpportunitiesModule: React.FC<SavedOpportunitiesModuleProps> = ({
  currentProfile,
  onExploreOpportunities,
  onSelectOpportunity
}) => {
  const [savedItems, setSavedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const userId = currentProfile?.id || 'guest-user-001';

  const loadSaved = async () => {
    setLoading(true);
    try {
      const items = await getSavedOpportunities(userId);
      setSavedItems(items);
    } catch (e) {
      console.error('Error loading saved items:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSaved();
  }, [userId]);

  const handleRemove = async (opp: Opportunity) => {
    await toggleSaveOpportunity(userId, opp);
    setSavedItems((prev) => prev.filter((item) => item.opportunity_id !== opp.id));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Supabase 'saved_opportunities' Table
            </span>
            <span className="text-xs text-slate-400 font-mono">Project: {SUPABASE_PROJECT_ID}</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Saved & Bookmarked Opportunities</h1>
          <p className="text-xs text-slate-300 mt-1">
            Your personal shortlist of careers, internships, and grants synced across devices.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadSaved}
            disabled={loading}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
            title="Refresh saved items"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
          {onExploreOpportunities && (
            <button
              onClick={onExploreOpportunities}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md"
            >
              Explore More
            </button>
          )}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
          <span className="text-sm">Fetching bookmarks from Supabase...</span>
        </div>
      ) : savedItems.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400">
          <Bookmark className="w-10 h-10 mx-auto text-slate-600 mb-3" />
          <h3 className="text-base font-semibold text-slate-300">No saved opportunities yet</h3>
          <p className="text-xs text-slate-500 mt-1">
            Click the bookmark icon on any job, fellowship, or scholarship to save it to your Supabase shortlist.
          </p>
          {onExploreOpportunities && (
            <button
              onClick={onExploreOpportunities}
              className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
            >
              Browse All Opportunities
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {savedItems.map((item) => {
            const opp: Opportunity = item.opportunity;
            if (!opp) return null;

            return (
              <div
                key={item.id}
                className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-md flex flex-col justify-between group transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" />
                      {opp.organization}
                    </div>
                    <button
                      onClick={() => handleRemove(opp)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                      title="Remove from saved"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors mb-2">
                    {opp.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-1.5 text-xs mb-3">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {opp.type}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/30">
                      {opp.category}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30">
                      {opp.workplace_type}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {opp.description}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-800/80">
                  <span className="text-[11px] text-slate-500">
                    Saved {new Date(item.saved_at).toLocaleDateString()}
                  </span>

                  <button
                    onClick={() => {
                      if (onSelectOpportunity) onSelectOpportunity(opp);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <span>View & Apply</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
