/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Search, 
  Filter, 
  ExternalLink,
  PlusCircle,
  Clock,
  ClipboardList,
  CheckCircle2,
  FileCheck,
  Building
} from "lucide-react";
import { getSubmissions } from "../services/store";
import { EmployeeRecord, EmployeeSubmissionStatus, IdentityDocumentStatus } from "../types";
import { SubmissionStatusBadge, IdentityStatusBadge, CsvExportButton } from "../components/UIComponents";

interface HrSubmissionsProps {
  onNavigateToSection: (section: "invitations" | "submissions" | "submissions-detail", id?: string) => void;
}

export const HrSubmissions: React.FC<HrSubmissionsProps> = ({ onNavigateToSection }) => {
  const [records, setRecords] = useState<EmployeeRecord[]>(getSubmissions());
  
  // Filtering states
  const [searchQuery, setSearchQuery] = useState("");
  const [subStatusFilter, setSubStatusFilter] = useState<EmployeeSubmissionStatus | "ALL">("ALL");
  
  // Selection state for exporting custom arrays
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleRowSelectToggle = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleAllSelectToggle = (visibleRecords: EmployeeRecord[]) => {
    const visibleIds = visibleRecords.map((r) => r.id);
    const allSelected = visibleIds.every((id) => selectedIds.includes(id));
    
    if (allSelected) {
      // Deselect visible
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      // Select visible
      setSelectedIds((prev) => {
        const unique = new Set([...prev, ...visibleIds]);
        return Array.from(unique);
      });
    }
  };

  // Perform full array filtering
  const filteredRecords = records.filter((rec) => {
    const searchLower = searchQuery.toLowerCase();
    
    const matchesSearch = 
      (rec.firstName + " " + rec.lastName).toLowerCase().includes(searchLower) ||
      rec.email.toLowerCase().includes(searchLower) ||
      rec.employeeCode.toLowerCase().includes(searchLower) ||
      rec.departmentName.toLowerCase().includes(searchLower) ||
      rec.positionName.toLowerCase().includes(searchLower);

    const matchesSubState = subStatusFilter === "ALL" || rec.status === subStatusFilter;

    return matchesSearch && matchesSubState;
  });

  // Approved records only for primary export button
  const approvedRecords = records.filter((r) => r.status === "APPROVED");
  
  // Custom checked records
  const selectedRecordsToExport = records.filter((r) => selectedIds.includes(r.id));

  return (
    <div className="space-y-6">
      
      {/* Page Title & Stats Ribbon */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-205 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Onboarding Submission Registry</h1>
          <p className="text-xs text-slate-500 mt-1">Audit onboarding files, inspect identity uploads, and configure Blih employment parameters.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Custom selected export */}
          <CsvExportButton
            records={selectedRecordsToExport}
            selectedOnly
            variant={selectedRecordsToExport.length > 0 ? "primary" : "secondary"}
          />
          
          <CsvExportButton
            records={approvedRecords}
            variant="secondary"
          />
        </div>
      </div>

      {/* Advanced Filter Criteria Hub */}
      <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-xs space-y-4">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wide">
          <Filter className="w-4 h-4 text-slate-500" />
          <span>Filter Criteria</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-500 font-medium">Query Text Search</span>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, code, department, position..."
                className="w-full text-xs font-normal border border-slate-300 rounded-lg pl-9.5 pr-4 py-1.5 bg-white outline-none focus:border-brand-505 focus:ring-1 focus:ring-brand-505 transition-all text-slate-850"
              />
            </div>
          </div>

          {/* Submission Status filter */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-550 block">Form Submission Status</label>
            <select
              value={subStatusFilter}
              onChange={(e) => setSubStatusFilter(e.target.value as any)}
              className="w-full text-xs border border-slate-300 rounded-lg px-3 py-1.5 bg-white outline-none focus:border-brand-505 focus:ring-1 focus:ring-brand-505 text-slate-800"
            >
              <option value="ALL">All States</option>
              <option value="DRAFT">Draft</option>
              <option value="SUBMITTED">Submitted (Active Queue)</option>
              <option value="NEEDS_CORRECTION">Needs Correction</option>
              <option value="APPROVED">Approved (Sealed)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Submissions List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-505 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={
                      filteredRecords.length > 0 &&
                      filteredRecords.every((r) => selectedIds.includes(r.id))
                    }
                    onChange={() => handleAllSelectToggle(filteredRecords)}
                    className="w-4 h-4 rounded border-slate-350 text-brand-600 focus:ring-brand-500 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-4">Employee Identity</th>
                <th className="py-3 px-4">Work Code</th>
                <th className="py-3 px-4">Enterprise Position</th>
                <th className="py-3 px-4">Forms Progress</th>
                <th className="py-3 px-4">Submitted Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No employee submissions matched the specified filter criteria.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => {
                  const isChecked = selectedIds.includes(rec.id);
                  const isDraft = rec.status === "DRAFT";
                  
                  return (
                    <tr 
                      key={rec.id} 
                      className={`hover:bg-slate-50/50 transition-all ${isChecked ? "bg-indigo-50/25" : ""}`}
                    >
                      <td className="py-3.5 px-4">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleRowSelectToggle(rec.id)}
                          className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                        />
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800">
                          {rec.firstName} {rec.lastName}
                        </div>
                        <div className="text-slate-500 font-mono mt-0.5 break-all">{rec.email}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                        {rec.employeeCode || <span className="text-slate-400 text-[10px]">UNASSIGNED</span>}
                      </td>
                      <td className="py-3.5 px-4 space-y-1">
                        <div className="flex items-center gap-1 font-semibold text-slate-850">
                          <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{rec.departmentName || "Unassigned"}</span>
                        </div>
                        <div className="text-slate-450">{rec.positionName || "Standard Associate"}</div>
                      </td>
                      <td className="py-3 px-4 align-middle">
                        <SubmissionStatusBadge status={rec.status} />
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-mono">
                        {rec.submittedAt ? (
                          <div className="font-medium text-slate-700">
                            {new Date(rec.submittedAt).toLocaleDateString()}
                            <span className="block text-[10px] text-slate-400 mt-0.5 font-normal">
                              {new Date(rec.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-405 italic">Incomplete</span>
                        )}
                      </td>
                      
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => onNavigateToSection("submissions-detail", rec.id)}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer inline-flex items-center gap-1
                            ${isDraft 
                              ? "bg-slate-50 hover:bg-slate-100 text-slate-605 border-slate-200" 
                              : "bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-100 hover:border-indigo-200"
                            }
                          `}
                        >
                          <span>{isDraft ? "View Info" : "Review Submissions"}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Table summary info */}
        <div className="px-5 py-3 border-t border-slate-150 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center text-slate-505 gap-2">
          <span>
            Showing <b>{filteredRecords.length}</b> of <b>{records.length}</b> employee files.
          </span>
          {selectedIds.length > 0 && (
            <span className="font-semibold text-indigo-700">
              {selectedIds.length} records selected to custom bulk import download.
            </span>
          )}
        </div>
      </div>

    </div>
  );
};
