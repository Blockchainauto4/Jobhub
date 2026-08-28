import React, { useState } from 'react';
import { 
  Briefcase, 
  Plus, 
  Search, 
  Filter, 
  Copy, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Users, 
  DollarSign, 
  MapPin, 
  Sparkles, 
  Share2, 
  Check, 
  AlertCircle,
  Zap,
  RotateCcw,
  X,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { FreelanceJob, SystemAdmin, JobSector, BrazilState } from '../types';
import { formatCurrency, createWhatsAppLink } from '../utils/formatters';

interface AdminJobsManagerProps {
  jobs: FreelanceJob[];
  currentAdmin: SystemAdmin | null;
  onOpenCreateJob: () => void;
  onRefreshJobs: () => void;
  onSelectJobForCandidates: (jobId: string) => void;
}

const CATEGORIES: (JobSector | 'Todas')[] = [
  'Todas',
  'Eventos & Festas',
  'Bares & Restaurantes',
  'Logística & Cargas',
  'Finanças & Caixa de Eventos',
  'Limpeza & Facilities',
  'Limpeza & Serviços',
  'Hotelaria & Recepção',
  'Audiovisual & Montagem',
  'Segurança & Apoio',
  'Outros'
];

export const AdminJobsManager: React.FC<AdminJobsManagerProps> = ({
  jobs,
  currentAdmin,
  onOpenCreateJob,
  onRefreshJobs,
  onSelectJobForCandidates
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [copiedJobId, setCopiedJobId] = useState<string | null>(null);
  const [editingJob, setEditingJob] = useState<FreelanceJob | null>(null);
  const [deletingJobId, setDeletingJobId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Filter jobs
  const filteredJobs = jobs.filter(job => {
    if (selectedCategory !== 'Todas' && job.category !== selectedCategory) return false;
    if (selectedStatus !== 'all' && job.status !== selectedStatus) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchRole = job.role.toLowerCase().includes(q);
      const matchTitle = job.title.toLowerCase().includes(q);
      const matchCity = job.city?.toLowerCase().includes(q);
      const matchNeigh = job.neighborhood?.toLowerCase().includes(q);
      return matchRole || matchTitle || matchCity || matchNeigh;
    }
    return true;
  });

  const showNotification = (msg: string) => {
    setActionSuccessMessage(msg);
    setTimeout(() => setActionSuccessMessage(null), 4000);
  };

  // Fast Job Status update
  const handleUpdateStatus = async (jobId: string, newStatus: FreelanceJob['status']) => {
    try {
      const res = await fetch(`/api/admin/jobs/${jobId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          requesterAdmin: currentAdmin ? { id: currentAdmin.id, name: currentAdmin.name } : undefined
        })
      });

      if (!res.ok) throw new Error('Falha ao atualizar status da vaga');
      showNotification(`Status da vaga atualizado para "${newStatus.toUpperCase()}" com sucesso!`);
      onRefreshJobs();
    } catch (err: any) {
      alert(err.message || 'Erro ao alterar status');
    }
  };

  // Clone Job
  const handleCloneJob = async (job: FreelanceJob) => {
    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/admin/jobs/clone/${job.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requesterAdmin: currentAdmin ? { id: currentAdmin.id, name: currentAdmin.name } : undefined
        })
      });

      if (!res.ok) throw new Error('Falha ao clonar vaga');
      showNotification(`Vaga "${job.role}" duplicada com sucesso para novo turno!`);
      onRefreshJobs();
    } catch (err: any) {
      alert(err.message || 'Erro ao duplicar vaga');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Job
  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Tem certeza de que deseja excluir esta vaga? Esta ação é irreversível.')) return;
    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Falha ao excluir vaga');
      setDeletingJobId(null);
      showNotification('Vaga excluída do sistema com sucesso!');
      onRefreshJobs();
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir vaga');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Save Edited Job
  const handleSaveEditedJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/jobs/${editingJob.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingJob)
      });

      if (!res.ok) throw new Error('Falha ao atualizar dados da vaga');
      setEditingJob(null);
      showNotification(`Vaga "${editingJob.role}" editada com sucesso!`);
      onRefreshJobs();
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar alterações na vaga');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Copy WhatsApp Broadcast Text
  const handleCopyWhatsApp = (job: FreelanceJob) => {
    const text = `🔥 *OPORTUNIDADE FREELAHUB - ${job.role.toUpperCase()}* 🔥

📍 *Local:* ${job.locationName || job.locationAddress} (${job.neighborhood || ''}, ${job.city || 'São Paulo - SP'})
📅 *Data:* ${job.date} | ⏰ *Horário:* ${job.startTime} às ${job.endTime}
💰 *Cachê Líquido:* R$ ${job.cachet.toFixed(2)} (${job.paymentDetails || 'PIX na hora'})
👥 *Vagas Disponíveis:* ${job.slotsAvailable} de ${job.slotsTotal}

👕 *Vestimenta:* ${job.dressCode}
${job.genderRequirement ? `⚠️ *Requisito:* Apenas ${job.genderRequirement.toUpperCase()}\n` : ''}🎁 *Benefícios:* ${job.benefits || 'Alimentação inclusa'}

📲 *Candidate-se agora pelo FreelaHub:*
https://freelahub.app/vagas/${job.id}

Coordenação: ${job.contactName || 'FreelaHub Operações'} (${job.contactPhone})`;

    navigator.clipboard.writeText(text);
    setCopiedJobId(job.id);
    setTimeout(() => setCopiedJobId(null), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Notification */}
      {actionSuccessMessage && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 flex items-center justify-between shadow-lg shadow-emerald-950/40 animate-fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-sm font-medium">{actionSuccessMessage}</span>
          </div>
          <button onClick={() => setActionSuccessMessage(null)} className="text-emerald-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">Postagem & Gestão de Vagas</h2>
              <p className="text-xs text-slate-400">
                Gerencie postagens, edite cachês, duplique turnos e controle o preenchimento de vagas.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenCreateJob}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Publicar Nova Vaga</span>
          </button>
          <button
            onClick={onRefreshJobs}
            title="Atualizar listagem de vagas"
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-900/50 p-4 rounded-2xl border border-slate-800/80">
        
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por função, local..."
            className="w-full pl-9.5 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"
          />
        </div>

        {/* Category */}
        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"
          >
            <option value="all">Todos os Status</option>
            <option value="open">🟢 Vagas Abertas</option>
            <option value="in_progress">⚡ Em Andamento</option>
            <option value="filled">🔒 Lotadas / Preenchidas</option>
            <option value="completed">✅ Concluídas</option>
            <option value="cancelled">❌ Canceladas</option>
          </select>
        </div>

        {/* Stats Pill */}
        <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-400">
          <span>Encontradas:</span>
          <span className="font-bold text-emerald-400">{filteredJobs.length} de {jobs.length} vagas</span>
        </div>
      </div>

      {/* Jobs Grid / List */}
      <div className="space-y-4">
        {filteredJobs.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/40 rounded-3xl border border-slate-800 p-8">
            <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-200">Nenhuma vaga encontrada com estes filtros</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Experimente alterar os termos de busca ou utilize o botão "+ Publicar Nova Vaga" acima.
            </p>
          </div>
        ) : (
          filteredJobs.map((job) => {
            const applicantsCount = job.applicants?.length || 0;
            const acceptedCount = job.applicants?.filter(a => a.status === 'accepted' || a.status === 'checked_in' || a.status === 'paid').length || 0;
            const isFull = job.slotsAvailable === 0 || acceptedCount >= job.slotsTotal;

            return (
              <div 
                key={job.id} 
                className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl sm:rounded-3xl p-4 sm:p-5 transition shadow-lg space-y-4"
              >
                
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3.5">
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                      job.status === 'open' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      job.status === 'filled' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      job.status === 'in_progress' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                      job.status === 'completed' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                      'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}>
                      {job.status === 'open' ? 'Aberta' :
                       job.status === 'filled' ? 'Lotada' :
                       job.status === 'in_progress' ? 'Em Operação' :
                       job.status === 'completed' ? 'Concluída' : 'Cancelada'}
                    </span>

                    {job.isUrgent && (
                      <span className="px-2 py-0.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[11px] font-bold flex items-center gap-1">
                        <Zap className="w-3 h-3" /> Urgente
                      </span>
                    )}

                    <span className="text-xs text-slate-400 font-medium">
                      {job.category}
                    </span>
                  </div>

                  {/* Cachet & Dates */}
                  <div className="flex items-center gap-3">
                    <span className="text-base sm:text-lg font-black text-emerald-400">
                      {formatCurrency(job.cachet)}
                    </span>
                    <span className="text-xs text-slate-400">
                      {job.paymentDetails || 'PIX na hora'}
                    </span>
                  </div>
                </div>

                {/* Job Title & Main Info */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  <div className="lg:col-span-8 space-y-2">
                    <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      <span>{job.role}</span>
                      {job.genderRequirement && job.genderRequirement !== 'todos' && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-amber-300 border border-amber-500/30">
                          {job.genderRequirement.toUpperCase()}
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-300 line-clamp-1">{job.title}</p>
                    
                    <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-slate-400 pt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        {job.date} • {job.startTime} às {job.endTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        {job.locationName || job.locationAddress} ({job.neighborhood}, {job.city})
                      </span>
                    </div>
                  </div>

                  {/* Slots & Candidates Progress */}
                  <div className="lg:col-span-4 flex flex-col justify-center bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Preenchimento:</span>
                      <span className="font-bold text-white">
                        {acceptedCount} / {job.slotsTotal} vagas ocupadas
                      </span>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${isFull ? 'bg-amber-400' : 'bg-emerald-400'}`}
                        style={{ width: `${Math.min(100, (acceptedCount / job.slotsTotal) * 100)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <button
                        onClick={() => onSelectJobForCandidates(job.id)}
                        className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 transition text-[11px]"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>Ver {applicantsCount} Candidatos</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                      <span className="text-slate-500 text-[11px]">
                        {job.slotsAvailable} disponíveis
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800/60">
                  
                  {/* Status Toggle Buttons */}
                  <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar py-1">
                    <span className="text-[11px] text-slate-500 font-medium mr-1">Status:</span>
                    <button
                      onClick={() => handleUpdateStatus(job.id, 'open')}
                      className={`text-xs px-2.5 py-1 rounded-lg font-medium transition ${
                        job.status === 'open' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      Aberta
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(job.id, 'in_progress')}
                      className={`text-xs px-2.5 py-1 rounded-lg font-medium transition ${
                        job.status === 'in_progress' ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      Em Andamento
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(job.id, 'filled')}
                      className={`text-xs px-2.5 py-1 rounded-lg font-medium transition ${
                        job.status === 'filled' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      Lotada
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(job.id, 'completed')}
                      className={`text-xs px-2.5 py-1 rounded-lg font-medium transition ${
                        job.status === 'completed' ? 'bg-blue-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      Concluída
                    </button>
                  </div>

                  {/* Operation Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyWhatsApp(job)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition border border-slate-700/60"
                      title="Copiar texto formatado para grupos de WhatsApp"
                    >
                      {copiedJobId === job.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400 font-bold">Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Texto WhatsApp</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleCloneJob(job)}
                      disabled={isSubmitting}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition border border-slate-700/60"
                      title="Duplicar vaga para novo dia ou turno"
                    >
                      <Copy className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Duplicar</span>
                    </button>

                    <button
                      onClick={() => setEditingJob(job)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition border border-slate-700/60"
                      title="Editar detalhes da vaga"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                      <span>Editar</span>
                    </button>

                    <button
                      onClick={() => handleDeleteJob(job.id)}
                      disabled={isSubmitting}
                      className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition border border-slate-700/60"
                      title="Excluir vaga"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Edit Job Modal */}
      {editingJob && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-sm p-3 sm:p-5 flex justify-center items-center">
          <div className="relative w-full max-w-2xl max-h-[92dvh] my-auto overflow-y-auto min-h-0 custom-scrollbar rounded-2xl sm:rounded-3xl bg-slate-900 border border-emerald-500/40 shadow-2xl p-5 sm:p-7 text-slate-100">
            
            <button
              onClick={() => setEditingJob(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
                <Edit3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Editar Dados da Vaga</h3>
                <p className="text-xs text-slate-400">Altere cachê, horários, vestimenta e quantidade de vagas.</p>
              </div>
            </div>

            <form onSubmit={handleSaveEditedJob} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Função / Cargo</label>
                  <input
                    type="text"
                    value={editingJob.role}
                    onChange={(e) => setEditingJob({ ...editingJob, role: e.target.value })}
                    required
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Setor / Categoria</label>
                  <select
                    value={editingJob.category}
                    onChange={(e) => setEditingJob({ ...editingJob, category: e.target.value as JobSector })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none"
                  >
                    {CATEGORIES.filter(c => c !== 'Todas').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Cachê Líquido (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingJob.cachet}
                    onChange={(e) => setEditingJob({ ...editingJob, cachet: parseFloat(e.target.value) || 0 })}
                    required
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 font-bold text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Total de Vagas</label>
                  <input
                    type="number"
                    min="1"
                    value={editingJob.slotsTotal}
                    onChange={(e) => {
                      const total = parseInt(e.target.value) || 1;
                      const accepted = editingJob.applicants?.filter(a => a.status === 'accepted').length || 0;
                      setEditingJob({ 
                        ...editingJob, 
                        slotsTotal: total,
                        slotsAvailable: Math.max(0, total - accepted)
                      });
                    }}
                    required
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Data de Atuação</label>
                  <input
                    type="text"
                    value={editingJob.date}
                    onChange={(e) => setEditingJob({ ...editingJob, date: e.target.value })}
                    required
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Horário de Início</label>
                  <input
                    type="text"
                    value={editingJob.startTime}
                    onChange={(e) => setEditingJob({ ...editingJob, startTime: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Horário de Término</label>
                  <input
                    type="text"
                    value={editingJob.endTime}
                    onChange={(e) => setEditingJob({ ...editingJob, endTime: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Endereço Completo</label>
                <input
                  type="text"
                  value={editingJob.locationAddress}
                  onChange={(e) => setEditingJob({ ...editingJob, locationAddress: e.target.value })}
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Vestimenta Obrigatória</label>
                <textarea
                  rows={2}
                  value={editingJob.dressCode}
                  onChange={(e) => setEditingJob({ ...editingJob, dressCode: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingJob(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-bold shadow-lg shadow-emerald-500/20 transition cursor-pointer"
                >
                  {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
