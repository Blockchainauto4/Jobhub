import React from 'react';
import { Search, ShieldCheck, Star, Zap, MapPin, Sparkles } from 'lucide-react';

interface HeroBannerProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  categories: string[];
  onlyUrgent: boolean;
  setOnlyUrgent: (val: boolean) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  categories,
  onlyUrgent,
  setOnlyUrgent
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-emerald-900/30 p-5 sm:p-8 mb-6 shadow-2xl">
      {/* Background glow effects */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-green-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto">
        
        {/* FreelaHub Logo Graphic Banner (reproduced from brand identity) */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Trabalho que Conecta • Vagas Freelancer em Tempo Real</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-3">
          Encontre e Contrate Freelas <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-emerald-400 via-green-300 to-emerald-500 bg-clip-text text-transparent">
            Pagamento via PIX no Final
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mb-6 leading-relaxed">
          Vagas para garçons, equipe de limpeza, carregadores, bartenders e eventos em São Paulo e região. 
          Confirmação instantânea e rotas no Google Maps.
        </p>

        {/* 4 Brand Value Pillars */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 w-full mb-6 text-left">
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-emerald-500/40 transition">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white uppercase tracking-tight">Busque</div>
              <div className="text-[11px] text-slate-400">Vagas agora</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-emerald-500/40 transition">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white uppercase tracking-tight">Contrate</div>
              <div className="text-[11px] text-slate-400">Com confiança</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-emerald-500/40 transition">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Star className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white uppercase tracking-tight">Construa</div>
              <div className="text-[11px] text-slate-400">Sua reputação</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-emerald-500/40 transition">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white uppercase tracking-tight">Trabalhe</div>
              <div className="text-[11px] text-slate-400">Em tempo real</div>
            </div>
          </div>
        </div>

        {/* Search and Filters Bar */}
        <div className="w-full space-y-3">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              id="input-search-jobs"
              type="text"
              placeholder="Buscar por função (Limpeza, Garçom, Bartender), bairro (Jardins, Pinheiros) ou local..."
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

          {/* Quick Category and Urgency Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <button
              id="filter-urgent"
              onClick={() => setOnlyUrgent(!onlyUrgent)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition ${
                onlyUrgent
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                  : 'bg-slate-900/90 text-rose-400 border border-rose-500/40 hover:bg-rose-500/10'
              }`}
            >
              <span className="text-sm">🚨</span>
              <span>Urgente / Vaga Hoje</span>
            </button>

            {categories.map((cat) => (
              <button
                key={cat}
                id={`filter-cat-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
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
