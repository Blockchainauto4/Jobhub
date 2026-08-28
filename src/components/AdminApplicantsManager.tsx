import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  DollarSign, 
  Phone, 
  Copy, 
  Check, 
  ExternalLink, 
  Share2, 
  Award, 
  MapPin, 
  Sparkles, 
  Download, 
  ShieldCheck, 
  Edit3, 
  X,
  FileSpreadsheet
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { FreelanceJob, JobApplicant, SystemAdmin } from '../types';
import { formatCurrency, createWhatsAppLink } from '../utils/formatters';

interface AdminApplicantsManagerProps {
  jobs: FreelanceJob[];
  currentAdmin: SystemAdmin | null;
  selectedJobId?: string;
  onRefreshJobs: () => void;
}

export const AdminApplicantsManager: React.FC<AdminApplicantsManagerProps> = ({
  jobs,
  currentAdmin,
  selectedJobId,
  onRefreshJobs
}) => {
  const [filterJobId, setFilterJobId] = useState<string>(selectedJobId || 'all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [copiedPixId, setCopiedPixId] = useState<string | null>(null);
  const [pixModalApplicant, setPixModalApplicant] = useState<{ applicant: JobApplicant; job: FreelanceJob } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [notesModalApplicant, setNotesModalApplicant] = useState<{ applicant: JobApplicant; job: FreelanceJob } | null>(null);
  const [candidateNotes, setCandidateNotes] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Flatten candidates with job reference
  const allCandidates: { applicant: JobApplicant; job: FreelanceJob }[] = [];
  jobs.forEach(job => {
    if (job.applicants) {
      job.applicants.forEach(app => {
        allCandidates.push({ applicant: app, job });
      });
    }
  });

  // Filter candidates
  const filteredCandidates = allCandidates.filter(({ applicant, job }) => {
    if (filterJobId !== 'all' && job.id !== filterJobId) return false;
    if (statusFilter !== 'all' && applicant.status !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchName = applicant.name.toLowerCase().includes(q);
      const matchPhone = applicant.whatsapp.toLowerCase().includes(q);
      const matchPix = applicant.pixKey.toLowerCase().includes(q);
      const matchSkills = applicant.skills?.some(s => s.toLowerCase().includes(q));
      const matchRole = job.role.toLowerCase().includes(q);
      return matchName || matchPhone || matchPix || matchSkills || matchRole;
    }
    return true;
  });

  // Update Status
  const handleUpdateStatus = async (
    jobId: string, 
    applicantId: string, 
    status: JobApplicant['status'], 
    notes?: string, 
    paidAmount?: number
  ) => {
    try {
      setIsProcessing(true);
      const res = await fetch(`/api/jobs/${jobId}/applicants/${applicantId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          notes,
          paidAmount,
          requesterAdmin: currentAdmin ? { id: currentAdmin.id, name: currentAdmin.name } : undefined
        })
      });

      if (!res.ok) throw new Error('Falha ao atualizar status do candidato');

      if (status === 'paid') {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
        showToast('Pagamento PIX registrado e comprovante validado!');
      } else if (status === 'accepted') {
        showToast('Candidato aprovado para a vaga com sucesso!');
      } else if (status === 'checked_in') {
        showToast('Presença / Check-in confirmado no local!');
      } else {
        showToast(`Status do candidato alterado para "${status}".`);
      }

      onRefreshJobs();
    } catch (err: any) {
      alert(err.message || 'Erro ao processar alteração');
    } finally {
      setIsProcessing(false);
      setPixModalApplicant(null);
      setNotesModalApplicant(null);
    }
  };

  const copyPixKey = (key: string, id: string) => {
    navigator.clipboard.writeText(key);
    setCopiedPixId(id);
    setTimeout(() => setCopiedPixId(null), 3000);
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Nome', 'Vaga', 'Setor', 'WhatsApp', 'Chave PIX', 'Tipo PIX', 'Cachê', 'Status', 'Cidade/UF', 'Data Candidatura'];
    const rows = filteredCandidates.map(({ applicant, job }) => [
      `"${applicant.name}"`,
      `"${job.role}"`,
      `"${job.category}"`,
      `"${applicant.whatsapp}"`,
      `"${applicant.pixKey}"`,
      `"${applicant.pixType}"`,
      `"${job.cachet.toFixed(2)}"`,
      `"${applicant.status}"`,
      `"${applicant.city || job.city} - ${applicant.state || job.state}"`,
      `"${applicant.appliedAt}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `freelahub_candidatos_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Planilha CSV de candidatos exportada com sucesso!');
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 flex items-center justify-between shadow-xl animate-fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-sm font-medium">{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Control Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white">Triagem & Gestão de Candidatos</h2>
            <p className="text-xs text-slate-400">
              Aprovação de candidaturas, confirmação de presença (check-in) e liquidação de pagamentos PIX.
            </p>
          </div>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={filteredCandidates.length === 0}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs sm:text-sm border border-slate-700 transition"
          title="Exportar candidatos filtrados para planilha CSV"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <span>Exportar Planilha CSV</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-900/50 p-4 rounded-2xl border border-slate-800/80">
        
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por candidato, chave PIX..."
            className="w-full pl-9.5 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"
          />
        </div>

        {/* Job selector */}
        <div>
          <select
            value={filterJobId}
            onChange={(e) => setFilterJobId(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"
          >
            <option value="all">Todas as Vagas ({jobs.length})</option>
            {jobs.map(j => (
              <option key={j.id} value={j.id}>
                {j.role} - {j.city} ({j.applicants?.length || 0} inscritos)
              </option>
            ))}
          </select>
        </div>

        {/* Status selector */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"
          >
            <option value="all">Todos os Status</option>
            <option value="pending">⏳ Pendentes de Análise</option>
            <option value="accepted">🟢 Aprovados / Escalados</option>
            <option value="checked_in">📍 Check-in no Local</option>
            <option value="paid">💰 Pagos via PIX</option>
            <option value="rejected">❌ Recusados</option>
          </select>
        </div>

        {/* Counter Summary */}
        <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-400">
          <span>Inscrições:</span>
          <span className="font-bold text-emerald-400">{filteredCandidates.length} candidatos</span>
        </div>

      </div>

      {/* Candidates List */}
      <div className="space-y-4">
        {filteredCandidates.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/40 rounded-3xl border border-slate-800 p-8">
            <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-200">Nenhum candidato encontrado</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Ajuste os filtros de status ou selecione outra vaga para visualizar os candidatos inscritos.
            </p>
          </div>
        ) : (
          filteredCandidates.map(({ applicant, job }) => {
            const isAccepted = applicant.status === 'accepted';
            const isCheckedIn = applicant.status === 'checked_in';
            const isPaid = applicant.status === 'paid';
            const isRejected = applicant.status === 'rejected';

            // WhatsApp link with tailored message
            const waMessage = `Olá ${applicant.name}! Aqui é ${currentAdmin?.name || 'da Coordenação FreelaHub'}.\n\nReferente à sua inscrição para a vaga: *${job.role}* (${job.date})\nCachê: R$ ${job.cachet.toFixed(2)} - Local: ${job.locationName || job.locationAddress}.\n\nPodemos confirmar sua escala?`;
            const waLink = createWhatsAppLink(applicant.whatsapp, waMessage);

            return (
              <div 
                key={`${job.id}-${applicant.id}`} 
                className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl sm:rounded-3xl p-4 sm:p-5 transition shadow-lg space-y-4"
              >
                
                {/* Top Row: Candidate Status & Job Tag */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 border-b border-slate-800/80 pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                      isPaid ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      isCheckedIn ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                      isAccepted ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' :
                      isRejected ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                      'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {isPaid ? '💰 Pago via PIX' :
                       isCheckedIn ? '📍 Check-in Realizado' :
                       isAccepted ? '🟢 Aprovado / Escalado' :
                       isRejected ? '❌ Recusado' : '⏳ Pendente de Análise'}
                    </span>

                    <span className="text-xs text-slate-300 font-semibold px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700/60">
                      Vaga: {job.role}
                    </span>

                    <span className="text-xs text-slate-500">
                      Inscrito em: {new Date(applicant.appliedAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Cachê Previsto:</span>
                    <span className="text-sm font-bold text-emerald-400">{formatCurrency(job.cachet)}</span>
                  </div>
                </div>

                {/* Main Candidate Info */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  
                  {/* Left info */}
                  <div className="md:col-span-7 space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-white">{applicant.name}</h4>
                      {applicant.rating && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          ★ {applicant.rating.toFixed(1)} ({applicant.completedJobsCount || 1} freelas)
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-300 italic bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                      "{applicant.experienceSummary || 'Disponibilidade total e compromisso com o evento.'}"
                    </p>

                    {/* Skills & Certifications */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {applicant.skills?.map((s, idx) => (
                        <span key={idx} className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                          {s}
                        </span>
                      ))}
                      {applicant.certifications?.map((c, idx) => (
                        <span key={idx} className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                          <Award className="w-3 h-3 text-emerald-400" />
                          {c}
                        </span>
                      ))}
                    </div>

                    {applicant.notes && (
                      <div className="text-[11px] text-amber-300 bg-amber-950/30 p-2 rounded-lg border border-amber-500/20">
                        <span className="font-bold">Nota Interna:</span> {applicant.notes}
                      </div>
                    )}
                  </div>

                  {/* Right: Contact & PIX details */}
                  <div className="md:col-span-5 bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/80 space-y-2.5 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      
                      {/* WhatsApp */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-emerald-400" />
                          WhatsApp:
                        </span>
                        <a 
                          href={waLink} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-emerald-400 hover:text-emerald-300 font-bold hover:underline flex items-center gap-1"
                        >
                          <span>{applicant.whatsapp}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      {/* PIX Key */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <DollarSign className="w-3.5 h-3.5 text-cyan-400" />
                          Chave PIX ({applicant.pixType}):
                        </span>
                        <button
                          onClick={() => copyPixKey(applicant.pixKey, applicant.id)}
                          className="text-cyan-400 hover:text-cyan-300 font-mono text-[11px] flex items-center gap-1 hover:underline cursor-pointer"
                        >
                          <span>{applicant.pixKey}</span>
                          {copiedPixId === applicant.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>

                      {/* Location */}
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          Região:
                        </span>
                        <span className="text-slate-200">
                          {applicant.neighborhood || job.neighborhood}, {applicant.city || job.city} - {applicant.state || job.state}
                        </span>
                      </div>

                    </div>

                    {/* Quick WhatsApp Action Button */}
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Falar no WhatsApp com Mensagem Pronta</span>
                    </a>
                  </div>

                </div>

                {/* Bottom Actions Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800/60">
                  
                  {/* Status update actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    
                    {!isAccepted && !isCheckedIn && !isPaid && (
                      <button
                        onClick={() => handleUpdateStatus(job.id, applicant.id, 'accepted')}
                        disabled={isProcessing}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20 transition cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Aprovar Candidato</span>
                      </button>
                    )}

                    {isAccepted && !isCheckedIn && !isPaid && (
                      <button
                        onClick={() => handleUpdateStatus(job.id, applicant.id, 'checked_in')}
                        disabled={isProcessing}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition cursor-pointer"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Confirmar Check-in</span>
                      </button>
                    )}

                    {!isPaid && (
                      <button
                        onClick={() => setPixModalApplicant({ applicant, job })}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20 transition cursor-pointer"
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>Pagar via PIX (R$ {job.cachet.toFixed(2)})</span>
                      </button>
                    )}

                    {!isRejected && !isPaid && (
                      <button
                        onClick={() => handleUpdateStatus(job.id, applicant.id, 'rejected')}
                        disabled={isProcessing}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 text-xs font-medium border border-slate-700/60 transition"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Recusar</span>
                      </button>
                    )}

                  </div>

                  {/* Internal Notes button */}
                  <button
                    onClick={() => {
                      setNotesModalApplicant({ applicant, job });
                      setCandidateNotes(applicant.notes || '');
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition border border-slate-700/60"
                  >
                    <Edit3 className="w-3 h-3 text-amber-400" />
                    <span>{applicant.notes ? 'Editar Nota' : '+ Adicionar Nota Interna'}</span>
                  </button>

                </div>

              </div>
            );
          })
        )}
      </div>

      {/* PIX Payment Modal */}
      {pixModalApplicant && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-sm p-3 sm:p-5 flex justify-center items-center">
          <div className="relative w-full max-w-md max-h-[92dvh] my-auto overflow-y-auto min-h-0 custom-scrollbar rounded-2xl sm:rounded-3xl bg-slate-900 border border-emerald-500/40 shadow-2xl p-5 sm:p-7 text-slate-100">
            
            <button
              onClick={() => setPixModalApplicant(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Liquidação de PIX</h3>
                <p className="text-xs text-slate-400">Transferência bancária instantânea para o freelancer.</p>
              </div>
            </div>

            <div className="space-y-4 bg-slate-950/80 p-4 rounded-2xl border border-slate-800 mb-5">
              
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Beneficiário:</span>
                <span className="font-bold text-white">{pixModalApplicant.applicant.name}</span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Vaga / Turno:</span>
                <span className="font-medium text-slate-300">{pixModalApplicant.job.role}</span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Tipo de Chave:</span>
                <span className="uppercase text-slate-300 font-bold">{pixModalApplicant.applicant.pixType}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] text-slate-500 block">Chave PIX Cadastrada:</span>
                  <span className="font-mono text-xs font-bold text-cyan-400 select-all">
                    {pixModalApplicant.applicant.pixKey}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => copyPixKey(pixModalApplicant.applicant.pixKey, 'modal')}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 flex items-center gap-1 border border-slate-700"
                >
                  {copiedPixId === 'modal' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPixId === 'modal' ? 'Copiada!' : 'Copiar'}</span>
                </button>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-300">Valor a Transferir:</span>
                <span className="text-xl font-extrabold text-emerald-400">
                  {formatCurrency(pixModalApplicant.job.cachet)}
                </span>
              </div>

            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPixModalApplicant(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleUpdateStatus(
                  pixModalApplicant.job.id, 
                  pixModalApplicant.applicant.id, 
                  'paid', 
                  pixModalApplicant.applicant.notes, 
                  pixModalApplicant.job.cachet
                )}
                disabled={isProcessing}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-bold shadow-lg shadow-emerald-500/20 transition cursor-pointer"
              >
                {isProcessing ? 'Confirmando...' : 'Confirmar Pagamento'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Internal Notes Modal */}
      {notesModalApplicant && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-sm p-3 sm:p-5 flex justify-center items-center">
          <div className="relative w-full max-w-md max-h-[92dvh] my-auto overflow-y-auto min-h-0 custom-scrollbar rounded-2xl sm:rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-5 sm:p-6 text-slate-100">
            
            <button
              onClick={() => setNotesModalApplicant(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-1">Nota Interna de Triagem</h3>
            <p className="text-xs text-slate-400 mb-4">
              Candidato: <span className="text-emerald-400 font-semibold">{notesModalApplicant.applicant.name}</span>
            </p>

            <textarea
              rows={4}
              value={candidateNotes}
              onChange={(e) => setCandidateNotes(e.target.value)}
              placeholder="Ex: Pontual, atendeu prontamente no WhatsApp, confirmou camisa preta."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:border-emerald-500 focus:outline-none mb-4"
            />

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setNotesModalApplicant(null)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleUpdateStatus(
                  notesModalApplicant.job.id, 
                  notesModalApplicant.applicant.id, 
                  notesModalApplicant.applicant.status, 
                  candidateNotes
                )}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition"
              >
                Salvar Nota
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
