export type UserRole = "ADMIN" | "ATTORNEY" | "PARALEGAL" | "LEGAL_ASSISTANT" | "READ_ONLY";

export type MatterType = "IMMIGRATION" | "CRIMINAL" | "PERSONAL_INJURY" | "GENERAL";

export type MatterStatus = "INTAKE" | "ACTIVE" | "PENDING" | "ON_HOLD" | "CLOSED" | "ARCHIVED";

export type BillingType = "HOURLY" | "FLAT_FEE" | "CONTINGENCY" | "HYBRID" | "PRO_BONO";

export type ContactType =
  | "CLIENT"
  | "OPPOSING_PARTY"
  | "WITNESS"
  | "EXPERT"
  | "COURT"
  | "MEDICAL_PROVIDER"
  | "INSURANCE"
  | "GOVERNMENT_AGENCY"
  | "OTHER";

export type ImmigrationFormStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "READY_FOR_REVIEW"
  | "APPROVED"
  | "FILED"
  | "RECEIVED"
  | "RFE_ISSUED"
  | "RFE_RESPONDED"
  | "APPROVED_BY_USCIS"
  | "DENIED";

export type EventType =
  | "COURT_HEARING"
  | "CLIENT_MEETING"
  | "DEADLINE"
  | "TASK_DUE"
  | "DEPOSITION"
  | "FILING_DEADLINE"
  | "SOL_DEADLINE"
  | "VISA_EXPIRATION"
  | "WORK_AUTH_EXPIRATION"
  | "CONSULTATION"
  | "INTERNAL_MEETING"
  | "OTHER";

export interface SessionUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  organizationId: string;
  organizationName: string;
}

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  children?: NavItem[];
  badge?: number;
}

export interface ConnectionStatus {
  id: string;
  name: string;
  description: string;
  status: "connected" | "disconnected" | "configured" | "not_configured";
  category: string;
  lastChecked?: Date;
  configUrl?: string;
  externalUrl?: string;
}
