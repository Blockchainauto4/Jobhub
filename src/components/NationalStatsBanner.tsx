import React, { useState, useEffect } from 'react';
import { Users, Zap, CheckCircle, Sparkles, MapPin, BarChart3, ArrowRight } from 'lucide-react';

interface NationalStatsData {
  activeFreelancers: number;
  totalJobsPosted: number;
  totalPixDisbursed: number;
  statesCovered: number;
  satisfactionRate: number;
}

interface NationalStatsBannerProps {
  onNavigateToDashboard?: () => void;
}

export const NationalStatsBanner: React.FC<NationalStatsBannerProps> = ({ onNavigateToDashboard }) => {
  const [stats, setStats] = useState<NationalStatsData>({
    activeFreelancers: 48920,
    totalJobsPosted: 12456,
    totalPixDisbursed: 3840290,
    statesCovered: 18,
    satisfactionRate: 99.4
  });

  useEffect(() => {
    fetch('/api/stats/national')
      .then(res => res.json())
      .then(data => {
        if (data && data.activeFreelancers) {
          setStats(data);
        }
      })
      .catch(err => console.error('Failed to fetch national stats:', err));
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950/40 border border-emerald-500/30 p-6 sm:p-8 my-6 shadow-xl text-slate-100">
      
      {/* Decorative Blur */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        
        {/* Left Column: Title & Mission */}
        <div className="space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Oportunidades Freelancer em Todo o Brasil</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
            A Maior Solução para Freelancers e Eventos no Brasil
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Conectamos organizadores de eventos, restaurantes, buffets e empresas aos melhores talentos operacionais de cada cidade e bairro com <strong>pagamento via PIX instantâneo</strong> e <strong>cursos & certificações técnicas</strong>.
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <CheckCircle className="w-3.5 h-3.5" /> Cobertura Nacional por Cidade e Bairro
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <CheckCircle className="w-3.5 h-3.5" /> 100% de Diárias Pagas no Término
            </span>
          </div>

          {onNavigateToDashboard && (
            <div className="pt-2">
              <button
                type="button"
                onClick={onNavigateToDashboard}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 shadow-md shadow-emerald-500/20 transition group"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Acessar Painel de Indicadores & BI em Tempo Real</span>
                <ArrowRight className="w-3.5 h-3.5 transition group-hover:translate-x-0.5" />
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Live Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full lg:w-auto">
          
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/90 text-center space-y-1">
            <div className="flex items-center justify-center gap-1 text-emerald-400 mb-1">
              <Users className="w-4 h-4" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">
              {(stats.activeFreelancers / 1000).toFixed(1)}k+
            </div>
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
              Freelancers Ativos
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/90 text-center space-y-1">
            <div className="flex items-center justify-center gap-1 text-emerald-400 mb-1">
              <Zap className="w-4 h-4" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400">
              R$ {(stats.totalPixDisbursed / 1000000).toFixed(2)}M
            </div>
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
              Pagos via PIX
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/90 text-center space-y-1 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-center gap-1 text-emerald-400 mb-1">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">
              {stats.statesCovered} Estados
            </div>
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
              Cidades & Bairros
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
