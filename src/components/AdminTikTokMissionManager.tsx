import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Unlock, 
  ExternalLink, 
  Clock, 
  RefreshCw, 
  CheckCircle2, 
  Sparkles, 
  AlertTriangle, 
  TrendingUp, 
  ShieldCheck, 
  Copy, 
  Check, 
  Share2, 
  Save, 
  Zap, 
  Eye, 
  FileText,
  MousePointerClick,
  Users
} from 'lucide-react';
import { TikTokMissionConfig, SystemAdmin } from '../types';

interface AdminTikTokMissionManagerProps {
  currentAdmin: SystemAdmin;
  onRefreshJobs?: () => void;
}

export const AdminTikTokMissionManager: React.FC<AdminTikTokMissionManagerProps> = ({
  currentAdmin,
  onRefreshJobs
}) => {
  const [config, setConfig] = useState<TikTokMissionConfig | null>(null);
  const [liveStats, setLiveStats] = useState<{
    formattedRemaining?: string;
    isExpired?: boolean;
    hoursLeft?: number;
    minutesLeft?: number;
    secondsLeft?: number;
  }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Form editable states
  const [urlInput, setUrlInput] = useState('');
  const [isActiveToggle, setIsActiveToggle] = useState(true);
  const [lockAllJobsToggle, setLockAllJobsToggle] = useState(true);
  const [missionTitleInput, setMissionTitleInput] = useState('');
  const [missionInstructionsInput, setMissionInstructionsInput] = useState('');

  // Fetch current config from backend
  const fetchConfig = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/tiktok-mission');
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        setConfig(data);
        setUrlInput(data.activeUrl || '');
        setIsActiveToggle(Boolean(data.isActive));
        setLockAllJobsToggle(Boolean(data.lockAllJobs));
        setMissionTitleInput(data.missionTitle || 'Missão TikTok 24h Oficial • Indicação & Desbloqueio');
        setMissionInstructionsInput(data.missionInstructions || '');
        setLiveStats({
          formattedRemaining: data.formattedRemaining,
          isExpired: data.isExpired,
          hoursLeft: data.hoursLeft,
          minutesLeft: data.minutesLeft,
          secondsLeft: data.secondsLeft
        });
      } else {
        // Fallback default config if running static
        const defaultExp = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
        setConfig({
          id: 'tiktok-mission-main',
          activeUrl: 'https://www.tiktok.com/d/1/ZS9BMchsVwW1a-x3E0j/',
          generatedAt: new Date().toISOString(),
          expiresAt: defaultExp,
          isActive: true,
          lockAllJobs: true,
          totalClicks: 14820,
          totalUnlocks: 4920,
          missionTitle: 'Missão TikTok 24h Oficial • Indicação & Desbloqueio',
          missionInstructions: 'Acesse o link do TikTok para apoiar a campanha e desbloquear o contato e o contrato oficial.',
          rewardDescription: 'Acesso liberado ao WhatsApp direto do contratante e Ficha de Contrato Digital emitida.',
          updatedAt: new Date().toISOString()
        });
        setUrlInput('https://www.tiktok.com/d/1/ZS9BMchsVwW1a-x3E0j/');
      }
    } catch (err) {
      console.warn('Erro ao carregar missão TikTok da API:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  // Live timer interval calculation
  useEffect(() => {
    if (!config?.expiresAt) return;
    const timer = setInterval(() => {
      const now = Date.now();
      const expiresAtMs = new Date(config.expiresAt).getTime();
      const diffMs = Math.max(0, expiresAtMs - now);
      const isExp = diffMs <= 0;

      const h = Math.floor(diffMs / (1000 * 60 * 60));
      const m = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diffMs % (1000 * 60)) / 1000);

      setLiveStats({
        formattedRemaining: `${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`,
        isExpired: isExp,
        hoursLeft: h,
        minutesLeft: m,
        secondsLeft: s
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [config?.expiresAt]);

  const handleSaveConfig = async (renew24h: boolean = false) => {
    try {
      setIsSaving(true);
      const payload = {
        activeUrl: urlInput,
        isActive: isActiveToggle,
        lockAllJobs: lockAllJobsToggle,
        missionTitle: missionTitleInput,
        missionInstructions: missionInstructionsInput,
        renew24Hours: renew24h,
        requesterAdmin: {
          id: currentAdmin.id,
          name: currentAdmin.name
        }
      };

      const res = await fetch('/api/admin/tiktok-mission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Falha ao salvar configuração');
      }

      await fetchConfig();
      if (onRefreshJobs) onRefreshJobs();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Erro ao salvar:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyUrl = () => {
    if (urlInput) {
      navigator.clipboard.writeText(urlInput);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const conversionRate = config && config.totalClicks > 0
    ? Math.round(((config.totalUnlocks || 0) / config.totalClicks) * 100 * 10) / 10
    : 33.2;

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-pink-950/40 to-slate-900 border border-pink-500/40 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-pink-500/20 text-pink-300 border border-pink-500/40 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>FERRAMENTA DE BLOQUEIO & RECOMPENSAS TIKTOK 24H</span>
              </span>
              {liveStats.isExpired ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Link Expirado
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Ativo ({liveStats.formattedRemaining || '24h'})
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Gerenciador de Link TikTok 24h & Gatekeeper de Contratos
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              O TikTok gera links diários com validade de 24 horas para indicação e recompensas. 
              Esta ferramenta bloqueia o <strong>número de WhatsApp do contratante</strong> e a <strong>ficha de contrato</strong> até que o candidato acesse o link ativo de hoje.
            </p>
          </div>

          {/* Quick Refresh Button */}
          <button
            onClick={() => fetchConfig()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Atualizar Dados</span>
          </button>
        </div>
      </div>

      {/* KPI Cards for the 24h Link */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Countdown Timer */}
        <div className={`p-4 rounded-2xl border ${
          liveStats.isExpired
            ? 'bg-rose-950/40 border-rose-500/50'
            : 'bg-slate-900/90 border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold">Validade do Link Atual</span>
            <Clock className="w-4 h-4 text-pink-400" />
          </div>
          <div className="text-2xl font-black font-mono tracking-tight text-white mt-1">
            {liveStats.formattedRemaining || '24:00:00'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {liveStats.isExpired 
              ? '🚨 O link expirou. Renove abaixo!' 
              : '⏳ Contagem regressiva de 24 horas'}
          </div>
        </div>

        {/* Total Clicks */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold">Total de Cliques no Link</span>
            <MousePointerClick className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black font-mono tracking-tight text-white mt-1">
            {config?.totalClicks?.toLocaleString('pt-BR') || '14.820'}
          </div>
          <div className="text-[11px] text-cyan-400 mt-1">
            Acessos enviados para o TikTok
          </div>
        </div>

        {/* Unlocked Contacts / Contracts */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold">Contratos & Contatos Liberados</span>
            <Unlock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono tracking-tight text-white mt-1">
            {config?.totalUnlocks?.toLocaleString('pt-BR') || '4.920'}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1">
            Candidatos que concluíram a missão
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold">Taxa de Conversão</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black font-mono tracking-tight text-white mt-1">
            {conversionRate}%
          </div>
          <div className="text-[11px] text-amber-400 mt-1">
            Média de conclusão de missão
          </div>
        </div>

      </div>

      {/* Main Configuration Form Card */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
        
        <div className="border-b border-slate-800 pb-4">
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-pink-400" />
            <span>Configuração do Link Diário de 24 Horas</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Insira o link gerado hoje no aplicativo do TikTok. Você pode renovar a contagem de 24 horas a cada novo link diário.
          </p>
        </div>

        {/* 24h URL Input */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-200">
            Link Ativo do TikTok (Link de Indicação / Prêmios das 24 Horas):
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://www.tiktok.com/d/1/ZS9BMchsVwW1a-x3E0j/"
                className="w-full py-3 px-4 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition"
              />
            </div>

            <button
              type="button"
              onClick={handleCopyUrl}
              className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition shrink-0"
              title="Copiar URL"
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-400" />
                  <span>Copiar</span>
                </>
              )}
            </button>

            <a
              href={urlInput || 'https://www.tiktok.com'}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white text-xs font-black flex items-center justify-center gap-1.5 transition shrink-0 shadow-md shadow-pink-600/20"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Testar Link</span>
            </a>
          </div>
        </div>

        {/* Global Protection & Lock Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
          
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="lockAllJobs"
              checked={lockAllJobsToggle}
              onChange={(e) => setLockAllJobsToggle(e.target.checked)}
              className="mt-1 w-4 h-4 rounded text-pink-500 focus:ring-pink-500 bg-slate-900 border-slate-700 cursor-pointer"
            />
            <div>
              <label htmlFor="lockAllJobs" className="text-xs font-black text-white cursor-pointer flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Bloquear Contratos & Contatos em TODAS as Vagas</span>
              </label>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                Quando ativado, qualquer vaga exibida na plataforma terá o número de WhatsApp e o contrato ocultados até o cumprimento da missão.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="isActive"
              checked={isActiveToggle}
              onChange={(e) => setIsActiveToggle(e.target.checked)}
              className="mt-1 w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-slate-900 border-slate-700 cursor-pointer"
            />
            <div>
              <label htmlFor="isActive" className="text-xs font-black text-white cursor-pointer flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Sistema de Missão TikTok Habilitado</span>
              </label>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                Permite que os candidatos façam o fluxo de verificação de 2 passos (acessar link + liberar instantaneamente).
              </p>
            </div>
          </div>

        </div>

        {/* Mission Copywriting Customization */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-200">
              Título da Missão para o Candidato:
            </label>
            <input
              type="text"
              value={missionTitleInput}
              onChange={(e) => setMissionTitleInput(e.target.value)}
              placeholder="Missão TikTok 24h Oficial • Indicação & Desbloqueio"
              className="w-full py-2.5 px-3.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-pink-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-200">
              Instruções da Missão:
            </label>
            <input
              type="text"
              value={missionInstructionsInput}
              onChange={(e) => setMissionInstructionsInput(e.target.value)}
              placeholder="Acesse o link oficial do TikTok para liberar o contrato e o WhatsApp do contratante."
              className="w-full py-2.5 px-3.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-pink-500"
            />
          </div>

        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
          
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Última atualização por {currentAdmin.name}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            
            {/* Save without resetting timer */}
            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSaveConfig(false)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition"
            >
              <Save className="w-4 h-4 text-slate-400" />
              <span>Salvar Alterações</span>
            </button>

            {/* Save & Reset 24-hour countdown */}
            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSaveConfig(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:from-pink-400 hover:to-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-pink-500/20 transition transform active:scale-95 cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              <span>{isSaving ? 'Salvando...' : '⚡ Iniciar Novo Link de 24 Horas'}</span>
            </button>

          </div>

        </div>

        {saveSuccess && (
          <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Link do TikTok atualizado e contagem de 24 horas iniciada com sucesso!</span>
          </div>
        )}

      </div>

      {/* Contract & Candidate Flow Preview */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-black text-white">
              Prévia do Fluxo: Como o Freelancer Desbloqueia o Contrato
            </h3>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
            Regra Operacional FreelaHub
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold">
              1
            </div>
            <h4 className="font-bold text-white">Visualização com Bloqueio</h4>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              O candidato vê o anúncio da vaga com o cachê e horário, porém o <strong>telefone/WhatsApp</strong> e o <strong>contrato completo</strong> aparecem bloqueados por cadeado com o aviso da missão TikTok.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold">
              2
            </div>
            <h4 className="font-bold text-white">Clique no Link TikTok de 24h</h4>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              O candidato clica no botão oficial que abre o link de indicação do TikTok gerado para as 24 horas atuais. O sistema contabiliza o clique automaticamente.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              3
            </div>
            <h4 className="font-bold text-white">Liberação do Contrato & WhatsApp</h4>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Ao validar, o número de telefone é exibido com botão direto de WhatsApp e a ficha oficial do <strong>Contrato de Prestação de Serviços</strong> é liberada para envio imediato.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
