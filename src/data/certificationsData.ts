import { CertificationItem, JobSector } from '../types';

export const SECTOR_CERTIFICATIONS: Record<JobSector, CertificationItem[]> = {
  'Finanças & Caixa de Eventos': [
    {
      id: 'fin-caixa-fechamento',
      name: 'Operador de Caixa & Fechamento Financeiro',
      category: 'Finanças & Caixa de Eventos',
      issuingEntity: 'SENAC / SEBRAE / Fundação Bradesco / Certificação Comercial',
      isMandatoryByLaw: false,
      description: 'Capacitação em abertura, sangria de valores, conferência de cédulas, conciliação e fechamento de lote fiscal.',
      badgeLabel: 'Operador de Caixa Certificado',
      officialUrl: 'https://www.ev.org.br/'
    },
    {
      id: 'fin-prevencao-fraudes-pix',
      name: 'Prevenção a Fraudes, Notas Falsas & PIX/TEF',
      category: 'Finanças & Caixa de Eventos',
      issuingEntity: 'FEBRABAN / Banco Central do Brasil / Escola Virtual Gov',
      isMandatoryByLaw: false,
      description: 'Reconhecimento de elementos de segurança do Real, prevenção a golpes de comprovante PIX falso e segurança em terminais POS.',
      badgeLabel: 'Especialista em Prevenção a Fraudes',
      officialUrl: 'https://www.bcb.gov.br/'
    },
    {
      id: 'fin-anbima-cpa',
      name: 'Certificação Financeira ANBIMA (CPA-10 / CPA-20 / AAI)',
      category: 'Finanças & Caixa de Eventos',
      issuingEntity: 'ANBIMA (Associação Brasileira das Entidades dos Mercados Financeiro e de Capitais)',
      isMandatoryByLaw: true,
      description: 'Certificação profissional regulatória para atuação em tesouraria corporativa, balcão bancário e operações financeiras formais.',
      badgeLabel: 'Certificado ANBIMA',
      officialUrl: 'https://www.anbima.com.br/'
    },
    {
      id: 'fin-maquininhas-pdv',
      name: 'Operação de Terminais POS, Stone, Cielo & Totem de Autoatendimento',
      category: 'Finanças & Caixa de Eventos',
      issuingEntity: 'Acquiring POS Academy / FreelaHub Pro Finance',
      isMandatoryByLaw: false,
      description: 'Agilidade e estorno em cartões de crédito/débito, recarga de pulseiras cashless e fichas para grandes festivais.',
      badgeLabel: 'Operador POS & Cashless',
      officialUrl: 'https://www.stone.com.br/'
    }
  ],
  'Bares & Restaurantes': [
    {
      id: 'bar-anvisa-manipulacao',
      name: 'Boas Práticas e Manipulação de Alimentos (RDC 216/ANVISA)',
      category: 'Bares & Restaurantes',
      issuingEntity: 'ANVISA / Vigilância Sanitária Municipal / SENAC',
      isMandatoryByLaw: true,
      description: 'Exigência sanitária legal para cozinheiros, ajudantes de cozinha, garçons e manipuladores de alimentos em estabelecimentos e eventos.',
      badgeLabel: 'Certificado ANVISA RDC 216',
      officialUrl: 'https://www.gov.br/anvisa/pt-br'
    },
    {
      id: 'bar-mixologia-barman',
      name: 'Curso Profissional de Bartender & Coquetelaria Internacional',
      category: 'Bares & Restaurantes',
      issuingEntity: 'IBA (International Bartenders Association) / SENAC / Mixology School',
      isMandatoryByLaw: false,
      description: 'Técnicas de dosagem, free pouring, coquetéis clássicos da IBA e agilidade em balcão de alto volume.',
      badgeLabel: 'Bartender Certificado',
      officialUrl: 'https://iba-world.com/'
    },
    {
      id: 'bar-sommelier-vinhos',
      name: 'Sommelier & Serviço de Vinhos e Espumantes',
      category: 'Bares & Restaurantes',
      issuingEntity: 'ABS (Associação Brasileira de Sommeliers) / WSET',
      isMandatoryByLaw: false,
      description: 'Serviço formal de sala, temperatura de serviço, abertura com saca-rolhas de dois estágios e harmonização.',
      badgeLabel: 'Sommelier de Eventos',
      officialUrl: 'https://abs-sp.com.br/'
    }
  ],
  'Logística & Cargas': [
    {
      id: 'log-nr11-empilhadeira',
      name: 'NR-11 - Operador de Empilhadeira e Transpaleteira Elétrica',
      category: 'Logística & Cargas',
      issuingEntity: 'MTE / SENAI / SEST SENAT (Norma Regulamentadora)',
      isMandatoryByLaw: true,
      description: 'Treinamento obrigatório para movimentação, armazenagem e manuseio de materiais e equipamentos de grande porte.',
      badgeLabel: 'Habilitado NR-11 (MTE)',
      officialUrl: 'https://www.gov.br/trabalho-e-emprego/pt-br'
    },
    {
      id: 'log-nr12-maquinas',
      name: 'NR-12 - Segurança no Trabalho em Máquinas e Equipamentos',
      category: 'Logística & Cargas',
      issuingEntity: 'SENAI / MTE',
      isMandatoryByLaw: true,
      description: 'Procedimentos de segurança para operação e proteção em maquinários industriais e montagens operacionais.',
      badgeLabel: 'Certificado NR-12',
      officialUrl: 'https://www.gov.br/trabalho-e-emprego/pt-br'
    },
    {
      id: 'log-mopp-cargas',
      name: 'MOPP - Movimentação Operacional de Produtos Perigosos & CNH Profissional',
      category: 'Logística & Cargas',
      issuingEntity: 'DETRAN / SEST SENAT / CONTRAN',
      isMandatoryByLaw: true,
      description: 'Exigência para transporte e movimentação de combustíveis, geradores e cargas inflamáveis em produções.',
      badgeLabel: 'MOPP / CNH Especializada',
      officialUrl: 'https://www.sestsenat.org.br/'
    }
  ],
  'Audiovisual & Montagem': [
    {
      id: 'av-nr10-eletrica',
      name: 'NR-10 - Segurança em Instalações e Serviços em Eletricidade',
      category: 'Audiovisual & Montagem',
      issuingEntity: 'MTE / SENAI / Escola Técnica Autorizada',
      isMandatoryByLaw: true,
      description: 'Obrigatório para operadores de gerador, técnicos de luz, painel de LED, cabistas e eletricistas de eventos.',
      badgeLabel: 'Certificado NR-10 (Elétrica)',
      officialUrl: 'https://www.gov.br/trabalho-e-emprego/pt-br'
    },
    {
      id: 'av-nr35-altura',
      name: 'NR-35 - Trabalho em Altura (Box Truss, Grids e Cenografia)',
      category: 'Audiovisual & Montagem',
      issuingEntity: 'MTE / SENAI / Corpo de Bombeiros',
      isMandatoryByLaw: true,
      description: 'Obrigatório para montadores de palco, rigger, iluminação aérea e trabalho com linhas de vida acima de 2 metros.',
      badgeLabel: 'Certificado NR-35 (Altura)',
      officialUrl: 'https://www.gov.br/trabalho-e-emprego/pt-br'
    },
    {
      id: 'av-audio-dmx',
      name: 'Operação de Áudio Digital & Protocolo DMX / GrandMA',
      category: 'Audiovisual & Montagem',
      issuingEntity: 'Instituto de Áudio e Vídeo (IAV) / Pro Audio Cert',
      isMandatoryByLaw: false,
      description: 'Técnico capacitado em mesas Behringer X32/Midas, microfonação sem fio e endereçamento DMX de moving lights.',
      badgeLabel: 'Técnico AV Especialista',
      officialUrl: 'https://iav.com.br/'
    }
  ],
  'Limpeza & Facilities': [
    {
      id: 'limp-nr06-epi',
      name: 'NR-06 - Uso Seguro de EPIs & Biossegurança no Trabalho',
      category: 'Limpeza & Facilities',
      issuingEntity: 'MTE / SESMT / FUNDACENTRO',
      isMandatoryByLaw: true,
      description: 'Uso e higienização correta de luvas nitrílicas, botas antiderrapantes, óculos de proteção e respiradores.',
      badgeLabel: 'Treinamento NR-06 (EPIs)',
      officialUrl: 'https://www.gov.br/trabalho-e-emprego/pt-br'
    },
    {
      id: 'limp-quimicos-hospitalar',
      name: 'Tratamento de Superfícies & Diluição de Químicos Profissionais',
      category: 'Limpeza & Facilities',
      issuingEntity: 'Abralimp (Associação Brasileira de Limpeza Profissional) / UniAbralimp',
      isMandatoryByLaw: false,
      description: 'Capacitação em desinfecção de alto nível, diluição de desengraxantes, neutralizadores e remoção de ceras.',
      badgeLabel: 'Especialista Abralimp',
      officialUrl: 'https://abralimp.org.br/'
    },
    {
      id: 'limp-enceradeiras-posobra',
      name: 'Operação de Enceradeiras Industriais & Limpeza Pós-Obra',
      category: 'Limpeza & Facilities',
      issuingEntity: 'Instituto Brasileiro de Facilities / UniAbralimp',
      isMandatoryByLaw: false,
      description: 'Técnicas de polimento de pisos nobres, lavagem pressurizada e entrega de obras e arenas comerciais.',
      badgeLabel: 'Operador de Maquinário de Limpeza',
      officialUrl: 'https://abralimp.org.br/'
    }
  ],
  'Limpeza & Serviços': [
    {
      id: 'limp-serv-nr06',
      name: 'NR-06 - Uso de EPIs e Higienização Comercial',
      category: 'Limpeza & Serviços',
      issuingEntity: 'MTE / SESMT',
      isMandatoryByLaw: true,
      description: 'Capacitação de segurança para rotinas de conservação predial e eventos.',
      badgeLabel: 'Treinado em EPIs',
      officialUrl: 'https://www.gov.br/trabalho-e-emprego/pt-br'
    }
  ],
  'Segurança & Apoio': [
    {
      id: 'seg-nr23-brigadista',
      name: 'NR-23 - Brigadista de Incêndio & Evacuação de Emergência',
      category: 'Segurança & Apoio',
      issuingEntity: 'Corpo de Bombeiros Militar / MTE',
      isMandatoryByLaw: true,
      description: 'Certificação de combate a princípios de incêndio, manuseio de extintores e orientação de rotas de fuga em eventos.',
      badgeLabel: 'Brigadista Credenciado',
      officialUrl: 'https://www.corpodebombeiros.sp.gov.br/'
    },
    {
      id: 'seg-primeiros-socorros-aph',
      name: 'APH - Primeiros Socorros & Ressuscitação Cardiopulmonar (DEA)',
      category: 'Segurança & Apoio',
      issuingEntity: 'Cruz Vermelha Brasileira / SAMU / American Heart Association',
      isMandatoryByLaw: false,
      description: 'Capacitação em atendimento de emergência, desmaios, convulsões, traumas e uso de Desfibrilador Externo Automático.',
      badgeLabel: 'Socorrista APH Certificado',
      officialUrl: 'https://www.cruzvermelha.org.br/'
    },
    {
      id: 'seg-grandes-eventos-pf',
      name: 'Curso de Extensão em Segurança de Grandes Eventos (Polícia Federal)',
      category: 'Segurança & Apoio',
      issuingEntity: 'Polícia Federal (DREX / Delesp) / Escolas Credenciadas',
      isMandatoryByLaw: true,
      description: 'Habilitação oficial da Polícia Federal para controle de acesso, revista e segurança privada em shows e estádios.',
      badgeLabel: 'Credenciado Polícia Federal',
      officialUrl: 'https://www.gov.br/pf/pt-br'
    }
  ],
  'Hotelaria & Recepção': [
    {
      id: 'rec-atendimento-bilingue',
      name: 'Atendimento Corporativo VIP & Etiqueta Profissional',
      category: 'Hotelaria & Recepção',
      issuingEntity: 'SENAC / Escola de Hospitalidade',
      isMandatoryByLaw: false,
      description: 'Credenciamento, recepção de palestrantes, controle de listas VIP e protocolo de hospitalidade corporativa.',
      badgeLabel: 'Recepção VIP Certificada',
      officialUrl: 'https://www.sp.senac.br/'
    }
  ],
  'Eventos & Festas': [
    {
      id: 'evt-producao-organizacao',
      name: 'Organização de Camarotes & Coordenação de Pessoal',
      category: 'Eventos & Festas',
      issuingEntity: 'ABEOC Brasil / Academia de Eventos',
      isMandatoryByLaw: false,
      description: 'Gestão de fluxo de convidados, montagem de kits, logística de staff e resolução de incidentes.',
      badgeLabel: 'Produtor de Apoio Certificado',
      officialUrl: 'https://www.abeoc.org.br/'
    }
  ],
  'Outros': [
    {
      id: 'out-atendimento-cliente',
      name: 'Excelência em Atendimento & Resolução de Conflitos',
      category: 'Outros',
      issuingEntity: 'Fundação Bradesco / SEBRAE',
      isMandatoryByLaw: false,
      description: 'Comunicação assertiva, postura ética e agilidade no suporte presencial.',
      badgeLabel: 'Atendimento Certificado',
      officialUrl: 'https://www.ev.org.br/'
    }
  ]
};

export const ALL_CERTIFICATIONS: CertificationItem[] = Object.values(SECTOR_CERTIFICATIONS).flat();

export function getCertificationsForSector(sector: JobSector | string): CertificationItem[] {
  const normalized = sector as JobSector;
  const specific = SECTOR_CERTIFICATIONS[normalized] || [];
  // Also include general ones (like finance, food safety, or NRs if relevant)
  return specific;
}

export function getCertificationBadgeLabel(certIdOrName: string): string {
  const found = ALL_CERTIFICATIONS.find(
    c => c.id === certIdOrName || c.name.toLowerCase() === certIdOrName.toLowerCase()
  );
  return found ? found.badgeLabel : certIdOrName;
}
