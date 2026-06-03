/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { Upload, FileText, CheckCircle2, AlertCircle, X } from "lucide-react";
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
  const allowedRoles: { key: RoleKey; label: string; desc: string }[] = [
    { key: "EMPLOYEE", label: "Employee", desc: "Standard entry role" },
    { key: "DEPARTMENT_HEAD", label: "Department Head", desc: "Department level manager" },
    { key: "PROJECT_MANAGER", label: "Project Manager", desc: "Drives specific project teams" },
    { key: "CRM_MANAGER", label: "CRM Manager", desc: "Oversees customer success integrations" },
    { key: "FINANCE_MANAGER", label: "Finance Manager", desc: "Controls budget approvals" },
    { key: "HR_MANAGER", label: "HR Manager", desc: "Oversees onboarding cycles" },
  ];

  const handleToggle = (key: RoleKey) => {
    if (disabled) return;
    if (selectedRoles.includes(key)) {
      // Allow deselecting, but keep at least 1 role assigned ideally (handled in validations)
      onChange(selectedRoles.filter((r) => r !== key));
    } else {
      onChange([...selectedRoles, key]);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-slate-700">
          Role Assignment(s) <span className="text-rose-500 font-bold">*</span>
        </span>
        <span className="text-xs text-slate-500 font-mono">Export: {selectedRoles.join("|")}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {allowedRoles.map((role) => {
          const isChecked = selectedRoles.includes(role.key);
          return (
            <button
              key={role.key}
              type="button"
              disabled={disabled}
              onClick={() => handleToggle(role.key)}
              className={`p-3 text-left rounded-xl border transition-all flex items-start gap-3 select-none cursor-pointer
                ${isChecked 
                  ? "border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500" 
                  : "border-slate-200 bg-white hover:border-slate-300"}
                ${disabled ? "opacity-60 cursor-not-allowed" : ""}
              `}
            >
              <div className={`w-5 h-5 rounded border mt-0.5 flex items-center justify-center shrink-0 transition-all
                ${isChecked ? "bg-emerald-500 border-emerald-600 text-white" : "border-slate-300 bg-white"}
              `}>
                {isChecked && (
                  <svg className="w-3.5 h-3.5 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-800">{role.label}</div>
                <div className="text-[11px] text-slate-500 font-normal leading-normal">{role.desc}</div>
              </div>
            </button>
          );
        })}
      </div>
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
