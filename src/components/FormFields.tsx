/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { Upload, FileText, CheckCircle2, AlertCircle, X, Lock, ChevronDown, ChevronUp, Check } from "lucide-react";
import { MockFileMetadata, RoleKey } from "../types";
import { simulateSecureFileUpload, formatBytes } from "../services/store";

interface BaseFieldProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  disabled?: boolean;
}

// 1. TEXT FIELD COMPONENT
interface TextFieldProps extends BaseFieldProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  type?: "text" | "email" | "tel" | "password" | "number";
}

export const TextField: React.FC<TextFieldProps> = ({
  id,
  label,
  required = false,
  error,
  helpText,
  disabled = false,
  value,
  onChange,
  placeholder = "",
  type = "text",
}) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label htmlFor={id} className="text-sm font-medium text-slate-700 flex items-center gap-1">
        {label}
        {required && <span className="text-rose-500 font-bold">*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full px-3.5 py-2 text-sm rounded-lg border bg-white transition-all outline-none
          ${disabled ? "bg-slate-50 text-slate-500 border-slate-200 cursor-not-allowed" : "border-slate-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:bg-white text-slate-800"}
          ${error ? "border-rose-400 focus:border-rose-400 focus:ring-rose-400 bg-rose-50/10" : ""}
        `}
      />
      {error && (
        <span className="text-xs text-rose-600 flex items-center gap-1 mt-0.5" id={`${id}-error`}>
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </span>
      )}
      {!error && helpText && (
        <span className="text-xs text-slate-500" id={`${id}-help`}>
          {helpText}
        </span>
      )}
    </div>
  );
};

// 2. DATE FIELD COMPONENT
interface DateFieldProps extends BaseFieldProps {
  value: string;
  onChange: (val: string) => void;
  min?: string;
  max?: string;
}

export const DateField: React.FC<DateFieldProps> = ({
  id,
  label,
  required = false,
  error,
  helpText,
  disabled = false,
  value,
  onChange,
  min,
  max,
}) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label htmlFor={id} className="text-sm font-medium text-slate-700 flex items-center gap-1">
        {label}
        {required && <span className="text-rose-500 font-bold">*</span>}
      </label>
      <input
        id={id}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        min={min}
        max={max}
        className={`w-full px-3.5 py-2 text-sm rounded-lg border bg-white transition-all outline-none
          ${disabled ? "bg-slate-50 text-slate-500 border-slate-200 cursor-not-allowed" : "border-slate-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:bg-white text-slate-800"}
          ${error ? "border-rose-400 focus:border-rose-400 focus:ring-rose-400 bg-rose-50/10" : ""}
        `}
      />
      {error && (
        <span className="text-xs text-rose-600 flex items-center gap-1 mt-0.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </span>
      )}
      {!error && helpText && (
        <span className="text-xs text-slate-500">
          {helpText}
        </span>
      )}
    </div>
  );
};

// 3. SELECT FIELD COMPONENT
interface SelectFieldProps extends BaseFieldProps {
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  id,
  label,
  required = false,
  error,
  helpText,
  disabled = false,
  value,
  onChange,
  options,
  placeholder = "Select an option...",
}) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label htmlFor={id} className="text-sm font-medium text-slate-700 flex items-center gap-1">
        {label}
        {required && <span className="text-rose-500 font-bold">*</span>}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full px-3.5 py-2 text-sm rounded-lg border bg-white transition-all outline-none appearance-none cursor-pointer
          ${disabled ? "bg-slate-50 text-slate-500 border-slate-200 cursor-not-allowed" : "border-slate-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:bg-white text-slate-800"}
          ${error ? "border-rose-400 focus:border-rose-400 focus:ring-rose-400 bg-rose-50/10" : ""}
        `}
        style={{
          backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 12px center",
          backgroundSize: "16px",
        }}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <span className="text-xs text-rose-600 flex items-center gap-1 mt-0.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </span>
      )}
      {!error && helpText && (
        <span className="text-xs text-slate-500">
          {helpText}
        </span>
      )}
    </div>
  );
};

// 4. MULTI SELECT ROLES COMPONENT
interface MultiSelectRolesProps {
  selectedRoles: RoleKey[];
  onChange: (roles: RoleKey[]) => void;
  disabled?: boolean;
  error?: string;
}

export const MultiSelectRoles: React.FC<MultiSelectRolesProps> = ({
  selectedRoles,
  onChange,
  disabled = false,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const allowedRoles: { key: RoleKey; label: string }[] = [
    { key: "EMPLOYEE", label: "EMPLOYEE" },
    { key: "DEPARTMENT_HEAD", label: "DEPARTMENT HEAD" },
    { key: "PROJECT_MANAGER", label: "PROJECT MANAGER" },
    { key: "CRM_MANAGER", label: "CRM MANAGER" },
    { key: "FINANCE_MANAGER", label: "FINANCE MANAGER" },
    { key: "HR_MANAGER", label: "HR MANAGER" },
  ];

  const handleToggle = (key: RoleKey) => {
    if (disabled) return;
    if (selectedRoles.includes(key)) {
      onChange(selectedRoles.filter((r) => r !== key));
    } else {
      onChange([...selectedRoles, key]);
    }
  };

  return (
    <div className="flex flex-col gap-2 relative">
      <div className="flex justify-between items-center">
        <span className="text-xs font-bold uppercase tracking-widest text-slate-500 font-mono">
          ERP SYSTEM ROLE(S) <span className="text-rose-500 font-bold">*</span>
        </span>
        <span className="text-xs text-slate-400 font-mono mt-0.5">Export: {selectedRoles.join("|")}</span>
      </div>

      {/* Styled Trigger Dropdown Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full p-3.5 bg-white border rounded-xl shadow-xs transition-all flex items-center justify-between text-left hover:border-slate-350 cursor-pointer
          ${disabled ? "bg-slate-50/70 border-slate-200 cursor-not-allowed opacity-75" : "border-slate-200"}
          ${isOpen ? "ring-2 ring-indigo-500/10 border-indigo-500" : ""}
        `}
      >
        <div className="flex flex-wrap gap-1.5 items-center">
          {selectedRoles.length === 0 ? (
            <span className="text-slate-450 font-normal text-xs italic">Select required systems roles (click to open)...</span>
          ) : (
            selectedRoles.map((role) => (
              <span key={role} className="px-2.5 py-1 bg-slate-900 border border-slate-750 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider font-mono">
                {role.replace("_", " ")}
              </span>
            ))
          )}
        </div>
        <div className="text-slate-400 shrink-0 ml-2">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Dropdown Options List styled exactly like the provided image */}
      {isOpen && !disabled && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-50 space-y-2 max-h-96 overflow-y-auto">
          <div className="text-[10px] text-slate-400 uppercase tracking-widest font-mono pb-1 border-b border-slate-100 flex justify-between items-center px-1">
            <span>Select System Role Keys</span>
            <span className="text-emerald-555 font-bold">Multi-Select Active</span>
          </div>

          <div className="space-y-1 pt-1.5">
            {allowedRoles.map((role) => {
              const isChecked = selectedRoles.includes(role.key);
              return (
                <button
                  key={role.key}
                  type="button"
                  onClick={() => handleToggle(role.key)}
                  className={`w-full p-2.5 text-left rounded-xl border transition-all flex items-center gap-3.5 select-none cursor-pointer
                    ${isChecked 
                      ? "border-indigo-100 bg-slate-50/75 shadow-xs" 
                      : "border-transparent bg-white hover:bg-slate-50/45"}
                  `}
                >
                  {/* Left lock icon inside light slate box */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all border
                    ${isChecked 
                      ? "bg-white border-slate-200 text-slate-700 shadow-xs" 
                      : "bg-slate-50 border-transparent text-slate-400"}
                  `}>
                    <Lock className="w-4 h-4 stroke-[2.2]" />
                  </div>

                  {/* Middle texts */}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-800 tracking-tight">
                      {role.label}
                    </div>
                    <div className="text-[10px] text-slate-400 font-bold tracking-wider font-mono mt-0.5">
                      {role.key}
                    </div>
                  </div>

                  {/* Checkmark or checkbox Indicator */}
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all border
                    ${isChecked 
                      ? "bg-emerald-600 border-emerald-650 text-white shadow-2xs" 
                      : "border-slate-200 bg-white"}
                  `}>
                    {isChecked && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 text-right">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-slate-800 transition-all"
            >
              Done Selecting
            </button>
          </div>
        </div>
      )}

      {error && (
        <span className="text-xs text-rose-600 flex items-center gap-1 mt-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </span>
      )}
    </div>
  );
};

// 5. SECURE FILE UPLOAD COMPONENT
interface FileUploadFieldProps {
  id: string;
  label: string;
  required?: boolean;
  value: MockFileMetadata | null;
  onChange: (meta: MockFileMetadata | null) => void;
  docType: "FAYDA" | "PASSPORT";
  disabled?: boolean;
  error?: string;
}

export const FileUploadField: React.FC<FileUploadFieldProps> = ({
  id,
  label,
  required = false,
  value,
  onChange,
  docType,
  disabled = false,
  error,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayError = error || localError;

  const handleUploadLogic = (file: File) => {
    setLocalError(null);
    try {
      const meta = simulateSecureFileUpload(file, docType);
      onChange(meta);
    } catch (e: any) {
      setLocalError(e.message || "Failed to process the document upload.");
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUploadLogic(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (e.target.files && e.target.files[0]) {
      handleUploadLogic(e.target.files[0]);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    onChange(null);
    setLocalError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="text-sm font-medium text-slate-700 flex items-center gap-1">
        {label}
        {required && <span className="text-rose-500 font-bold">*</span>}
      </label>

      {value ? (
        // File Uploaded View Card
        <div className="p-4 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/35 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <FileText className="w-5.5 h-5.5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-700 truncate">{value.name}</p>
              <p className="text-xs text-slate-500 font-mono flex items-center gap-1.5 mt-0.5">
                <span>{formatBytes(value.size)}</span>
                <span className="text-slate-300">|</span>
                <span>Uploaded {new Date(value.uploadedAt).toLocaleDateString()}</span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-emerald-700 bg-emerald-100/50 px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Secure Link Saved
            </span>
            {!disabled && (
              <button
                type="button"
                onClick={handleRemove}
                className="p-1 text-slate-450 hover:text-rose-500 hover:bg-rose-50 rounded transition-all cursor-pointer"
                title="Remove uploaded document"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            )}
          </div>
        </div>
      ) : (
        // Standard Uploader Drag Zone
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={disabled ? undefined : handleButtonClick}
          className={`border-2 border-dashed rounded-xl p-6.5 text-center transition-all flex flex-col items-center justify-center gap-2.5
            ${disabled ? "bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed" : "cursor-pointer bg-white"}
            ${dragActive ? "border-brand-500 bg-brand-50/30" : "border-slate-300 hover:border-slate-400"}
            ${displayError ? "border-rose-300 bg-rose-50/5" : ""}
          `}
        >
          <input
            ref={fileInputRef}
            id={id}
            type="file"
            accept=".pdf,image/png,image/jpeg,image/jpg"
            onChange={handleFileChange}
            disabled={disabled}
            className="hidden"
          />
          
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
            <Upload className="w-6 h-6 animate-pulse" />
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-700">
              <span className="text-brand-600 underline">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-slate-500">
              PDF, JPG, JPEG, or PNG up to 5 MB
            </p>
          </div>
        </div>
      )}

      {displayError && (
        <span className="text-xs text-rose-600 flex items-center gap-1 mt-0.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {displayError}
        </span>
      )}
    </div>
  );
};
