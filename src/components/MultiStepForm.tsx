/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  Send, 
  User, 
  UserCheck, 
  PhoneCall, 
  Users, 
  Landmark, 
  Briefcase, 
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  Download
} from "lucide-react";
import { EmployeeRecord, RoleKey } from "../types";
import { 
  TextField, 
  DateField, 
  SelectField, 
  FileUploadField 
} from "./FormFields";
import { 
  CorrectionMessage, 
  SubmissionStatusBadge, 
  IdentityStatusBadge,
  MaskedValue
} from "./UIComponents";
import { saveEmployeeDraft, submitEmployeeForm, maskBankAccountNumber, downloadRecordAsCsv } from "../services/store";

interface MultiStepFormProps {
  initialRecord: EmployeeRecord;
  onSubmissionComplete: (updatedRecord: EmployeeRecord) => void;
}

// Fixed evaluation date base
const TODAY_STR = "2026-06-03";

export const MultiStepForm: React.FC<MultiStepFormProps> = ({
  initialRecord,
  onSubmissionComplete,
}) => {
  const [record, setRecord] = useState<EmployeeRecord>({ ...initialRecord });
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveStatus, setSaveStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Steps declaration
  const steps = [
    { number: 1, label: "Personal", icon: User },
    { number: 2, label: "Contact", icon: PhoneCall },
    { number: 3, label: "Emergency", icon: Users },
    { number: 4, label: "Bank Details", icon: Landmark },
    { number: 5, label: "Job Review", icon: Briefcase },
    { number: 6, label: "Confirm", icon: ClipboardCheck },
  ];

  // Universal updater helper
  const updateField = (field: keyof EmployeeRecord, value: any) => {
    setRecord((prev) => ({ ...prev, [field]: value }));
    // Clear error for that field
    if (errors[field as string]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field as string];
        return copy;
      });
    }
  };

  // Validators per step
  const validateStep = (stepNum: number): boolean => {
    const stepErrors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (stepNum === 1) {
      if (!record.firstName.trim()) stepErrors.firstName = "First name is required.";
      if (!record.lastName.trim()) stepErrors.lastName = "Last name is required.";
      if (!record.dateOfBirth) stepErrors.dateOfBirth = "Date of birth is required.";
      if (!record.city.trim()) stepErrors.city = "City is required.";
      if (!record.countryOfBirth.trim()) stepErrors.countryOfBirth = "Country of birth is required.";
    }

    if (stepNum === 2) {
      if (!record.email.trim()) {
        stepErrors.email = "Work email address is required.";
      } else if (!emailRegex.test(record.email.trim())) {
        stepErrors.email = "Please input a valid email formatting.";
      }
      if (!record.phone.trim()) stepErrors.phone = "Phone number is required for notification.";
    }

    if (stepNum === 3) {
      if (!record.emergencyFirstName.trim()) stepErrors.emergencyFirstName = "First name is required.";
      if (!record.emergencyLastName.trim()) stepErrors.emergencyLastName = "Last name is required.";
      if (!record.emergencyPhone.trim()) stepErrors.emergencyPhone = "Emergency contact phone is required.";
      
      if (record.emergencyEmail.trim() && !emailRegex.test(record.emergencyEmail.trim())) {
        stepErrors.emergencyEmail = "Emergency email must be in a valid format (or left empty).";
      }
    }

    if (stepNum === 4) {
      if (!record.bankName.trim()) stepErrors.bankName = "Bank organization name is required.";
      if (!record.bankAccountNumber.trim()) {
        stepErrors.bankAccountNumber = "Account number is required to routing direct deposits.";
      }
    }

    // Step 5 (Employment review) has no input fields for employee (Read-only review page)
    
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setSaveStatus(null);
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    }
  };

  const handlePrev = () => {
    setSaveStatus(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSaveDraft = () => {
    try {
      // For drafts, we do not strictly enforce validation, let them capture what they have completed!
      // This increases form-fill completions.
      // Normalize email if filled
      const normalizedRecord = {
        ...record,
        email: record.email.trim().toLowerCase(),
      };

      saveEmployeeDraft(record.id, normalizedRecord);
      setRecord(normalizedRecord);
      
      setSaveStatus({ type: "success", text: "Progress saved! You can close this window and resume anytime." });
      setErrors({});
      
      setTimeout(() => setSaveStatus(null), 5500);
    } catch (e: any) {
      setSaveStatus({ type: "error", text: e.message || "Failed to save draft." });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate ALL preceding steps to guarantee zero errors
    let isValid = true;
    for (let s = 1; s <= steps.length; s++) {
      if (!validateStep(s)) {
        setCurrentStep(s);
        isValid = false;
        break;
      }
    }

    if (!isValid) return;

    try {
      const submitted = submitEmployeeForm(record.id, record);
      setRecord(submitted);
      downloadRecordAsCsv(submitted, `Blih_ERP_Submission_${submitted.firstName}_${submitted.lastName}`);
      onSubmissionComplete(submitted);
    } catch (e: any) {
      alert("Submission Error: " + e.message);
    }
  };

  const isFormLocked = record.status === "SUBMITTED" || record.status === "APPROVED";

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      
      {/* Sticky Top Status & Correction Warning Bar */}
      <div className="flex flex-col gap-3">
        {record.status === "NEEDS_CORRECTION" && (
          <CorrectionMessage 
            message={record.correctionMessage} 
            requestedAt={record.correctionRequestedAt} 
          />
        )}

        <div className="bg-white rounded-xl border border-slate-200 p-4.5 flex items-center justify-between gap-4 shadow-xs">
          <div className="space-y-0.5">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">Form Status</h2>
            <div className="flex items-center gap-2 mt-1">
              <SubmissionStatusBadge status={record.status} />
              {isFormLocked && (
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  • Locked on {record.submittedAt ? new Date(record.submittedAt).toLocaleDateString() : ""}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            {!isFormLocked && (
              <button
                type="button"
                onClick={handleSaveDraft}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-slate-200 hover:border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-all cursor-pointer bg-white"
              >
                <Save className="w-4 h-4 text-slate-500" />
                <span>Save Progress</span>
              </button>
            )}
            
            {isFormLocked && (
              <div className="flex flex-wrap gap-2 items-center">
                <button
                  type="button"
                  onClick={() => downloadRecordAsCsv(record, `Blih_ERP_Submission_${record.firstName}_${record.lastName}`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-750 hover:bg-slate-800 text-slate-100 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer shadow-xs"
                  title="Download a copy of your submitted onboarding data in Blih ERP CSV format"
                >
                  <Download className="w-3.5 h-3.5 text-slate-300" />
                  <span>Download ERP CSV</span>
                </button>
                <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Submitted and Sealed
                </span>
              </div>
            )}
          </div>
        </div>

        {saveStatus && (
          <div className={`p-3.5 rounded-lg border text-sm flex items-center gap-2 ${
            saveStatus.type === "success" ? "bg-emerald-50 text-emerald-800 border-emerald-250" : "bg-rose-50 text-rose-800 border-rose-250"
          }`}>
            <CheckCircle2 className="w-4.5 h-4.5 shrink-0 text-emerald-500" />
            <span>{saveStatus.text}</span>
          </div>
        )}
      </div>

      {/* Progress Circle Indicators */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-wrap justify-between items-center gap-y-4 gap-x-2">
          {steps.map((st, i) => {
            const StepIcon = st.icon;
            const isCompleted = currentStep > st.number;
            const isActive = currentStep === st.number;

            return (
              <React.Fragment key={st.number}>
                <button
                  type="button"
                  onClick={() => !isFormLocked && validateStep(currentStep) ? setCurrentStep(st.number) : null}
                  disabled={isFormLocked}
                  className={`flex items-center gap-2 group transition-all text-left focus:outline-none ${isFormLocked ? "cursor-default" : "cursor-pointer"}`}
                >
                  <div className={`w-8.5 h-8.5 rounded-full flex items-center justify-center font-semibold text-xs border transition-all shrink-0
                    ${isCompleted ? "bg-brand-600 border-brand-700 text-white" : ""}
                    ${isActive ? "bg-brand-50 border-brand-500 text-brand-600 font-bold ring-2 ring-brand-100" : ""}
                    {!isCompleted && !isActive ? "bg-slate-50 border-slate-200 text-slate-400 group-hover:border-slate-300" : ""}
                  `}>
                    {isCompleted ? (
                      <svg className="w-4.5 h-4.5 stroke-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      st.number
                    )}
                  </div>
                  <div className="hidden md:block">
                    <span className={`block text-[11px] font-mono leading-none ${isActive || isCompleted ? "text-slate-800" : "text-slate-400"}`}>
                      Step 0{st.number}
                    </span>
                    <span className={`text-[12px] font-semibold tracking-tight ${isActive ? "text-brand-600" : "text-slate-600"}`}>
                      {st.label}
                    </span>
                  </div>
                </button>
                {i < steps.length - 1 && (
                  <div className={`hidden md:block h-0.5 flex-1 transition-all
                    ${isCompleted ? "bg-brand-600" : "bg-slate-100"}
                  `} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Interactive Step Form Box */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="border-b border-slate-100 px-6.5 py-4.5 bg-slate-50/40 flex justify-between items-center bg-transparent">
          <div className="space-y-0.5">
            <h3 className="text-base font-bold text-slate-800">{steps[currentStep - 1].label} Information</h3>
            <p className="text-xs text-slate-500">Please make sure details correspond to official registration registries.</p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
            Step {currentStep} of {steps.length}
          </span>
        </div>

        <div className="p-6.5 space-y-6">
          
          {/* STEP 1: PERSONAL INFORMATION */}
          {currentStep === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5.5">
              <TextField
                id="firstName"
                label="First Name"
                required
                disabled={isFormLocked}
                value={record.firstName}
                onChange={(val) => updateField("firstName", val)}
                error={errors.firstName}
                placeholder="Abebe"
              />
              <TextField
                id="lastName"
                label="Last Name"
                required
                disabled={isFormLocked}
                value={record.lastName}
                onChange={(val) => updateField("lastName", val)}
                error={errors.lastName}
                placeholder="Kebede"
              />
              <DateField
                id="dateOfBirth"
                label="Date of Birth"
                required
                disabled={isFormLocked}
                value={record.dateOfBirth}
                onChange={(val) => updateField("dateOfBirth", val)}
                error={errors.dateOfBirth}
                max={TODAY_STR}
              />
              <TextField
                id="city"
                label="City of Residence"
                required
                disabled={isFormLocked}
                value={record.city}
                onChange={(val) => updateField("city", val)}
                error={errors.city}
                placeholder="Addis Ababa"
              />
              <div className="md:col-span-2">
                <TextField
                  id="countryOfBirth"
                  label="Country of Birth"
                  required
                  disabled={isFormLocked}
                  value={record.countryOfBirth}
                  onChange={(val) => updateField("countryOfBirth", val)}
                  error={errors.countryOfBirth}
                  placeholder="Ethiopia"
                />
              </div>
            </div>
          )}          {/* STEP 2: CONTACT INFORMATION */}
          {currentStep === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5.5">
              <div className="md:col-span-2">
                <TextField
                  id="email"
                  type="email"
                  label="Work Email Address"
                  required
                  disabled={isFormLocked}
                  value={record.email}
                  onChange={(val) => updateField("email", val)}
                  error={errors.email}
                  placeholder="name.lastName@company.com"
                  helpText="This is normalized to lowercase and used as your primary enterprise identity."
                />
              </div>
              <TextField
                id="phone"
                type="tel"
                label="Primary Mobile Phone"
                required
                disabled={isFormLocked}
                value={record.phone}
                onChange={(val) => updateField("phone", val)}
                error={errors.phone}
                placeholder="+251911..."
              />
              <TextField
                id="additionalPhone"
                type="tel"
                label="Alternative Phone (Optional)"
                disabled={isFormLocked}
                value={record.additionalPhone}
                onChange={(val) => updateField("additionalPhone", val)}
                placeholder="+251922..."
              />
            </div>
          )}

          {/* STEP 3: EMERGENCY CONTACT */}
          {currentStep === 3 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5.5">
              <TextField
                id="emergencyFirstName"
                label="Contact First Name"
                required
                disabled={isFormLocked}
                value={record.emergencyFirstName}
                onChange={(val) => updateField("emergencyFirstName", val)}
                error={errors.emergencyFirstName}
                placeholder="Almaz"
              />
              <TextField
                id="emergencyLastName"
                label="Contact Last Name"
                required
                disabled={isFormLocked}
                value={record.emergencyLastName}
                onChange={(val) => updateField("emergencyLastName", val)}
                error={errors.emergencyLastName}
                placeholder="Kebede"
              />
              <TextField
                id="emergencyPhone"
                type="tel"
                label="Emergency Contact Phone"
                required
                disabled={isFormLocked}
                value={record.emergencyPhone}
                onChange={(val) => updateField("emergencyPhone", val)}
                error={errors.emergencyPhone}
                placeholder="+251911..."
              />
              <TextField
                id="emergencyEmail"
                type="email"
                label="Emergency Contact Email (Optional)"
                disabled={isFormLocked}
                value={record.emergencyEmail}
                onChange={(val) => updateField("emergencyEmail", val)}
                error={errors.emergencyEmail}
                placeholder="almaz.k@example.com"
              />
              <TextField
                id="emergencyCity"
                label="City"
                disabled={isFormLocked}
                value={record.emergencyCity}
                onChange={(val) => updateField("emergencyCity", val)}
                placeholder="Addis Ababa"
              />
              <TextField
                id="emergencyCountry"
                label="Country"
                disabled={isFormLocked}
                value={record.emergencyCountry}
                onChange={(val) => updateField("emergencyCountry", val)}
                placeholder="Ethiopia"
              />
            </div>
          )}

          {/* STEP 4: BANK REGISTRY */}
          {currentStep === 4 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5.5">
              <div className="md:col-span-2">
                <TextField
                  id="bankName"
                  label="Official Banking Institution Name"
                  required
                  disabled={isFormLocked}
                  value={record.bankName}
                  onChange={(val) => updateField("bankName", val)}
                  error={errors.bankName}
                  placeholder="Commercial Bank of Ethiopia"
                  helpText="Specify the full registered banking entity name."
                />
              </div>
              <div className="md:col-span-2">
                <TextField
                  id="bankAccountNumber"
                  label="Bank Account Number"
                  required
                  disabled={isFormLocked}
                  value={record.bankAccountNumber}
                  onChange={(val) => updateField("bankAccountNumber", val)}
                  error={errors.bankAccountNumber}
                  placeholder="Enter full number (preserving any leading zeros)"
                  helpText="This is stored strictly as text markup to preserve initial zeros. Value is encrypted."
                />
              </div>
            </div>
          )}

          {/* STEP 5: HR / EMPLOYEMENT CONTROL REVIEW */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start gap-3">
                <Briefcase className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-slate-800">Company-Controlled Employment Records</h4>
                  <p className="text-xs text-slate-505 leading-normal mt-0.5">
                    These parameters are managed directly by HR Admin. Employees have read-only access here. For changes, please message your assigned recruiter.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4.5 pt-2">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Employee Code</div>
                  <div className="text-sm font-semibold text-slate-800 font-mono mt-1">{record.employeeCode || "PENDING PROVISION"}</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Hire Date</div>
                  <div className="text-sm font-semibold text-slate-800 mt-1">{record.hireDate || "NOT SET"}</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Manager Assignment</div>
                  <div className="text-sm font-semibold text-slate-800 truncate mt-1" title={record.managerEmail}>{record.managerEmail || "NOT ASSIGNED"}</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Department</div>
                  <div className="text-sm font-semibold text-slate-800 mt-1">{record.departmentName || "General Admin"}</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Position Title</div>
                  <div className="text-sm font-semibold text-slate-800 mt-1">{record.positionName || "Standard Associate"}</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Branch</div>
                  <div className="text-sm font-semibold text-slate-800 mt-1">{record.branch || "Headquarters"}</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Employment Type</div>
                  <div className="text-sm font-semibold text-slate-800 mt-1 capitalize">{record.employmentType ? record.employmentType.replace("_", " ") : "Not selected"}</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">ERP System Role(s)</div>
                  <div className="text-xs font-semibold text-emerald-800 flex flex-wrap gap-1 mt-1">
                    {record.roleKeys.map((r) => (
                      <span key={r} className="bg-emerald-100/50 px-1.5 py-0.5 rounded font-mono uppercase text-[10px]">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Probation Limit</div>
                  <div className="text-sm font-semibold text-slate-800 mt-1">{record.probationEndDate || "None set"}</div>
                </div>
              </div>
              
              {record.additionalNotes && (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Recruitment / Contract Notes</div>
                  <p className="text-xs text-slate-600 mt-1.5 whitespace-pre-wrap">{record.additionalNotes}</p>
                </div>
              )}
            </div>
          )}

          {/* STEP 6: MASTER REVIEW AND DECLARATION */}
          {currentStep === 6 && (
            <div className="space-y-6">
              
              <div className="p-4 rounded-xl bg-slate-50 text-slate-800 border border-slate-200 flex items-start gap-3">
                <CheckCircle2 className="w-5.5 h-5.5 text-brand-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-800">Review entered information</h4>
                  <p className="text-xs text-slate-500 leading-normal">
                    Check your submissions carefully. Click on individual sections to make modifications before final submission.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                
                {/* 1. PERSONAL */}
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                  <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between items-center bg-transparent">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">Personal Information</span>
                    {!isFormLocked && (
                      <button type="button" onClick={() => setCurrentStep(1)} className="text-xs text-brand-600 font-semibold hover:underline">
                        Edit
                      </button>
                    )}
                  </div>
                  <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-3.5 text-xs text-slate-700">
                    <div>
                      <span className="block text-slate-405 font-medium">First Name</span>
                      <span className="font-semibold text-slate-800 text-sm mt-0.5 block">{record.firstName}</span>
                    </div>
                    <div>
                      <span className="block text-slate-405 font-medium">Last Name</span>
                      <span className="font-semibold text-slate-800 text-sm mt-0.5 block">{record.lastName}</span>
                    </div>
                    <div>
                      <span className="block text-slate-405 font-medium">Date of Birth</span>
                      <span className="font-semibold text-slate-800 text-sm mt-0.5 block">{record.dateOfBirth}</span>
                    </div>
                    <div>
                      <span className="block text-slate-405 font-medium">City of Residence</span>
                      <span className="font-semibold text-slate-800 text-sm mt-0.5 block">{record.city}</span>
                    </div>
                    <div>
                      <span className="block text-slate-405 font-medium">Country of Birth</span>
                      <span className="font-semibold text-slate-800 text-sm mt-0.5 block">{record.countryOfBirth}</span>
                    </div>
                  </div>
                </div>

                {/* 2. CONTACT */}
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                  <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between items-center bg-transparent">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">Contact Information</span>
                    {!isFormLocked && (
                      <button type="button" onClick={() => setCurrentStep(2)} className="text-xs text-brand-600 font-semibold hover:underline">
                        Edit
                      </button>
                    )}
                  </div>
                  <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-3.5 text-xs text-slate-705">
                    <div className="col-span-2 md:col-span-1">
                      <span className="block text-slate-405 font-medium">Work Email</span>
                      <span className="font-semibold text-indigo-755 text-sm mt-0.5 block break-all font-mono lowercase">{record.email}</span>
                    </div>
                    <div>
                      <span className="block text-slate-405 font-medium">Primary Mobile</span>
                      <span className="font-semibold text-slate-800 text-sm mt-0.5 block">{record.phone}</span>
                    </div>
                    <div>
                      <span className="block text-slate-405 font-medium">Alternative Mobile</span>
                      <span className="font-semibold text-slate-800 text-sm mt-0.5 block">{record.additionalPhone || "N/A"}</span>
                    </div>
                  </div>
                </div>

                {/* 3. EMERGENCY */}
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                  <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between items-center bg-transparent">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">Emergency Contact Details</span>
                    {!isFormLocked && (
                      <button type="button" onClick={() => setCurrentStep(3)} className="text-xs text-brand-600 font-semibold hover:underline">
                        Edit
                      </button>
                    )}
                  </div>
                  <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-3.5 text-xs text-slate-700">
                    <div>
                      <span className="block text-slate-405 font-medium">Contact Full Name</span>
                      <span className="font-semibold text-slate-800 text-sm mt-0.5 block">{record.emergencyFirstName} {record.emergencyLastName}</span>
                    </div>
                    <div>
                      <span className="block text-slate-405 font-medium">Emergency Phone</span>
                      <span className="font-semibold text-slate-800 text-sm mt-0.5 block">{record.emergencyPhone}</span>
                    </div>
                    <div>
                      <span className="block text-slate-405 font-medium">Emergency Email</span>
                      <span className="font-semibold text-slate-800 text-sm mt-0.5 block">{record.emergencyEmail || "N/A"}</span>
                    </div>
                    <div>
                      <span className="block text-slate-405 font-medium">City</span>
                      <span className="font-semibold text-slate-800 text-sm mt-0.5 block">{record.emergencyCity || "N/A"}</span>
                    </div>
                    <div>
                      <span className="block text-slate-405 font-medium">Country</span>
                      <span className="font-semibold text-slate-800 text-sm mt-0.5 block">{record.emergencyCountry || "N/A"}</span>
                    </div>
                  </div>
                </div>

                {/* 4. BANK INFO */}
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                  <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between items-center bg-transparent">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">Bank Registry</span>
                    {!isFormLocked && (
                      <button type="button" onClick={() => setCurrentStep(4)} className="text-xs text-brand-600 font-semibold hover:underline">
                        Edit
                      </button>
                    )}
                  </div>
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700">
                    <div>
                      <span className="block text-slate-405 font-medium">Financial Institution</span>
                      <span className="font-semibold text-slate-800 text-sm mt-0.5 block">{record.bankName}</span>
                    </div>
                    <div>
                      <span className="block text-slate-405 font-medium">BankAccount Number (Masked)</span>
                      <span className="font-mono text-sm tracking-wider font-semibold text-slate-800 mt-1 block">
                        {maskBankAccountNumber(record.bankAccountNumber)}
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Secure Consent Box */}
              {!isFormLocked && (
                <div className="p-4 bg-emerald-50 border border-emerald-150 rounded-xl flex items-start gap-3.5 text-emerald-950 mt-4.5">
                  <input
                    type="checkbox"
                    id="consentCheck"
                    required
                    className="w-4.5 h-4.5 text-brand-600 border-slate-300 rounded focus:ring-brand-500 mt-0.5 cursor-pointer"
                  />
                  <div className="text-xs space-y-1">
                    <label htmlFor="consentCheck" className="font-bold block cursor-pointer select-none">
                      I declare that all information entered is true and accurate
                    </label>
                    <p className="text-emerald-805 leading-relaxed">
                      Completing this registry updates the ERP master node. Intentionally entering incorrect or fake documents breaches standard contract terms. Information is protected according to Blih ERP national security standards.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Form Nav Buttons footer */}
        <div className="border-t border-slate-100 bg-slate-50/55 px-6.5 py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStep === 1}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-lg border border-slate-200 text-slate-600 transition-all cursor-pointer bg-white
              ${currentStep === 1 ? "opacity-35 cursor-not-allowed" : "hover:bg-slate-50"}
            `}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {currentStep < steps.length ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg border border-brand-500 hover:border-brand-600 shadow-xs focus:outline-none transition-all cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            !isFormLocked && (
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg border border-emerald-550 hover:border-emerald-650 shadow-sm focus:outline-none transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Submit My Information</span>
              </button>
            )
          )}
        </div>
      </form>
    </div>
  );
};
