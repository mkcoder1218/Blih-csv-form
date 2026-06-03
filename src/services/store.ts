/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EmployeeRecord,
  Invitation,
  AuditLog,
  ActiveUser,
  EmployeeSubmissionStatus,
  IdentityDocumentStatus,
  RoleKey,
  MockFileMetadata
} from "../types";

// Local storage keys
const SUBMISSIONS_KEY = "blih_erp_submissions";
const INVITATIONS_KEY = "blih_erp_invitations";
const AUDIT_LOGS_KEY = "blih_erp_audit_logs";
const SESSION_KEY = "blih_erp_session";

// Base Mock User Credentials
export const DEMO_HR_EMAIL = "admin@blih-erp.com";

// High-fidelity Mock Document Previews
// Using clean vector, SVG, or high-quality public domain placeholders for passport/fayda representations
const MOCK_FAYDA_PREVIEW = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600";
const MOCK_PASSPORT_PREVIEW = "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80&w=600";

// Standard mock audit logging helper
export function addAuditLog(
  userEmail: string,
  action: AuditLog["action"],
  details: string
): void {
  const logs: AuditLog[] = JSON.parse(localStorage.getItem(AUDIT_LOGS_KEY) || "[]");
  const newLog: AuditLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    timestamp: new Date().toISOString(),
    userEmail,
    action,
    details,
    ipAddress: "192.168.10.84",
  };
  logs.unshift(newLog); // New logs at the beginning
  localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(logs));
}

// Check if initial samples have been loaded
export function initializeStore(): void {
  const currentSubmissions = localStorage.getItem(SUBMISSIONS_KEY);
  const currentInvitations = localStorage.getItem(INVITATIONS_KEY);
  const currentAuditLogs = localStorage.getItem(AUDIT_LOGS_KEY);
  
  // Set default HR session if not set
  if (!localStorage.getItem(SESSION_KEY)) {
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ role: "HR_ADMIN", email: DEMO_HR_EMAIL })
    );
  }

  // Pre-populate 5 diverse cases
  const submissions: EmployeeRecord[] = [];
  const invitations: Invitation[] = [];

  // Current simulation base time (2026-06-03)
  const baseDate = "2026-06-03";

  // CASE 1: Submitted with Fayda document pending verification
  const emp1: EmployeeRecord = {
    id: "rec_demo_1",
    token: null, // Submitting clears active token or completes invitation
    tokenExpiresAt: null,
    status: "SUBMITTED",
    submittedAt: "2026-06-02T09:12:00Z",
    approvedAt: null,
    firstName: "Abebe",
    lastName: "Kebede",
    dateOfBirth: "1994-08-12",
    city: "Addis Ababa",
    countryOfBirth: "Ethiopia",
    identityDocumentFile: {
      name: "fayda_id_abebe.png",
      size: 1420500,
      type: "image/png",
      uploadedAt: "2026-06-02T09:05:00Z",
      dataUrl: MOCK_FAYDA_PREVIEW,
    },
    identityDocumentStatus: "PENDING",
    identityDocumentComment: "",
    identityVerifiedAt: null,
    identityVerifiedBy: null,
    email: "abebe.kebede94@gmail.com",
    phone: "+251911223344",
    additionalPhone: "+251922334455",
    emergencyFirstName: "Almaz",
    emergencyLastName: "Kebede",
    emergencyPhone: "+251911556677",
    emergencyEmail: "almaz.k@example.com",
    emergencyCity: "Addis Ababa",
    emergencyCountry: "Ethiopia",
    bankName: "Commercial Bank of Ethiopia",
    bankAccountNumber: "1000159483726", // text, preserves leading zeros

    // HR Controls (editable by HR, read-only for employee)
    employeeCode: "EMP-2026-001",
    roleKeys: ["EMPLOYEE"],
    departmentName: "Operations",
    positionName: "Logistics Specialist",
    managerEmail: "ops.head@blih-erp.com",
    branch: "Addis Ababa HQ",
    employmentType: "full_time",
    employmentStatus: "onboarding",
    hireDate: "2026-06-15",
    probationEndDate: "2026-09-15",
    contractStartDate: "2026-06-15",
    contractEndDate: "",
    monthlySalary: 23000,
    salaryCurrency: "ETB",
    additionalNotes: "Pre-assigned to local delivery operations team. Document matches standard Ethiopian Fayda format.",
    correctionMessage: "",
    correctionRequestedAt: null,
    correctionRequestedBy: null,
  };

  // CASE 2: Submitted with Passport verified
  const emp2: EmployeeRecord = {
    id: "rec_demo_2",
    token: null,
    tokenExpiresAt: null,
    status: "SUBMITTED",
    submittedAt: "2026-06-01T14:45:00Z",
    approvedAt: null,
    firstName: "Sarah",
    lastName: "Müller",
    dateOfBirth: "1989-11-23",
    city: "Munich",
    countryOfBirth: "Germany",
    identityDocumentFile: {
      name: "passport_german_sarah_muller.pdf",
      size: 3204900,
      type: "application/pdf",
      uploadedAt: "2026-06-01T14:30:00Z",
      dataUrl: MOCK_PASSPORT_PREVIEW,
    },
    identityDocumentStatus: "VERIFIED",
    identityDocumentComment: "International passport details validated via standard secure visual scan.",
    identityVerifiedAt: "2026-06-02T08:30:00Z",
    identityVerifiedBy: DEMO_HR_EMAIL,
    email: "sarah.muller@example.com",
    phone: "+491701234567",
    additionalPhone: "",
    emergencyFirstName: "Dieter",
    emergencyLastName: "Müller",
    emergencyPhone: "+491709876543",
    emergencyEmail: "dieter.muller@example.com",
    emergencyCity: "Stuttgart",
    emergencyCountry: "Germany",
    bankName: "Deutsche Bank",
    bankAccountNumber: "DE12370400440001234567", // text, preserves leading zeros

    employeeCode: "EMP-2026-002",
    roleKeys: ["PROJECT_MANAGER", "EMPLOYEE"],
    departmentName: "Software Engineering",
    positionName: "Senior Delivery Manager",
    managerEmail: "engineering.head@blih-erp.com",
    branch: "Europe Hub",
    employmentType: "full_time",
    employmentStatus: "active",
    hireDate: "2026-07-01",
    probationEndDate: "2026-10-01",
    contractStartDate: "2026-07-01",
    contractEndDate: "",
    monthlySalary: 6800,
    salaryCurrency: "EUR",
    additionalNotes: "Oversees local integrations. Identity documents successfully cleared on June 2nd.",
    correctionMessage: "",
    correctionRequestedAt: null,
    correctionRequestedBy: null,
  };

  // CASE 3: Active Draft Form
  const tokenDraft = "token_demo_draft_101";
  const emp3: EmployeeRecord = {
    id: "rec_demo_3",
    token: tokenDraft,
    tokenExpiresAt: "2026-12-31T23:59:59Z",
    status: "DRAFT",
    submittedAt: null,
    approvedAt: null,
    firstName: "Elena",
    lastName: "Rostova",
    dateOfBirth: "1997-04-05",
    city: "Riga",
    countryOfBirth: "Latvia",
    identityDocumentFile: {
      name: "elena_r_passport.jpg",
      size: 2190000,
      type: "image/jpeg",
      uploadedAt: "2026-06-02T16:00:00Z",
      dataUrl: MOCK_PASSPORT_PREVIEW,
    },
    identityDocumentStatus: "PENDING",
    identityDocumentComment: "",
    identityVerifiedAt: null,
    identityVerifiedBy: null,
    email: "elena.rostova@example.com",
    phone: "+37129555123",
    additionalPhone: "",
    emergencyFirstName: "Yury",
    emergencyLastName: "Rostov",
    emergencyPhone: "+37129555789",
    emergencyEmail: "",
    emergencyCity: "Riga",
    emergencyCountry: "Latvia",
    bankName: "Swedbank Latvia",
    bankAccountNumber: "LV80SWED000123456789",

    // HR Controls (blank or prefilled by HR, but employee form is current draft)
    employeeCode: "EMP-2026-003",
    roleKeys: [],
    departmentName: "",
    positionName: "",
    managerEmail: "support.head@blih-erp.com",
    branch: "Baltics Team",
    employmentType: "part_time",
    employmentStatus: "onboarding",
    hireDate: "2026-07-15",
    probationEndDate: "",
    contractStartDate: "2026-07-15",
    contractEndDate: "2027-07-14",
    monthlySalary: 3100,
    salaryCurrency: "EUR",
    additionalNotes: "Saving progress to complete emergency contacts later.",
    correctionMessage: "",
    correctionRequestedAt: null,
    correctionRequestedBy: null,
  };

  // CASE 4: Needs Correction because identity document must be replaced
  const tokenCorrection = "token_demo_correct_202";
  const emp4: EmployeeRecord = {
    id: "rec_demo_4",
    token: tokenCorrection,
    tokenExpiresAt: "2026-12-31T23:59:59Z",
    status: "NEEDS_CORRECTION",
    submittedAt: "2026-05-30T10:15:00Z",
    approvedAt: null,
    firstName: "Chala",
    lastName: "Tadesse",
    dateOfBirth: "1992-02-14",
    city: "Adama",
    countryOfBirth: "Ethiopia",
    identityDocumentFile: {
      name: "blurry_identity_photo.jpg",
      size: 4900000,
      type: "image/jpeg",
      uploadedAt: "2026-05-30T10:12:00Z",
      dataUrl: "https://images.unsplash.com/photo-1590086782957-93c060218021?auto=format&fit=crop&q=80&w=200", // low contrast / placeholder
    },
    identityDocumentStatus: "REPLACEMENT_REQUIRED",
    identityDocumentComment: "Document file is too dark and blurry to read the identity registration number. Please upload a high-contrast scan in PNG or PDF format.",
    identityVerifiedAt: null,
    identityVerifiedBy: null,
    email: "chala.tadesse@example.com",
    phone: "+251912987654",
    additionalPhone: "",
    emergencyFirstName: "Tadesse",
    emergencyLastName: "Negash",
    emergencyPhone: "+251911987654",
    emergencyEmail: "tadesse.n@example.com",
    emergencyCity: "Adama",
    emergencyCountry: "Ethiopia",
    bankName: "Awash International Bank",
    bankAccountNumber: "01320491827000",

    employeeCode: "EMP-2026-004",
    roleKeys: ["CRM_MANAGER"],
    departmentName: "Operations",
    positionName: "Field Sales Specialist",
    managerEmail: "ops.head@blih-erp.com",
    branch: "Adama Office",
    employmentType: "full_time",
    employmentStatus: "onboarding",
    hireDate: "2026-06-20",
    probationEndDate: "2026-09-20",
    contractStartDate: "2026-06-20",
    contractEndDate: "",
    monthlySalary: 18500,
    salaryCurrency: "ETB",
    additionalNotes: "Needs correction for Fayda card immediately so work visa mapping can proceed.",
    correctionMessage: "The Fayda digital ID document uploaded is completely blurry. Please upload a clear scan showing your document number and photo.",
    correctionRequestedAt: "2026-06-01T10:00:00Z",
    correctionRequestedBy: DEMO_HR_EMAIL,
  };

  // CASE 5: Approved and ready for CSV export
  const emp5: EmployeeRecord = {
    id: "rec_demo_5",
    token: null,
    tokenExpiresAt: null,
    status: "APPROVED",
    submittedAt: "2026-05-28T08:30:00Z",
    approvedAt: "2026-05-29T11:20:00Z",
    firstName: "Fisseha",
    lastName: "Assefa",
    dateOfBirth: "1985-05-21",
    city: "Harar",
    countryOfBirth: "Ethiopia",
    identityDocumentFile: {
      name: "fisseha_assefa_fayda.pdf",
      size: 2450000,
      type: "application/pdf",
      uploadedAt: "2026-05-28T08:15:00Z",
      dataUrl: MOCK_FAYDA_PREVIEW,
    },
    identityDocumentStatus: "VERIFIED",
    identityDocumentComment: "Verified from national portal lookup by authorization department on May 29.",
    identityVerifiedAt: "2026-05-29T11:15:00Z",
    identityVerifiedBy: DEMO_HR_EMAIL,
    email: "fisseha.assefa@example.com",
    phone: "+251910557788",
    additionalPhone: "",
    emergencyFirstName: "Tigist",
    emergencyLastName: "Assefa",
    emergencyPhone: "+251910559900",
    emergencyEmail: "tigist.a@example.com",
    emergencyCity: "Harar",
    emergencyCountry: "Ethiopia",
    bankName: "Dashen Bank",
    bankAccountNumber: "0010998827361", // Note the leading zeros

    employeeCode: "EMP-2026-005",
    roleKeys: ["DEPARTMENT_HEAD", "HR_MANAGER"],
    departmentName: "Human Resources",
    positionName: "Regional Chief of People",
    managerEmail: "exec.board@blih-erp.com",
    branch: "Addis Ababa HQ",
    employmentType: "full_time",
    employmentStatus: "active",
    hireDate: "2026-06-01",
    probationEndDate: "",
    contractStartDate: "2026-06-01",
    contractEndDate: "",
    monthlySalary: 74000,
    salaryCurrency: "ETB",
    additionalNotes: "Full onboarding completed. Record approved and logged ready for monthly ERP synchronize run.",
    correctionMessage: "",
    correctionRequestedAt: null,
    correctionRequestedBy: null,
  };

  // Corresponding Invitations
  const invite3: Invitation = {
    id: emp3.id,
    employeeCode: emp3.employeeCode,
    employeeEmail: emp3.email,
    employeeFirstName: emp3.firstName,
    employeeLastName: emp3.lastName,
    token: tokenDraft,
    status: "ACTIVE",
    createdAt: "2026-05-25T09:00:00Z",
    expiresAt: "2026-12-31T23:59:59Z",
    sentCount: 1,
  };

  const invite4: Invitation = {
    id: emp4.id,
    employeeCode: emp4.employeeCode,
    employeeEmail: emp4.email,
    employeeFirstName: emp4.firstName,
    employeeLastName: emp4.lastName,
    token: tokenCorrection,
    status: "ACTIVE", // can still open to submit again
    createdAt: "2026-05-25T11:00:00Z",
    expiresAt: "2026-12-31T23:59:59Z",
    sentCount: 2, // resent during request correction
  };

  // Add invitations that have already been used/approved to showcase invitation management
  const invite1: Invitation = {
    id: emp1.id,
    employeeCode: emp1.employeeCode,
    employeeEmail: emp1.email,
    employeeFirstName: emp1.firstName,
    employeeLastName: emp1.lastName,
    token: "token_used_demo_1",
    status: "USED",
    createdAt: "2026-05-24T08:00:00Z",
    expiresAt: "2026-06-24T08:00:00Z",
    sentCount: 1,
  };

  const invite2: Invitation = {
    id: emp2.id,
    employeeCode: emp2.employeeCode,
    employeeEmail: emp2.email,
    employeeFirstName: emp2.firstName,
    employeeLastName: emp2.lastName,
    token: "token_used_demo_2",
    status: "USED",
    createdAt: "2026-05-24T10:00:00Z",
    expiresAt: "2026-06-24T10:00:00Z",
    sentCount: 1,
  };

  const invite5: Invitation = {
    id: emp5.id,
    employeeCode: emp5.employeeCode,
    employeeEmail: emp5.email,
    employeeFirstName: emp5.firstName,
    employeeLastName: emp5.lastName,
    token: "token_used_demo_5",
    status: "USED",
    createdAt: "2026-05-23T08:00:00Z",
    expiresAt: "2026-06-23T08:00:00Z",
    sentCount: 1,
  };

  if (!currentSubmissions) {
    submissions.push(emp1, emp2, emp3, emp4, emp5);
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(submissions));
  }
  if (!currentInvitations) {
    invitations.push(invite1, invite2, invite3, invite4, invite5);
    localStorage.setItem(INVITATIONS_KEY, JSON.stringify(invitations));
  }
  if (!currentAuditLogs) {
    const historicalLogs: AuditLog[] = [
      {
        id: "l_hist_1",
        timestamp: "2026-05-25T09:05:00Z",
        userEmail: DEMO_HR_EMAIL,
        action: "INVITATION_CREATE",
        details: "Created invitation token for pre-onboard Elena Rostova (elena.rostova@example.com) with employee code EMP-2026-003",
        ipAddress: "192.168.10.84",
      },
      {
        id: "l_hist_2",
        timestamp: "2026-05-29T11:15:00Z",
        userEmail: DEMO_HR_EMAIL,
        action: "DOCUMENT_VERIFY",
        details: "Verified Fayda identity card file (fisseha_assefa_fayda.pdf) for Fisseha Assefa",
        ipAddress: "192.168.10.84",
      },
      {
        id: "l_hist_3",
        timestamp: "2026-05-29T11:20:00Z",
        userEmail: DEMO_HR_EMAIL,
        action: "SUBMISSION_APPROVE",
        details: "Approved employee record for Fisseha Assefa with code EMP-2026-005 into Blih ERP registry",
        ipAddress: "192.168.10.84",
      },
      {
        id: "l_hist_4",
        timestamp: "2026-06-01T10:00:00Z",
        userEmail: DEMO_HR_EMAIL,
        action: "CORRECTION_REQUEST",
        details: "Sent correction request to Chala Tadesse (chala.tadesse@example.com) for blurry Fayda ID image",
        ipAddress: "192.168.10.84",
      },
      {
        id: "l_hist_5",
        timestamp: "2026-06-02T08:30:00Z",
        userEmail: DEMO_HR_EMAIL,
        action: "DOCUMENT_VERIFY",
        details: "Verified Passport file (passport_german_sarah_muller.pdf) for Sarah Müller",
        ipAddress: "192.168.10.84",
      }
    ];
    localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(historicalLogs));
  }
}

// ----------------------
// DATA FETCHING METRICS
// ----------------------

export function getSubmissions(): EmployeeRecord[] {
  initializeStore();
  return JSON.parse(localStorage.getItem(SUBMISSIONS_KEY) || "[]");
}

export function saveSubmissions(list: EmployeeRecord[]): void {
  localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(list));
}

export function getInvitations(): Invitation[] {
  initializeStore();
  return JSON.parse(localStorage.getItem(INVITATIONS_KEY) || "[]");
}

export function saveInvitations(list: Invitation[]): void {
  localStorage.setItem(INVITATIONS_KEY, JSON.stringify(list));
}

export function getAuditLogs(): AuditLog[] {
  initializeStore();
  return JSON.parse(localStorage.getItem(AUDIT_LOGS_KEY) || "[]");
}

export function getActiveSession(): ActiveUser | null {
  const sessionStr = localStorage.getItem(SESSION_KEY);
  if (!sessionStr) return null;
  return JSON.parse(sessionStr);
}

export function setActiveSession(session: ActiveUser | null): void {
  if (session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
}

// ----------------------
// HR SERVICE OPERATIONS
// ----------------------

export function createInvitation(payload: {
  employeeCode: string;
  employeeEmail: string;
  employeeFirstName: string;
  employeeLastName: string;
}): Invitation {
  const submissions = getSubmissions();
  const invitations = getInvitations();

  // Guard against non-unique code or email in existing approved submissions or active invites
  const cleanedEmail = payload.employeeEmail.trim().toLowerCase();
  const lowerCode = payload.employeeCode.trim().toUpperCase();

  const codeConflict = submissions.some(
    (s) => s.employeeCode.toUpperCase() === lowerCode
  );
  const emailConflict = submissions.some(
    (s) => s.email.toLowerCase() === cleanedEmail
  );

  if (codeConflict) throw new Error(`Employee Code "${payload.employeeCode}" is already taken.`);
  if (emailConflict) throw new Error(`Employee Email "${payload.employeeEmail}" is already registered.`);

  const token = `tok_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
  const id = `rec_${Math.random().toString(36).substr(2, 6)}`;

  const newInvitation: Invitation = {
    id,
    employeeCode: payload.employeeCode.trim(),
    employeeEmail: cleanedEmail,
    employeeFirstName: payload.employeeFirstName.trim(),
    employeeLastName: payload.employeeLastName.trim(),
    token,
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
    // 7 days in future expiration
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    sentCount: 1,
  };

  // Prepare a linked empty submission draft so the personal link loads instant placeholders
  const newSubmission: EmployeeRecord = {
    id,
    token,
    tokenExpiresAt: newInvitation.expiresAt,
    status: "DRAFT",
    submittedAt: null,
    approvedAt: null,
    firstName: payload.employeeFirstName.trim(),
    lastName: payload.employeeLastName.trim(),
    dateOfBirth: "",
    city: "",
    countryOfBirth: "",
    identityDocumentFile: null,
    identityDocumentStatus: "PENDING",
    identityDocumentComment: "",
    identityVerifiedAt: null,
    identityVerifiedBy: null,
    email: cleanedEmail,
    phone: "",
    additionalPhone: "",
    emergencyFirstName: "",
    emergencyLastName: "",
    emergencyPhone: "",
    emergencyEmail: "",
    emergencyCity: "",
    emergencyCountry: "",
    bankName: "",
    bankAccountNumber: "",
    employeeCode: payload.employeeCode.trim(),
    roleKeys: [], // Start clean for guided placeholders
    departmentName: "",
    positionName: "",
    managerEmail: "",
    branch: "",
    employmentType: "",
    employmentStatus: "onboarding",
    hireDate: "",
    probationEndDate: "",
    contractStartDate: "",
    contractEndDate: "",
    monthlySalary: "",
    salaryCurrency: "USD",
    additionalNotes: "",
    correctionMessage: "",
    correctionRequestedAt: null,
    correctionRequestedBy: null,
  };

  invitations.unshift(newInvitation);
  submissions.unshift(newSubmission);

  saveInvitations(invitations);
  saveSubmissions(submissions);

  addAuditLog(
    DEMO_HR_EMAIL,
    "INVITATION_CREATE",
    `Created onboarding invitation for ${newInvitation.employeeFirstName} ${newInvitation.employeeLastName} (${newInvitation.employeeEmail}). Code: ${newInvitation.employeeCode}`
  );

  return newInvitation;
}

export function revokeInvitation(invitationId: string): void {
  const invites = getInvitations();
  const submissions = getSubmissions();
  
  const inviteIndex = invites.findIndex((i) => i.id === invitationId);
  if (inviteIndex === -1) return;

  const invite = invites[inviteIndex];
  invite.status = "REVOKED";

  // Also prevent the token link from filling by setting token to null in record
  const subIndex = submissions.findIndex((s) => s.id === invitationId);
  if (subIndex !== -1) {
    submissions[subIndex].token = null;
    submissions[subIndex].tokenExpiresAt = null;
  }

  saveInvitations(invites);
  saveSubmissions(submissions);

  addAuditLog(
    DEMO_HR_EMAIL,
    "INVITATION_REVOKE",
    `Revoked invitation for ${invite.employeeFirstName} ${invite.employeeLastName} (${invite.employeeEmail})`
  );
}

export function resendInvitation(invitationId: string): void {
  const invites = getInvitations();
  const inviteIndex = invites.findIndex((i) => i.id === invitationId);
  if (inviteIndex === -1) return;

  const invite = invites[inviteIndex];
  invite.sentCount += 1;
  // Renew expiration by adding 7 more days from now
  invite.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  invite.status = "ACTIVE"; // reactive if it was expired

  // Update record token limits
  const submissions = getSubmissions();
  const subIndex = submissions.findIndex((s) => s.id === invitationId);
  if (subIndex !== -1) {
    submissions[subIndex].tokenExpiresAt = invite.expiresAt;
    // ensure token stays aligned
    submissions[subIndex].token = invite.token; 
  }

  saveInvitations(invites);
  saveSubmissions(submissions);

  addAuditLog(
    DEMO_HR_EMAIL,
    "INVITATION_RESEND",
    `Resent onboarding invitation to ${invite.employeeFirstName} ${invite.employeeLastName} (${invite.employeeEmail}), delivery attempt #${invite.sentCount}`
  );
}

export function processDocumentVerification(
  submissionId: string,
  newStatus: "VERIFIED" | "REJECTED" | "REPLACEMENT_REQUIRED",
  comment: string,
  hrUserEmail: string
): EmployeeRecord {
  const submissions = getSubmissions();
  const index = submissions.findIndex((s) => s.id === submissionId);
  if (index === -1) throw new Error("Record not found.");

  const rec = submissions[index];
  rec.identityDocumentStatus = newStatus;
  rec.identityDocumentComment = comment.trim();
  rec.identityVerifiedAt = new Date().toISOString();
  rec.identityVerifiedBy = hrUserEmail;

  // If replacement required, HR typically will also trigger a correction request,
  // but changing document state alters submission parameters directly as well
  saveSubmissions(submissions);

  const actionMap: Record<typeof newStatus, AuditLog["action"]> = {
    VERIFIED: "DOCUMENT_VERIFY",
    REJECTED: "DOCUMENT_REJECT",
    REPLACEMENT_REQUIRED: "DOCUMENT_REPLACEMENT",
  };

  addAuditLog(
    hrUserEmail,
    actionMap[newStatus],
    `Updated document status for ${rec.firstName} ${rec.lastName} (${rec.email}) to ${newStatus}. Note: ${comment || "None"}`
  );

  return rec;
}

export function requestOnboardingCorrection(
  submissionId: string,
  message: string,
  hrUserEmail: string
): EmployeeRecord {
  const submissions = getSubmissions();
  const index = submissions.findIndex((s) => s.id === submissionId);
  if (index === -1) throw new Error("Record not found.");

  const rec = submissions[index];
  rec.status = "NEEDS_CORRECTION";
  rec.correctionMessage = message.trim();
  rec.correctionRequestedAt = new Date().toISOString();
  rec.correctionRequestedBy = hrUserEmail;

  // Re-enable a unique temporary token if employee had none, so they can log back in securely
  // We can just reuse their original link or generate a secure state token
  const invites = getInvitations();
  const invite = invites.find((i) => i.id === submissionId);
  if (invite) {
    invite.status = "ACTIVE";
    invite.expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(); // 14 days extension for correction
    rec.token = invite.token;
    rec.tokenExpiresAt = invite.expiresAt;
    saveInvitations(invites);
  }

  saveSubmissions(submissions);

  addAuditLog(
    hrUserEmail,
    "CORRECTION_REQUEST",
    `Requested submission correction from ${rec.firstName} ${rec.lastName}. Message: "${message}"`
  );

  return rec;
}

export function approveSubmission(
  submissionId: string,
  hrFields: Partial<EmployeeRecord>,
  hrUserEmail: string
): EmployeeRecord {
  const submissions = getSubmissions();
  const index = submissions.findIndex((s) => s.id === submissionId);
  if (index === -1) throw new Error("Record not found.");

  const rec = submissions[index];

  // Merge the HR prefilled employment properties
  const merged: EmployeeRecord = {
    ...rec,
    ...hrFields,
    status: "APPROVED",
    approvedAt: new Date().toISOString(),
    token: null, // Revoke token upon full registry approval
    tokenExpiresAt: null,
  };

  // Perform validation on company-controlled inputs
  if (!merged.employeeCode.trim()) throw new Error("Employee Code is required before approval.");
  if (!merged.roleKeys || merged.roleKeys.length === 0) throw new Error("At least one authorized Role must be assigned.");
  if (!merged.employmentType) throw new Error("Employment Type must be specified.");
  if (!merged.employmentStatus) throw new Error("Employment Status is required.");
  if (!merged.hireDate) throw new Error("Hire Date cannot be blank.");

  const salaryNum = Number(merged.monthlySalary);
  if (isNaN(salaryNum) || salaryNum < 0) {
    throw new Error("Monthly Salary cannot be negative.");
  }
  
  if (merged.contractStartDate && merged.contractEndDate) {
    const start = new Date(merged.contractStartDate);
    const end = new Date(merged.contractEndDate);
    if (end < start) {
      throw new Error("Contract End Date cannot be earlier than Contract Start Date.");
    }
  }

  // Ensure unique constraints across other approved records
  const isCodeTaken = submissions.some(
    (s) => s.id !== submissionId && s.employeeCode.toUpperCase() === merged.employeeCode.trim().toUpperCase() && s.status === "APPROVED"
  );
  if (isCodeTaken) {
    throw new Error(`Employee Code "${merged.employeeCode}" is already assigned to another approved worker.`);
  }

  submissions[index] = merged;
  saveSubmissions(submissions);

  // Link used invitation as USED
  const invites = getInvitations();
  const inviteIndex = invites.findIndex((i) => i.id === submissionId);
  if (inviteIndex !== -1) {
    invites[inviteIndex].status = "USED";
    saveInvitations(invites);
  }

  addAuditLog(
    hrUserEmail,
    "SUBMISSION_APPROVE",
    `Approved Blih ERP registry entry for ${merged.firstName} ${merged.lastName}. Code: ${merged.employeeCode}. Assigned Department: ${merged.departmentName || "Unassigned"}`
  );

  return merged;
}

// ---------------------------
// EMPLOYEE FORM FLOW
// ---------------------------

export function findSubmissionByToken(token: string): EmployeeRecord | null {
  const submissions = getSubmissions();
  const rec = submissions.find((s) => s.token === token);
  if (!rec) return null;

  // Check token expiration
  if (rec.tokenExpiresAt) {
    const exp = new Date(rec.tokenExpiresAt);
    if (exp < new Date()) {
      return null; // Expired
    }
  }
  return rec;
}

export function saveEmployeeDraft(
  submissionId: string,
  updatedData: Partial<EmployeeRecord>
): EmployeeRecord {
  const submissions = getSubmissions();
  const index = submissions.findIndex((s) => s.id === submissionId);
  if (index === -1) throw new Error("Submission record matching token not found.");

  const rec = submissions[index];
  if (rec.status === "APPROVED") {
    throw new Error("Approved records are locked and cannot be edited.");
  }

  // If status is SUBMITTED, employee cannot edit (is locked under review)
  if (rec.status === "SUBMITTED") {
    throw new Error("Submissions currently under active HR review are locked.");
  }

  // Preserve read-only HR fields and deep properties safely
  const merged = {
    ...rec,
    ...updatedData,
    id: rec.id, // preserve ID
    // Keep HR controls locked from modification via employee page
    employeeCode: rec.employeeCode,
    roleKeys: rec.roleKeys,
    departmentName: rec.departmentName,
    positionName: rec.positionName,
    managerEmail: rec.managerEmail,
    branch: rec.branch,
    employmentType: rec.employmentType,
    employmentStatus: rec.employmentStatus,
    hireDate: rec.hireDate,
    probationEndDate: rec.probationEndDate,
    contractStartDate: rec.contractStartDate,
    contractEndDate: rec.contractEndDate,
    monthlySalary: rec.monthlySalary,
    salaryCurrency: rec.salaryCurrency,
    additionalNotes: rec.additionalNotes,
  };

  submissions[index] = merged as EmployeeRecord;
  saveSubmissions(submissions);

  return merged as EmployeeRecord;
}

export function submitEmployeeForm(
  submissionId: string,
  finalData: EmployeeRecord
): EmployeeRecord {
  const submissions = getSubmissions();
  const index = submissions.findIndex((s) => s.id === submissionId);
  if (index === -1) throw new Error("Record not found.");

  const original = submissions[index];
  if (original.status === "APPROVED") {
    throw new Error("This record has already been approved.");
  }

  // Compile final clean values
  const dateStr = new Date().toISOString();

  // Rules: Lowercase emails, trim spaces
  const cleanedEmail = finalData.email.trim().toLowerCase();
  
  const merged: EmployeeRecord = {
    ...original,
    ...finalData,
    email: cleanedEmail,
    phone: finalData.phone.trim(),
    additionalPhone: finalData.additionalPhone ? finalData.additionalPhone.trim() : "",
    status: "SUBMITTED",
    submittedAt: dateStr,
    // Reset/update document pending review
    identityDocumentStatus: "PENDING",
    correctionMessage: "", // Clear correction requests after submission
  };

  submissions[index] = merged;
  saveSubmissions(submissions);

  // Mark invitation as USED/SUBMITTED in audit
  const invites = getInvitations();
  const inv = invites.find((i) => i.id === submissionId);
  if (inv) {
    inv.status = "USED";
    saveInvitations(invites);
  }

  addAuditLog(
    cleanedEmail,
    "SUBMISSION_SUBMIT",
    `Completed self-service onboarding form for employee ${merged.firstName} ${merged.lastName}. Status updated to SUBMITTED.`
  );

  return merged;
}

// --------------------------
// MOCK SECURE FILE UPLOADER
// --------------------------

export function simulateSecureFileUpload(
  file: File,
  docType?: string
): MockFileMetadata {
  // Validate limits
  const maxSize_5MB = 5 * 1024 * 1024;
  if (file.size > maxSize_5MB) {
    throw new Error(`File "${file.name}" exceeds the maximum authorized limit of 5 MB.`);
  }

  const allowedTypes = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Unsupported file format. Please upload a PDF, PNG, JPG, or JPEG.");
  }

  // Generate safe temporary URL path
  const dataPreviewUrl = docType === "PASSPORT" ? MOCK_PASSPORT_PREVIEW : MOCK_FAYDA_PREVIEW;

  return {
    name: file.name.replace(/[^\w.-]/g, "_"), // trim spaces/unsafe chars
    size: file.size,
    type: file.type,
    uploadedAt: new Date().toISOString(),
    dataUrl: dataPreviewUrl,
  };
}

// --------------------------
// CSV EXPORT GENERATOR
// --------------------------

export function generateBlihErpCsv(records: EmployeeRecord[]): string {
  // Ordered exact headers as requested
  const columns = [
    "employeeCode",
    "firstName",
    "lastName",
    "email",
    "phone",
    "roleKeys",
    "departmentName",
    "positionName",
    "managerEmail",
    "branch",
    "employmentType",
    "employmentStatus",
    "hireDate",
    "probationEndDate",
    "contractStartDate",
    "contractEndDate",
    "monthlySalary",
    "salaryCurrency",
    "dateOfBirth",
    "city",
    "countryOfBirth",
    "additionalPhone",
    "additionalNotes",
    "emergencyFirstName",
    "emergencyLastName",
    "emergencyPhone",
    "emergencyEmail",
    "emergencyCity",
    "emergencyCountry",
    "bankName",
    "bankAccountNumber"
  ];

  const escapeCsvValue = (val: any): string => {
    if (val === undefined || val === null) return "";
    let str = "";
    if (Array.isArray(val)) {
      // e.g. roleKeys exports as EMPLOYEE|HR_MANAGER
      str = val.join("|");
    } else {
      str = String(val).trim();
    }
    // escape CSV double quotes and commas
    if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
      str = `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const lines = [columns.join(",")];

  records.forEach((rec) => {
    // Collect mapping details
    const mapping: Record<string, any> = {
      employeeCode: rec.employeeCode,
      firstName: rec.firstName,
      lastName: rec.lastName,
      email: rec.email.toLowerCase(),
      phone: rec.phone,
      roleKeys: rec.roleKeys, // Array gets escaped with pipe delimiter
      departmentName: rec.departmentName,
      positionName: rec.positionName,
      managerEmail: rec.managerEmail ? rec.managerEmail.toLowerCase() : "",
      branch: rec.branch,
      employmentType: rec.employmentType,
      employmentStatus: rec.employmentStatus,
      hireDate: rec.hireDate, // YYYY-MM-DD
      probationEndDate: rec.probationEndDate,
      contractStartDate: rec.contractStartDate,
      contractEndDate: rec.contractEndDate,
      monthlySalary: rec.monthlySalary,
      salaryCurrency: rec.salaryCurrency,
      dateOfBirth: rec.dateOfBirth,
      city: rec.city,
      countryOfBirth: rec.countryOfBirth,
      additionalPhone: rec.additionalPhone,
      additionalNotes: rec.additionalNotes,
      emergencyFirstName: rec.emergencyFirstName,
      emergencyLastName: rec.emergencyLastName,
      emergencyPhone: rec.emergencyPhone,
      emergencyEmail: rec.emergencyEmail ? rec.emergencyEmail.toLowerCase() : "",
      emergencyCity: rec.emergencyCity,
      emergencyCountry: rec.emergencyCountry,
      bankName: rec.bankName,
      bankAccountNumber: rec.bankAccountNumber, // stored as text, preserves leading zeros
    };

    const lineValues = columns.map((col) => escapeCsvValue(mapping[col]));
    lines.push(lineValues.join(","));
  });

  return lines.join("\n");
}

export function downloadRecordAsCsv(records: EmployeeRecord | EmployeeRecord[], filenamePrefix = "Employee_Submission") {
  const recordList = Array.isArray(records) ? records : [records];
  const csvContent = generateBlihErpCsv(recordList);
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const dateStr = new Date().toISOString().slice(0, 10);
  link.setAttribute("href", url);
  link.setAttribute("download", `${filenamePrefix}_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Helper to mask identity documents and bank cards for basic dashboard privacy
export function maskIdentityNumber(num: string): string {
  if (!num) return "";
  if (num.length <= 4) return "****";
  const maskedLength = num.length - 4;
  return "*".repeat(maskedLength) + num.slice(-4);
}

export function maskBankAccountNumber(num: string): string {
  if (!num) return "";
  if (num.length <= 4) return "******";
  return "•••• •••• " + num.slice(-4);
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
