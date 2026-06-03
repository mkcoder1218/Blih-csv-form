/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type EmployeeSubmissionStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "NEEDS_CORRECTION"
  | "APPROVED";

export type IdentityDocumentType =
  | "FAYDA"
  | "PASSPORT";

export type IdentityDocumentStatus =
  | "PENDING"
  | "VERIFIED"
  | "REJECTED"
  | "REPLACEMENT_REQUIRED";

export type EmploymentType =
  | "full_time"
  | "part_time"
  | "contractor"
  | "intern";

export type EmploymentStatus =
  | "onboarding"
  | "active"
  | "inactive"
  | "on_leave"
  | "terminated";

export type RoleKey =
  | "EMPLOYEE"
  | "DEPARTMENT_HEAD"
  | "PROJECT_MANAGER"
  | "CRM_MANAGER"
  | "FINANCE_MANAGER"
  | "HR_MANAGER";

export interface MockFileMetadata {
  name: string;
  size: number; // in bytes
  type: string; // mime-type
  uploadedAt: string;
  dataUrl?: string; // local URL snippet for rendering mock document previews
}

export interface EmployeeRecord {
  id: string; // matches invitation or submission ID
  token: string | null; // null if processed or active
  tokenExpiresAt: string | null;
  status: EmployeeSubmissionStatus;
  submittedAt: string | null;
  approvedAt: string | null;
  
  // Step 1: Personal Info
  firstName: string;
  lastName: string;
  dateOfBirth: string; // YYYY-MM-DD
  city: string;
  countryOfBirth: string;

  // Step 2: Identity Verification
  identityDocumentFile?: MockFileMetadata | null;

  // Global verification status
  identityDocumentStatus: IdentityDocumentStatus;
  identityDocumentComment: string; // rejection or replacement explanation
  identityVerifiedAt: string | null;
  identityVerifiedBy: string | null;

  // Step 3: Contact Info
  email: string; // lowercase, work email
  phone: string;
  additionalPhone: string;

  // Step 4: Emergency Contact
  emergencyFirstName: string;
  emergencyLastName: string;
  emergencyPhone: string;
  emergencyEmail: string;
  emergencyCity: string;
  emergencyCountry: string;

  // Step 5: Bank Info
  bankName: string;
  bankAccountNumber: string; // text, preserves leading zeros

  // Step 6: HR / Employment Info
  employeeCode: string; // unique identifier
  roleKeys: RoleKey[]; // multi-select
  departmentName: string;
  positionName: string;
  managerEmail: string;
  branch: string;
  employmentType: EmploymentType | "";
  employmentStatus: EmploymentStatus | "";
  hireDate: string;
  probationEndDate: string;
  contractStartDate: string;
  contractEndDate: string;
  monthlySalary: number | "";
  salaryCurrency: string;
  additionalNotes: string;

  // Correction Workflow Tracker
  correctionMessage: string;
  correctionRequestedAt: string | null;
  correctionRequestedBy: string | null;
}

export interface Invitation {
  id: string;
  employeeCode: string;
  employeeEmail: string;
  employeeFirstName: string;
  employeeLastName: string;
  token: string;
  status: "ACTIVE" | "USED" | "REVOKED" | "EXPIRED";
  createdAt: string;
  expiresAt: string;
  sentCount: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userEmail: string; // who performed it
  action: "DOCUMENT_VERIFY" | "DOCUMENT_REJECT" | "DOCUMENT_REPLACEMENT" | "SUBMISSION_APPROVE" | "CORRECTION_REQUEST" | "CSV_EXPORT" | "INVITATION_CREATE" | "INVITATION_REVOKE" | "INVITATION_RESEND" | "SUBMISSION_SAVE_DRAFT" | "SUBMISSION_SUBMIT";
  details: string; // details of what changed
  ipAddress?: string; // simulated standard workspace audit log attribute
}

export interface ActiveUser {
  role: "HR_ADMIN" | "EMPLOYEE";
  email: string;
  associatedEmployeeId?: string; // if role is EMPLOYEE, links to their Submission/Record
}
