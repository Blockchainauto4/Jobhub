import { BrazilState } from '../types';

export interface BrazilStateInfo {
  uf: BrazilState;
  name: string;
  capital: string;
  popularCities: string[];
}

export const BRAZIL_STATES: BrazilStateInfo[] = [
  {
    uf: 'SP',
    name: 'São Paulo',
    capital: 'São Paulo',
    popularCities: ['São Paulo', 'Campinas', 'Santos', 'Ribeirão Preto', 'São Bernardo do Campo', 'Santo André', 'Osasco', 'Guarulhos', 'Sorocaba', 'São José dos Campos']
  },
  {
    uf: 'RJ',
    name: 'Rio de Janeiro',
    capital: 'Rio de Janeiro',
    popularCities: ['Rio de Janeiro', 'Niterói', 'Duque de Caxias', 'Nova Iguaçu', 'Petrópolis', 'Cabo Frio', 'Búzios', 'Campos dos Goytacazes']
  },
  {
    uf: 'MG',
    name: 'Minas Gerais',
    capital: 'Belo Horizonte',
    popularCities: ['Belo Horizonte', 'Uberlândia', 'Contagem', 'Juiz de Fora', 'Betim', 'Montes Claros', 'Ouro Preto', 'Tiradentes']
  },
  {
    uf: 'PR',
    name: 'Paraná',
    capital: 'Curitiba',
    popularCities: ['Curitiba', 'Londrina', 'Maringá', 'Ponta Grossa', 'Cascavel', 'Foz do Iguaçu', 'São José dos Pinhais']
  },
  {
    uf: 'SC',
    name: 'Santa Catarina',
    capital: 'Florianópolis',
    popularCities: ['Florianópolis', 'Joinville', 'Blumenau', 'Balneário Camboriú', 'Itajaí', 'Chapecó', 'Criciúma']
  },
  {
    uf: 'RS',
    name: 'Rio Grande do Sul',
    capital: 'Porto Alegre',
    popularCities: ['Porto Alegre', 'Caxias do Sul', 'Canoas', 'Pelotas', 'Santa Maria', 'Gramado', 'Canela', 'Passo Fundo']
  },
  {
    uf: 'BA',
    name: 'Bahia',
    capital: 'Salvador',
    popularCities: ['Salvador', 'Feira de Santana', 'Vitória da Conquista', 'Camaçari', 'Itabuna', 'Porto Seguro', 'Ilhéus']
  },
  {
    uf: 'PE',
    name: 'Pernambuco',
    capital: 'Recife',
    popularCities: ['Recife', 'Jaboatão dos Guararapes', 'Olinda', 'Caruaru', 'Petrolina', 'Paulista', 'Porto de Galinhas']
  },
  {
    uf: 'CE',
    name: 'Ceará',
    capital: 'Fortaleza',
    popularCities: ['Fortaleza', 'Caucaia', 'Juazeiro do Norte', 'Maracanaú', 'Sobral', 'Jericoacoara']
  },
  {
    uf: 'DF',
    name: 'Distrito Federal',
    capital: 'Brasília',
    popularCities: ['Brasília', 'Taguatinga', 'Ceilândia', 'Águas Claras', 'Guará', 'Samambaia', 'Asa Sul', 'Asa Norte']
  },
  {
    uf: 'GO',
    name: 'Goiás',
    capital: 'Goiânia',
    popularCities: ['Goiânia', 'Aparecida de Goiânia', 'Anápolis', 'Rio Verde', 'Caldas Novas', 'Pirenópolis']
  },
  {
    uf: 'ES',
    name: 'Espírito Santo',
    capital: 'Vitória',
    popularCities: ['Vitória', 'Vila Velha', 'Serra', 'Cariacica', 'Guarapari', 'Linhares']
  },
  {
    uf: 'AM',
    name: 'Amazonas',
    capital: 'Manaus',
    popularCities: ['Manaus', 'Parintins', 'Itacoatiara', 'Manacapuru']
  },
  {
    uf: 'PA',
    name: 'Pará',
    capital: 'Belém',
    popularCities: ['Belém', 'Ananindeua', 'Santarém', 'Marabá', 'Parauapebas']
  },
  {
    uf: 'Outros',
    name: 'Outros Estados',
    capital: 'Brasil',
    popularCities: ['Outra Cidade']
  }
];

export const POPULAR_NEIGHBORHOODS_BY_CITY: Record<string, string[]> = {
  'São Paulo': [
    'Jardins',
    'Vila Madalena',
    'Pinheiros',
    'Vila Olímpia',
    'Itaim Bibi',
    'Moema',
    'Santana',
    'Tatuapé',
    'Mooca',
    'Barra Funda',
    'Bela Vista',
    'Centro Histórico',
    'Santo Amaro',
    'Perdizes',
    'Lapa',
    'Morumbi'
  ],
  'Rio de Janeiro': [
    'Copacabana',
    'Ipanema',
    'Leblon',
    'Barra da Tijuca',
    'Glória',
    'Botafogo',
    'Flamengo',
    'Lapa',
    'Tijuca',
    'Recreio dos Bandeirantes',
    'Centro'
  ],
  'Belo Horizonte': [
    'Savassi',
    'Lourdes',
    'Funcionários',
    'Mangabeiras',
    'Pampulha',
    'Centro',
    'Buritis',
    'Belvedere',
    'Santa Efigênia'
  ],
  'Curitiba': [
    'Batel',
    'Água Verde',
    'Centro Cívico',
    'Bigorrilho',
    'Santa Felicidade',
    'Cabral',
    'Juvevê',
    'Portão'
  ],
  'Brasília': [
    'Asa Sul',
    'Asa Norte',
    'Lago Sul',
    'Lago Norte',
    'Sudoeste',
    'Noroeste',
    'Águas Claras',
    'Taguatinga'
  ],
  'Salvador': [
    'Barra',
    'Rio Vermelho',
    'Pituba',
    'Pelourinho',
    'Ondina',
    'Itaigara',
    'Campo Grande'
  ]
};
