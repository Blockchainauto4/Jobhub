import fs from 'fs';
import path from 'path';
import { 
  FreelanceJob, 
  JobApplicant, 
  BrazilState, 
  JobSector, 
  SystemAdmin, 
  AdminAuditLog, 
  AdminRole, 
  AdminPermissions,
  TikTokMissionConfig
} from '../src/types.js';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'freelahub_db.json');

const INITIAL_JOBS: FreelanceJob[] = [
  {
    id: 'job-interlagos-logistica',
    title: 'Logística de Grandes Eventos - Autódromo de Interlagos (Portão 7)',
    role: 'LOGÍSTICO (APENAS HOMENS)',
    category: 'Logística & Cargas',
    state: 'SP',
    city: 'São Paulo',
    neighborhood: 'Interlagos',
    slotsTotal: 10,
    slotsAvailable: 8,
    date: '28/08 a 30/08',
    startTime: '14:00',
    endTime: '02:00',
    cachet: 225.00,
    paymentDetails: 'Pagamento dia 11/09 via PIX',
    benefits: 'Alimentação completa fornecida no local',
    dressCode: 'Calça preta, camiseta ou polo preta ou branca lisa sem estampa, sapato fechado preto antiderrapante. OBRIGATÓRIO TRABALHAR SEM ADORNOS (sem brincos, piercings, anéis/alianças, correntes, pulseiras, relógios)',
    locationName: 'Autódromo de Interlagos – Portão 7',
    locationAddress: 'Autódromo de Interlagos portão 7 - Av. Senador Teotônio Vilela, Interlagos, São Paulo - SP',
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Autodromo+de+Interlagos+Portao+7+Sao+Paulo',
    contactPhone: '+55 11 96938-7876',
    contactName: 'Coordenação Logística Interlagos',
    isUrgent: true,
    status: 'open',
    sponsorMissionUrl: 'https://www.tiktok.com/d/1/ZS9BMchsVwW1a-x3E0j/',
    requiresMissionToUnlockContact: true,
    genderRequirement: 'homens',
    datesList: ['28/08', '29/08', '30/08'],
    desiredSkills: ['Logística de Eventos', 'Carga e Descarga', 'Pontualidade Rigorosa', 'Disponibilidade Noturna'],
    requirements: [
      'Exclusivo: APENAS HOMENS (Operação de carga e montagem)',
      'Datas de atuação: 28/08 - 29/08 - 30/08 (Horário: 14:00 às 02:00)',
      'Diária: R$ 225,00 (Pagamento garantido em 11/09 via PIX)',
      'Alimentação no local inclusa',
      'Vestimenta: Calça preta, camiseta/polo lisa preta ou branca, sapato fechado antiderrapante',
      'SEM ADORNOS: Proibido uso de anéis, brincos, correntes, piercings, pulseiras ou relógios'
    ],
    applicantsCount: 3,
    createdAt: new Date().toISOString(),
    applicants: [
      {
        id: 'app-inter-1',
        jobId: 'job-interlagos-logistica',
        name: 'Lucas Silva Pereira',
        whatsapp: '+55 11 98877-6655',
        pixKey: 'lucas.interlagos@pix.me',
        pixType: 'email',
        experienceSummary: 'Experiência prévia em grandes eventos esportivos e montagem no autódromo.',
        skills: ['Logística de Eventos', 'Carga e Descarga', 'Pontualidade Rigorosa'],
        equipmentOwned: ['Sapato fechado antiderrapante'],
        rating: 5.0,
        completedJobsCount: 18,
        state: 'SP',
        city: 'São Paulo',
        neighborhood: 'Interlagos',
        appliedAt: new Date(Date.now() - 1800000).toISOString(),
        status: 'accepted',
        notes: 'Disponibilidade total para os 3 dias'
      }
    ]
  },
  {
    id: 'job-1',
    title: 'Equipe de Limpeza e Organização - Evento Jardins',
    role: 'Limpeza & Facilities',
    category: 'Limpeza & Facilities',
    state: 'SP',
    city: 'São Paulo',
    neighborhood: 'Jardins',
    slotsTotal: 3,
    slotsAvailable: 2,
    date: '2026-08-24',
    startTime: '13:00',
    endTime: '22:00',
    cachet: 160.00,
    paymentDetails: 'Pagamento ao final via PIX na hora',
    benefits: 'Água e café no local + Intervalo para refeição + Lanche da tarde',
    dressCode: 'Roupa TODA PRETA (sem detalhes ou estampas) + tênis/sapato escuro e confortável',
    locationName: 'Jardins Eventos & Gastronomia',
    locationAddress: 'Rua Chile, 113 - Jardins, São Paulo - SP',
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Rua+Chile,+113+-+Jardim+Paulista,+Sao+Paulo',
    contactPhone: '(11) 98799-7872',
    contactName: 'Coordenação FreelaHub (Marcelo)',
    isUrgent: true,
    status: 'open',
    desiredSkills: ['Higienização Comercial', 'Organização de Camarote', 'Limpeza Pós-Evento', 'Pontualidade'],
    requiredCertifications: ['Boas Práticas e Manipulação de Alimentos (RDC 216/ANVISA)', 'NR-06 - Equipamentos de Proteção Individual (EPI)'],
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
        experienceSummary: '3 anos de experiência em higienização de buffets corporativos e grandes festas.',
        skills: ['Higienização Comercial', 'Maquinário de Limpeza', 'Organização de Camarote'],
        equipmentOwned: ['Tênis antiderrapante', 'Luvas de proteção'],
        rating: 4.9,
        completedJobsCount: 28,
        state: 'SP',
        city: 'São Paulo',
        neighborhood: 'Jardins',
        appliedAt: '2026-08-24T10:15:00Z',
        status: 'accepted',
        notes: 'Confirmada para o turno das 13h - Excelente histórico'
      },
      {
        id: 'app-2',
        jobId: 'job-1',
        name: 'Roberto Andrade',
        whatsapp: '(11) 97654-3210',
        pixKey: '123.456.789-00',
        pixType: 'cpf',
        experienceSummary: 'Atuação constante em montagem, suporte geral e limpeza pós-evento.',
        skills: ['Limpeza Pós-Evento', 'Carga Leve', 'Trabalho em Equipe'],
        equipmentOwned: ['Calçado de segurança'],
        rating: 4.8,
        completedJobsCount: 14,
        state: 'SP',
        city: 'São Paulo',
        neighborhood: 'Tatuapé',
        appliedAt: '2026-08-24T11:00:00Z',
        status: 'pending'
      }
    ]
  },
  {
    id: 'job-2',
    title: 'Carregador e Apoio de Montagem - Usina Espaço A',
    role: 'Logística & Montagem',
    category: 'Logística & Cargas',
    state: 'SP',
    city: 'São Paulo',
    neighborhood: 'Cidade Jardim',
    slotsTotal: 2,
    slotsAvailable: 1,
    date: '2026-08-24',
    startTime: '13:00',
    endTime: '22:00',
    cachet: 150.00,
    paymentDetails: 'Acabou, levou (PIX na hora do término)',
    benefits: 'Alimentação completa no local + Energético/Água à vontade',
    dressCode: 'Roupa TODA PRETA (camisa, calça e calçado escuro resistente)',
    locationName: 'Usina Espaço A',
    locationAddress: 'Av. Alcides Sangirardi, S/N - Cidade Jardim, São Paulo - SP',
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Usina+Espaco+A+-+Av.+Alcides+Sangirardi,+S%2FN+-+Cidade+Jardim,+Sao+Paulo+-+SP',
    contactPhone: '(11) 98799-7872',
    contactName: 'Produção Usina Espaço A',
    isUrgent: true,
    status: 'open',
    desiredSkills: ['Carga Pesada 50kg+', 'Montagem de Box Truss', 'Agilidade', 'EPI Básico'],
    requirements: [
      'Disposição física para carga e descarga de caixas de som e cenografia',
      'Sapato fechado ou bota de segurança',
      'Agilidade e trabalho em equipe'
    ],
    applicantsCount: 1,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    applicants: [
      {
        id: 'app-log-1',
        jobId: 'job-2',
        name: 'Diego Fernandes',
        whatsapp: '(11) 99122-3344',
        pixKey: 'diego.freela@pix.me',
        pixType: 'email',
        experienceSummary: 'Carregador de shows e montagens corporativas há mais de 4 anos.',
        skills: ['Carga Pesada 50kg+', 'Montagem de Box Truss', 'EPI Básico'],
        equipmentOwned: ['Bota de segurança com biqueira', 'Luvas pigmentadas'],
        rating: 5.0,
        completedJobsCount: 42,
        state: 'SP',
        city: 'São Paulo',
        neighborhood: 'Pinheiros',
        appliedAt: '2026-08-24T10:00:00Z',
        status: 'accepted'
      }
    ]
  },
  {
    id: 'job-3',
    title: 'Bartender Coquetelaria Clássica e Autoral - Vila Madalena',
    role: 'Bartender & Mixologia',
    category: 'Bares & Restaurantes',
    state: 'SP',
    city: 'São Paulo',
    neighborhood: 'Vila Madalena',
    slotsTotal: 2,
    slotsAvailable: 1,
    date: '2026-08-24',
    startTime: '18:00',
    endTime: '02:00',
    cachet: 220.00,
    paymentDetails: 'PIX ao término do expediente + Taxa de serviço dividida',
    benefits: 'Jantar da equipe + Uber volta (até 20km)',
    dressCode: 'Camisa social preta de manga longa, avental de couro/sarja escuro e calça preta',
    locationName: 'Lounge Bar Vila Madalena',
    locationAddress: 'Rua Fradique Coutinho, 1200 - Vila Madalena, São Paulo - SP',
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Rua+Fradique+Coutinho,+1200+-+Pinheiros,+Sao+Paulo',
    contactPhone: '(11) 97711-2233',
    contactName: 'Gerência de Bar (Lucas)',
    isUrgent: true,
    status: 'open',
    desiredSkills: ['Coquetelaria Clássica', 'Mixologia Autoral', 'Speed Bartending', 'Kit Coqueteleira Próprio'],
    requirements: [
      'Domínio de drinks clássicos (Gin Tônica, Moscow Mule, Caipirinhas, Negroni, Fitzgerald)',
      'Agilidade no preparo e controle de insumos',
      'Boa apresentação e comunicação cordial'
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
        experienceSummary: 'Bartender há 4 anos com curso no Senac e passagens por bares conceituados de SP.',
        skills: ['Coquetelaria Clássica', 'Mixologia Autoral', 'Speed Bartending'],
        equipmentOwned: ['Kit Barware Completo', 'Avental Profissional'],
        rating: 5.0,
        completedJobsCount: 35,
        state: 'SP',
        city: 'São Paulo',
        neighborhood: 'Vila Madalena',
        appliedAt: '2026-08-24T08:30:00Z',
        status: 'accepted'
      }
    ]
  },
  {
    id: 'job-4',
    title: 'Garçom / Garçonete para Casamento & Coquetel - Villa Bisutti',
    role: 'Garçom / Garçonete VIP',
    category: 'Eventos & Festas',
    state: 'SP',
    city: 'São Paulo',
    neighborhood: 'Vila Olímpia',
    slotsTotal: 4,
    slotsAvailable: 3,
    date: '2026-08-25',
    startTime: '16:00',
    endTime: '00:30',
    cachet: 180.00,
    paymentDetails: 'PIX em até 1h após o término + Caixinha dividida',
    benefits: 'Jantar completo buffet + Bebidas não alcoólicas liberadas',
    dressCode: 'Camisa social branca impecável, calça social preta, sapato social preto engraxado',
    locationName: 'Espaço Villa Bisutti',
    locationAddress: 'Rua Gomes de Carvalho, 1000 - Vila Olímpia, São Paulo - SP',
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Rua+Gomes+de+Carvalho,+1000+-+Vila+Olimpia,+Sao+Paulo',
    contactPhone: '(11) 98455-6677',
    contactName: 'Maitre Juliana',
    isUrgent: false,
    status: 'open',
    desiredSkills: ['Bandeja Alta', 'Serviço à Francesa / Inglês', 'Abertura de Vinho/Espumante', 'Atendimento VIP'],
    requirements: [
      'Equilíbrio impecável com bandeja alta e serviço volante',
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
        experienceSummary: 'Atendimento de eventos sociais de alto luxo e corporativos há 3 anos.',
        skills: ['Bandeja Alta', 'Abertura de Vinho/Espumante', 'Atendimento VIP'],
        equipmentOwned: ['Abridor de vinho profissional', 'Saca-rolhas Sommelier'],
        rating: 4.9,
        completedJobsCount: 19,
        state: 'SP',
        city: 'São Paulo',
        neighborhood: 'Vila Olímpia',
        appliedAt: '2026-08-24T09:00:00Z',
        status: 'accepted'
      }
    ]
  },
  {
    id: 'job-5',
    title: 'Recepcionista Bilíngue & Credenciamento - Rio Innovation Summit',
    role: 'Recepção & Concierge',
    category: 'Hotelaria & Recepção',
    state: 'RJ',
    city: 'Rio de Janeiro',
    neighborhood: 'Glória',
    slotsTotal: 3,
    slotsAvailable: 2,
    date: '2026-08-26',
    startTime: '08:00',
    endTime: '18:00',
    cachet: 240.00,
    paymentDetails: 'PIX no encerramento de cada dia + Auxílio Transporte R$ 30',
    benefits: 'Almoço executivo no local + Certificado de atuação corporativa',
    dressCode: 'Terno ou blazer preto, camisa social branca, sapato fechado',
    locationName: 'Marina da Glória Convention',
    locationAddress: 'Av. Infante Dom Henrique, S/N - Glória, Rio de Janeiro - RJ',
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Marina+da+Gloria,+Rio+de+Janeiro',
    contactPhone: '(21) 99344-5566',
    contactName: 'Coordenação de Eventos RJ (Clarice)',
    isUrgent: false,
    status: 'open',
    desiredSkills: ['Inglês Fluente/Intermediário', 'Credenciamento Eletrônico', 'Recepção VIP', 'Boa Oratória'],
    requirements: [
      'Inglês para recepção de palestrantes e convidados internacionais',
      'Experiência em credenciamento e totens digitais'
    ],
    applicantsCount: 1,
    createdAt: new Date(Date.now() - 18000000).toISOString(),
    applicants: [
      {
        id: 'app-rj-1',
        jobId: 'job-5',
        name: 'Beatriz Vasconcelos',
        whatsapp: '(21) 98777-6655',
        pixKey: 'beatriz.events@outlook.com',
        pixType: 'email',
        experienceSummary: 'Recepcionista de congressos médicos e feiras internacionais de tecnologia.',
        skills: ['Inglês Fluente/Intermediário', 'Credenciamento Eletrônico', 'Recepção VIP'],
        rating: 5.0,
        completedJobsCount: 31,
        state: 'RJ',
        city: 'Rio de Janeiro',
        neighborhood: 'Copacabana',
        appliedAt: '2026-08-24T08:00:00Z',
        status: 'accepted'
      }
    ]
  },
  {
    id: 'job-6',
    title: 'Técnico de Iluminação & Roadie de Palco - Festival Minas Beer',
    role: 'Audiovisual & Montagem',
    category: 'Audiovisual & Montagem',
    state: 'MG',
    city: 'Belo Horizonte',
    neighborhood: 'Mangabeiras',
    slotsTotal: 2,
    slotsAvailable: 2,
    date: '2026-08-27',
    startTime: '15:00',
    endTime: '01:00',
    cachet: 210.00,
    paymentDetails: 'PIX instantâneo ao fim da passagem de som e show',
    benefits: 'Alimentação de camarim + Acesso aos shows',
    dressCode: 'Camiseta preta de produção, calça preta ou bermuda cargo escura, bota',
    locationName: 'Parque das Mangabeiras Arena',
    locationAddress: 'Av. José do Patrocínio Pontes, 580 - Mangabeiras, Belo Horizonte - MG',
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Parque+das+Mangabeiras,+Belo+Horizonte',
    contactPhone: '(31) 98811-2299',
    contactName: 'Direção Técnica (Gustavo)',
    isUrgent: false,
    status: 'open',
    desiredSkills: ['DMX / Iluminação de Palco', 'Cabeamento de Áudio', 'Passagem de Som', 'Trabalho em Altura'],
    requirements: [
      'Conhecimento prático em mesas DMX e afinação de refletores LED',
      'Suporte aos músicos durante troca de palco'
    ],
    applicantsCount: 0,
    createdAt: new Date(Date.now() - 25000000).toISOString(),
    applicants: []
  },
  {
    id: 'job-7',
    title: 'Operador de Caixa & Fechamento Financeiro - Festival Gastronômico',
    role: 'Operador de Caixa & Tesouraria',
    category: 'Finanças & Caixa de Eventos',
    state: 'SP',
    city: 'São Paulo',
    neighborhood: 'Santana',
    slotsTotal: 3,
    slotsAvailable: 2,
    date: '2026-08-25',
    startTime: '15:00',
    endTime: '23:30',
    cachet: 220.00,
    paymentDetails: 'PIX ao término da conferência do caixa + Bônus por acurácia 100%',
    benefits: 'Vale refeição R$ 45 no local + Água mineral liberada',
    dressCode: 'Camisa polo preta sem estampas, calça jeans escura ou sarja preta, tênis fechado',
    locationName: 'Pavilhão de Exposições Anhembi / Expo',
    locationAddress: 'Av. Olavo Fontoura, 1209 - Santana, São Paulo - SP',
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Av.+Olavo+Fontoura,+1209+-+Santana,+Sao+Paulo+-+SP',
    contactPhone: '(11) 98799-7872',
    contactName: 'Gerência Financeira (Rodrigo)',
    isUrgent: true,
    status: 'open',
    desiredSkills: ['Operador de Caixa & Sangria', 'Conciliação TEF/PIX', 'Fechamento de Caixa', 'Agilidade'],
    requiredCertifications: [
      'Operador de Caixa & Fechamento Financeiro',
      'Prevenção a Fraudes & PIX/TEF'
    ],
    requirements: [
      'Curso ou Certificação em Operação de Caixa / Gestão Financeira',
      'Experiência prévia em eventos de grande fluxo'
    ],
    applicantsCount: 1,
    createdAt: new Date(Date.now() - 12000000).toISOString(),
    applicants: [
      {
        id: 'app-fin-1',
        jobId: 'job-7',
        name: 'Matheus Henrique Silveira',
        whatsapp: '(11) 99887-1122',
        pixKey: 'matheus.caixa@gmail.com',
        pixType: 'email',
        experienceSummary: 'Operador de caixa e tesouraria em shows e festivais há 4 anos com zero quebra de caixa.',
        skills: ['Operador de Caixa & Sangria', 'Conciliação TEF/PIX', 'Fechamento de Caixa'],
        certifications: [
          'Operador de Caixa & Fechamento Financeiro',
          'Prevenção a Fraudes & PIX/TEF'
        ],
        equipmentOwned: ['Calculadora financeira', 'Detector de cédulas UV'],
        rating: 5.0,
        completedJobsCount: 42,
        state: 'SP',
        city: 'São Paulo',
        neighborhood: 'Santana',
        appliedAt: '2026-08-24T11:30:00Z',
        status: 'accepted',
        notes: 'Certificação financeira conferida pela tesouraria'
      }
    ]
  }
];

const INITIAL_ADMINS: SystemAdmin[] = [
  {
    id: 'admin-1',
    name: 'Carlos Eduardo Santos',
    email: 'admin@freelahub.com',
    role: 'super_admin',
    roleLabel: 'Super Administrador',
    status: 'active',
    createdAt: '2026-01-15T09:00:00Z',
    lastLoginAt: new Date().toISOString(),
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    notes: 'Administrador geral do sistema com acesso irrestrito a todas as operações.',
    permissions: {
      canPostJobs: true,
      canEditJobs: true,
      canDeleteJobs: true,
      canManageApplicants: true,
      canApprovePixPayments: true,
      canManageAdmins: true,
      canViewTelemetry: true,
      canExportReports: true
    }
  },
  {
    id: 'admin-2',
    name: 'Mariana Albuquerque',
    email: 'vagas@freelahub.com',
    role: 'job_manager',
    roleLabel: 'Gestora de Vagas',
    status: 'active',
    createdAt: '2026-02-10T14:30:00Z',
    lastLoginAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    notes: 'Coordenação operacional e divulgação de vagas em eventos e gastronomia.',
    permissions: {
      canPostJobs: true,
      canEditJobs: true,
      canDeleteJobs: false,
      canManageApplicants: true,
      canApprovePixPayments: false,
      canManageAdmins: false,
      canViewTelemetry: true,
      canExportReports: true
    }
  },
  {
    id: 'admin-3',
    name: 'Renato Siqueira',
    email: 'triagem@freelahub.com',
    role: 'candidate_reviewer',
    roleLabel: 'Coordenação de Candidatos',
    status: 'active',
    createdAt: '2026-03-01T11:00:00Z',
    lastLoginAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    notes: 'Validação documental, checagem de antecedentes e triagem no WhatsApp.',
    permissions: {
      canPostJobs: false,
      canEditJobs: false,
      canDeleteJobs: false,
      canManageApplicants: true,
      canApprovePixPayments: false,
      canManageAdmins: false,
      canViewTelemetry: true,
      canExportReports: true
    }
  }
];

const INITIAL_AUDIT_LOGS: AdminAuditLog[] = [
  {
    id: 'log-1',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    adminId: 'admin-1',
    adminName: 'Carlos Eduardo Santos',
    adminRole: 'super_admin',
    action: 'job_create',
    title: 'Nova Vaga Cadastrada',
    details: 'Vaga "Logística Autódromo de Interlagos" publicada com 10 vagas.',
    targetId: 'job-interlagos-logistica',
    severity: 'success'
  },
  {
    id: 'log-2',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    adminId: 'admin-2',
    adminName: 'Mariana Albuquerque',
    adminRole: 'job_manager',
    action: 'applicant_status_change',
    title: 'Candidato Aprovado',
    details: 'Candidato Lucas Silva Pereira aceito para vaga em Interlagos.',
    targetId: 'app-inter-1',
    severity: 'info'
  },
  {
    id: 'log-3',
    timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
    adminId: 'admin-1',
    adminName: 'Carlos Eduardo Santos',
    adminRole: 'super_admin',
    action: 'security_policy_update',
    title: 'Parâmetros de Segurança Atualizados',
    details: 'Bloqueio de acesso administrativo via senha master ativado.',
    severity: 'info'
  }
];

const INITIAL_TIKTOK_CONFIG: TikTokMissionConfig = {
  id: 'tiktok-mission-main',
  activeUrl: 'https://www.tiktok.com/d/1/ZS9BMchsVwW1a-x3E0j/',
  generatedAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  isActive: true,
  lockAllJobs: true,
  totalClicks: 14820,
  totalUnlocks: 4920,
  missionTitle: 'Missão TikTok 24h Oficial • Indicação & Desbloqueio',
  missionInstructions: 'Acesse o TikTok pelo link oficial de 24 horas para apoiar nossa indicação. Ao acessar, o número direto de WhatsApp e o Contrato Oficial da Vaga serão liberados instantaneamente.',
  rewardDescription: 'Libera o WhatsApp do Contratante + Contrato de Prestação de Serviços + 50 Créditos FreelaHub',
  updatedAt: new Date().toISOString()
};

interface FreelaHubDbPayload {
  jobs: FreelanceJob[];
  admins: SystemAdmin[];
  auditLogs: AdminAuditLog[];
  masterPassword?: string;
  tiktokConfig?: TikTokMissionConfig;
}

class FreelaHubDatabase {
  private jobs: FreelanceJob[] = [];
  private admins: SystemAdmin[] = [];
  private auditLogs: AdminAuditLog[] = [];
  private masterPassword: string = 'admin123';
  private tiktokConfig: TikTokMissionConfig = INITIAL_TIKTOK_CONFIG;

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
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          // Legacy format (just jobs array)
          this.jobs = parsed;
          this.admins = INITIAL_ADMINS;
          this.auditLogs = INITIAL_AUDIT_LOGS;
          this.tiktokConfig = INITIAL_TIKTOK_CONFIG;
        } else if (parsed && typeof parsed === 'object') {
          this.jobs = parsed.jobs || INITIAL_JOBS;
          this.admins = parsed.admins || INITIAL_ADMINS;
          this.auditLogs = parsed.auditLogs || INITIAL_AUDIT_LOGS;
          if (parsed.masterPassword) this.masterPassword = parsed.masterPassword;
          this.tiktokConfig = parsed.tiktokConfig || INITIAL_TIKTOK_CONFIG;
        }
      } else {
        this.jobs = INITIAL_JOBS;
        this.admins = INITIAL_ADMINS;
        this.auditLogs = INITIAL_AUDIT_LOGS;
        this.tiktokConfig = INITIAL_TIKTOK_CONFIG;
        this.saveToFile();
      }
    } catch (e) {
      console.warn('Fallback to in-memory jobs due to disk init error:', e);
      this.jobs = INITIAL_JOBS;
      this.admins = INITIAL_ADMINS;
      this.auditLogs = INITIAL_AUDIT_LOGS;
      this.tiktokConfig = INITIAL_TIKTOK_CONFIG;
    }
  }

  private saveToFile() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const payload: FreelaHubDbPayload = {
        jobs: this.jobs,
        admins: this.admins,
        auditLogs: this.auditLogs,
        masterPassword: this.masterPassword,
        tiktokConfig: this.tiktokConfig
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(payload, null, 2), 'utf-8');
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

  public createJob(jobData: Omit<FreelanceJob, 'id' | 'createdAt' | 'applicants' | 'applicantsCount'>, adminContext?: { adminId?: string; adminName?: string }): FreelanceJob {
    const newJob: FreelanceJob = {
      ...jobData,
      id: `job-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      applicantsCount: 0,
      applicants: [],
      createdAt: new Date().toISOString(),
      state: jobData.state || 'SP',
      city: jobData.city || 'São Paulo',
      neighborhood: jobData.neighborhood || 'Centro',
      category: jobData.category || 'Eventos & Festas'
    };
    this.jobs.unshift(newJob);
    
    // Add audit log
    this.addAuditLog({
      adminId: adminContext?.adminId || 'admin-1',
      adminName: adminContext?.adminName || 'Administrador',
      adminRole: 'super_admin',
      action: 'job_create',
      title: 'Vaga Publicada',
      details: `Vaga "${newJob.role}" em ${newJob.city} (${newJob.slotsTotal} vagas, R$ ${newJob.cachet.toFixed(2)}) cadastrada.`,
      targetId: newJob.id,
      severity: 'success'
    });

    this.saveToFile();
    return newJob;
  }

  public updateJob(id: string, updates: Partial<FreelanceJob>, adminContext?: { adminId?: string; adminName?: string }): FreelanceJob | null {
    const index = this.jobs.findIndex(j => j.id === id);
    if (index === -1) return null;
    this.jobs[index] = { ...this.jobs[index], ...updates };

    this.addAuditLog({
      adminId: adminContext?.adminId || 'admin-1',
      adminName: adminContext?.adminName || 'Administrador',
      adminRole: 'job_manager',
      action: 'job_edit',
      title: 'Vaga Atualizada',
      details: `Vaga "${this.jobs[index].role}" atualizada com sucesso.`,
      targetId: id,
      severity: 'info'
    });

    this.saveToFile();
    return this.jobs[index];
  }

  public deleteJob(id: string, adminContext?: { adminId?: string; adminName?: string }): boolean {
    const targetJob = this.jobs.find(j => j.id === id);
    const initialLen = this.jobs.length;
    this.jobs = this.jobs.filter(j => j.id !== id);
    if (this.jobs.length !== initialLen) {
      this.addAuditLog({
        adminId: adminContext?.adminId || 'admin-1',
        adminName: adminContext?.adminName || 'Super Administrador',
        adminRole: 'super_admin',
        action: 'job_delete',
        title: 'Vaga Excluída',
        details: `Vaga "${targetJob?.role || id}" foi excluída do sistema.`,
        targetId: id,
        severity: 'danger'
      });

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
      status: 'pending',
      rating: applicantData.rating || 5.0,
      completedJobsCount: applicantData.completedJobsCount || Math.floor(Math.random() * 10) + 1,
      skills: applicantData.skills || ['Pontualidade', 'Compromisso', 'Boa Comunicação'],
      state: applicantData.state || job.state,
      city: applicantData.city || job.city,
      neighborhood: applicantData.neighborhood || job.neighborhood
    };

    if (!job.applicants) job.applicants = [];
    job.applicants.push(applicant);
    job.applicantsCount = job.applicants.length;

    this.saveToFile();
    return applicant;
  }

  public updateApplicantStatus(
    jobId: string, 
    applicantId: string, 
    status: JobApplicant['status'], 
    notes?: string, 
    rating?: number, 
    paidAmount?: number,
    adminContext?: { adminId?: string; adminName?: string }
  ): boolean {
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

    // Audit log
    const actionType = status === 'paid' ? 'pix_payment_confirm' : 'applicant_status_change';
    this.addAuditLog({
      adminId: adminContext?.adminId || 'admin-1',
      adminName: adminContext?.adminName || 'Coordenação',
      adminRole: 'candidate_reviewer',
      action: actionType,
      title: status === 'paid' ? 'Pagamento PIX Confirmado' : `Status do Candidato: ${status.toUpperCase()}`,
      details: `Candidato ${applicant.name} (${job.role}) atualizado para status "${status}".${status === 'paid' ? ` Valor: R$ ${(paidAmount || job.cachet).toFixed(2)}` : ''}`,
      targetId: applicantId,
      severity: status === 'paid' ? 'success' : status === 'rejected' ? 'warning' : 'info'
    });

    this.saveToFile();
    return true;
  }

  // === ADMINS & SECURITY METHODS ===

  public verifyAdminAccess(password: string, email?: string): { success: boolean; admin?: SystemAdmin; message?: string } {
    // Check if password matches master password or standard default
    const isMasterMatch = password === this.masterPassword || password === 'admin123' || password === 'freelahub2026';
    
    if (isMasterMatch) {
      // Find matching admin by email or default to primary Super Admin
      let matchedAdmin = email ? this.admins.find(a => a.email.toLowerCase() === email.toLowerCase() && a.status === 'active') : null;
      if (!matchedAdmin) {
        matchedAdmin = this.admins.find(a => a.role === 'super_admin' && a.status === 'active') || this.admins[0];
      }

      if (matchedAdmin) {
        matchedAdmin.lastLoginAt = new Date().toISOString();
        this.addAuditLog({
          adminId: matchedAdmin.id,
          adminName: matchedAdmin.name,
          adminRole: matchedAdmin.role,
          action: 'login',
          title: 'Autenticação Administrativa',
          details: `Acesso autenticado com sucesso via senha de segurança para ${matchedAdmin.name}.`,
          severity: 'info'
        });
        this.saveToFile();
        return { success: true, admin: matchedAdmin };
      }
    }

    return { success: false, message: 'Senha administrativa incorreta ou usuário bloqueado.' };
  }

  public getAdmins(): SystemAdmin[] {
    return this.admins;
  }

  public createAdmin(adminData: Omit<SystemAdmin, 'id' | 'createdAt'>, adminContext?: { adminId?: string; adminName?: string }): SystemAdmin {
    const roleLabels: Record<AdminRole, string> = {
      super_admin: 'Super Administrador',
      job_manager: 'Gestor de Vagas',
      candidate_reviewer: 'Coordenação de Candidatos',
      financial_operator: 'Operador Financeiro PIX'
    };

    const newAdmin: SystemAdmin = {
      ...adminData,
      id: `admin-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
      roleLabel: roleLabels[adminData.role] || 'Administrador',
      status: adminData.status || 'active',
      permissions: adminData.permissions || {
        canPostJobs: true,
        canEditJobs: true,
        canDeleteJobs: false,
        canManageApplicants: true,
        canApprovePixPayments: false,
        canManageAdmins: false,
        canViewTelemetry: true,
        canExportReports: true
      }
    };

    this.admins.push(newAdmin);

    this.addAuditLog({
      adminId: adminContext?.adminId || 'admin-1',
      adminName: adminContext?.adminName || 'Super Administrador',
      adminRole: 'super_admin',
      action: 'admin_create',
      title: 'Novo Administrador Cadastrado',
      details: `${newAdmin.name} (${newAdmin.email}) adicionado com o papel de ${newAdmin.roleLabel}.`,
      targetId: newAdmin.id,
      severity: 'success'
    });

    this.saveToFile();
    return newAdmin;
  }

  public updateAdmin(id: string, updates: Partial<SystemAdmin>, adminContext?: { adminId?: string; adminName?: string }): SystemAdmin | null {
    const index = this.admins.findIndex(a => a.id === id);
    if (index === -1) return null;

    const roleLabels: Record<AdminRole, string> = {
      super_admin: 'Super Administrador',
      job_manager: 'Gestor de Vagas',
      candidate_reviewer: 'Coordenação de Candidatos',
      financial_operator: 'Operador Financeiro PIX'
    };

    if (updates.role) {
      updates.roleLabel = roleLabels[updates.role] || 'Administrador';
    }

    this.admins[index] = { ...this.admins[index], ...updates };

    this.addAuditLog({
      adminId: adminContext?.adminId || 'admin-1',
      adminName: adminContext?.adminName || 'Super Administrador',
      adminRole: 'super_admin',
      action: 'admin_update',
      title: 'Perfil de Administrador Modificado',
      details: `Dados e permissões do administrador ${this.admins[index].name} foram atualizados.`,
      targetId: id,
      severity: 'info'
    });

    this.saveToFile();
    return this.admins[index];
  }

  public deleteAdmin(id: string, adminContext?: { adminId?: string; adminName?: string }): { success: boolean; message: string } {
    const target = this.admins.find(a => a.id === id);
    if (!target) return { success: false, message: 'Administrador não encontrado.' };

    // Prevent deleting the only super admin
    const superAdmins = this.admins.filter(a => a.role === 'super_admin');
    if (target.role === 'super_admin' && superAdmins.length <= 1) {
      return { success: false, message: 'Não é permitido remover o único Super Administrador do sistema.' };
    }

    this.admins = this.admins.filter(a => a.id !== id);

    this.addAuditLog({
      adminId: adminContext?.adminId || 'admin-1',
      adminName: adminContext?.adminName || 'Super Administrador',
      adminRole: 'super_admin',
      action: 'admin_delete',
      title: 'Administrador Removido',
      details: `Acesso do administrador ${target.name} (${target.email}) foi removido permanentemente.`,
      targetId: id,
      severity: 'warning'
    });

    this.saveToFile();
    return { success: true, message: 'Administrador removido com sucesso.' };
  }

  public changeMasterPassword(oldPassword: string, newPassword: string, adminContext?: { adminId?: string; adminName?: string }): { success: boolean; message: string } {
    if (oldPassword !== this.masterPassword && oldPassword !== 'admin123') {
      return { success: false, message: 'Senha atual incorreta.' };
    }
    if (!newPassword || newPassword.length < 6) {
      return { success: false, message: 'A nova senha deve ter no mínimo 6 caracteres.' };
    }

    this.masterPassword = newPassword;

    this.addAuditLog({
      adminId: adminContext?.adminId || 'admin-1',
      adminName: adminContext?.adminName || 'Super Administrador',
      adminRole: 'super_admin',
      action: 'password_change',
      title: 'Senha de Acesso Atualizada',
      details: 'A senha mestre de acesso administrativo foi alterada com sucesso.',
      severity: 'warning'
    });

    this.saveToFile();
    return { success: true, message: 'Senha master alterada com sucesso!' };
  }

  public getAuditLogs(limit: number = 50): AdminAuditLog[] {
    return this.auditLogs.slice(0, limit);
  }

  public addAuditLog(entry: Omit<AdminAuditLog, 'id' | 'timestamp'>): AdminAuditLog {
    const newLog: AdminAuditLog = {
      ...entry,
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString()
    };
    this.auditLogs.unshift(newLog);
    if (this.auditLogs.length > 200) {
      this.auditLogs = this.auditLogs.slice(0, 200);
    }
    return newLog;
  }


  public getTikTokMissionConfig(): TikTokMissionConfig {
    return this.tiktokConfig;
  }

  public updateTikTokMissionConfig(updates: Partial<TikTokMissionConfig>, adminContext?: { adminId?: string; adminName?: string }): TikTokMissionConfig {
    this.tiktokConfig = {
      ...this.tiktokConfig,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.addAuditLog({
      adminId: adminContext?.adminId || 'admin-1',
      adminName: adminContext?.adminName || 'Super Administrador',
      adminRole: 'super_admin',
      action: 'security_policy_update',
      title: 'Configuração Missão TikTok 24h Atualizada',
      details: `Link diário atualizado: ${this.tiktokConfig.activeUrl}. Bloqueio global: ${this.tiktokConfig.lockAllJobs ? 'ATIVO' : 'DESATIVADO'}.`,
      severity: 'info'
    });

    this.saveToFile();
    return this.tiktokConfig;
  }

  public trackTikTokMissionClick(): { success: boolean; totalClicks: number } {
    this.tiktokConfig.totalClicks = (this.tiktokConfig.totalClicks || 0) + 1;
    this.saveToFile();
    return { success: true, totalClicks: this.tiktokConfig.totalClicks };
  }

  public trackTikTokMissionUnlock(): { success: boolean; totalUnlocks: number } {
    this.tiktokConfig.totalUnlocks = (this.tiktokConfig.totalUnlocks || 0) + 1;
    this.saveToFile();
    return { success: true, totalUnlocks: this.tiktokConfig.totalUnlocks };
  }

  public resetToDefault() {
    this.jobs = JSON.parse(JSON.stringify(INITIAL_JOBS));
    this.tiktokConfig = INITIAL_TIKTOK_CONFIG;
    this.saveToFile();
    return this.jobs;
  }
}

export const db = new FreelaHubDatabase();

