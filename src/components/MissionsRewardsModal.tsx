import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  ExternalLink, 
  Coins, 
  MessageCircle, 
  ArrowRight, 
  Gift, 
  Copy, 
  Check, 
  Settings2,
  Share2,
  Zap,
  Lock,
  Unlock,
  DollarSign
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile } from '../types';
import { formatCurrency } from '../utils/formatters';

interface MissionsRewardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile | null;
  onUpdateMissions: (missions: {
    tiktokReferral: boolean;
    kwaiReferral: boolean;
    whatsappGroupJoined: boolean;
  }, creditsAdded: number) => void;
}

export const MissionsRewardsModal: React.FC<MissionsRewardsModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onUpdateMissions
}) => {
  // Referral links state with defaults (customizable)
  const [tiktokLink, setTiktokLink] = useState('https://www.tiktok.com/d/1/ZS9BMchsVwW1a-x3E0j/');
  const [tiktokCode, setTiktokCode] = useState('TIKTOK-FREELA50');
  const [kwaiLink, setKwaiLink] = useState('https://s.kwai.app/s/kwaiFreelaHub50');
  const [kwaiCode, setKwaiCode] = useState('KWAI-FREELA50');
  const [whatsappGroupLink, setWhatsappGroupLink] = useState('https://chat.whatsapp.com/FreelaHubVipBrasil');

  const [isEditingLinks, setIsEditingLinks] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // Status of missions
  const isTiktokDone = Boolean(userProfile?.missionsCompleted?.tiktokReferral);
  const isKwaiDone = Boolean(userProfile?.missionsCompleted?.kwaiReferral);
  const isWhatsappJoined = Boolean(userProfile?.missionsCompleted?.whatsappGroupJoined);

  const completedCount = (isTiktokDone ? 1 : 0) + (isKwaiDone ? 1 : 0);
  const allMissionsDone = completedCount === 2;

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(id);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const handleOpenTiktokMission = () => {
    window.open(tiktokLink, '_blank');
    if (!isTiktokDone) {
      onUpdateMissions({
        tiktokReferral: true,
        kwaiReferral: isKwaiDone,
        whatsappGroupJoined: isWhatsappJoined
      }, isKwaiDone ? 50 : 25);
      
      try {
        confetti({ particleCount: 40, spread: 60 });
      } catch {
        // ignore
      }
    }
  };

  const handleOpenKwaiMission = () => {
    window.open(kwaiLink, '_blank');
    if (!isKwaiDone) {
      onUpdateMissions({
        tiktokReferral: isTiktokDone,
        kwaiReferral: true,
        whatsappGroupJoined: isWhatsappJoined
      }, isTiktokDone ? 50 : 25);

      try {
        confetti({ particleCount: 40, spread: 60 });
      } catch {
        // ignore
      }
    }
  };

  const handleJoinWhatsAppGroup = () => {
    window.open(whatsappGroupLink, '_blank');
    onUpdateMissions({
      tiktokReferral: isTiktokDone,
      kwaiReferral: isKwaiDone,
      whatsappGroupJoined: true
    }, 0);

    try {
      confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });
    } catch {
      // ignore
    }
  };

  const currentReais = userProfile?.credits ?? 50;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/90 backdrop-blur-md p-2.5 sm:p-4 md:p-6 flex justify-center items-center">
      <div className="relative w-full max-w-2xl max-h-[92dvh] sm:max-h-[88vh] my-auto flex flex-col rounded-2xl sm:rounded-3xl bg-slate-900 border border-emerald-500/50 shadow-2xl shadow-emerald-950/60 text-slate-100 overflow-hidden min-h-0">
        
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 z-20 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition border border-slate-700/60 shadow-md"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Modal Content */}
        <div className="p-4 sm:p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 min-h-0 space-y-4 sm:space-y-6 overscroll-contain">
          {/* Header with Gift Icon */}
          <div className="text-center space-y-2 pr-2 sm:pr-0">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-amber-400 text-slate-950 shadow-xl shadow-emerald-500/20 mb-1 animate-bounce">
              <Gift className="w-7 h-7" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Missões de Indicação & Recompensa em Reais</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Ganhe R$ 50,00 em Reais + Acesso VIP no WhatsApp
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
              Realize as duas missões de acesso pelos links de indicação do <strong>TikTok</strong> e <strong>Kwai</strong> para liberar seus <strong>R$ 50,00 em Reais (R$ 25 por missão)</strong> e entrar no <strong>Grupo Exclusivo do WhatsApp</strong>.
            </p>
          </div>

          {/* Progress Tracker */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">Progresso das Missões:</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-extrabold text-[11px] border border-emerald-500/30">
                {completedCount} de 2 Concluídas
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-emerald-400 font-black text-sm">
              <span className="p-1 rounded-md bg-emerald-500/20 text-emerald-300">
                <DollarSign className="w-3.5 h-3.5" />
              </span>
              <span>Saldo: {formatCurrency(currentReais)}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-800 p-0.5">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-amber-400 h-full rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${(completedCount / 2) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* The 2 Mandatory Missions */}
        <div className="space-y-4 mb-6">
          
          {/* Mission 1: TikTok Referral Link */}
          <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
            isTiktokDone 
              ? 'bg-slate-950/80 border-emerald-500/50 shadow-md shadow-emerald-950/30' 
              : 'bg-slate-950 border-slate-800 hover:border-slate-700'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 via-rose-600 to-black text-white flex items-center justify-center font-black text-lg shadow-md shrink-0">
                  🎵
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-black text-white">
                      Missão 1: Acessar pelo Link de Indicação do TikTok
                    </h3>
                    {isTiktokDone ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Concluída (+R$ 25,00)</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        +R$ 25,00 em Reais
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Acesse o TikTok pelo link de indicação oficial e confirme a ativação para ganhar R$ 25,00.
                  </p>
                  
                  {/* Referral Code snippet */}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[11px] text-slate-400">Código de Convite:</span>
                    <span className="text-xs font-mono font-bold text-pink-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {tiktokCode}
                    </span>
                    <button
                      onClick={() => handleCopy(tiktokCode, 'tiktok-code')}
                      className="p-1 text-slate-400 hover:text-pink-400 text-xs transition"
                      title="Copiar código"
                    >
                      {copiedLink === 'tiktok-code' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleOpenTiktokMission}
                  className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition shadow-md ${
                    isTiktokDone
                      ? 'bg-slate-800 text-emerald-300 border border-emerald-500/40 hover:bg-slate-700'
                      : 'bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white shadow-pink-500/20'
                  }`}
                >
                  <span>{isTiktokDone ? 'Abrir Novamente' : 'Acessar TikTok (+R$ 25)'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Mission 2: Kwai Referral Link */}
          <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
            isKwaiDone 
              ? 'bg-slate-950/80 border-emerald-500/50 shadow-md shadow-emerald-950/30' 
              : 'bg-slate-950 border-slate-800 hover:border-slate-700'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-slate-950 flex items-center justify-center font-black text-lg shadow-md shrink-0">
                  🟠
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-black text-white">
                      Missão 2: Acessar pelo Link de Indicação do Kwai
                    </h3>
                    {isKwaiDone ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Concluída (+R$ 25,00)</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        +R$ 25,00 em Reais
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Acesse o Kwai pelo link de indicação oficial e confirme a ativação para ganhar R$ 25,00.
                  </p>

                  {/* Referral Code snippet */}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[11px] text-slate-400">Código de Convite:</span>
                    <span className="text-xs font-mono font-bold text-orange-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {kwaiCode}
                    </span>
                    <button
                      onClick={() => handleCopy(kwaiCode, 'kwai-code')}
                      className="p-1 text-slate-400 hover:text-orange-400 text-xs transition"
                      title="Copiar código"
                    >
                      {copiedLink === 'kwai-code' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleOpenKwaiMission}
                  className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition shadow-md ${
                    isKwaiDone
                      ? 'bg-slate-800 text-emerald-300 border border-emerald-500/40 hover:bg-slate-700'
                      : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 shadow-orange-500/20'
                  }`}
                >
                  <span>{isKwaiDone ? 'Abrir Novamente' : 'Acessar Kwai (+R$ 25)'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Reward Unlocked: WhatsApp VIP Group Inclusion */}
        <div className={`p-5 rounded-2xl border transition-all ${
          allMissionsDone
            ? 'bg-gradient-to-br from-emerald-950/80 via-slate-950 to-slate-900 border-emerald-500/60 shadow-xl'
            : 'bg-slate-950/60 border-slate-800/80 opacity-75'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${allMissionsDone ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                  <MessageCircle className="w-4 h-4" />
                </div>
                <h4 className="text-base font-black text-white flex items-center gap-2">
                  <span>Inclusão no Grupo VIP do WhatsApp</span>
                  {allMissionsDone ? (
                    <span className="text-xs text-emerald-400 flex items-center gap-1 font-bold">
                      <Unlock className="w-3.5 h-3.5" /> Desbloqueado!
                    </span>
                  ) : (
                    <span className="text-xs text-slate-500 flex items-center gap-1 font-semibold">
                      <Lock className="w-3.5 h-3.5" /> Bloqueado
                    </span>
                  )}
                </h4>
              </div>
              <p className="text-xs text-slate-300 max-w-md">
                Receba alertas instantâneos de vagas urgentes com cachê na hora antes de irem para o feed geral.
              </p>
            </div>

            <button
              onClick={handleJoinWhatsAppGroup}
              disabled={!allMissionsDone}
              className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-black transition transform active:scale-95 ${
                allMissionsDone
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/30'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              <span>{isWhatsappJoined ? 'Acessar Grupo VIP' : 'Entrar no Grupo VIP do WhatsApp'}</span>
            </button>
          </div>
        </div>

        {/* Option to customize referral links */}
        <div className="mt-4 pt-3 border-t border-slate-800 text-center">
          <button
            type="button"
            onClick={() => setIsEditingLinks(!isEditingLinks)}
            className="text-[11px] text-slate-400 hover:text-emerald-400 flex items-center justify-center gap-1 mx-auto transition"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>{isEditingLinks ? 'Ocultar Configuração de Links' : 'Configurar Meus Próprios Links de Indicação'}</span>
          </button>

          {isEditingLinks && (
            <div className="mt-3 p-4 rounded-xl bg-slate-950 border border-slate-800 text-left space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Link de Indicação do TikTok:</label>
                <input
                  type="url"
                  value={tiktokLink}
                  onChange={(e) => setTiktokLink(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Link de Indicação do Kwai:</label>
                <input
                  type="url"
                  value={kwaiLink}
                  onChange={(e) => setKwaiLink(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Link de Convite do Grupo WhatsApp:</label>
                <input
                  type="url"
                  value={whatsappGroupLink}
                  onChange={(e) => setWhatsappGroupLink(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>
          )}
        </div>

        </div>

        {/* Footer actions (Pinned) */}
        <div className="flex items-center justify-between gap-3 p-4 sm:p-5 shrink-0 border-t border-slate-800 bg-slate-950/90">
          <div className="text-[11px] text-slate-400 font-medium">
            {allMissionsDone ? '🎉 R$ 50,00 em Reais e Grupo VIP Liberados!' : '⚡ Complete as 2 missões para liberar o grupo e R$ 50,00'}
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-300 hover:to-green-400 text-slate-950 text-xs font-black shadow-lg shadow-emerald-500/20 transition transform active:scale-95"
          >
            Fechar e Ir para o App
          </button>
        </div>

      </div>
    </div>
  );
};

