/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  ShieldCheck, 
  HelpCircle, 
  FileCheck, 
  ArrowLeft,
  Mail,
  AlertTriangle
} from "lucide-react";
import { findSubmissionByToken } from "../services/store";
import { EmployeeRecord } from "../types";
import { MultiStepForm } from "../components/MultiStepForm";

interface EmployeeFormPortalProps {
  token: string;
  onNavigateToLogin: () => void;
}

export const EmployeeFormPortal: React.FC<EmployeeFormPortalProps> = ({
  token,
  onNavigateToLogin,
}) => {
  const initialRecord = findSubmissionByToken(token);
  const [record, setRecord] = useState<EmployeeRecord | null>(initialRecord);
  const [justSubmitted, setJustSubmitted] = useState(false);

  const handleSubmissionSuccess = (updated: EmployeeRecord) => {
    setRecord(updated);
    setJustSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!record) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center p-6 font-sans">
        <div className="bg-slate-850 border border-slate-800 rounded-2xl p-8 max-w-md w-full text-center space-y-6 shadow-xl">
          <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center text-rose-400 mx-auto select-none">
            <AlertTriangle className="w-8 h-8" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Onboarding Link Expired or Invalid</h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              The secure onboarding token provided is either invalid, revoked by HR Admin, or has expired its 7-day validity duration window.
            </p>
          </div>

          <div className="bg-slate-905 border border-slate-800 p-4 rounded-lg text-left text-[11px] leading-relaxed text-slate-400 space-y-1.5">
            <span className="font-bold text-white uppercase tracking-wider block">Security Recommendations:</span>
            <p>1. Check that the URL token matches your email invitation precisely.</p>
            <p>2. Message your assigned talent scout at <span className="font-semibold text-slate-305">recruitment@blih-erp.com</span> to request a link refresh.</p>
          </div>

          <button
            type="button"
            onClick={onNavigateToLogin}
            className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white font-bold text-xs rounded-lg uppercase tracking-wide cursor-pointer transition-all border border-slate-700"
          >
            Return to Portal Gate
          </button>
        </div>
      </div>
    );
  }

  const isFormLocked = record.status === "SUBMITTED" || record.status === "APPROVED";

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      
      {/* Visual Header */}
      <header className="bg-slate-950 text-white border-b border-slate-800 shadow-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center text-slate-900 shadow-sm shrink-0 select-none">
              <ShieldCheck className="w-5.5 h-5.5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-widest font-mono">Blih ERP Portal</span>
              <h1 className="text-sm font-bold text-white tracking-tight">Employee Self-Service</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onNavigateToLogin}
              className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1 transition-all cursor-pointer bg-transparent"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Lobby</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Body Container */}
      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        
        {/* Onboarding Welcome / Completion Header */}
        {justSubmitted || (isFormLocked && record.status === "SUBMITTED") ? (
          <div className="p-6.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-4 shadow-xs">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-emerald-110 rounded-xl flex items-center justify-center text-emerald-700 shrink-0 select-none">
                <FileCheck className="w-7 h-7" />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider font-bold text-emerald-700 font-mono">Submission Successful</div>
                <h2 className="text-lg font-bold text-slate-800 mt-0.5">Thank you, {record.firstName}!</h2>
                <p className="text-xs text-emerald-805 mt-1 leading-relaxed max-w-xl">
                  Your information has been securely sealed and is under active review by HR Admin. Your onboarding credentials will be provisioned once your identity document is verified.
                </p>
              </div>
            </div>

            <div className="bg-white/80 p-4 border border-emerald-200/50 rounded-lg max-w-fit flex items-center gap-2 text-xs font-semibold text-slate-700">
              <Mail className="w-4.5 h-4.5 text-slate-500" />
              <span>Contact HR Desk:</span>
              <span className="font-bold text-indigo-700">recruitment@blih-erp.com</span>
            </div>
          </div>
        ) : (
          <div className="space-y-1.5 pb-2">
            <h2 className="text-xl font-bold text-slate-800 tracking-tight font-display">
              Welcome, {record.firstName} {record.lastName}!
            </h2>
            <p className="text-xs text-slate-500 leading-normal max-w-xl">
              Please complete your onboarding file below. Your personal workspace tracks progress instantly. Click **Save Progress** if you need to fetch external details later.
            </p>
          </div>
        )}

        {/* Wizard Multi-Step Form Instance */}
        <MultiStepForm 
          initialRecord={record}
          onSubmissionComplete={handleSubmissionSuccess}
        />

      </main>

      {/* Footer copyright */}
      <footer className="py-8 text-center text-xs text-slate-400 border-t border-slate-200/60 max-w-4xl mx-auto mt-12 bg-transparent">
        <p>© 2026 Blih ERP Onboarding Ledger. Encrypted connection SSL-TLS-1.3.</p>
      </footer>

    </div>
  );
};
