import React, { useState } from 'react';
import { Calculator, DollarSign, TrendingUp, Sparkles, Target, Zap, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export const FreelancerCalculator: React.FC = () => {
  const [daysPerWeek, setDaysPerWeek] = useState<number>(4);
  const [avgCachet, setAvgCachet] = useState<number>(140);
  const [transportCostPerDay, setTransportCostPerDay] = useState<number>(20);
  const [monthlyGoal, setMonthlyGoal] = useState<number>(3000);

  const grossDaily = avgCachet;
  const netDaily = Math.max(0, avgCachet - transportCostPerDay);
  const grossWeekly = grossDaily * daysPerWeek;
  const netWeekly = netDaily * daysPerWeek;
  const grossMonthly = grossWeekly * 4.33;
  const netMonthly = netWeekly * 4.33;

  const progressPercent = Math.min(100, Math.round((netMonthly / (monthlyGoal || 1)) * 100));

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-xl">
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
          <Calculator className="w-4 h-4" />
          <span>Planejador Financeiro FreelaHub</span>
        </div>
        <h2 className="text-2xl font-black text-white">
          Calculadora de Ganhos Freelancer & Metas PIX
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
          Simule seus rendimentos semanais e mensais com base na quantidade de diárias, valor médio do cachê e custos de transporte/alimentação.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Input Parameters Box */}
        <div className="lg:col-span-1 rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4 shadow-lg">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span>Parâmetros de Trabalho</span>
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Diárias / Bicos por Semana: <span className="text-emerald-400 font-mono">({daysPerWeek} dias)</span>
            </label>
            <input
              type="range"
              min="1"
              max="7"
              value={daysPerWeek}
              onChange={(e) => setDaysPerWeek(parseInt(e.target.value, 10))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>1 dia</span>
              <span>4 dias</span>
              <span>7 dias</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Cachê Médio por Evento (R$):
            </label>
            <input
              type="number"
              step="10"
              value={avgCachet}
              onChange={(e) => setAvgCachet(parseFloat(e.target.value) || 0)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-emerald-500 font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Custo de Transporte / Deslocamento Diário (R$):
            </label>
            <input
              type="number"
              step="5"
              value={transportCostPerDay}
              onChange={(e) => setTransportCostPerDay(parseFloat(e.target.value) || 0)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Sua Meta Mensal de Renda Líquida (R$):
            </label>
            <input
              type="number"
              step="100"
              value={monthlyGoal}
              onChange={(e) => setMonthlyGoal(parseFloat(e.target.value) || 0)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Results Overview */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Main KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Weekly Card */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-lg relative overflow-hidden">
              <div className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-1">
                Ganhos Líquidos / Semana
              </div>
              <div className="text-3xl font-black text-white tracking-tight">
                {formatCurrency(netWeekly)}
              </div>
              <div className="text-xs text-slate-400 mt-2">
                Bruto: <strong className="text-slate-200">{formatCurrency(grossWeekly)}</strong> ({daysPerWeek} eventos de {formatCurrency(avgCachet)})
              </div>
            </div>

            {/* Monthly Card */}
            <div className="rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border-2 border-emerald-500/50 p-5 shadow-xl relative overflow-hidden">
              <div className="text-xs uppercase font-bold text-emerald-400 tracking-wider mb-1">
                Projeção Líquida / Mês (PIX)
              </div>
              <div className="text-3xl font-black text-emerald-400 tracking-tight">
                {formatCurrency(netMonthly)}
              </div>
              <div className="text-xs text-emerald-300/80 mt-2">
                Total bruto de {formatCurrency(grossMonthly)} em ~{Math.round(daysPerWeek * 4.33)} freelas
              </div>
            </div>

          </div>

          {/* Goal Progress Bar */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-bold text-white">Atingimento da Meta ({formatCurrency(monthlyGoal)})</span>
              </div>
              <span className="text-sm font-black text-emerald-400">{progressPercent}%</span>
            </div>

            <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {progressPercent >= 100 ? (
                <span className="text-emerald-400 font-bold">
                  🎉 Parabéns! Com esse ritmo você supera sua meta mensal em {formatCurrency(netMonthly - monthlyGoal)}.
                </span>
              ) : (
                <span>
                  Faltam <strong className="text-white">{formatCurrency(monthlyGoal - netMonthly)}</strong> para bater sua meta. Você precisaria de mais aproximadamente <strong className="text-emerald-400">{Math.ceil((monthlyGoal - netMonthly) / (netDaily || 1))} diárias no mês</strong>.
                </span>
              )}
            </p>
          </div>

          {/* Tips for Freelancers */}
          <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4 text-xs text-slate-300 space-y-2">
            <div className="font-bold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Dicas FreelaHub para Maximizar Ganhos:
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>Priorize vagas com <strong>"Alimentação no Local"</strong> para economizar de R$ 25 a R$ 40 por turno.</li>
              <li>Mantenha vestimenta toda preta pronta (camisa, calça e sapato fechado) para aceitar vagas urgentes de última hora com cachês mais altos.</li>
              <li>Confirme presença 1 hora antes para manter alta reputação e prioridade em novas escalas.</li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
};
