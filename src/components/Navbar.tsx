import React from 'react';
import { 
  Briefcase, 
  PlusCircle, 
  Users, 
  Calculator, 
  Database, 
  Sparkles,
  MapPin,
  TrendingUp,
  Share2
} from 'lucide-react';
import { FreelanceJob } from '../types';
import { formatCurrency } from '../utils/formatters';

interface NavbarProps {
  activeTab: 'jobs' | 'candidates' | 'calculator' | 'radar';
  setActiveTab: (tab: 'jobs' | 'candidates' | 'calculator' | 'radar') => void;
  jobs: FreelanceJob[];
  onOpenCreateJob: () => void;
  onOpenDbSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  jobs,
  onOpenCreateJob,
  onOpenDbSettings
}) => {
  const openJobsCount = jobs.filter(j => j.status === 'open').length;
  const urgentJobsCount = jobs.filter(j => j.status === 'open' && j.isUrgent).length;
  const totalAvailableCachet = jobs
    .filter(j => j.status === 'open')
    .reduce((sum, j) => sum + (j.cachet * j.slotsAvailable), 0);

  const totalApplicants = jobs.reduce((sum, j) => sum + (j.applicants?.length || 0), 0);

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-emerald-900/40 shadow-lg shadow-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('jobs')}>
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-green-600 shadow-md shadow-emerald-500/20 text-slate-950 font-black text-xl tracking-tighter">
              <span className="font-extrabold text-2xl tracking-tighter text-slate-950">FH</span>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border border-slate-900"></span>
              </span>
            </div>
            
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-black tracking-tight text-white">Freela<span className="text-emerald-400">Hub</span></span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  PRO
                </span>
              </div>
              <span className="text-[11px] font-medium text-slate-400 tracking-wider hidden sm:block">
                VAGAS • PROFISSIONAIS • RESULTADOS
              </span>
            </div>
          </div>

          {/* Quick Metrics Bar (Desktop) */}
          <div className="hidden lg:flex items-center gap-6 px-4 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-slate-400">Vagas Abertas:</span>
              <span className="font-bold text-white">{openJobsCount}</span>
              {urgentJobsCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  {urgentJobsCount} Urgentes
                </span>
              )}
            </div>
            <div className="w-px h-4 bg-slate-800"></div>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-400">Disponível em Cachês:</span>
              <span className="font-bold text-emerald-400">{formatCurrency(totalAvailableCachet)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              id="btn-db-settings"
              onClick={onOpenDbSettings}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 hover:text-white border border-slate-700/70 transition"
              title="Configuração de Banco de Dados Neon / PostgreSQL / Vercel"
            >
              <Database className="w-4 h-4 text-emerald-400" />
              <span className="hidden md:inline">Neon / SQL</span>
            </button>

            <button
              id="btn-create-job"
              onClick={onOpenCreateJob}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-300 hover:to-green-400 shadow-md shadow-emerald-500/20 transition transform active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-slate-950" />
              <span>Publicar Vaga</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-2.5 border-t border-slate-900">
          <button
            id="tab-jobs"
            onClick={() => setActiveTab('jobs')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
              activeTab === 'jobs'
                ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Mural de Vagas</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${activeTab === 'jobs' ? 'bg-slate-950 text-emerald-400' : 'bg-slate-800 text-slate-300'}`}>
              {openJobsCount}
            </span>
          </button>

          <button
            id="tab-candidates"
            onClick={() => setActiveTab('candidates')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
              activeTab === 'candidates'
                ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Gestão de Contratações</span>
            {totalApplicants > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${activeTab === 'candidates' ? 'bg-slate-950 text-emerald-400' : 'bg-slate-800 text-slate-300'}`}>
                {totalApplicants}
              </span>
            )}
          </button>

          <button
            id="tab-radar"
            onClick={() => setActiveTab('radar')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
              activeTab === 'radar'
                ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Radar de Vagas & Rotas</span>
          </button>

          <button
            id="tab-calculator"
            onClick={() => setActiveTab('calculator')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
              activeTab === 'calculator'
                ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Calculadora de Ganhos PIX</span>
          </button>
        </div>

      </div>
    </header>
  );
};
