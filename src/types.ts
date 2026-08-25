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

export interface DbStatusInfo {
  engine: 'neon_postgres' | 'local_persistent_json';
  status: 'connected' | 'fallback_active';
  totalJobs: number;
  totalApplicants: number;
  databaseUrlConfigured: boolean;
  sampleSqlSchema: string;
  vercelInstructions: string;
}

