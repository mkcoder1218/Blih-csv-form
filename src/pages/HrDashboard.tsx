/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  Users, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Mail, 
  Clock, 
  ChevronRight,
  ShieldAlert,
  Download
} from "lucide-react";
import { getSubmissions, getInvitations, getAuditLogs } from "../services/store";
import { AuditLogTimeline, CsvExportButton } from "../components/UIComponents";

interface HrDashboardProps {
  onNavigateToSection: (section: "invitations" | "submissions" | "submissions-detail", id?: string) => void;
}

export const HrDashboard: React.FC<HrDashboardProps> = ({ onNavigateToSection }) => {
  const submissions = getSubmissions();
  const invitations = getInvitations();
  const logs = getAuditLogs();

  // Metric calculation
  const totalInvitations = invitations.length;
  const draftSubmissions = submissions.filter((s) => s.status === "DRAFT").length;
  const submittedSubmissions = submissions.filter((s) => s.status === "SUBMITTED").length;
  const correctionSubmissions = submissions.filter((s) => s.status === "NEEDS_CORRECTION").length;
  const approvedSubmissions = submissions.filter((s) => s.status === "APPROVED").length;

  // Gather latest in-flight items for quick review panel
  const inboxSubmissions = submissions
    .filter((s) => s.status === "SUBMITTED")
    .slice(0, 3);

  return (
    <div className="space-y-6">
      
      {/* Title & Introduction Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Onboarding Operations Center</h1>
          <p className="text-xs text-slate-500 mt-1">Real-time status of Blih ERP employee self-service records, verification queues, and CSV exports.</p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Quick global bulk export */}
          <CsvExportButton 
            records={submissions.filter((s) => s.status === "APPROVED")} 
          />
        </div>
      </div>

      {/* Metric Bento Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Metric 1 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex justify-between items-start gap-1">
            <span className="text-xs font-semibold text-slate-500 leading-tight">Total Invitations</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
              <Mail className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3.5">
            <span className="text-2xl font-bold text-slate-800 tracking-tight">{totalInvitations}</span>
            <p className="text-[10px] text-slate-400 mt-1 font-medium font-mono">Registry Links</p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex justify-between items-start gap-1">
            <span className="text-xs font-semibold text-slate-500 leading-tight">Draft Forms</span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3.5">
            <span className="text-2xl font-bold text-slate-800 tracking-tight">{draftSubmissions}</span>
            <p className="text-[10px] text-slate-400 mt-1 font-medium font-mono">In-progress</p>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex justify-between items-start gap-1">
            <span className="text-xs font-semibold text-slate-500 leading-tight">Submitted Forms</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3.5">
            <span className="text-2xl font-bold text-slate-800 tracking-tight">{submittedSubmissions}</span>
            <p className="text-[10px] text-slate-400 mt-1 font-medium font-mono">Ready to Audit</p>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex justify-between items-start gap-1">
            <span className="text-xs font-semibold text-slate-500 leading-tight">Needs Correction</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600 shrink-0">
              <AlertTriangle className="w-4 h-4 animate-pulse text-rose-500" />
            </div>
          </div>
          <div className="mt-3.5">
            <span className="text-2xl font-bold text-slate-800 tracking-tight">{correctionSubmissions}</span>
            <p className="text-[10px] text-slate-400 mt-1 font-medium font-mono">Rejected Action Required</p>
          </div>
        </div>

        {/* Metric 5 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex justify-between items-start gap-1">
            <span className="text-xs font-semibold text-slate-500 leading-tight">Approved Forms</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3.5">
            <span className="text-2xl font-bold text-slate-800 tracking-tight">{approvedSubmissions}</span>
            <p className="text-[10px] text-slate-400 mt-1 font-medium font-mono">Export Ready</p>
          </div>
        </div>



      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Bento: Actionable Inbox panel */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Critical Submission Approvals Inbox</h3>
                <p className="text-xs text-slate-500">Unprocessed records requiring document review and ERP provisioning.</p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateToSection("submissions")}
                className="text-xs text-brand-605 hover:text-brand-700 font-semibold flex items-center gap-0.5 hover:underline"
              >
                <span>View All</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {inboxSubmissions.length === 0 ? (
                <div className="p-8 text-center text-slate-500 space-y-1">
                  <p className="text-sm font-medium">All clear! No pending approvals.</p>
                  <p className="text-xs text-slate-405">Create invitations to onboard new employees into Blih ERP.</p>
                </div>
              ) : (
                inboxSubmissions.map((sub) => (
                  <div key={sub.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-all">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{sub.firstName} {sub.lastName}</h4>
                      <p className="text-xs text-slate-500 mt-1">{sub.email} • Code: <span className="font-mono text-slate-600">{sub.employeeCode || "NOT ASSIGNED"}</span></p>
                      
                    </div>

                    <button
                      type="button"
                      onClick={() => onNavigateToSection("submissions-detail", sub.id)}
                      className="px-3.5 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold rounded-lg border border-brand-100 transition-all cursor-pointer flex items-center gap-1 self-start md:self-center"
                    >
                      <span>Audits & Approvals</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick-start guides */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <button
              onClick={() => onNavigateToSection("invitations")}
              className="text-left p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-350 transition-all flex flex-col justify-between hover:shadow-xs group cursor-pointer"
            >
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-800 flex items-center justify-between">
                  <span>Create Employee Invitation</span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-800 transition-all" />
                </h4>
                <p className="text-xs text-slate-500 leading-normal">
                  Generate temporary tokens and send personalized self-service form links.
                </p>
              </div>
              <span className="text-[11px] font-mono font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded px-2.5 py-0.5 mt-4 self-start">
                Invitation Registry
              </span>
            </button>

            <button
              onClick={() => onNavigateToSection("submissions")}
              className="text-left p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-350 transition-all flex flex-col justify-between hover:shadow-xs group cursor-pointer"
            >
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-800 flex items-center justify-between">
                  <span>Audit Identity Documents</span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-800 transition-all" />
                </h4>
                <p className="text-xs text-slate-500 leading-normal">
                  Inspect secure employee identity documents and certificate uploads. Clear security limits.
                </p>
              </div>
              <span className="text-[11px] font-mono font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded px-2.5 py-0.5 mt-4 self-start">
                Submissions Table
              </span>
            </button>

          </div>

        </div>

        {/* Right Bento: Security Audit Log Timeline */}
        <div className="lg:col-span-5">
          <AuditLogTimeline logs={logs} />
        </div>

      </div>

    </div>
  );
};
