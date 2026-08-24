import React, { useState } from 'react';
import { 
  Users, 
  CheckCircle2, 
  XCircle, 
  Phone, 
  DollarSign, 
  Clock, 
  MapPin, 
  Search, 
  Check, 
  Copy, 
  QrCode, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { FreelanceJob, JobApplicant } from '../types';
import { formatCurrency, createWhatsAppLink } from '../utils/formatters';

interface CandidatesManagerProps {
  jobs: FreelanceJob[];
  selectedJobId?: string;
  onUpdateApplicantStatus: (jobId: string, applicantId: string, status: JobApplicant['status'], notes?: string, paidAmount?: number) => Promise<void>;
}

export const CandidatesManager: React.FC<CandidatesManagerProps> = ({
  jobs,
  selectedJobId,
  onUpdateApplicantStatus
}) => {
  const [filterJobId, setFilterJobId] = useState<string>(selectedJobId || 'all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [pixModalApplicant, setPixModalApplicant] = useState<{ applicant: JobApplicant; job: FreelanceJob } | null>(null);
  const [pixCopied, setPixCopied] = useState(false);

  // Flatten candidates with job metadata
  const allCandidates: { applicant: JobApplicant; job: FreelanceJob }[] = [];
  jobs.forEach(job => {
    if (job.applicants) {
      job.applicants.forEach(app => {
        allCandidates.push({ applicant: app, job });
      });
    }
  });

  const filteredCandidates = allCandidates.filter(({ applicant, job }) => {
    if (filterJobId !== 'all' && job.id !== filterJobId) return false;
    if (statusFilter !== 'all' && applicant.status !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        applicant.name.toLowerCase().includes(q) ||
        applicant.whatsapp.toLowerCase().includes(q) ||
        applicant.pixKey.toLowerCase().includes(q) ||
        job.role.toLowerCase().includes(q) ||
        job.title.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleStatusChange = async (jobId: string, applicantId: string, newStatus: JobApplicant['status']) => {
    try {
      await onUpdateApplicantStatus(jobId, applicantId, newStatus);
      if (newStatus === 'accepted' || newStatus === 'paid') {
        confetti({ particleCount: 50, spread: 50 });
      }
    } catch (e: any) {
      alert(`Erro: ${e.message}`);
    }
  };

  const handleCopyPix = (key: string) => {
    navigator.clipboard.writeText(key);
    setPixCopied(true);
    setTimeout(() => setPixCopied(false), 2000);
  };

  const handleSendConfirmationWhatsApp = (candidate: { applicant: JobApplicant; job: FreelanceJob }) => {
    const text = `Olá, *${candidate.applicant.name}*! Tudo bem? 

Confirmamos sua escalação no *FreelaHub* para a vaga de *${candidate.job.role}*.

📅 *Data:* ${candidate.job.date}
⏰ *Horário:* Das ${candidate.job.startTime} às ${candidate.job.endTime}
💰 *Cachê:* ${formatCurrency(candidate.job.cachet)} (${candidate.job.paymentDetails})
👔 *Vestimenta:* ${candidate.job.dressCode}
📍 *Local:* ${candidate.job.locationAddress}

🗺️ *Traçar Rota no Maps:*
${candidate.job.googleMapsUrl}

Por favor, responda com *"CONFIRMADO"* para garantirmos sua vaga!`;

    window.open(createWhatsAppLink(candidate.applicant.whatsapp, text), '_blank');
  };

  const handleConfirmPixPayment = async () => {
    if (!pixModalApplicant) return;
    try {
      await onUpdateApplicantStatus(
        pixModalApplicant.job.id,
        pixModalApplicant.applicant.id,
        'paid',
        'Pagamento via PIX realizado com sucesso',
        pixModalApplicant.job.cachet
      );
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      setPixModalApplicant(null);
    } catch (e: any) {
      alert(`Erro ao registrar pagamento: ${e.message}`);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Users className="w-4 h-4" />
              <span>Painel do Contratante / Produtor</span>
            </div>
            <h2 className="text-2xl font-black text-white">
              Gestão de Candidatos & Confirmação de Presença
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Aprove inscrições, confirme horários via WhatsApp, valide presença e realize o pagamento via PIX no término.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-xl font-black text-emerald-400">{allCandidates.length}</div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Total Inscritos</div>
            </div>
            <div className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-xl font-black text-cyan-400">
                {allCandidates.filter(c => c.applicant.status === 'accepted' || c.applicant.status === 'checked_in').length}
              </div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Escalados</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-4 border-t border-slate-800">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Filtrar por Vaga:</label>
            <select
              value={filterJobId}
              onChange={(e) => setFilterJobId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="all">Todas as Vagas ({jobs.length})</option>
              {jobs.map(j => (
                <option key={j.id} value={j.id}>
                  {j.role} - {j.locationName || j.neighborhood} ({j.applicants?.length || 0} inscritos)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Status da Candidatura:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="all">Todos os Status</option>
              <option value="pending">🟡 Pendente de Avaliação</option>
              <option value="accepted">🟢 Aprovado / Escalado</option>
              <option value="checked_in">🔵 Presença Confirmada no Local</option>
              <option value="paid">💰 PIX Pago</option>
              <option value="rejected">🔴 Recusado</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Buscar Candidato:</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Nome, WhatsApp ou Chave PIX..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Candidates List */}
      {filteredCandidates.length === 0 ? (
        <div className="text-center py-12 rounded-2xl bg-slate-900/50 border border-slate-800 p-6">
          <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">Nenhum candidato encontrado</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Não encontramos inscrições para os filtros selecionados. Divulgue as vagas nos grupos de WhatsApp!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCandidates.map(({ applicant, job }) => {
            const isAccepted = applicant.status === 'accepted';
            const isPaid = applicant.status === 'paid';
            const isCheckedIn = applicant.status === 'checked_in';

            return (
              <div 
                key={applicant.id}
                className="rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 p-5 space-y-4 shadow-lg"
              >
                {/* Card Top */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-white">{applicant.name}</h3>
                      
                      {applicant.status === 'pending' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Pendente
                        </span>
                      )}
                      {isAccepted && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Aprovado / Escalado
                        </span>
                      )}
                      {isCheckedIn && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          Presente no Local
                        </span>
                      )}
                      {isPaid && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          PIX Pago
                        </span>
                      )}
                      {applicant.status === 'rejected' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          Recusado
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-emerald-400 font-semibold mt-0.5">
                      Vaga: {job.role} • {formatCurrency(job.cachet)}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block">{job.date}</span>
                    <span className="text-[11px] text-slate-500 font-mono">{job.startTime} às {job.endTime}</span>
                  </div>
                </div>

                {/* Info Box */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2 text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">WhatsApp:</span>
                    <span className="font-bold text-white font-mono">{applicant.whatsapp}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Chave PIX ({applicant.pixType.toUpperCase()}):</span>
                    <span className="font-mono text-emerald-400 font-semibold truncate max-w-[200px]" title={applicant.pixKey}>
                      {applicant.pixKey}
                    </span>
                  </div>

                  {applicant.experienceSummary && (
                    <div className="pt-1 border-t border-slate-800/80 text-[11px] text-slate-400 italic">
                      "{applicant.experienceSummary}"
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  
                  {/* WhatsApp contact */}
                  <button
                    onClick={() => handleSendConfirmationWhatsApp({ applicant, job })}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-emerald-400 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 transition"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>

                  {/* Accept / Reject if pending */}
                  {applicant.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleStatusChange(job.id, applicant.id, 'accepted')}
                        className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Aprovar</span>
                      </button>

                      <button
                        onClick={() => handleStatusChange(job.id, applicant.id, 'rejected')}
                        className="px-2.5 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/40 border border-rose-500/30 transition"
                        title="Recusar"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}

                  {/* Mark Check-in */}
                  {isAccepted && (
                    <button
                      onClick={() => handleStatusChange(job.id, applicant.id, 'checked_in')}
                      className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 transition"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Confirmar Presença</span>
                    </button>
                  )}

                  {/* PIX Payment Trigger */}
                  {(isAccepted || isCheckedIn) && !isPaid && (
                    <button
                      onClick={() => setPixModalApplicant({ applicant, job })}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-emerald-400 to-green-400 hover:from-emerald-300 hover:to-green-300 shadow-md shadow-emerald-500/20 transition"
                    >
                      <DollarSign className="w-3.5 h-3.5 text-slate-950" />
                      <span>Pagar PIX ({formatCurrency(job.cachet)})</span>
                    </button>
                  )}

                  {/* Already Paid Badge */}
                  {isPaid && (
                    <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-purple-950/40 text-purple-300 border border-purple-500/30">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                      <span>PIX de {formatCurrency(job.cachet)} Concluído</span>
                    </div>
                  )}

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* PIX Payment Modal */}
      {pixModalApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-emerald-500/40 shadow-2xl p-6 text-slate-100">
            
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Checkout PIX Freelancer</span>
            </div>

            <h3 className="text-2xl font-black text-white mb-1">
              Pagar Cachê: {formatCurrency(pixModalApplicant.job.cachet)}
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Profissional: <strong className="text-white">{pixModalApplicant.applicant.name}</strong> • {pixModalApplicant.job.role}
            </p>

            {/* Key Copy Box */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 mb-5">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold mb-1">
                  Tipo de Chave ({pixModalApplicant.applicant.pixType.toUpperCase()}):
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-700 font-mono text-sm text-emerald-400 select-all">
                  <span className="truncate">{pixModalApplicant.applicant.pixKey}</span>
                  <button
                    onClick={() => handleCopyPix(pixModalApplicant.applicant.pixKey)}
                    className="ml-2 p-1.5 rounded text-slate-300 hover:text-white hover:bg-slate-800"
                    title="Copiar Chave PIX"
                  >
                    {pixCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Valor a transferir:</span>
                <span className="font-black text-emerald-400 text-base">
                  {formatCurrency(pixModalApplicant.job.cachet)}
                </span>
              </div>
            </div>

            <div className="space-y-2.5">
              <button
                onClick={handleConfirmPixPayment}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-300 hover:to-green-400 text-slate-950 font-black text-sm shadow-md shadow-emerald-500/20 transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmar Pagamento Realizado</span>
              </button>

              <button
                onClick={() => setPixModalApplicant(null)}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                Cancelar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
