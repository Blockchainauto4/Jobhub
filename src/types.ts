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
  paidAmount?: number;
  paidAt?: string;
  notes?: string;
}

export interface FreelanceJob {
  id: string;
  title: string;
  role: string;
  category: 'Eventos & Festas' | 'Bares & Restaurantes' | 'Logística & Cargas' | 'Limpeza & Serviços' | 'Hotelaria & Recepção' | 'Outros';
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
  neighborhood: string;
  city: string;
  googleMapsUrl: string;
  contactPhone: string;
  contactName: string;
  isUrgent: boolean;
  status: 'open' | 'filled' | 'in_progress' | 'completed' | 'cancelled';
  requirements: string[];
  applicantsCount: number;
  createdAt: string;
  applicants?: JobApplicant[];
}

export interface FreelancerProfile {
  name: string;
  phone: string;
  pixKey: string;
  pixType: 'cpf' | 'email' | 'phone' | 'random';
  city: string;
  skills: string[];
  experience: string;
  totalEarnings: number;
  completedJobsCount: number;
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
