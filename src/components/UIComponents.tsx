/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Eye, 
  EyeOff, 
  Download, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  RotateCcw
} from "lucide-react";
import { 
  EmployeeSubmissionStatus, 
  IdentityDocumentStatus, 
  EmployeeRecord, 
  AuditLog 
} from "../types";
import { 
  maskBankAccountNumber, 
  maskIdentityNumber, 
  generateBlihErpCsv, 
  addAuditLog, 
  DEMO_HR_EMAIL 
} from "../services/store";

// 1. SUBMISSION STATUS BADGE
export const SubmissionStatusBadge: React.FC<{ status: EmployeeSubmissionStatus }> = ({ status }) => {
  const styles: Record<EmployeeSubmissionStatus, { bg: string; text: string; label: string; icon: any }> = {
    DRAFT: {
      bg: "bg-slate-100 text-slate-705",
      text: "text-slate-700",
      label: "Draft",
      icon: Clock
    },
    SUBMITTED: {
      bg: "bg-blue-50 text-blue-700 border-blue-200",
      text: "text-blue-700",
      label: "Submitted",
      icon: Clock
    },
    NEEDS_CORRECTION: {
      bg: "bg-rose-50 text-rose-700 border-rose-200 animate-pulse",
      text: "text-rose-700",
      label: "Needs Correction",
      icon: ShieldAlert
    },
    APPROVED: {
      bg: "bg-emerald-50 text-emerald-700 border-emerald-100",
      text: "text-emerald-700",
      label: "Approved",
      icon: CheckCircle2
    }
  };

  const config = styles[status] || styles.DRAFT;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${config.bg}`}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
};

// 2. IDENTITY STATUS BADGE
export const IdentityStatusBadge: React.FC<{ status: IdentityDocumentStatus }> = ({ status }) => {
  const styles: Record<IdentityDocumentStatus, { bg: string; text: string; label: string }> = {
    PENDING: {
      bg: "bg-amber-50 text-amber-700 border-amber-200",
      text: "text-amber-700",
      label: "Pending Review"
    },
    VERIFIED: {
      bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
      text: "text-emerald-700",
      label: "Verified"
    },
    REJECTED: {
      bg: "bg-rose-50 text-rose-700 border-rose-200",
      text: "text-rose-700",
      label: "Rejected"
    },
    REPLACEMENT_REQUIRED: {
      bg: "bg-pink-50 text-pink-700 border-pink-200",
      text: "text-pink-700",
      label: "Replacement Required"
    }
  };

  const config = styles[status] || styles.PENDING;

  return (
    <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-md border ${config.bg}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 shrink-0" />
      {config.label}
    </span>
  );
};

// 3. SECURE REVEAL MASKED VALUE
interface MaskedValueProps {
  value: string;
  type: "IDENTITY" | "BANK";
  entityName: string; // for audit logs
}

export const MaskedValue: React.FC<MaskedValueProps> = ({ value, type, entityName }) => {
  const [revealed, setRevealed] = useState(false);

  const handleRevealToggle = () => {
    const nextState = !revealed;
    setRevealed(nextState);

    if (nextState) {
      // Record reveal action in the audit logs
      const maskType = type === "IDENTITY" ? "Identity Document Number" : "Bank Account Number";
      addAuditLog(
        DEMO_HR_EMAIL,
        "DOCUMENT_VERIFY", // Maps to audit validation scope
        `Authorized reveal of sensitive ${maskType} for employee record "${entityName}"`
      );
    }
  };

  const displayValue = revealed
    ? value
    : type === "IDENTITY"
    ? maskIdentityNumber(value)
    : maskBankAccountNumber(value);

  return (
    <div className="flex items-center gap-2 font-mono text-sm bg-slate-100/80 border border-slate-200 px-3 py-1.5 rounded-lg select-all">
      <span className="text-slate-800 tracking-wider font-semibold">
        {displayValue || "UNSPECIFIED"}
      </span>
      {value && (
        <button
          type="button"
          onClick={handleRevealToggle}
          className="text-slate-500 hover:text-slate-800 p-1 rounded transition-all ml-auto hover:bg-slate-200 cursor-pointer"
          title={revealed ? "Cover sensitive digits" : "Reveal full number"}
        >
          {revealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      )}
    </div>
  );
};

// 4. CORRECTION REQUEST HIGHLIGHT INSTRUCTIONS
interface CorrectionMessageProps {
  message: string;
  requestedAt: string | null;
}

export const CorrectionMessage: React.FC<CorrectionMessageProps> = ({ message, requestedAt }) => {
  if (!message) return null;

  return (
    <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 text-rose-900 flex gap-3.5 items-start">
      <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center text-rose-600 shrink-0 mt-0.5">
        <AlertTriangle className="w-5.5 h-5.5" />
      </div>
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="text-sm font-semibold text-rose-850">HR Guidance Action Required</h4>
          {requestedAt && (
            <span className="text-[11px] text-rose-600 bg-white border border-rose-100 px-2 py-0.5 rounded">
              Requested {new Date(requestedAt).toLocaleString()}
            </span>
          )}
        </div>
        <p className="text-sm text-rose-700 mt-1 leading-relaxed">
          {message}
        </p>
      </div>
    </div>
  );
};

// 5. BLIH ERP EXCEL COMPATIBLE CSV EXPORT BUTTON
interface CsvExportButtonProps {
  records: EmployeeRecord[];
  onExportDone?: () => void;
  variant?: "primary" | "secondary";
  selectedOnly?: boolean;
}

export const CsvExportButton: React.FC<CsvExportButtonProps> = ({ 
  records, 
  onExportDone, 
  variant = "primary",
  selectedOnly = false
}) => {
  const handleExport = () => {
    if (records.length === 0) return;

    try {
      const csvContent = generateBlihErpCsv(records);
      const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" }); // BOM for Excel UTF-8 support
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      
      const countLabel = records.length === 1 ? "1_record" : `${records.length}_records`;
      const dateStr = new Date().toISOString().slice(0, 10);
      
      link.setAttribute("href", url);
      link.setAttribute("download", `Blih_ERP_Bulk_Import_${countLabel}_${dateStr}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Log the export event
      addAuditLog(
        DEMO_HR_EMAIL,
        "CSV_EXPORT",
        `Exported Blih ERP bulk import CSV containing ${records.length} record(s).`
      );

      if (onExportDone) onExportDone();
    } catch (e: any) {
      alert("An error occurred during CSV compiling: " + e.message);
    }
  };

  const disabled = records.length === 0;

  const styleClasses = variant === "primary"
    ? `flex items-center gap-2 justify-center bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg shadow-sm border border-emerald-500 hover:border-emerald-600 focus:outline-none transition-all cursor-pointer ${disabled ? "opacity-50 cursor-not-allowed" : ""}`
    : `flex items-center gap-2 justify-center bg-white hover:bg-slate-50 text-slate-700 font-medium py-2 px-4 rounded-lg border border-slate-200 focus:outline-none transition-all cursor-pointer ${disabled ? "opacity-50 cursor-not-allowed" : ""}`;

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={disabled}
      className={styleClasses}
      title={disabled ? "No approved submissions available for export" : "Download compatible bulk import file"}
    >
      <Download className="w-4 h-4" />
      <span>{selectedOnly ? `Export Selected (${records.length})` : `Export All Approved (${records.length})`}</span>
    </button>
  );
};

// 6. CONFIRMATION SERVICE DIALOG MODAL
interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: "danger" | "success" | "info";
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText,
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  type = "info"
}) => {
  if (!isOpen) return null;

  const themeColors = {
    danger: {
      button: "bg-rose-600 hover:bg-rose-700 border-rose-500 hover:border-rose-600 text-white",
      iconBg: "bg-rose-100 text-rose-600",
      icon: ShieldAlert
    },
    success: {
      button: "bg-emerald-600 hover:bg-emerald-700 border-emerald-500 hover:border-emerald-600 text-white",
      iconBg: "bg-emerald-100 text-emerald-600",
      icon: CheckCircle2
    },
    info: {
      button: "bg-brand-600 hover:bg-brand-700 border-brand-50n text-white",
      iconBg: "bg-blue-100 text-blue-600",
      icon: Clock
    }
  };

  const styles = themeColors[type] || themeColors.info;
  const DialogIcon = styles.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-slate-100 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 flex gap-4">
          <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${styles.iconBg}`}>
            <DialogIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">{title}</h3>
            <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="bg-slate-50 px-5 py-3.5 flex justify-end gap-2.5 border-t border-slate-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-all cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium rounded-lg border shadow-xs transition-all cursor-pointer ${styles.button}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// 7. PUBLIC AUDIT TRAIL LOG LISTING
export const AuditLogTimeline: React.FC<{ logs: AuditLog[] }> = ({ logs }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
      <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Security Audit Log</h3>
          <p className="text-xs text-slate-500">Chronological history of identity and bank verification actions</p>
        </div>
        <span className="text-xs shrink-0 font-semibold px-2 py-0.5 rounded bg-slate-250 text-slate-600 font-mono">
          {logs.length} Audited Events
        </span>
      </div>
      
      <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
        {logs.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            No logged auditing actions recorded.
          </div>
        ) : (
          logs.map((log) => {
            // style mapping
            const colorMap: Record<AuditLog["action"], string> = {
              DOCUMENT_VERIFY: "text-emerald-600 bg-emerald-50 border-emerald-100",
              DOCUMENT_REJECT: "text-rose-600 bg-rose-50 border-rose-105",
              DOCUMENT_REPLACEMENT: "text-amber-600 bg-amber-50 border-amber-100",
              SUBMISSION_APPROVE: "text-blue-600 bg-blue-50 border-blue-100",
              CORRECTION_REQUEST: "text-pink-600 bg-pink-50 border-pink-101",
              CSV_EXPORT: "text-teal-600 bg-teal-50 border-teal-100",
              INVITATION_CREATE: "text-indigo-650 bg-indigo-50 border-indigo-100",
              INVITATION_REVOKE: "text-red-600 bg-red-50 border-red-100",
              INVITATION_RESEND: "text-purple-600 bg-purple-50 border-purple-100",
              SUBMISSION_SAVE_DRAFT: "text-slate-500 bg-slate-50 border-slate-100",
              SUBMISSION_SUBMIT: "text-cyan-600 bg-cyan-50 border-cyan-100",
            };

            return (
              <div key={log.id} className="p-4 hover:bg-slate-50/80 transition-all text-xs flex gap-3.5 items-start">
                <span className={`px-2 py-0.5 rounded-sm font-mono font-semibold uppercase text-[10px] tracking-wide border ${colorMap[log.action] || "bg-slate-100 text-slate-600"}`}>
                  {log.action.replace("_", " ")}
                </span>
                
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="text-slate-700 font-normal leading-relaxed break-words">{log.details}</p>
                  <p className="text-[10px] text-slate-405 font-mono flex items-center gap-2">
                    <span className="font-semibold text-slate-600">{log.userEmail}</span>
                    <span>•</span>
                    <span>{new Date(log.timestamp).toLocaleString()}</span>
                    {log.ipAddress && (
                      <>
                        <span>•</span>
                        <span>IP: {log.ipAddress}</span>
                      </>
                    )}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
