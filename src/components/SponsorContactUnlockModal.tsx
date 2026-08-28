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
  Users,
  FileText,
  ShieldCheck,
  Award,
  Zap,
  Download
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
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedContract, setCopiedContract] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [tiktokMissionData, setTiktokMissionData] = useState<{
    activeUrl: string;
    formattedRemaining?: string;
    isExpired?: boolean;
    missionTitle?: string;
    missionInstructions?: string;
  } | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  // Fetch active 24h mission configuration
  useEffect(() => {
    if (isOpen) {
      fetch('/api/tiktok-mission')
        .then(res => res.json())
        .then(data => {
          setTiktokMissionData(data);
        })
        .catch(err => {
          console.warn('Erro ao carregar link 24h do TikTok:', err);
        });
    }
  }, [isOpen]);

  // Check if this job was already unlocked by user
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

  // The official 24h sponsor TikTok link (prioritizes dynamic daily URL from backend)
  const sponsorUrl = tiktokMissionData?.activeUrl || job.sponsorMissionUrl || 'https://www.tiktok.com/d/1/ZS9BMchsVwW1a-x3E0j/';
  const contactPhone = job.contactPhone || '+55 11 96938-7876';
  const locationText = `${job.locationName || job.locationAddress}${job.neighborhood ? ` (${job.neighborhood})` : ''}`;

  const handleOpenSponsorLink = async () => {
    // Track click on backend
    try {
      fetch('/api/tiktok-mission/track-click', { method: 'POST' });
    } catch {
      // ignore
    }

    window.open(sponsorUrl, '_blank', 'noopener,noreferrer');
    setHasVisitedMission(true);

    // Fast 3-second simulation validation timer
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

  const handleUnlockContact = async () => {
    setIsValidating(true);
    try {
      await fetch('/api/tiktok-mission/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: job.id,
          userName: userProfile?.name || 'Freelancer'
        })
      });
    } catch (e) {
      console.warn('Erro ao registrar unlock:', e);
    } finally {
      setIsValidating(false);
      setIsUnlocked(true);
      if (onContactUnlocked && job) {
        onContactUnlocked(job.id);
      }

      try {
        confetti({
          particleCount: 80,
          spread: 85,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore
      }
    }
  };

  // Generate Digital Freelancer Contract text
  const contractDocumentText = `=====================================================
📜 FREELAHUB - CONTRATO DE PRESTAÇÃO DE SERVIÇOS FREELANCER
Termo de Compromisso Operacional & Acordo de Atuação
Código do Contrato: FLH-${job.id.slice(-6).toUpperCase()}-${Date.now().toString().slice(-4)}
=====================================================

1. CONTRATANTE & COORDENAÇÃO RESPONSÁVEL:
   - Evento/Local: ${job.locationName || 'FreelaHub Operações'}
   - Endereço: ${job.locationAddress}
   - Contato Oficial: ${job.contactName || 'Coordenação Geral'} (${contactPhone})

2. PRESTADOR(A) FREELANCER CADASTRADO(A):
   - Nome: ${userProfile?.name || 'Profissional Freelancer'}
   - WhatsApp: ${userProfile?.phone || 'Informado no cadastro'}
   - Chave PIX: ${userProfile?.pixKey || 'Conforme cadastro do app'} (${userProfile?.pixType || 'PIX'})
   - Cidade/UF: ${userProfile?.city || job.city || 'São Paulo'} - ${userProfile?.state || job.state || 'SP'}

3. OBJETO & FUNÇÃO CONTRATADA:
   - Função: ${job.role}
   - Categoria: ${job.category}
   - Requisitos Especiais: ${job.genderRequirement === 'homens' ? 'Exclusivo público masculino' : 'Padrão FreelaHub'}

4. DATAS & HORÁRIOS ACORDADOS:
   - Período: ${job.date}
   - Turno: Das ${job.startTime} às ${job.endTime}
   - Tolerância de chegada: Chegar com 15 minutos de antecedência para credenciamento.

5. CACHÊ & CONDIÇÕES DE PAGAMENTO:
   - Valor da Diária: ${formatCurrency(job.cachet)} líquidos
   - Prazo & Forma: ${job.paymentDetails}
   - Benefícios: ${job.benefits || 'Alimentação e água fornecidas no local'}

6. PADRÃO DE VESTIMENTA & SEGURANÇA:
   - Padrão Obrigatório: ${job.dressCode}
   - POLÍTICA RIGOROSA SEM ADORNOS: Proibido trabalhar com brincos, piercings, anéis, alianças, pulseiras, colares ou relógios.

7. TERMO DE COMPROMISSO:
   O(A) prestador(a) declara estar apto(a), com disponibilidade total e pontualidade para cumprir a escala designada.

Emitido digitalmente via FreelaHub em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}
Status: ✅ CONTRATO LIBERADO & EMITIDO DIGITALMENTE`;

  const whatsappMessage = `Olá! Realizei a missão de indicação do TikTok de 24h e desbloqueei o *Contrato Oficial FreelaHub* para a vaga de *${job.role}* (${locationText}).
📅 Datas: ${job.date} (Turno: ${job.startTime} às ${job.endTime})
💰 Cachê: ${formatCurrency(job.cachet)} (${job.paymentDetails})
👕 Confirmo traje padrão e trabalho SEM ADORNOS.
👤 Meu Nome: ${userProfile?.name || 'Freelancer'}. Gostaria de confirmar minha escala!`;

  const directWhatsAppUrl = createWhatsAppLink(contactPhone, whatsappMessage);

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(contactPhone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleCopyContract = () => {
    navigator.clipboard.writeText(contractDocumentText);
    setCopiedContract(true);
    setTimeout(() => setCopiedContract(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/95 backdrop-blur-md p-2.5 sm:p-4 md:p-6 flex justify-center items-center animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[94dvh] sm:max-h-[90vh] my-auto flex flex-col rounded-2xl sm:rounded-3xl bg-slate-900 border-2 border-pink-500/50 shadow-2xl shadow-pink-950/60 text-slate-100 overflow-hidden min-h-0">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 z-20 p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-400 hover:text-white transition border border-slate-700/60 shadow-md"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="p-4 sm:p-6 pb-3.5 sm:pb-4 shrink-0 bg-gradient-to-r from-slate-950 via-slate-900 to-pink-950/50 border-b border-slate-800 pr-14">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            {isUnlocked ? (
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
                <Unlock className="w-3.5 h-3.5" />
                <span>CONTRATO & WHATSAPP LIBERADOS COM SUCESSO</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-black bg-gradient-to-r from-pink-500/20 to-rose-500/20 text-pink-300 border border-pink-500/40">
                <Lock className="w-3.5 h-3.5" />
                <span>MISSÃO TIKTOK 24H • LIBERAÇÃO DE CONTRATO & CONTATO</span>
              </span>
            )}

            {tiktokMissionData?.formattedRemaining && !isUnlocked && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                <Clock className="w-3 h-3 text-pink-400" />
                <span>Link Válido por: {tiktokMissionData.formattedRemaining}</span>
              </span>
            )}
          </div>

          <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>🚨 {job.role}</span>
          </h2>

          <p className="text-xs text-slate-300 mt-1">
            {job.locationName || 'Local Oficial'} • <span className="text-emerald-400 font-bold">Cachê {formatCurrency(job.cachet)}</span> • {job.paymentDetails}
          </p>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto min-h-0 flex-1 custom-scrollbar space-y-4 sm:space-y-5 overscroll-contain">
          
          {/* Requirement Alert if Men Only or Urgent */}
          {(job.genderRequirement === 'homens' || job.role.toUpperCase().includes('HOMENS')) && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 to-rose-500/15 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-2.5 shadow-md">
              <Users className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-black text-white uppercase tracking-wider text-xs">
                  ⚠️ Requisito Operacional: APENAS HOMENS
                </div>
                <p className="text-slate-300 mt-0.5 leading-relaxed">
                  Vaga com esforço físico, carga de equipamentos e vestimenta operacional padronizada sem adornos.
                </p>
              </div>
            </div>
          )}

          {/* Job Specs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white">Datas de Trabalho:</span>
                <div className="text-slate-300 font-semibold">{job.date}</div>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white">Horário da Escala:</span>
                <div className="text-slate-300 font-semibold">Das {job.startTime} às {job.endTime}</div>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white">Cachê Líquido:</span>
                <div className="text-emerald-300 font-bold">{formatCurrency(job.cachet)} ({job.paymentDetails})</div>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white">Local da Vaga:</span>
                <div className="text-slate-300 truncate">{job.locationName || job.locationAddress}</div>
              </div>
            </div>
          </div>

          {/* Dress code & No Accessories rules */}
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-xs space-y-2">
            <div className="flex items-center gap-2 text-slate-200 font-bold">
              <Shirt className="w-4 h-4 text-blue-400" />
              <span>Vestimenta & Apresentação Pessoal:</span>
            </div>
            <p className="text-slate-300 text-[11px]">
              {job.dressCode}
            </p>

            <div className="pt-2 border-t border-slate-800">
              <div className="flex items-center gap-1.5 text-rose-400 font-bold text-xs mb-1">
                <Ban className="w-4 h-4" />
                <span>Norma Rigorosa SEM ADORNOS:</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Trabalhar sem brincos, piercings, anéis, alianças, correntes, pulseiras ou relógios por normas de segurança de eventos.
              </p>
            </div>
          </div>

          {/* UNLOCKED STATE: Reveal Phone and Full Digital Contract */}
          {isUnlocked ? (
            <div className="space-y-4 animate-scale-up">
              
              {/* Unlocked Contact Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-b from-emerald-950/70 to-slate-950 border-2 border-emerald-500/80 shadow-xl shadow-emerald-950/50 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                        Número de WhatsApp do Contratante Liberado!
                      </div>
                      <h3 className="text-xl font-black text-white font-mono">
                        {contactPhone}
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        {job.contactName || 'Coordenação Oficial de Eventos'} • Atendimento Direto
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black border border-emerald-500/40">
                    Desbloqueado
                  </span>
                </div>

                {/* Direct WhatsApp Big Action */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <a
                    href={directWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 transition transform active:scale-95 text-center"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Chamar no WhatsApp com Contrato</span>
                  </a>

                  <button
                    type="button"
                    onClick={handleCopyPhone}
                    className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition"
                  >
                    {copiedPhone ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-300">Número Copiado!</span>
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

              {/* Digital Freelancer Contract Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-emerald-500/40 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-400" />
                    <h4 className="text-sm font-black text-white">
                      Ficha Oficial de Contrato de Prestação de Serviços
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Válido Digitalmente
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 font-mono text-[11px] text-slate-300 leading-relaxed max-h-52 overflow-y-auto custom-scrollbar whitespace-pre-line select-all">
                  {contractDocumentText}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Contrato e dados garantidos via FreelaHub</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyContract}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    {copiedContract ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-300">Contrato Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-slate-400" />
                        <span>Copiar Texto do Contrato</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>
          ) : (
            /* LOCKED STATE: TikTok 24h Mission Step-by-Step Flow */
            <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900 border-2 border-pink-500/60 shadow-xl space-y-4">
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-pink-500/20 text-pink-400 border border-pink-500/40 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-white">
                      Missão TikTok 24 Horas: Liberar Contrato & WhatsApp
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      O TikTok gera links com duração de 24h para você apoiar a indicação e desbloquear o contrato.
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/40 shrink-0">
                  Missão do Dia
                </span>
              </div>

              {/* Step 1: Open 24h TikTok Link */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-200 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-pink-500 text-slate-950 flex items-center justify-center text-[10px] font-black">1</span>
                    <span>Passo 1: Acessar o Link Oficial de Hoje no TikTok</span>
                  </span>
                  {hasVisitedMission && (
                    <span className="text-emerald-400 flex items-center gap-1 text-[11px] font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Acessado com Sucesso
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Clique no botão abaixo para abrir a página de indicação no TikTok em uma nova aba:
                </p>

                <button
                  type="button"
                  onClick={handleOpenSponsorLink}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-pink-600 via-rose-600 to-amber-500 hover:from-pink-500 hover:to-amber-400 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-pink-600/30 transition transform active:scale-95 cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>1. Acessar TikTok pelo Link Oficial de 24h (Clique Aqui)</span>
                </button>

                <div className="text-[10px] text-slate-400 text-center truncate pt-1">
                  Link ativo: <span className="text-slate-300 underline">{sponsorUrl}</span>
                </div>
              </div>

              {/* Step 2: Validate and Release */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
                <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                    hasVisitedMission ? 'bg-emerald-400 text-slate-950' : 'bg-slate-700 text-slate-400'
                  }`}>2</span>
                  <span>Passo 2: Confirmar Missão & Liberar Número e Contrato</span>
                </div>

                <button
                  type="button"
                  disabled={!hasVisitedMission || isValidating}
                  onClick={handleUnlockContact}
                  className={`w-full py-3.5 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition transform active:scale-95 ${
                    hasVisitedMission
                      ? 'bg-gradient-to-r from-emerald-400 to-green-500 text-slate-950 shadow-lg shadow-emerald-500/30 hover:from-emerald-300 hover:to-green-400 cursor-pointer animate-pulse'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Unlock className="w-4 h-4" />
                  <span>
                    {isValidating 
                      ? 'Validando com o TikTok...'
                      : hasVisitedMission
                        ? '2. Validar Missão e Liberar WhatsApp & Contrato Agora'
                        : 'Acesse o Passo 1 Acima para Habilitar a Liberação'}
                  </span>
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 shrink-0 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between gap-3">
          <div className="text-[11px] text-slate-400 truncate">
            {isUnlocked 
              ? '✅ Contrato de prestação de serviços e número de WhatsApp prontos' 
              : '⚡ Missão rápida com o link de 24h do TikTok'}
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
