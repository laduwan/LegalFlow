// ============================================================
// IMMIGRATION CASE TYPES
// ============================================================

export const IMMIGRATION_CASE_TYPES = [
  { value: "family-based", label: "Family-Based Immigration" },
  { value: "employment-based", label: "Employment-Based Immigration" },
  { value: "asylum", label: "Asylum / Refugee" },
  { value: "removal-defense", label: "Removal Defense / Deportation" },
  { value: "daca", label: "DACA" },
  { value: "tps", label: "Temporary Protected Status (TPS)" },
  { value: "naturalization", label: "Naturalization / Citizenship" },
  { value: "adjustment-of-status", label: "Adjustment of Status" },
  { value: "consular-processing", label: "Consular Processing" },
  { value: "h1b", label: "H-1B Visa" },
  { value: "l1", label: "L-1 Visa" },
  { value: "o1", label: "O-1 Visa" },
  { value: "eb5", label: "EB-5 Investor Visa" },
  { value: "vawa", label: "VAWA" },
  { value: "u-visa", label: "U Visa" },
  { value: "t-visa", label: "T Visa" },
  { value: "sij", label: "Special Immigrant Juvenile" },
  { value: "bond", label: "Bond Hearing" },
  { value: "other", label: "Other" },
] as const;

// ============================================================
// USCIS FORMS
// ============================================================

export const USCIS_FORMS = [
  { value: "I-130", label: "I-130 - Petition for Alien Relative", category: "family" },
  { value: "I-130A", label: "I-130A - Supplemental Information", category: "family" },
  { value: "I-485", label: "I-485 - Adjustment of Status", category: "green-card" },
  { value: "I-765", label: "I-765 - Employment Authorization (EAD)", category: "work" },
  { value: "I-131", label: "I-131 - Travel Document (Advance Parole)", category: "travel" },
  { value: "I-589", label: "I-589 - Asylum Application", category: "asylum" },
  { value: "I-751", label: "I-751 - Remove Conditions on Residence", category: "green-card" },
  { value: "I-601", label: "I-601 - Waiver of Inadmissibility", category: "waiver" },
  { value: "I-601A", label: "I-601A - Provisional Unlawful Presence Waiver", category: "waiver" },
  { value: "I-212", label: "I-212 - Permission to Reapply for Admission", category: "waiver" },
  { value: "N-400", label: "N-400 - Naturalization Application", category: "citizenship" },
  { value: "I-129", label: "I-129 - Nonimmigrant Worker Petition", category: "work" },
  { value: "I-140", label: "I-140 - Immigrant Petition for Alien Workers", category: "employment" },
  { value: "I-526", label: "I-526 - Immigrant Petition by Investor", category: "investment" },
  { value: "I-539", label: "I-539 - Extend/Change Nonimmigrant Status", category: "status" },
  { value: "I-864", label: "I-864 - Affidavit of Support", category: "family" },
  { value: "I-693", label: "I-693 - Medical Examination", category: "medical" },
  { value: "I-944", label: "I-944 - Declaration of Self-Sufficiency", category: "support" },
  { value: "I-290B", label: "I-290B - Notice of Appeal/Motion", category: "appeal" },
  { value: "EOIR-26", label: "EOIR-26 - Notice of Appeal (BIA)", category: "court" },
  { value: "EOIR-28", label: "EOIR-28 - Entry of Appearance", category: "court" },
  { value: "EOIR-42A", label: "EOIR-42A - Cancellation of Removal (LPR)", category: "court" },
  { value: "EOIR-42B", label: "EOIR-42B - Cancellation of Removal (Non-LPR)", category: "court" },
] as const;

// ============================================================
// IMMIGRATION STATUS OPTIONS
// ============================================================

export const IMMIGRATION_STATUSES = [
  { value: "us-citizen", label: "U.S. Citizen" },
  { value: "lpr", label: "Lawful Permanent Resident (Green Card)" },
  { value: "conditional-resident", label: "Conditional Resident" },
  { value: "h1b", label: "H-1B Worker" },
  { value: "h4", label: "H-4 Dependent" },
  { value: "l1", label: "L-1 Intracompany Transferee" },
  { value: "f1", label: "F-1 Student" },
  { value: "j1", label: "J-1 Exchange Visitor" },
  { value: "b1b2", label: "B-1/B-2 Visitor" },
  { value: "ead", label: "EAD Holder" },
  { value: "asylee", label: "Asylee" },
  { value: "refugee", label: "Refugee" },
  { value: "tps", label: "TPS Holder" },
  { value: "daca", label: "DACA Recipient" },
  { value: "parole", label: "Parolee" },
  { value: "undocumented", label: "Undocumented" },
  { value: "removal-proceedings", label: "In Removal Proceedings" },
  { value: "detained", label: "Detained" },
  { value: "other", label: "Other" },
] as const;

// ============================================================
// MATTER STATUSES
// ============================================================

export const MATTER_STATUSES = [
  { value: "INTAKE", label: "Intake", color: "bg-blue-100 text-blue-800" },
  { value: "ACTIVE", label: "Active", color: "bg-green-100 text-green-800" },
  { value: "PENDING", label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  { value: "ON_HOLD", label: "On Hold", color: "bg-orange-100 text-orange-800" },
  { value: "CLOSED", label: "Closed", color: "bg-gray-100 text-gray-800" },
  { value: "ARCHIVED", label: "Archived", color: "bg-gray-100 text-gray-500" },
] as const;

// ============================================================
// FORM STATUS PIPELINE
// ============================================================

export const FORM_STATUSES = [
  { value: "NOT_STARTED", label: "Not Started", color: "bg-gray-100 text-gray-800" },
  { value: "IN_PROGRESS", label: "In Progress", color: "bg-blue-100 text-blue-800" },
  { value: "READY_FOR_REVIEW", label: "Ready for Review", color: "bg-purple-100 text-purple-800" },
  { value: "APPROVED", label: "Approved", color: "bg-indigo-100 text-indigo-800" },
  { value: "FILED", label: "Filed", color: "bg-cyan-100 text-cyan-800" },
  { value: "RECEIVED", label: "Received (Receipt)", color: "bg-teal-100 text-teal-800" },
  { value: "RFE_ISSUED", label: "RFE Issued", color: "bg-red-100 text-red-800" },
  { value: "RFE_RESPONDED", label: "RFE Responded", color: "bg-amber-100 text-amber-800" },
  { value: "APPROVED_BY_USCIS", label: "Approved by USCIS", color: "bg-green-100 text-green-800" },
  { value: "DENIED", label: "Denied", color: "bg-red-100 text-red-800" },
] as const;

// ============================================================
// BOND STATUSES
// ============================================================

export const BOND_STATUSES = [
  { value: "none", label: "No Bond" },
  { value: "set", label: "Bond Set" },
  { value: "posted", label: "Bond Posted" },
  { value: "denied", label: "Bond Denied" },
  { value: "revoked", label: "Bond Revoked" },
] as const;

// ============================================================
// TIME ENTRY ACTIVITY TYPES
// ============================================================

export const ACTIVITY_TYPES = [
  { value: "research", label: "Legal Research" },
  { value: "drafting", label: "Document Drafting" },
  { value: "review", label: "Document Review" },
  { value: "client-meeting", label: "Client Meeting" },
  { value: "client-call", label: "Client Phone Call" },
  { value: "court-appearance", label: "Court Appearance" },
  { value: "hearing-prep", label: "Hearing Preparation" },
  { value: "filing", label: "Filing / Submission" },
  { value: "correspondence", label: "Correspondence" },
  { value: "uscis-inquiry", label: "USCIS Inquiry" },
  { value: "case-strategy", label: "Case Strategy" },
  { value: "immigration-forms", label: "Immigration Form Preparation" },
  { value: "travel", label: "Travel" },
  { value: "administrative", label: "Administrative" },
  { value: "other", label: "Other" },
] as const;

// ============================================================
// DOCUMENT TYPES
// ============================================================

export const DOCUMENT_TYPES = [
  { value: "pleading", label: "Pleading" },
  { value: "correspondence", label: "Correspondence" },
  { value: "evidence", label: "Evidence" },
  { value: "government-form", label: "Government Form" },
  { value: "identification", label: "Identification Document" },
  { value: "financial", label: "Financial Document" },
  { value: "medical", label: "Medical Record" },
  { value: "court-order", label: "Court Order" },
  { value: "receipt-notice", label: "USCIS Receipt Notice" },
  { value: "approval-notice", label: "Approval Notice" },
  { value: "rfe", label: "Request for Evidence" },
  { value: "nta", label: "Notice to Appear" },
  { value: "support-letter", label: "Support Letter" },
  { value: "translation", label: "Translation" },
  { value: "contract", label: "Contract / Agreement" },
  { value: "invoice", label: "Invoice" },
  { value: "template", label: "Template" },
  { value: "other", label: "Other" },
] as const;

// ============================================================
// COUNTRIES (subset — most commonly used in immigration)
// ============================================================

export const COUNTRIES = [
  { value: "US", label: "United States" },
  { value: "MX", label: "Mexico" },
  { value: "GT", label: "Guatemala" },
  { value: "HN", label: "Honduras" },
  { value: "SV", label: "El Salvador" },
  { value: "CO", label: "Colombia" },
  { value: "BR", label: "Brazil" },
  { value: "VE", label: "Venezuela" },
  { value: "CU", label: "Cuba" },
  { value: "HT", label: "Haiti" },
  { value: "DO", label: "Dominican Republic" },
  { value: "PE", label: "Peru" },
  { value: "EC", label: "Ecuador" },
  { value: "CN", label: "China" },
  { value: "IN", label: "India" },
  { value: "PH", label: "Philippines" },
  { value: "VN", label: "Vietnam" },
  { value: "KR", label: "South Korea" },
  { value: "PK", label: "Pakistan" },
  { value: "BD", label: "Bangladesh" },
  { value: "NG", label: "Nigeria" },
  { value: "ET", label: "Ethiopia" },
  { value: "GH", label: "Ghana" },
  { value: "EG", label: "Egypt" },
  { value: "JM", label: "Jamaica" },
  { value: "NI", label: "Nicaragua" },
  { value: "UA", label: "Ukraine" },
  { value: "RU", label: "Russia" },
  { value: "GB", label: "United Kingdom" },
  { value: "CA", label: "Canada" },
  { value: "OTHER", label: "Other" },
] as const;

// ============================================================
// LANGUAGES
// ============================================================

export const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "zh", label: "Chinese (Mandarin)" },
  { value: "fr", label: "French" },
  { value: "ht", label: "Haitian Creole" },
  { value: "pt", label: "Portuguese" },
  { value: "vi", label: "Vietnamese" },
  { value: "ko", label: "Korean" },
  { value: "ar", label: "Arabic" },
  { value: "hi", label: "Hindi" },
  { value: "ur", label: "Urdu" },
  { value: "bn", label: "Bengali" },
  { value: "tl", label: "Tagalog" },
  { value: "ru", label: "Russian" },
  { value: "uk", label: "Ukrainian" },
  { value: "other", label: "Other" },
] as const;

// ============================================================
// EVENT TYPES
// ============================================================

export const EVENT_TYPES = [
  { value: "COURT_HEARING", label: "Court Hearing", color: "#DC2626" },
  { value: "CLIENT_MEETING", label: "Client Meeting", color: "#2563EB" },
  { value: "DEADLINE", label: "Deadline", color: "#D97706" },
  { value: "FILING_DEADLINE", label: "Filing Deadline", color: "#DC2626" },
  { value: "SOL_DEADLINE", label: "Statute of Limitations", color: "#7C3AED" },
  { value: "VISA_EXPIRATION", label: "Visa Expiration", color: "#EA580C" },
  { value: "WORK_AUTH_EXPIRATION", label: "Work Auth Expiration", color: "#EA580C" },
  { value: "DEPOSITION", label: "Deposition", color: "#0891B2" },
  { value: "CONSULTATION", label: "Consultation", color: "#059669" },
  { value: "INTERNAL_MEETING", label: "Internal Meeting", color: "#6B7280" },
  { value: "OTHER", label: "Other", color: "#6B7280" },
] as const;
