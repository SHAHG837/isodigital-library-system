import React from 'react';
import { Phone, ShieldCheck } from 'lucide-react';
import { SUPER_ADMIN_INFO } from '../data/initialData';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-12 bg-slate-950 text-slate-300 border-t border-slate-800 rounded-t-2xl overflow-hidden shadow-2xl">
      {/* Running Scrolling News Ticker Banner */}
      <div className="bg-indigo-950/40 py-2.5 px-4 border-b border-slate-800 text-xs font-semibold text-indigo-300 overflow-hidden flex items-center gap-3">
        <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase bg-indigo-600 text-white rounded-md shrink-0 tracking-wider shadow-sm">
          NOTICE
        </span>
        <div className="whitespace-nowrap overflow-hidden relative w-full">
          <div className="inline-block animate-marquee tracking-wide font-mono text-[11px] text-indigo-200">
            This Digital Library is prepared by {SUPER_ADMIN_INFO.name}, {SUPER_ADMIN_INFO.designation}. Contact Number: {SUPER_ADMIN_INFO.mobileNumber}. &nbsp;&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;&nbsp; International Sadat Organization Central Digital Repository System.
          </div>
        </div>
      </div>

      {/* Main Footer Info */}
      <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs border-b border-slate-800/80">
        <div>
          <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-400" /> ISO Digital Library System
          </h4>
          <p className="text-slate-400 mt-2 leading-relaxed text-[11px]">
            Centralized organizational repository managing records, office bearers, administrative permissions, and security audit trails for the International Sadat Organization.
          </p>
        </div>

        <div>
          <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">Super Administrator Oversight</h4>
          <p className="text-indigo-400 font-bold mt-1.5">{SUPER_ADMIN_INFO.name}</p>
          <p className="text-slate-400 mt-0.5 text-[11px]">{SUPER_ADMIN_INFO.designation}</p>
          <p className="text-slate-400 font-mono mt-1 text-[11px] flex items-center gap-1">
            <Phone className="w-3.5 h-3.5 text-indigo-400" /> {SUPER_ADMIN_INFO.mobileNumber}
          </p>
        </div>

        <div>
          <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">System Specifications</h4>
          <p className="text-slate-400 mt-1.5 text-[11px]">Multi-Cloud Ready: Firestore, Supabase, PostgreSQL, MySQL</p>
          <p className="text-slate-400 mt-0.5 text-[11px]">RBAC & Encrypted Audit Trail Active</p>
          <p className="text-slate-400 font-mono mt-1 text-[11px]">Version: 2026.1.0-PROD</p>
        </div>
      </div>

      {/* Copyright Notice Bar */}
      <div className="bg-slate-950 py-3 px-6 text-center text-[10px] text-slate-500 font-medium leading-relaxed">
        <p>
          © All Rights Reserved. This Digital Library is the intellectual property of Syed Muhammad Aamir Naqvi Al Bukhari. Unauthorized copying, modification, or distribution is strictly prohibited.
        </p>
      </div>
    </footer>
  );
};
