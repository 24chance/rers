// ─── Enums ───────────────────────────────────────────────────────────────────

export enum UserRole {
  APPLICANT = 'APPLICANT',
  REVIEWER = 'REVIEWER',
  IRB_ADMIN = 'IRB_ADMIN',
  RNEC_ADMIN = 'RNEC_ADMIN',
  FINANCE_OFFICER = 'FINANCE_OFFICER',
  CHAIRPERSON = 'CHAIRPERSON',
  SYSTEM_ADMIN = 'SYSTEM_ADMIN',
}

export enum ApplicationStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  SCREENING = 'SCREENING',
  PAYMENT_PENDING = 'PAYMENT_PENDING',
  PAYMENT_VERIFIED = 'PAYMENT_VERIFIED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  QUERY_RAISED = 'QUERY_RAISED',
  RESPONSE_RECEIVED = 'RESPONSE_RECEIVED',
  DECISION_PENDING = 'DECISION_PENDING',
  APPROVED = 'APPROVED',
  CONDITIONALLY_APPROVED = 'CONDITIONALLY_APPROVED',
  REJECTED = 'REJECTED',
  AMENDMENT_PENDING = 'AMENDMENT_PENDING',
  MONITORING_ACTIVE = 'MONITORING_ACTIVE',
  CLOSED = 'CLOSED',
}

export enum ApplicationType {
  FULL_BOARD = 'FULL_BOARD',
  EXPEDITED = 'EXPEDITED',
  EXEMPT = 'EXEMPT',
}

export enum ReviewRecommendation {
  APPROVE = 'APPROVE',
  APPROVE_WITH_CONDITIONS = 'APPROVE_WITH_CONDITIONS',
  REJECT = 'REJECT',
  DEFER = 'DEFER',
  ABSTAIN = 'ABSTAIN',
}

export enum DecisionType {
  APPROVED = 'APPROVED',
  CONDITIONALLY_APPROVED = 'CONDITIONALLY_APPROVED',
  REJECTED = 'REJECTED',
  DEFERRED = 'DEFERRED',
}

export enum DocumentType {
  PROTOCOL = 'PROTOCOL',
  CONSENT_FORM = 'CONSENT_FORM',
  QUESTIONNAIRE = 'QUESTIONNAIRE',
  BUDGET = 'BUDGET',
  CV = 'CV',
  ETHICS_APPROVAL = 'ETHICS_APPROVAL',
  SUPPORTING_DOCUMENT = 'SUPPORTING_DOCUMENT',
  OTHER = 'OTHER',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  REFUNDED = 'REFUNDED',
}

export enum NotificationType {
  APPLICATION_SUBMITTED = 'APPLICATION_SUBMITTED',
  QUERY_RAISED = 'QUERY_RAISED',
  PAYMENT_PENDING = 'PAYMENT_PENDING',
  REVIEWER_ASSIGNED = 'REVIEWER_ASSIGNED',
  DECISION_ISSUED = 'DECISION_ISSUED',
  CERTIFICATE_AVAILABLE = 'CERTIFICATE_AVAILABLE',
  GENERAL = 'GENERAL',
}

// ─── Entity Interfaces ────────────────────────────────────────────────────────

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  role: UserRole
  tenantId?: string | null
  isActive: boolean
  isVerified: boolean
  firstLogin?: boolean
  createdAt: string
}

export interface Tenant {
  id: string
  name: string
  code: string
  type: string
  logoUrl?: string
  isActive: boolean
}

export interface Application {
  id: string
  referenceNumber: string | null
  title: string
  type: ApplicationType
  status: ApplicationStatus
  tenantId: string | null
  applicantId: string
  destinationId?: string | null
  principalInvestigator?: string | null
  coInvestigators?: string[]
  studyDuration?: string | null
  studyStartDate?: string | null
  studyEndDate?: string | null
  population?: string | null
  sampleSize?: number | null
  methodology?: string | null
  fundingSource?: string | null
  budget?: number | string | null
  ethicsStatement?: string | null
  consentDescription?: string | null
  formData: Record<string, unknown>
  tenant?: {
    id: string
    name: string
    code: string
  } | null
  applicant?: {
    id: string
    firstName: string
    lastName: string
    email: string
  } | null
  destination?: {
    id: string
    name: string
    code: string
  } | null
  _count?: {
    documents: number
    queries: number
    reviewAssignments: number
  }
  submittedAt?: string
  createdAt: string
  updatedAt: string
}

export interface ApplicationDocument {
  id: string
  applicationId: string
  fileName: string
  originalName: string
  mimeType: string
  size: number
  path: string
  cloudinaryPublicId?: string | null
  documentType: DocumentType
  version: number
  createdAt: string
}

export interface Review {
  id: string
  applicationId: string
  reviewerId: string
  comments?: string
  recommendation?: ReviewRecommendation
  conditions?: string
  isComplete: boolean
  completedAt?: string
  createdAt?: string
  updatedAt?: string
  application?: Pick<
    Application,
    'id' | 'referenceNumber' | 'title' | 'type' | 'status'
  >
  reviewer?: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>
}

export interface ReviewAssignment {
  id: string
  applicationId: string
  reviewerId: string
  assignedById?: string | null
  conflictDeclared: boolean
  conflictReason?: string | null
  isActive: boolean
  dueDate?: string | null
  createdAt: string
  updatedAt: string
  application?: Pick<
    Application,
    'id' | 'referenceNumber' | 'title' | 'type' | 'status'
  >
  reviewer?: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>
}

export interface Decision {
  id: string
  applicationId: string
  type: DecisionType
  conditions?: string
  rationale?: string
  createdAt: string
}

export interface Certificate {
  id: string
  applicationId: string
  certificateNumber: string
  verificationToken: string
  issuedAt: string
  expiresAt?: string
}

export interface Invoice {
  id: string
  applicationId: string
  amount: number
  currency: string
  description?: string | null
  status: PaymentStatus
  dueDate?: string | null
  createdAt?: string
  updatedAt?: string
  application?: Pick<Application, 'id' | 'referenceNumber' | 'title'>
  payments?: Payment[]
}

export interface Payment {
  id: string
  invoiceId: string
  amount: number | string
  method?: string | null
  referenceNumber?: string | null
  status: PaymentStatus
  notes?: string | null
  verifiedAt?: string | null
  createdAt: string
  invoice?: {
    id: string
    amount?: number | string
    currency?: string
    application?: Pick<Application, 'id' | 'referenceNumber' | 'title'>
  }
  receipts?: Receipt[]
}

export interface Receipt {
  id: string
  paymentId: string
  receiptNumber: string
  amount: number | string
  issuedAt: string
  payment?: {
    id: string
    method?: string | null
    referenceNumber?: string | null
    invoice?: {
      id: string
      amount?: number | string
      currency?: string
      application?: Pick<Application, 'id' | 'referenceNumber' | 'title'> & {
        applicant?: Pick<User, 'firstName' | 'lastName' | 'email'>
      }
    }
  }
}

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  isRead: boolean
  createdAt: string
}

export interface WorkflowTransition {
  id: string
  applicationId: string
  fromStatus: ApplicationStatus
  toStatus: ApplicationStatus
  actorId: string
  reason?: string
  createdAt: string
}

// ─── Utility Types ────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export interface ApiError {
  message: string
  statusCode: number
  error?: string
  details?: Record<string, string[]>
}

export interface AuthUser {
  user: User
  accessToken: string
}
