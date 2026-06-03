/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  UserPlus, 
  Send, 
  Trash2, 
  Copy, 
  Check, 
  Calendar, 
  Search, 
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Ban
} from "lucide-react";
import { 
  getInvitations, 
  createInvitation, 
  revokeInvitation, 
  resendInvitation,
  saveSubmissions,
  saveInvitations
} from "../services/store";
import { Invitation } from "../types";
import { TextField } from "../components/FormFields";

interface HrInvitationsProps {
  onNavigateToToken: (token: string) => void;
}

export const HrInvitations: React.FC<HrInvitationsProps> = ({ onNavigateToToken }) => {
  const [invitations, setInvitations] = useState<Invitation[]>(getInvitations());
  const [searchQuery, setSearchQuery] = useState("");
  
  // State for Create Invitation Form
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  
  // Form status / validation helpers
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [copiedTokenId, setCopiedTokenId] = useState<string | null>(null);

  const reloadList = () => {
    setInvitations(getInvitations());
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!code.trim()) return setFormError("Employee Code is required.");
    if (!email.trim()) return setFormError("Employee Work Email is required.");
    if (!firstName.trim()) return setFormError("First Name is required.");
    if (!lastName.trim()) return setFormError("Last Name is required.");

    try {
      const payload = {
        employeeCode: code.toUpperCase().trim(),
        employeeEmail: email.trim().toLowerCase(),
        employeeFirstName: firstName.trim(),
        employeeLastName: lastName.trim(),
      };

      const newInvite = createInvitation(payload);
      setFormSuccess(`Onboarding link created successfully for ${payload.employeeFirstName}!`);
      
      // Clear Form
      setCode("");
      setEmail("");
      setFirstName("");
      setLastName("");
      
      reloadList();
      
      setTimeout(() => setFormSuccess(null), 5000);
    } catch (err: any) {
      setFormError(err.message || "Failed to issue invitation.");
    }
  };

  const handleResend = (id: string) => {
    try {
      resendInvitation(id);
      reloadList();
    } catch (e: any) {
      alert("Error resending: " + e.message);
    }
  };

  const handleRevoke = (id: string) => {
    if (confirm("Are you sure you want to revoke this onboarding invitation? The employee will no longer be able to submit their information using this link.")) {
      try {
        revokeInvitation(id);
        reloadList();
      } catch (e: any) {
        alert("Error revoking: " + e.message);
      }
    }
  };

  // Helper to compile a link
  const getFullSecureLink = (token: string, hashMode = true) => {
    const origin = window.location.origin;
    const path = window.location.pathname === "/" ? "" : window.location.pathname;
    const delimiter = hashMode ? "#" : "";
    return `${origin}${path}${delimiter}/employee-information/${token}`; // works with react hash/state routing beautifully
  };

  const handleCopyLink = (token: string, inviteId: string) => {
    const link = getFullSecureLink(token);
    navigator.clipboard.writeText(link);
    setCopiedTokenId(inviteId);
    setTimeout(() => setCopiedTokenId(null), 2000);
  };

  // Filtering
  const filteredInvitations = invitations.filter((inv) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      inv.employeeEmail.toLowerCase().includes(searchLower) ||
      inv.employeeFirstName.toLowerCase().includes(searchLower) ||
      inv.employeeLastName.toLowerCase().includes(searchLower) ||
      inv.employeeCode.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Page Title Header */}
      <div className="border-b border-slate-205 pb-4.5">
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">Onboarding Invitation Center</h1>
        <p className="text-xs text-slate-500 mt-1">Issue unique, expiring self-service tokens to newly pre-hired workers so they can disclose sensitive details securely.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Create Invitation Form Card */}
        <div className="lg:col-span-4">
          <form onSubmit={handleCreateSubmit} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-805">Issue Onboarding Link</h3>
            </div>

            <div className="p-5 space-y-4">
              
              {formError && (
                <div className="text-xs p-3 bg-rose-50 border border-rose-150 rounded-lg text-rose-700 flex items-start gap-1.5 font-semibold">
                  <span>{formError}</span>
                </div>
              )}

              {formSuccess && (
                <div className="text-xs p-3 bg-emerald-50 border border-emerald-150 rounded-lg text-emerald-800 flex items-start gap-1.5 font-semibold animate-bounce">
                  <span>{formSuccess}</span>
                </div>
              )}

              <TextField
                id="inviteCode"
                label="Assigned Employee Code"
                required
                value={code}
                onChange={(val) => setCode(val)}
                placeholder="EMP-2026-X11"
                helpText="Must be entirely unique inside Blih ERP."
              />

              <TextField
                id="inviteEmail"
                type="email"
                label="Employee Primary Email"
                required
                value={email}
                onChange={(val) => setEmail(val)}
                placeholder="jane.doe@work.com"
                helpText="Invitation link is linked to this workspace identity."
              />

              <div className="grid grid-cols-2 gap-3.5">
                <TextField
                  id="inviteFirstName"
                  label="First Name"
                  required
                  value={firstName}
                  onChange={(val) => setFirstName(val)}
                  placeholder="Jane"
                />
                <TextField
                  id="inviteLastName"
                  label="Last Name"
                  required
                  value={lastName}
                  onChange={(val) => setLastName(val)}
                  placeholder="Doe"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-2 px-4 bg-indigo-650 hover:bg-indigo-750 text-white font-bold text-xs rounded-lg uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Send className="w-4 h-4" />
                <span>Publish Secure Link</span>
              </button>

            </div>
          </form>
        </div>

        {/* Right Side: Search and List Cards */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Filtering bar */}
          <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-xs flex flex-col md:flex-row gap-3.5 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search email, name or code..."
                className="w-full text-xs font-normal border border-slate-300 rounded-lg pl-9.5 pr-4 py-2 bg-white outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-slate-800"
              />
            </div>
            
            <button
              type="button"
              onClick={reloadList}
              className="text-xs font-bold text-slate-500 hover:text-slate-850 flex items-center gap-1.5 hover:underline cursor-pointer bg-transparent"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Registry</span>
            </button>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-505 uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Employee Details</th>
                    <th className="py-3 px-4">Secure Link Token</th>
                    <th className="py-3 px-4">Sent</th>
                    <th className="py-3 px-4 header-align">Security Limits</th>
                    <th className="py-3 px-4">Link Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150">
                  {filteredInvitations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        No onboarding invitations matched your queries.
                      </td>
                    </tr>
                  ) : (
                    filteredInvitations.map((inv) => {
                      const isCcCopied = copiedTokenId === inv.id;
                      const isRevoked = inv.status === "REVOKED";
                      const isUsed = inv.status === "USED";
                      const isExpired = new Date(inv.expiresAt) < new Date();

                      let statusBadge = (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-emerald-100 text-emerald-800 border border-emerald-200 select-none">
                          Active
                        </span>
                      );
                      if (isUsed) {
                        statusBadge = (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-slate-100 text-slate-500 border border-slate-200 select-none">
                            Consumed
                          </span>
                        );
                      } else if (isRevoked) {
                        statusBadge = (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase bg-rose-50 text-rose-700 border border-rose-100 select-none">
                            Revoked
                          </span>
                        );
                      } else if (isExpired) {
                        statusBadge = (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase bg-amber-50 text-amber-700 border border-amber-100 select-none">
                            Expired
                          </span>
                        );
                      }

                      return (
                        <tr key={inv.id} className="hover:bg-slate-50/50 transition-all">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-800">
                              {inv.employeeFirstName} {inv.employeeLastName}
                            </div>
                            <div className="text-slate-500 mt-1">{inv.employeeEmail}</div>
                            <div className="text-[10px] text-slate-400 font-mono mt-1">Code: {inv.employeeCode}</div>
                          </td>
                          <td className="py-3.5 px-4 max-w-xs">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[11px] text-slate-600 truncate max-w-[140px]" title={inv.token}>
                                {inv.token}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyLink(inv.token, inv.id)}
                                className={`p-1 rounded transition-all cursor-pointer ${isCcCopied ? "text-emerald-600 bg-emerald-50" : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"}`}
                                title="Copy portal link address"
                              >
                                {isCcCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                            {/* Simulator Travel button */}
                            {!isRevoked && (
                              <button
                                type="button"
                                onClick={() => onNavigateToToken(inv.token)}
                                className="mt-1.5 flex items-center gap-1 text-[10px] text-indigo-650 hover:text-indigo-850 hover:underline font-bold"
                              >
                                <span>Simulate travel</span>
                                <ExternalLink className="w-3 h-3" />
                              </button>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-medium text-slate-600">
                            {inv.sentCount} time(s)
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="text-[11px] text-slate-505 flex items-center gap-1 mb-1">
                              <Calendar className="w-3.5 h-3.5 shrink-0" />
                              <span>Expires on:</span>
                            </div>
                            <span className="font-mono font-medium text-slate-700 text-[10px]">
                              {new Date(inv.expiresAt).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="py-1 px-4 align-middle">
                            {statusBadge}
                          </td>
                          <td className="py-3.5 px-4 text-right space-y-1 md:space-y-0 md:space-x-1.5">
                            {!isUsed && !isRevoked && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleResend(inv.id)}
                                  className="px-2 py-1 text-[11px] font-bold text-indigo-700 hover:bg-indigo-50 border border-indigo-100 hover:border-indigo-200 rounded transition-all cursor-pointer"
                                  title="Extend expiration and increment delivery"
                                >
                                  Resend
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRevoke(inv.id)}
                                  className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded transition-all inline-flex items-center justify-center align-middle cursor-pointer"
                                  title="Revoke access token"
                                >
                                  <Ban className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            {isRevoked && (
                              <span className="text-[11px] text-slate-400 italic">No Actions</span>
                            )}
                            {isUsed && (
                              <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-medium">Locked</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
