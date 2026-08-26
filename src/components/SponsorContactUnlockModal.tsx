import React, { useState, useEffect } from 'react';
import { 
  X, 
  Lock, 
  Unlock, 
  ExternalLink, 
  CheckCircle2, 
  Phone, 
  Copy, 
  Check, 
  Sparkles, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  DollarSign, 
  Calendar,
  Shirt,
  Ban,
  MessageCircle,
  Users
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { FreelanceJob, UserProfile } from '../types';
import { formatCurrency, createWhatsAppLink } from '../utils/formatters';

interface SponsorContactUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: FreelanceJob | null;
  userProfile: UserProfile | null;
  onContactUnlocked?: (jobId: string) => void;
}

export const SponsorContactUnlockModal: React.FC<SponsorContactUnlockModalProps> = ({
  isOpen,
  onClose,
  job,
  userProfile,
  onContactUnlocked
}) => {
  const [hasVisitedMission, setHasVisitedMission] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  // The official sponsor TikTok link provided by user
  const sponsorUrl = job?.sponsorMissionUrl || 'https://www.tiktok.com/d/1/ZS9BMchsVwW1a-x3E0j/';
  const contactPhone = job?.contactPhone || '+55 11 96938-7876';

  // Check if this job was already unlocked
  useEffect(() => {
    if (job) {
      const alreadyUnlocked = userProfile?.unlockedJobContacts?.includes(job.id) || 
                             Boolean(userProfile?.missionsCompleted?.tiktokReferral);
      if (alreadyUnlocked) {
        setIsUnlocked(true);
      } else {
        setIsUnlocked(false);
        setHasVisitedMission(false);
      }
    }
  }, [job, userProfile]);

  if (!isOpen || !job) return null;

  const handleOpenSponsorLink = () => {
    window.open(sponsorUrl, '_blank', 'noopener,noreferrer');
    setHasVisitedMission(true);
    // Start a fast 3-second simulation timer
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev !== null && prev <= 1) {
          clearInterval(interval);
          return null;
        }
        return prev !== null ? prev - 1 : null;
      });
    }, 1000);
  };

  const handleUnlockContact = () => {
    setIsUnlocked(true);
    if (onContactUnlocked && job) {
      onContactUnlocked(job.id);
    }

    try {
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }
  };

  const whatsappMessage = `Olá! Realizei a missão no TikTok do patrocinador e quero confirmar minha vaga de *${job.role}* para o *Autódromo de Interlagos* nas datas ${job.date} (14h às 02h). Cachê R$ 225,00 com pagamento 11/09 via PIX. Confirmo que atenderei a vestimenta padrão e trabalharei sem adornos. Meu nome: ${userProfile?.name || 'Candidato FreelaHub'}.`;

  const directWhatsAppUrl = createWhatsAppLink(contactPhone, whatsappMessage);

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(contactPhone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/90 backdrop-blur-md p-3 sm:p-5 flex justify-center items-start sm:items-center animate-fade-in">
      <div className="relative w-full max-w-xl max-h-[90vh] my-auto flex flex-col rounded-3xl bg-slate-900 border border-emerald-500/60 shadow-2xl shadow-emerald-950/80 text-slate-100 overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Pinned Modal Header */}
        <div className="p-5 sm:p-6 pb-4 shrink-0 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/60 border-b border-slate-800 pr-12">
          <div className="flex items-center gap-2 mb-1">
            {isUnlocked ? (
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
                <Unlock className="w-3.5 h-3.5" />
                <span>CONTATO LIBERADO COM SUCESSO</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
                <Lock className="w-3.5 h-3.5" />
                <span>LIBERAÇÃO DE CONTATO • MISSÃO PATROCINADOR</span>
              </span>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>🚨 {job.role}</span>
          </h2>

          <p className="text-xs text-slate-300 mt-1">
            {job.locationName || 'Autódromo de Interlagos'} • <span className="text-emerald-400 font-bold">Diária R$ 225,00</span> • Pagamento via PIX 11/09
          </p>
        </div>

        {/* Scrollable Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar space-y-5 flex-1">
          
          {/* Male Only Alert / Exclusivo Homens */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 to-rose-500/15 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-2.5 shadow-md">
            <Users className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-black text-white uppercase tracking-wider text-xs">
                ⚠️ Requisito Operacional: APENAS HOMENS
              </div>
              <p className="text-slate-300 mt-0.5 leading-relaxed">
                Vaga destinada ao público masculino devido a esforço logístico, carga de materiais e vestimenta padronizada no evento.
              </p>
            </div>
          </div>

          {/* Job Key Specs Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white">Datas de Trabalho:</span>
                <div className="text-slate-300 font-semibold">28/08 • 29/08 • 30/08 (ou 30/07)</div>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white">Horário:</span>
                <div className="text-slate-300 font-semibold">14:00 às 02:00</div>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white">Diária & Pagamento:</span>
                <div className="text-emerald-300 font-bold">R$ 225,00 / dia (PIX em 11/09)</div>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white">Local / Portão:</span>
                <div className="text-slate-300 truncate">Autódromo de Interlagos – Portão 7</div>
              </div>
            </div>
          </div>

          {/* Dress code & No accessories rules */}
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-xs space-y-2">
            <div className="flex items-center gap-2 text-slate-200 font-bold">
              <Shirt className="w-4 h-4 text-blue-400" />
              <span>Vestimenta Obrigatória:</span>
            </div>
            <ul className="text-slate-300 space-y-1 pl-6 list-disc text-[11px]">
              <li>Calça preta</li>
              <li>Camiseta ou polo preta ou branca, lisa e <strong>sem estampa</strong></li>
              <li>Sapato fechado preto e antiderrapante</li>
            </ul>

            <div className="pt-2 border-t border-slate-800">
              <div className="flex items-center gap-1.5 text-rose-400 font-bold text-xs mb-1">
                <Ban className="w-4 h-4" />
                <span>Proibido Uso de Adornos:</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Trabalhar obrigatoriamente <strong>sem brincos, piercings, anéis/alianças, correntes, pulseiras, relógios</strong> e demais acessórios.
              </p>
            </div>
          </div>

          {/* Unlocked State vs Locked State */}
          {isUnlocked ? (
            <div className="p-5 rounded-2xl bg-gradient-to-b from-emerald-950/60 to-slate-950 border-2 border-emerald-500/70 shadow-xl shadow-emerald-950/50 space-y-4 animate-scale-up">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Telefone Liberado no Final da Missão
                  </div>
                  <h3 className="text-lg font-black text-white">
                    {contactPhone}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Coordenação Oficial • Autódromo de Interlagos
                  </p>
                </div>
              </div>

              {/* Direct WhatsApp Big Action */}
              <div className="space-y-2">
                <a
                  href={directWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 transition transform active:scale-95"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Chamar no WhatsApp Privado Agora</span>
                </a>

                <button
                  onClick={handleCopyPhone}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-300">Telefone Copiado ({contactPhone})!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-400" />
                      <span>Copiar Número ({contactPhone})</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900 border-2 border-emerald-500/50 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">Desbloqueio com Patrocinador TikTok</h3>
                    <p className="text-[11px] text-slate-400">Acesse o link oficial para liberar o WhatsApp privado</p>
                  </div>
                </div>
                <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Gratuito
                </span>
              </div>

              {/* Step 1: Open TikTok sponsor link */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-200">Passo 1: Acessar Link da Missão</span>
                  {hasVisitedMission && (
                    <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Acessado
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  Clique no botão abaixo para abrir a página do patrocinador TikTok em uma nova aba:
                </p>
                <button
                  type="button"
                  onClick={handleOpenSponsorLink}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-500 via-pink-600 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-pink-500/20 transition transform active:scale-95"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>1. Acessar Link Oficial do TikTok (Clique Aqui)</span>
                </button>
                <div className="text-[10px] text-slate-400 text-center truncate">
                  Link: <span className="text-slate-300 underline">{sponsorUrl}</span>
                </div>
              </div>

              {/* Step 2: Validate and Release */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-slate-200">
                  Passo 2: Confirmar e Liberar Contato
                </div>
                <button
                  type="button"
                  disabled={!hasVisitedMission}
                  onClick={handleUnlockContact}
                  className={`w-full py-3 px-4 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition transform active:scale-95 ${
                    hasVisitedMission
                      ? 'bg-gradient-to-r from-emerald-400 to-green-500 text-slate-950 shadow-lg shadow-emerald-500/30 hover:from-emerald-300 hover:to-green-400 cursor-pointer animate-pulse'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Unlock className="w-4 h-4" />
                  <span>
                    {hasVisitedMission
                      ? '2. Validar Missão e Liberar WhatsApp Agora'
                      : 'Clique no Passo 1 Primeiro para Habilitar'}
                  </span>
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Pinned Modal Footer */}
        <div className="p-4 sm:p-5 shrink-0 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between gap-3">
          <div className="text-[11px] text-slate-400 truncate">
            {isUnlocked 
              ? '✅ Contato do coordenador liberado para envio de mensagem' 
              : '⚡ Missão rápida do patrocinador TikTok'}
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
