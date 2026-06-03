/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  ArrowLeft, 
  ShieldCheck, 
  User, 
  FileText, 
  Phone, 
  Users, 
  Landmark, 
  Briefcase, 
  MessageSquare,
  AlertOctagon,
  CheckCircle,
  FileSearch,
  Eye,
  Lock,
  Download
} from "lucide-react";
import { 
  EmployeeRecord, 
  IdentityDocumentStatus, 
  RoleKey, 
  EmploymentType, 
  EmploymentStatus 
} from "../types";
import { 
  getSubmissions, 
  approveSubmission, 
  requestOnboardingCorrection, 
  processDocumentVerification,
  DEMO_HR_EMAIL,
  downloadRecordAsCsv
} from "../services/store";
import { 
  SubmissionStatusBadge, 
  IdentityStatusBadge, 
  MaskedValue
} from "../components/UIComponents";
import { TextField, DateField, SelectField, MultiSelectRoles } from "../components/FormFields";

interface HrSubmissionDetailProps {
  id: string;
  onNavigateBack: () => void;
  onPostAction: () => void;
}

export const HrSubmissionDetail: React.FC<HrSubmissionDetailProps> = ({
  id,
  onNavigateBack,
  onPostAction,
}) => {
  const submissions = getSubmissions();
  const index = submissions.findIndex((s) => s.id === id);
  if (index === -1) {
    return (
      <div className="p-8 text-center bg-white border rounded-xl">
        <p className="text-slate-500">Employee record with ID {id} not found.</p>
        <button type="button" onClick={onNavigateBack} className="mt-4 text-brand-600 font-bold hover:underline">
          Go Back
        </button>
      </div>
    );
  }

  const initialRecord = submissions[index];
  const [record, setRecord] = useState<EmployeeRecord>({ ...initialRecord });
  
  // HR form field states (binds to company properties)
  const [empCode, setEmpCode] = useState(record.employeeCode || "");
  const [assignedRoles, setAssignedRoles] = useState<RoleKey[]>(record.roleKeys || ["EMPLOYEE"]);
  const [dept, setDept] = useState(record.departmentName || "");
  const [position, setPosition] = useState(record.positionName || "");
  const [manager, setManager] = useState(record.managerEmail || "");
  const [branchLocation, setBranchLocation] = useState(record.branch || "");
  const [empType, setEmpType] = useState<EmploymentType | "">(record.employmentType || "");
  const [empStatus, setEmpStatus] = useState<EmploymentStatus | "">(record.employmentStatus || "");
  const [hDate, setHDate] = useState(record.hireDate || "");
  const [probationEnd, setProbationEnd] = useState(record.probationEndDate || "");
  const [contractStart, setContractStart] = useState(record.contractStartDate || "");
  const [contractEnd, setContractEnd] = useState(record.contractEndDate || "");
  const [salary, setSalary] = useState<number | "">(record.monthlySalary || "");
  const [curr, setCurr] = useState(record.salaryCurrency || "USD");
  const [hrNotes, setHrNotes] = useState(record.additionalNotes || "");

  // Interactive comments / Workflow helpers
  const [docFeedback, setDocFeedback] = useState("");
  const [correctionFeedback, setCorrectionFeedback] = useState("");
  const [uiError, setUiError] = useState<string | null>(null);
  const [uiSuccess, setUiSuccess] = useState<string | null>(null);

  // Modal expander for ID document preview
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false);

  // Save the HR internal fields locally without final registry approval
  const handleSaveHrFieldsDraft = () => {
    setUiError(null);
    setUiSuccess(null);
    try {
      const submissionsList = getSubmissions();
      const currentIdx = submissionsList.findIndex((s) => s.id === id);
      if (currentIdx !== -1) {
        const salaryNum = salary === "" ? "" : Number(salary);
        submissionsList[currentIdx] = {
          ...submissionsList[currentIdx],
          employeeCode: empCode.trim(),
          roleKeys: assignedRoles,
          departmentName: dept.trim(),
          positionName: position.trim(),
          managerEmail: manager.trim(),
          branch: branchLocation.trim(),
          employmentType: empType,
          employmentStatus: empStatus,
          hireDate: hDate,
          probationEndDate: probationEnd,
          contractStartDate: contractStart,
          contractEndDate: contractEnd,
          monthlySalary: salaryNum,
          salaryCurrency: curr,
          additionalNotes: hrNotes.trim(),
        } as EmployeeRecord;
        localStorage.setItem("blih_erp_submissions", JSON.stringify(submissionsList));
        setUiSuccess("HR internal configuration parameters saved successfully.");
        setTimeout(() => setUiSuccess(null), 3000);
      }
    } catch (e: any) {
      setUiError(e.message || "Failed to save fields");
    }
  };

  // 1. Document verification actions
  const handleDocumentAction = (status: "VERIFIED" | "REJECTED" | "REPLACEMENT_REQUIRED") => {
    setUiError(null);
    setUiSuccess(null);

    // Rejection or replacement requires comment
    if ((status === "REJECTED" || status === "REPLACEMENT_REQUIRED") && !docFeedback.trim()) {
      setUiError("Please specify a reason comment for rejection or replacement request.");
      return;
    }

    try {
      const updated = processDocumentVerification(id, status, docFeedback, DEMO_HR_EMAIL);
      setRecord(updated);
      setDocFeedback("");
      setUiSuccess(`Identity document status set to: ${status}`);
      setTimeout(() => setUiSuccess(null), 3500);
    } catch (e: any) {
      setUiError(e.message);
    }
  };

  // 2. Correction Request Trigger
  const handleTriggerCorrection = () => {
    setUiError(null);
    setUiSuccess(null);

    if (!correctionFeedback.trim()) {
      setUiError("Correction request message comment cannot be empty.");
      return;
    }

    try {
      const updated = requestOnboardingCorrection(id, correctionFeedback, DEMO_HR_EMAIL);
      setRecord(updated);
      setCorrectionFeedback("");
      setUiSuccess("Correction notification sent to the employee. Link is reactivated.");
      setTimeout(() => {
        setUiSuccess(null);
        onPostAction();
      }, 2500);
    } catch (e: any) {
      setUiError(e.message);
    }
  };

  // 3. Final Form Approval
  const handleApproveSealed = () => {
    setUiError(null);
    setUiSuccess(null);

    // Validate salary currency / numbers
    const salaryNum = salary === "" ? 0 : Number(salary);
    if (isNaN(salaryNum) || salaryNum < 0) {
      setUiError("Monthly Salary must be a valid, positive scale.");
      return;
    }

    // Capture fields
    const fieldsToSubmit: Partial<EmployeeRecord> = {
      employeeCode: empCode.trim(),
      roleKeys: assignedRoles,
      departmentName: dept.trim(),
      positionName: position.trim(),
      managerEmail: manager.trim(),
      branch: branchLocation.trim(),
      employmentType: empType,
      employmentStatus: empStatus,
      hireDate: hDate,
      probationEndDate: probationEnd,
      contractStartDate: contractStart,
      contractEndDate: contractEnd,
      monthlySalary: salaryNum,
      salaryCurrency: curr,
      additionalNotes: hrNotes.trim(),
    };

    try {
      const approved = approveSubmission(id, fieldsToSubmit, DEMO_HR_EMAIL);
      setRecord(approved);
      downloadRecordAsCsv(approved, `Blih_ERP_Approved_${approved.firstName}_${approved.lastName}`);
      setUiSuccess("Employee record approved! CSV output updated automatically.");
      setTimeout(() => {
        setUiSuccess(null);
        onPostAction();
      }, 2500);
    } catch (e: any) {
      setUiError(e.message || "Failed to process approval checks.");
    }
  };

  const isApproved = record.status === "APPROVED";

  return (
    <div className="space-y-6">
      
      {/* Title block back nav */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-205 pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onNavigateBack}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all cursor-pointer bg-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">Onboarding Audit Workspace</h1>
              <SubmissionStatusBadge status={record.status} />
            </div>
            <p className="text-xs text-slate-505 mt-1">Reviewing submission file for {record.firstName} {record.lastName}</p>
          </div>
        </div>

        {isApproved && (
          <button
            type="button"
            onClick={() => downloadRecordAsCsv(record, `Blih_ERP_Approved_${record.firstName}_${record.lastName}`)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-850 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer shadow-xs border border-slate-850"
            title="Download the approved record in Blih ERP CSV format"
          >
            <Download className="w-4 h-4 text-slate-300" />
            <span>Download ERP CSV</span>
          </button>
        )}
      </div>

      {uiError && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-xl flex items-start gap-2.5">
          <AlertOctagon className="w-4.5 h-4.5 text-rose-500 shrink-0 mt-0.5" />
          <span>{uiError}</span>
        </div>
      )}

      {uiSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold rounded-xl flex items-start gap-2.5">
          <CheckCircle className="w-4.5 h-4.5 text-emerald-500 shrink-0 mt-0.5" />
          <span>{uiSuccess}</span>
        </div>
      )}

      {/* Split Columns Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Read-only Employee Form disclosures */}
        <div className="lg:col-span-6 space-y-6">
          
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5.5 space-y-5.5">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest font-mono flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
              <User className="w-4.5 h-4.5 text-slate-500" />
              Employee Disclosures
            </h2>

            {/* 1. PERSONAL */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-500 tracking-wider uppercase font-mono">1. Personal Information</h3>
              <div className="grid grid-cols-2 gap-4 text-xs font-medium p-3 bg-slate-50 rounded-lg border border-slate-150">
                <div>
                  <span className="text-slate-400 block text-[10px]">First Name</span>
                  <span className="text-slate-800 font-bold text-sm">{record.firstName || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Last Name</span>
                  <span className="text-slate-800 font-bold text-sm">{record.lastName || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Date of Birth</span>
                  <span className="text-slate-800 font-semibold">{record.dateOfBirth || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">City</span>
                  <span className="text-slate-800 font-semibold">{record.city || "N/A"}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block text-[10px]">Country of Birth</span>
                  <span className="text-slate-800 font-semibold">{record.countryOfBirth || "N/A"}</span>
                </div>
              </div>
            </div>

            {/* 2. CONTACT */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-500 tracking-wider uppercase font-mono">2. Contact Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium p-3 bg-slate-50 rounded-lg border border-slate-150">
                <div className="sm:col-span-2 border-b border-slate-200/50 pb-2">
                  <span className="text-slate-400 block text-[10px]">Work Email</span>
                  <span className="text-indigo-800 font-bold font-mono break-all">{record.email || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Primary Mobile</span>
                  <span className="text-slate-850 font-semibold">{record.phone || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Alternative Mobile</span>
                  <span className="text-slate-850 font-semibold">{record.additionalPhone || "N/A"}</span>
                </div>
              </div>
            </div>

            {/* 3. EMERGENCY CONTACT */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-505 tracking-wider uppercase font-mono">3. Emergency Contact</h3>
              <div className="grid grid-cols-2 gap-4 text-xs font-medium p-3 bg-slate-50 rounded-lg border border-slate-150">
                <div>
                  <span className="text-slate-400 block text-[10px]">First Name</span>
                  <span className="text-slate-800 font-bold">{record.emergencyFirstName || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Last Name</span>
                  <span className="text-slate-800 font-bold">{record.emergencyLastName || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Phone</span>
                  <span className="text-slate-800 font-semibold">{record.emergencyPhone || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Email</span>
                  <span className="text-slate-800 font-semibold truncate block" title={record.emergencyEmail}>{record.emergencyEmail || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">City</span>
                  <span className="text-slate-800 font-semibold">{record.emergencyCity || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Country</span>
                  <span className="text-slate-800 font-semibold">{record.emergencyCountry || "N/A"}</span>
                </div>
              </div>
            </div>

            {/* 4. BANK DETAILS (SECURE WORKSPACE ONLY) */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-slate-500 tracking-wider uppercase font-mono flex items-center gap-1">
                  <Landmark className="w-3.5 h-3.5" />
                  4. Bank registry details
                </h3>
                <span className="text-[10px] bg-red-100 text-red-800 px-2 py-0.5 rounded font-mono uppercase font-bold tracking-wider select-none">
                  HR Authorized Only
                </span>
              </div>
              
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-150 space-y-3">
                <div>
                  <span className="text-slate-400 block text-[10px]">Financial Depository Institution</span>
                  <span className="text-sm font-semibold text-slate-800 mt-0.5 block">{record.bankName || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] mb-1">Account Number</span>
                  <MaskedValue 
                    value={record.bankAccountNumber} 
                    type="BANK" 
                    entityName={`${record.firstName} ${record.lastName}`} 
                  />
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: HR Review Panel, Document Auditing, Employment Control Forms */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* B. Company-Controlled Employment configuration Form */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5.5 shadow-xs space-y-5">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest font-mono flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <Briefcase className="w-5 h-5 text-indigo-650" />
              Company-Controlled Employment Registry
            </h3>

            <div className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextField
                  id="hrEmpCode"
                  label="Employee Code"
                  required
                  disabled={isApproved}
                  value={empCode}
                  onChange={(val) => setEmpCode(val)}
                  placeholder="EMP-2026-X11"
                  helpText="Must be unique across Blih database records."
                />

                <DateField
                  id="hrHireDate"
                  label="Hire Date"
                  required
                  disabled={isApproved}
                  value={hDate}
                  onChange={(val) => setHDate(val)}
                  helpText="Start date representing HR contract triggers."
                />

                <TextField
                  id="hrDept"
                  label="Department Name"
                  disabled={isApproved}
                  value={dept}
                  onChange={(val) => setDept(val)}
                  placeholder="Software Engineering"
                />

                <TextField
                  id="hrPosition"
                  label="Position Name"
                  disabled={isApproved}
                  value={position}
                  onChange={(val) => setPosition(val)}
                  placeholder="Senior Lead Engineer"
                />

                <TextField
                  id="hrManager"
                  type="email"
                  label="Manager Email address"
                  disabled={isApproved}
                  value={manager}
                  onChange={(val) => setManager(val)}
                  placeholder="supervisor@blih-erp.com"
                />

                <TextField
                  id="hrBranch"
                  label="Assigned Branch Locality"
                  disabled={isApproved}
                  value={branchLocation}
                  onChange={(val) => setBranchLocation(val)}
                  placeholder="Addis Ababa HQ"
                />

                <SelectField
                  id="hrEmploymentType"
                  label="Employment Classification"
                  required
                  disabled={isApproved}
                  value={empType}
                  onChange={(val) => setEmpType(val as any)}
                  placeholder="Select class..."
                  options={[
                    { value: "full_time", label: "Full Time" },
                    { value: "part_time", label: "Part Time" },
                    { value: "contractor", label: "Contractor" },
                    { value: "intern", label: "Intern" },
                  ]}
                />

                <SelectField
                  id="hrEmploymentStatus"
                  label="Onboarding ERP Status"
                  required
                  disabled={isApproved}
                  value={empStatus}
                  onChange={(val) => setEmpStatus(val as any)}
                  placeholder="Select status..."
                  options={[
                    { value: "onboarding", label: "Onboarding" },
                    { value: "active", label: "Active" },
                    { value: "inactive", label: "Inactive" },
                    { value: "on_leave", label: "On Leave" },
                    { value: "terminated", label: "Terminated" },
                  ]}
                />

                <DateField
                  id="hrProbationDate"
                  label="Probation End date"
                  disabled={isApproved}
                  value={probationEnd}
                  onChange={(val) => setProbationEnd(val)}
                />

                <DateField
                  id="hrContractStart"
                  label="Contract Start Date"
                  disabled={isApproved}
                  value={contractStart}
                  onChange={(val) => setContractStart(val)}
                />

                <DateField
                  id="hrContractEnd"
                  label="Contract End Date"
                  disabled={isApproved}
                  value={contractEnd}
                  onChange={(val) => setContractEnd(val)}
                />

                <div className="grid grid-cols-1 gap-2 border border-slate-100 p-2.5 rounded bg-slate-50">
                  <div className="text-[11px] font-bold text-slate-500 uppercase">Monthly Salary Scale</div>
                  <div className="flex gap-2.5">
                    <input
                      type="number"
                      required
                      disabled={isApproved}
                      value={salary}
                      onChange={(e) => setSalary(e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder="5000"
                      className="w-full text-xs font-semibold px-2 py-1 border rounded bg-white"
                    />
                    <select
                      value={curr}
                      disabled={isApproved}
                      onChange={(e) => setCurr(e.target.value)}
                      className="text-xs font-semibold border rounded bg-white px-2"
                    >
                      <option value="USD">USD</option>
                      <option value="ETB">ETB</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <MultiSelectRoles
                  selectedRoles={assignedRoles}
                  onChange={(roles) => setAssignedRoles(roles)}
                  disabled={isApproved}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-505 block">Recruitment / General Administrative annotation notes</label>
                <textarea
                  value={hrNotes}
                  onChange={(e) => setHrNotes(e.target.value)}
                  disabled={isApproved}
                  placeholder="Add comments relating to salary band lookup or contract signing..."
                  rows={2}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs bg-white outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 disabled:bg-slate-50 disabled:cursor-not-allowed"
                />
              </div>

              {!isApproved && (
                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={handleSaveHrFieldsDraft}
                    className="flex-1 py-2 px-4 bg-slate-100 hover:bg-slate-205 border border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wide rounded-lg cursor-pointer transition-all"
                  >
                    Save Changes Draft
                  </button>
                  <button
                    type="button"
                    onClick={handleApproveSealed}
                    className="flex-1.5 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-555 font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm cursor-pointer transition-all flex items-center justify-center gap-1"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Approve & Seal Registry</span>
                  </button>
                </div>
              )}

              {isApproved && (
                <div className="p-3.5 bg-emerald-50 text-emerald-800 border border-emerald-150 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold leading-normal">
                  <Lock className="w-4 h-4 text-emerald-600" />
                  <span>Approved for ERP Sync on {record.approvedAt ? new Date(record.approvedAt).toLocaleDateString() : ""}</span>
                </div>
              )}

            </div>
          </div>

          {/* C. Request Correction Form */}
          {!isApproved && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5.5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                <MessageSquare className="w-5 h-5 text-rose-500 shrink-0" />
                <h3 className="text-sm font-bold text-slate-805 uppercase tracking-widest font-mono">Correction Request Service</h3>
              </div>
              
              <div className="space-y-4">
                <p className="text-xs text-slate-500 leading-normal">
                  Send this file back to the employee for correction. This rolls back form locks and prompts workers with the correction commentary outlined below.
                </p>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-505 block">Correction Message Checklist Instructions</label>
                  <textarea
                    value={correctionFeedback}
                    onChange={(e) => setCorrectionFeedback(e.target.value)}
                    placeholder="e.g. Please crop the ID card scan borders. Specify exact corrections..."
                    rows={3}
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs bg-white outline-none focus:border-brand-505 focus:ring-1 focus:ring-brand-505"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleTriggerCorrection}
                  className="w-full py-2 bg-rose-550 hover:bg-rose-650 border border-rose-600 text-white font-bold text-xs uppercase tracking-wide rounded-lg cursor-pointer transition-all"
                >
                  Request Corrections
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
