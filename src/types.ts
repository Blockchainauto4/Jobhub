export type BrazilState = 
  | 'SP' 
  | 'RJ' 
  | 'MG' 
  | 'PR' 
  | 'SC' 
  | 'RS' 
  | 'BA' 
  | 'PE' 
  | 'CE' 
  | 'DF' 
  | 'GO' 
  | 'ES'
  | 'AM'
  | 'PA'
  | 'Outros';

export type JobSector = 
  | 'Eventos & Festas'
  | 'Bares & Restaurantes'
  | 'Finanças & Caixa de Eventos'
  | 'Logística & Cargas'
  | 'Limpeza & Serviços'
  | 'Limpeza & Facilities'
  | 'Hotelaria & Recepção'
  | 'Audiovisual & Montagem'
  | 'Segurança & Apoio'
  | 'Outros';

export interface CertificationItem {
  id: string;
  name: string;
  category: JobSector;
  issuingEntity: string;
  isMandatoryByLaw?: boolean;
  description: string;
  badgeLabel: string;
  officialUrl?: string;
}

export interface CandidateSkill {
  id: string;
  name: string;
  category: string;
  isSpecialized?: boolean;
}

export interface JobApplicant {
  id: string;
  jobId: string;
  name: string;
  whatsapp: string;
  pixKey: string;
  pixType: 'cpf' | 'email' | 'phone' | 'random';
  experienceSummary: string;
  appliedAt: string;
  status: 'pending' | 'accepted' | 'rejected' | 'checked_in' | 'paid';
  rating?: number;
  completedJobsCount?: number;
  skills?: string[];
  certifications?: string[];
  equipmentOwned?: string[];
  state?: BrazilState;
  city?: string;
  neighborhood?: string;
  paidAmount?: number;
  paidAt?: string;
  notes?: string;
}

export interface FreelanceJob {
  id: string;
  title: string;
  role: string;
  category: JobSector;
  state: BrazilState;
  city: string;
  neighborhood: string;
  slotsTotal: number;
  slotsAvailable: number;
  date: string;
  startTime: string;
  endTime: string;
  cachet: number;
  paymentDetails: string;
  benefits: string;
  dressCode: string;
  locationName: string;
  locationAddress: string;
  googleMapsUrl: string;
  contactPhone: string;
  contactName: string;
  isUrgent: boolean;
  status: 'open' | 'filled' | 'in_progress' | 'completed' | 'cancelled';
  requirements: string[];
  desiredSkills?: string[];
  requiredCertifications?: string[];
  applicantsCount: number;
  createdAt: string;
  applicants?: JobApplicant[];
  sponsorMissionUrl?: string;
  requiresMissionToUnlockContact?: boolean;
  genderRequirement?: 'todos' | 'homens' | 'mulheres';
  datesList?: string[];
}

export interface UserProfile {
  id: string;
  userType: 'freelancer' | 'contractor' | 'both';
  name: string;
  companyName?: string;
  phone: string;
  cpfOrCnpj?: string;
  pixKey: string;
  pixType: 'cpf' | 'email' | 'phone' | 'random';
  state: BrazilState;
  city: string;
  neighborhood: string;
  skills: string[];
  certifications?: string[];
  equipmentOwned?: string[];
  bio?: string;
  completedJobsCount?: number;
  totalEarnings?: number;
  credits?: number; // 50 Créditos de Vagas
  unlockedJobContacts?: string[]; // Job IDs where contact was unlocked
  missionsCompleted?: {
    tiktokReferral: boolean;
    kwaiReferral: boolean;
    whatsappGroupJoined: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface FreelancerProfile {
  id?: string;
  name: string;
  phone: string;
  cpf?: string;
  pixKey: string;
  pixType: 'cpf' | 'email' | 'phone' | 'random';
  state: BrazilState;
  city: string;
  neighborhood: string;
  skills: string[];
  certifications?: string[];
  equipmentOwned?: string[];
  experience: string;
  totalEarnings: number;
  completedJobsCount: number;
  rating: number;
}

export interface UserGrowthDataPoint {
  period: string;
  totalUsers: number;
  newFreelancers: number;
  newContractors: number;
  verifiedProfiles: number;
}

export interface CategoryMetric {
  category: JobSector | string;
  count: number;
  totalSlots: number;
  filledSlots: number;
  availableSlots: number;
  totalCachetValue: number;
  avgCachet: number;
  fillRate: number;
  color: string;
}

export interface MissionTelemetry {
  totalInitiated: number;
  totalCompleted: number;
  completionRate: number;
  tiktokCompleted: number;
  kwaiCompleted: number;
  whatsappGroupJoined: number;
  sponsorContactUnlocked: number;
  totalRewardsDistributed: number;
  hourlyTrends: {
    hour: string;
    tiktok: number;
    kwai: number;
    whatsapp: number;
    unlocks: number;
  }[];
  liveEvents: {
    id: string;
    timestamp: string;
    userName: string;
    missionType: 'tiktok' | 'kwai' | 'whatsapp' | 'contact_unlock';
    jobRole?: string;
    rewardAmount?: number;
    status: 'completed';
  }[];
}

export interface AdminDashboardMetrics {
  kpis: {
    totalUsers: number;
    usersGrowthPct: number;
    totalActiveJobs: number;
    totalCachetVolume: number;
    missionCompletionRate: number;
    totalMissionsCompleted: number;
    totalApplicants: number;
    avgFillRate: number;
  };
  userGrowth: {
    '7d': UserGrowthDataPoint[];
    '30d': UserGrowthDataPoint[];
    '6m': UserGrowthDataPoint[];
    '1y': UserGrowthDataPoint[];
  };
  categories: CategoryMetric[];
  missions: MissionTelemetry;
  lastUpdated: string;
}

export interface DbStatusInfo {
  engine: 'neon_postgres' | 'local_persistent_json';
  status: 'connected' | 'fallback_active';
  totalJobs: number;
  totalApplicants: number;
  databaseUrlConfigured: boolean;
  sampleSqlSchema: string;
  vercelInstructions: string;
}

export type AdminRole = 
  | 'super_admin' 
  | 'job_manager' 
  | 'candidate_reviewer' 
  | 'financial_operator';

export interface AdminPermissions {
  canPostJobs: boolean;
  canEditJobs: boolean;
  canDeleteJobs: boolean;
  canManageApplicants: boolean;
  canApprovePixPayments: boolean;
  canManageAdmins: boolean;
  canViewTelemetry: boolean;
  canExportReports: boolean;
}

export interface SystemAdmin {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  roleLabel: string;
  status: 'active' | 'blocked';
  createdAt: string;
  lastLoginAt?: string;
  permissions: AdminPermissions;
  avatarUrl?: string;
  notes?: string;
}

export interface AdminAuditLog {
  id: string;
  timestamp: string;
  adminId: string;
  adminName: string;
  adminRole: AdminRole;
  action: 
    | 'login' 
    | 'logout'
    | 'job_create' 
    | 'job_edit' 
    | 'job_delete' 
    | 'job_status_change'
    | 'applicant_status_change' 
    | 'pix_payment_confirm' 
    | 'admin_create' 
    | 'admin_update' 
    | 'admin_delete' 
    | 'password_change'
    | 'security_policy_update';
  title: string;
  details: string;
  targetId?: string;
  severity: 'info' | 'warning' | 'success' | 'danger';
}

export interface AdminSession {
  token: string;
  admin: SystemAdmin;
  expiresAt: string;
}

export interface TikTokMissionConfig {
  id: string;
  activeUrl: string;
  generatedAt: string;
  expiresAt: string;
  isActive: boolean;
  lockAllJobs: boolean;
  totalClicks: number;
  totalUnlocks: number;
  missionTitle: string;
  missionInstructions: string;
  rewardDescription: string;
  updatedAt: string;
}

