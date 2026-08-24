import fs from 'fs';
import path from 'path';
import { FreelanceJob, JobApplicant } from '../src/types.js';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'freelahub_db.json');

const INITIAL_JOBS: FreelanceJob[] = [
  {
    id: 'job-1',
    title: 'Equipe de Limpeza e Organização - Evento Jardins',
    role: 'Limpeza',
    category: 'Limpeza & Serviços',
    slotsTotal: 3,
    slotsAvailable: 2,
    date: '2026-08-24',
    startTime: '13:00',
    endTime: '22:00',
    cachet: 140.00,
    paymentDetails: 'Pagamento ao final via PIX',
    benefits: 'Água e café no local + Intervalo para refeição',
    dressCode: 'Roupa TODA PRETA (sem detalhes ou rasgos) + tênis/sapato escuro e confortável',
    locationName: 'Jardins Eventos & Gastronomia',
    locationAddress: 'Rua Chile, 113 - Jardins, São Paulo - SP',
    neighborhood: 'Jardins',
    city: 'São Paulo - SP',
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Rua+Chile,+113+-+Jardim+Paulista,+Sao+Paulo',
    contactPhone: '(11) 98799-7872',
    contactName: 'Coordenação FreelaHub (Marcelo)',
    isUrgent: true,
    status: 'open',
    requirements: [
      'Maior de 18 anos',
      'Experiência prévia em eventos ou limpeza comercial',
      'Pontualidade rigorosa (chegar 15 min antes)'
    ],
    applicantsCount: 2,
    createdAt: new Date().toISOString(),
    applicants: [
      {
        id: 'app-1',
        jobId: 'job-1',
        name: 'Carla Silveira',
        whatsapp: '(11) 98123-4567',
        pixKey: 'carla.silveira@email.com',
        pixType: 'email',
        experienceSummary: '3 anos de experiência em higienização de buffets e grandes festas.',
        appliedAt: '2026-08-24T10:15:00Z',
        status: 'accepted',
        notes: 'Confirmada para o turno das 13h'
      },
      {
        id: 'app-2',
        jobId: 'job-1',
        name: 'Roberto Andrade',
        whatsapp: '(11) 97654-3210',
        pixKey: '123.456.789-00',
        pixType: 'cpf',
        experienceSummary: 'Atuação constante em montagem e limpeza pós-evento.',
        appliedAt: '2026-08-24T11:00:00Z',
        status: 'pending'
      }
    ]
  },
  {
    id: 'job-2',
    title: 'Carregador e Apoio de Montagem - Usina Espaço A',
    role: 'Carregador',
    category: 'Logística & Cargas',
    slotsTotal: 1,
    slotsAvailable: 1,
    date: '2026-08-24',
    startTime: '13:00',
    endTime: '22:00',
    cachet: 120.00,
    paymentDetails: 'Acabou, levou (PIX na hora)',
    benefits: 'Alimentação completa no local',
    dressCode: 'Roupa TODA PRETA (camisa, calça e calçado escuro resistente)',
    locationName: 'Usina Espaço A',
    locationAddress: 'Av. Alcides Sangirardi, S/N - Cidade Jardim, São Paulo - SP, 05672-015',
    neighborhood: 'Cidade Jardim',
    city: 'São Paulo - SP',
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Usina+Espaco+A+-+Av.+Alcides+Sangirardi,+S%2FN+-+Cidade+Jardim,+Sao+Paulo+-+SP',
    contactPhone: '(11) 98799-7872',
    contactName: 'Produção Usina Espaço A',
    isUrgent: true,
    status: 'open',
    requirements: [
      'Disposição física para carga e descarga de caixas de som e cenografia',
      'Sapato fechado ou bota de segurança',
      'Agilidade e trabalho em equipe'
    ],
    applicantsCount: 0,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    applicants: []
  },
  {
    id: 'job-3',
    title: 'Bartender Coquetelaria Clássica e Autoral',
    role: 'Bartender',
    category: 'Bares & Restaurantes',
    slotsTotal: 2,
    slotsAvailable: 1,
    date: '2026-08-24',
    startTime: '18:00',
    endTime: '02:00',
    cachet: 190.00,
    paymentDetails: 'PIX ao término do expediente + Taxa de serviço',
    benefits: 'Jantar da equipe + Uber volta (até 15km)',
    dressCode: 'Camisa social preta de manga longa, avental escuro e calça preta',
    locationName: 'Lounge Bar Vila Madalena',
    locationAddress: 'Rua Fradique Coutinho, 1200 - Vila Madalena, São Paulo - SP',
    neighborhood: 'Vila Madalena',
    city: 'São Paulo - SP',
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Rua+Fradique+Coutinho,+1200+-+Pinheiros,+Sao+Paulo',
    contactPhone: '(11) 97711-2233',
    contactName: 'Gerência de Bar (Lucas)',
    isUrgent: true,
    status: 'open',
    requirements: [
      'Domínio de drinks clássicos (Gin Tônica, Moscow Mule, Caipirinhas, Negroni)',
      'Agilidade no preparo e controle de insumos'
    ],
    applicantsCount: 1,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    applicants: [
      {
        id: 'app-3',
        jobId: 'job-3',
        name: 'Matheus Fontes',
        whatsapp: '(11) 99887-1122',
        pixKey: 'matheus.bar@gmail.com',
        pixType: 'email',
        experienceSummary: 'Bartender há 4 anos com curso no Senac e passagens por bares de alta coquetelaria.',
        appliedAt: '2026-08-24T08:30:00Z',
        status: 'accepted'
      }
    ]
  },
  {
    id: 'job-4',
    title: 'Garçom / Garçonete para Casamento & Coquetel',
    role: 'Garçom / Garçonete',
    category: 'Eventos & Festas',
    slotsTotal: 4,
    slotsAvailable: 3,
    date: '2026-08-25',
    startTime: '16:00',
    endTime: '00:30',
    cachet: 160.00,
    paymentDetails: 'PIX em até 1h após o término + Caixinha dividida',
    benefits: 'Jantar completo buffet + Bebidas não alcoólicas liberadas',
    dressCode: 'Camisa social branca impecável, calça social preta, sapato social preto engraxado',
    locationName: 'Espaço Villa Bisutti',
    locationAddress: 'Rua Gomes de Carvalho, 1000 - Vila Olímpia, São Paulo - SP',
    neighborhood: 'Vila Olímpia',
    city: 'São Paulo - SP',
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Rua+Gomes+de+Carvalho,+1000+-+Vila+Olimpia,+Sao+Paulo',
    contactPhone: '(11) 98455-6677',
    contactName: 'Maitre Juliana',
    isUrgent: false,
    status: 'open',
    requirements: [
      'Equilíbrio com bandeja alta e serviço volante',
      'Excelente postura e cordialidade com convidados'
    ],
    applicantsCount: 1,
    createdAt: new Date(Date.now() - 14400000).toISOString(),
    applicants: [
      {
        id: 'app-4',
        jobId: 'job-4',
        name: 'Juliana Paes Costa',
        whatsapp: '(11) 98765-4321',
        pixKey: '11987654321',
        pixType: 'phone',
        experienceSummary: 'Atendimento de eventos sociais e corporativos há 2 anos.',
        appliedAt: '2026-08-24T09:00:00Z',
        status: 'accepted'
      }
    ]
  },
  {
    id: 'job-5',
    title: 'Auxiliar de Cozinha & Pré-Preparo de Buffet',
    role: 'Cozinha / Apoio',
    category: 'Bares & Restaurantes',
    slotsTotal: 2,
    slotsAvailable: 2,
    date: '2026-08-24',
    startTime: '14:00',
    endTime: '23:00',
    cachet: 150.00,
    paymentDetails: 'Pagamento ao final via PIX',
    benefits: 'Refeição no local + Lanche da tarde',
    dressCode: 'Dólmã ou camiseta preta de algodão, calça escura e sapato fechado antiderrapante',
    locationName: 'Buffet Gastronômico Pinheiros',
    locationAddress: 'Rua dos Pinheiros, 740 - Pinheiros, São Paulo - SP',
    neighborhood: 'Pinheiros',
    city: 'São Paulo - SP',
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Rua+dos+Pinheiros,+740+-+Pinheiros,+Sao+Paulo',
    contactPhone: '(11) 98112-9900',
    contactName: 'Chef Rodrigo',
    isUrgent: true,
    status: 'open',
    requirements: [
      'Corte de legumes, montagem de canapés e suporte à chapa/forno',
      'Higiene alimentar rigorosa e pontualidade'
    ],
    applicantsCount: 0,
    createdAt: new Date(Date.now() - 18000000).toISOString(),
    applicants: []
  }
];

class FreelaHubDatabase {
  private jobs: FreelanceJob[] = [];

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.jobs = JSON.parse(raw);
      } else {
        this.jobs = INITIAL_JOBS;
        this.saveToFile();
      }
    } catch (e) {
      console.warn('Fallback to in-memory jobs due to disk init error:', e);
      this.jobs = INITIAL_JOBS;
    }
  }

  private saveToFile() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.jobs, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to save to db file:', e);
    }
  }

  public getJobs(): FreelanceJob[] {
    return this.jobs;
  }

  public getJobById(id: string): FreelanceJob | undefined {
    return this.jobs.find(j => j.id === id);
  }

  public createJob(jobData: Omit<FreelanceJob, 'id' | 'createdAt' | 'applicants' | 'applicantsCount'>): FreelanceJob {
    const newJob: FreelanceJob = {
      ...jobData,
      id: `job-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      applicantsCount: 0,
      applicants: [],
      createdAt: new Date().toISOString(),
    };
    this.jobs.unshift(newJob);
    this.saveToFile();
    return newJob;
  }

  public updateJob(id: string, updates: Partial<FreelanceJob>): FreelanceJob | null {
    const index = this.jobs.findIndex(j => j.id === id);
    if (index === -1) return null;
    this.jobs[index] = { ...this.jobs[index], ...updates };
    this.saveToFile();
    return this.jobs[index];
  }

  public deleteJob(id: string): boolean {
    const initialLen = this.jobs.length;
    this.jobs = this.jobs.filter(j => j.id !== id);
    if (this.jobs.length !== initialLen) {
      this.saveToFile();
      return true;
    }
    return false;
  }

  public addApplicant(jobId: string, applicantData: Omit<JobApplicant, 'id' | 'appliedAt' | 'status' | 'jobId'>): JobApplicant | null {
    const job = this.jobs.find(j => j.id === jobId);
    if (!job) return null;

    const applicant: JobApplicant = {
      ...applicantData,
      id: `app-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      jobId,
      appliedAt: new Date().toISOString(),
      status: 'pending'
    };

    if (!job.applicants) job.applicants = [];
    job.applicants.push(applicant);
    job.applicantsCount = job.applicants.length;

    this.saveToFile();
    return applicant;
  }

  public updateApplicantStatus(jobId: string, applicantId: string, status: JobApplicant['status'], notes?: string, rating?: number, paidAmount?: number): boolean {
    const job = this.jobs.find(j => j.id === jobId);
    if (!job || !job.applicants) return false;

    const applicant = job.applicants.find(a => a.id === applicantId);
    if (!applicant) return false;

    const previousStatus = applicant.status;
    applicant.status = status;
    if (notes !== undefined) applicant.notes = notes;
    if (rating !== undefined) applicant.rating = rating;
    if (paidAmount !== undefined) applicant.paidAmount = paidAmount;
    if (status === 'paid' && !applicant.paidAt) applicant.paidAt = new Date().toISOString();

    // Adjust slots available if accepted or rejected
    if (status === 'accepted' && previousStatus !== 'accepted') {
      job.slotsAvailable = Math.max(0, job.slotsAvailable - 1);
      if (job.slotsAvailable === 0) {
        job.status = 'filled';
      }
    } else if (previousStatus === 'accepted' && status !== 'accepted') {
      job.slotsAvailable = Math.min(job.slotsTotal, job.slotsAvailable + 1);
      if (job.status === 'filled' && job.slotsAvailable > 0) {
        job.status = 'open';
      }
    }

    this.saveToFile();
    return true;
  }

  public resetToDefault() {
    this.jobs = JSON.parse(JSON.stringify(INITIAL_JOBS));
    this.saveToFile();
    return this.jobs;
  }
}

export const db = new FreelaHubDatabase();
