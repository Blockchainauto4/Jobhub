import React, { useMemo } from 'react';
import { Search, MapPin, Sparkles, Tag, Globe, GraduationCap, Building2 } from 'lucide-react';
import { BRAZIL_STATES, POPULAR_NEIGHBORHOODS_BY_CITY, BrazilStateInfo } from '../data/brazilLocations';

interface HeroBannerProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  categories: string[];
  selectedState: string;
  setSelectedState: (state: string) => void;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  selectedNeighborhood: string;
  setSelectedNeighborhood: (nh: string) => void;
  onlyUrgent: boolean;
  setOnlyUrgent: (val: boolean) => void;
  onOpenSkillsDirectory: () => void;
  onOpenCertificationsGuide?: () => void;
  onOpenCreateJob: () => void;
  onOpenMissionsModal?: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  categories,
  selectedState,
  setSelectedState,
  selectedCity,
  setSelectedCity,
  selectedNeighborhood,
  setSelectedNeighborhood,
  onlyUrgent,
  setOnlyUrgent,
  onOpenSkillsDirectory,
  onOpenCertificationsGuide,
  onOpenCreateJob,
  onOpenMissionsModal
}) => {
  const availableCities = useMemo(() => {
    if (selectedState === 'Todos') {
      return [];
    }
    const foundState = BRAZIL_STATES.find(s => s.uf === selectedState);
    return foundState ? foundState.popularCities : [];
  }, [selectedState]);

  const availableNeighborhoods = useMemo(() => {
    if (!selectedCity || selectedCity === 'Todas as Cidades') {
      return [];
    }
    return POPULAR_NEIGHBORHOODS_BY_CITY[selectedCity] || ['Centro', 'Região Central', 'Zona Norte', 'Zona Sul', 'Zona Leste', 'Zona Oeste'];
  }, [selectedCity]);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-emerald-900/30 p-5 sm:p-8 mb-6 shadow-2xl">
      {/* Background glow effects */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-green-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-5xl mx-auto">
        
        {/* FreelaHub Logo & Brand Header */}
        <div className="flex flex-col items-center mb-5">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shadow-2xl shadow-emerald-500/20 border-2 border-emerald-500/40 mb-3 bg-slate-950">
            <img
              src="/freelahub_logo.png"
              alt="FreelaHub Logo Oficial"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Vagas • Profissionais • Brasil</span>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-3">
          A Maior Rede de Freelancers do Brasil <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-emerald-400 via-green-300 to-emerald-500 bg-clip-text text-transparent">
            Pagamento no PIX & Cobertura por Cidade e Bairro
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mb-6 leading-relaxed">
          Garçons, bartenders, caixa/finanças, limpeza e carregadores organizados por <strong>Estado, Cidade e Bairro</strong> com exigência de <strong>cursos técnicos & certificações</strong>.
        </p>

        {/* Action Buttons Bar */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-6 w-full">
          {onOpenMissionsModal && (
            <button
              onClick={onOpenMissionsModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-amber-500/20 hover:from-amber-500/30 hover:to-emerald-500/30 border border-amber-500/50 text-amber-300 text-xs font-black transition shadow-lg shadow-amber-500/10 animate-pulse"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>🎁 Missões TikTok & Kwai: R$ 50,00 + Grupo VIP WhatsApp</span>
            </button>
          )}

          {onOpenCertificationsGuide && (
            <button
              onClick={onOpenCertificationsGuide}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-950/70 hover:bg-amber-900/80 border border-amber-500/40 text-amber-300 text-xs font-bold transition shadow-sm"
            >
              <GraduationCap className="w-4 h-4 text-amber-400" />
              <span>Cursos & Certificações</span>
            </button>
          )}

          <button
            onClick={onOpenSkillsDirectory}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold transition shadow-sm"
          >
            <Tag className="w-4 h-4 text-emerald-400" />
            <span>Habilidades</span>
          </button>

          <button
            onClick={onOpenCreateJob}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 text-xs font-extrabold transition shadow-lg shadow-emerald-500/20"
          >
            <Sparkles className="w-4 h-4" />
            <span>Publicar Vaga</span>
          </button>
        </div>

        {/* Search, State, City and Neighborhood Filters */}
        <div className="w-full space-y-3">
          
          {/* Main Search Input */}
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              id="input-search-jobs"
              type="text"
              placeholder="Buscar por função (Garçom, Caixa, Bartender), bairro, endereço ou habilidades..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition shadow-inner"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                Limpar
              </button>
            )}
          </div>

          {/* Geographical Filter Dropdowns: Estado, Cidade, Bairro + Urgência */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
            
            {/* State Filter */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800">
              <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
              <select
                value={selectedState}
                onChange={(e) => {
                  setSelectedState(e.target.value);
                  setSelectedCity('Todas as Cidades');
                  setSelectedNeighborhood('Todos os Bairros');
                }}
                className="w-full bg-transparent text-xs text-slate-200 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="Todos" className="bg-slate-900 text-white">Todos os Estados</option>
                {BRAZIL_STATES.map((s: BrazilStateInfo) => (
                  <option key={s.uf} value={s.uf} className="bg-slate-900 text-white">
                    {s.name} ({s.uf})
                  </option>
                ))}
              </select>
            </div>

            {/* City Filter */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800">
              <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <select
                value={selectedCity}
                disabled={selectedState === 'Todos'}
                onChange={(e) => {
                  setSelectedCity(e.target.value);
                  setSelectedNeighborhood('Todos os Bairros');
                }}
                className="w-full bg-transparent text-xs text-slate-200 font-semibold focus:outline-none cursor-pointer disabled:opacity-50"
              >
                <option value="Todas as Cidades" className="bg-slate-900 text-white">Todas as Cidades</option>
                {availableCities.map((cityName: string) => (
                  <option key={cityName} value={cityName} className="bg-slate-900 text-white">
                    {cityName}
                  </option>
                ))}
              </select>
            </div>

            {/* Neighborhood Filter */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
              <select
                value={selectedNeighborhood}
                disabled={selectedCity === 'Todas as Cidades' || availableNeighborhoods.length === 0}
                onChange={(e) => setSelectedNeighborhood(e.target.value)}
                className="w-full bg-transparent text-xs text-slate-200 font-semibold focus:outline-none cursor-pointer disabled:opacity-50"
              >
                <option value="Todos os Bairros" className="bg-slate-900 text-white">Todos os Bairros</option>
                {availableNeighborhoods.map((n: string) => (
                  <option key={n} value={n} className="bg-slate-900 text-white">
                    {n}
                  </option>
                ))}
              </select>
            </div>

            {/* Toggle Urgent */}
            <button
              onClick={() => setOnlyUrgent(!onlyUrgent)}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition border ${
                onlyUrgent
                  ? 'bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-500/30'
                  : 'bg-slate-950 text-rose-400 border-rose-500/30 hover:bg-rose-950/40'
              }`}
            >
              <span>🚨</span>
              <span>Urgente / Vagas Hoje</span>
            </button>

          </div>

          {/* Category / Sector Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {categories.map((cat) => (
              <button
                key={cat}
                id={`filter-cat-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition ${
                  selectedCategory === cat
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm shadow-emerald-500/30'
                    : 'bg-slate-900/80 text-slate-300 border border-slate-800 hover:border-slate-700 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
};
