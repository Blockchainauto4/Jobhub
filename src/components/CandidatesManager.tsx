import React, { useState } from 'react';
import { 
  Users, 
  CheckCircle2, 
  XCircle, 
  Phone, 
  DollarSign, 
  Clock, 
  Search, 
  Check, 
  Copy, 
  Sparkles,
  Tag,
  Award,
  MapPin,
  X
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
      const skillsMatch = applicant.skills?.some(s => s.toLowerCase().includes(q));
      return (
        applicant.name.toLowerCase().includes(q) ||
        applicant.whatsapp.toLowerCase().includes(q) ||
        applicant.pixKey.toLowerCase().includes(q) ||
        job.role.toLowerCase().includes(q) ||
        job.title.toLowerCase().includes(q) ||
        Boolean(skillsMatch)
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
📍 *Local:* ${candidate.job.locationAddress} (${candidate.job.neighborhood || ''}, ${candidate.job.city || ''} - ${candidate.job.state || 'SP'})
👔 *Vestimenta:* ${candidate.job.dressCode}

🗺️ *Traçar Rota no Maps:*
${candidate.job.googleMapsUrl}

Por favor, responda com *"CONFIRMADO"* para garantirmos sua presença!`;

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
              <span>Painel de Produtores & Gestão de Talentos</span>
            </div>
            <h2 className="text-2xl font-black text-white">
              Gestão de Candidatos & Triagem
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Aprove inscrições, confira qualificações e cursos específicos e realize pagamentos via PIX no encerramento do evento.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-xl font-black text-emerald-400">{allCandidates.length}</div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Inscritos</div>
            </div>
            <div className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-xl font-black text-cyan-400">
                {allCandidates.filter(c => c.applicant.status === 'accepted' || c.applicant.status === 'checked_in').length}
              </div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Escalados</div>
            </div>
            <div className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-xl font-black text-purple-400">
                {allCandidates.filter(c => c.applicant.status === 'paid').length}
              </div>
              <div className="text-[10px] uppercase font-bold text-slate-400">PIX Pago</div>
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
                  {j.role} - {j.neighborhood || j.city} ({j.applicants?.length || 0} inscritos)
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
              <option value="checked_in">🔵 Presença Confirmada</option>
              <option value="paid">💰 PIX Pago</option>
              <option value="rejected">🔴 Recusado</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Buscar por Nome / Habilidade:</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Ex: Carlos, Coquetelaria, Bandeja, PIX..."
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

            const applicantLocation = `${applicant.neighborhood ? `${applicant.neighborhood}, ` : ''}${applicant.city || 'São Paulo'} - ${applicant.state || 'SP'}`;

            return (
              <div 
                key={applicant.id}
                className="rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 p-5 space-y-4 shadow-lg"
              >
                {/* Card Top */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-bold text-white">{applicant.name}</h3>
                      
                      {/* Locality badge: Bairro, Cidade - UF */}
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-950 text-slate-300 border border-slate-700">
                        <MapPin className="w-3 h-3 text-cyan-400" />
                        <span>{applicantLocation}</span>
                      </span>

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

                {/* Candidate Skills Tags */}
                {applicant.skills && applicant.skills.length > 0 && (
                  <div>
                    <div className="text-[11px] font-bold text-slate-400 mb-1 flex items-center gap-1">
                      <Tag className="w-3 h-3 text-emerald-400" />
                      <span>Habilidades Comprovadas:</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {applicant.skills.map((skill, idx) => (
                        <span key={idx} className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Candidate Certifications & Compliance */}
                {applicant.certifications && applicant.certifications.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-500/30">
                    <div className="text-[11px] font-bold text-amber-300 mb-1.5 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-amber-400" />
                      <span>Cursos & Certificações do Candidato:</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {applicant.certifications.map((cert, idx) => {
                        const isRequiredByJob = job.requiredCertifications?.includes(cert);
                        return (
                          <span
                            key={idx}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${
                              isRequiredByJob
                                ? 'bg-emerald-500/30 text-emerald-300 border-emerald-500/50'
                                : 'bg-slate-950 text-amber-200 border-amber-500/30'
                            }`}
                          >
                            <span>{isRequiredByJob ? '✓' : '📜'}</span>
                            <span>{cert}</span>
                            {isRequiredByJob && <span className="text-[9px] text-emerald-400 font-extrabold">(Exigido)</span>}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

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
                        className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition shadow-sm"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-emerald-500/40 shadow-2xl p-6 text-slate-100">
            <button
              onClick={() => setPixModalApplicant(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2 mb-5">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500 flex items-center justify-center mx-auto">
                <DollarSign className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-white">Transferência PIX</h3>
              <p className="text-xs text-slate-400">
                Pague o cachê de {formatCurrency(pixModalApplicant.job.cachet)} para {pixModalApplicant.applicant.name}
              </p>
            </div>

            <div className="space-y-3 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Favorecido:</span>
                <span className="font-bold text-white">{pixModalApplicant.applicant.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tipo de Chave:</span>
                <span className="uppercase text-slate-300 font-bold">{pixModalApplicant.applicant.pixType}</span>
              </div>
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
                <span className="text-slate-400">Chave PIX:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-emerald-400 font-bold">{pixModalApplicant.applicant.pixKey}</span>
                  <button
                    onClick={() => handleCopyPix(pixModalApplicant.applicant.pixKey)}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px]"
                    title="Copiar PIX"
                  >
                    {pixCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setPixModalApplicant(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmPixPayment}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-green-500 text-slate-950 font-black text-xs hover:from-emerald-300 hover:to-green-400 shadow-md shadow-emerald-500/20"
              >
                Confirmar PIX Pago
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
