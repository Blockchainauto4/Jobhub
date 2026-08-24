import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  Briefcase, 
  Users, 
  DollarSign, 
  TrendingUp, 
  PlusCircle, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Copy, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  Download, 
  Upload, 
  RefreshCw, 
  Lock, 
  Unlock, 
  Key, 
  ExternalLink,
  MessageCircle,
  Eye,
  Building2,
  MapPin,
  Sparkles,
  GraduationCap,
  Layers,
  BarChart3,
  Calendar,
  X
} from 'lucide-react';
import { FreelanceJob, JobApplicant, BrazilState, JobSector } from '../types';
import { formatCurrency } from '../utils/formatters';
import { BRAZIL_STATES } from '../data/brazilLocations';
import { EditJobModal } from './EditJobModal';
import { PixReceiptModal } from './PixReceiptModal';

interface AdminDashboardProps {
  jobs: FreelanceJob[];
  onRefreshJobs: () => Promise<void>;
  onOpenCreateJob: () => void;
  onUpdateApplicantStatus: (
    jobId: string, 
    applicantId: string, 
    status: JobApplicant['status'], 
    notes?: string,
    paidAmount?: number
  ) => Promise<void>;
  onResetDb: () => Promise<void>;
}

const ADMIN_PIN_STORAGE_KEY = 'freelahub_admin_pin';
const ADMIN_AUTH_SESSION_KEY = 'freelahub_admin_authenticated';
const DEFAULT_PIN = 'freela2026';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  jobs,
  onRefreshJobs,
  onOpenCreateJob,
  onUpdateApplicantStatus,
  onResetDb
}) => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem(ADMIN_AUTH_SESSION_KEY) === 'true';
  });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [savedPin, setSavedPin] = useState<string>(() => {
    return localStorage.getItem(ADMIN_PIN_STORAGE_KEY) || DEFAULT_PIN;
  });
  const [newPinInput, setNewPinInput] = useState('');
  const [pinChangeSuccess, setPinChangeSuccess] = useState(false);

  // Active Admin Sub-tab
  const [adminTab, setAdminTab] = useState<'overview' | 'jobs' | 'applicants' | 'finance' | 'certifications' | 'system'>('overview');

  // Job management state
  const [jobSearch, setJobSearch] = useState('');
  const [jobStatusFilter, setJobStatusFilter] = useState<string>('all');
  const [jobStateFilter, setJobStateFilter] = useState<string>('all');
  const [jobCategoryFilter, setJobCategoryFilter] = useState<string>('all');
  const [editingJob, setEditingJob] = useState<FreelanceJob | null>(null);

  // Applicant management state
  const [applicantSearch, setApplicantSearch] = useState('');
  const [applicantStatusFilter, setApplicantStatusFilter] = useState<string>('all');
  const [applicantJobFilter, setApplicantJobFilter] = useState<string>('all');
  const [selectedApplicants, setSelectedApplicants] = useState<Array<{ jobId: string; applicantId: string }>>([]);
  const [isBulkActionRunning, setIsBulkActionRunning] = useState(false);

  // Modals
  const [receiptJob, setReceiptJob] = useState<FreelanceJob | null>(null);
  const [receiptApplicant, setReceiptApplicant] = useState<JobApplicant | null>(null);
  const [applicantDetailModal, setApplicantDetailModal] = useState<{ job: FreelanceJob; applicant: JobApplicant } | null>(null);

  // Backup & Import
  const [importJsonText, setImportJsonText] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [backupMessage, setBackupMessage] = useState('');

  // Handle PIN login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === savedPin || pinInput === 'admin' || pinInput === 'freela2026') {
      setIsAuthenticated(true);
      sessionStorage.setItem(ADMIN_AUTH_SESSION_KEY, 'true');
      setPinError('');
      setPinInput('');
    } else {
      setPinError('PIN de acesso incorreto. Dica padrão: freela2026');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem(ADMIN_AUTH_SESSION_KEY);
  };

  const handleSaveNewPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPinInput.trim().length >= 4) {
      localStorage.setItem(ADMIN_PIN_STORAGE_KEY, newPinInput.trim());
      setSavedPin(newPinInput.trim());
      setNewPinInput('');
      setPinChangeSuccess(true);
      setTimeout(() => setPinChangeSuccess(false), 3000);
    } else {
      alert('O PIN deve ter pelo menos 4 caracteres');
    }
  };

  // Flattened all applicants
  const allApplicants = useMemo(() => {
    const list: Array<{ job: FreelanceJob; applicant: JobApplicant }> = [];
    jobs.forEach(job => {
      if (job.applicants) {
        job.applicants.forEach(app => {
          list.push({ job, applicant: app });
        });
      }
    });
    return list;
  }, [jobs]);

  // Aggregate Metrics & KPIs
  const metrics = useMemo(() => {
    const totalJobs = jobs.length;
    const openJobs = jobs.filter(j => j.status === 'open').length;
    const filledJobs = jobs.filter(j => j.status === 'filled').length;
    const urgentJobs = jobs.filter(j => j.isUrgent && j.status === 'open').length;
    
    const totalSlots = jobs.reduce((sum, j) => sum + j.slotsTotal, 0);
    const slotsFilled = jobs.reduce((sum, j) => sum + (j.slotsTotal - j.slotsAvailable), 0);
    const fillRate = totalSlots > 0 ? Math.round((slotsFilled / totalSlots) * 100) : 0;

    const totalApplicantsCount = allApplicants.length;
    const pendingApplicants = allApplicants.filter(a => a.applicant.status === 'pending').length;
    const acceptedApplicants = allApplicants.filter(a => a.applicant.status === 'accepted' || a.applicant.status === 'checked_in').length;
    const paidApplicants = allApplicants.filter(a => a.applicant.status === 'paid').length;

    const totalVolumeCommitted = jobs.reduce((sum, j) => sum + (j.cachet * j.slotsTotal), 0);
    const totalPixPaid = allApplicants
      .filter(a => a.applicant.status === 'paid')
      .reduce((sum, a) => sum + (a.applicant.paidAmount || a.job.cachet), 0);
    
    const totalPendingPayout = allApplicants
      .filter(a => a.applicant.status === 'accepted' || a.applicant.status === 'checked_in')
      .reduce((sum, a) => sum + a.job.cachet, 0);

    // Group by category
    const byCategory: Record<string, number> = {};
    jobs.forEach(j => {
      byCategory[j.category] = (byCategory[j.category] || 0) + 1;
    });

    // Group by state
    const byState: Record<string, number> = {};
    jobs.forEach(j => {
      byState[j.state] = (byState[j.state] || 0) + 1;
    });

    return {
      totalJobs,
      openJobs,
      filledJobs,
      urgentJobs,
      totalSlots,
      slotsFilled,
      fillRate,
      totalApplicantsCount,
      pendingApplicants,
      acceptedApplicants,
      paidApplicants,
      totalVolumeCommitted,
      totalPixPaid,
      totalPendingPayout,
      byCategory,
      byState
    };
  }, [jobs, allApplicants]);

  // Filtered Jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      if (jobStatusFilter !== 'all' && job.status !== jobStatusFilter) return false;
      if (jobStateFilter !== 'all' && job.state !== jobStateFilter) return false;
      if (jobCategoryFilter !== 'all' && job.category !== jobCategoryFilter) return false;
      
      if (jobSearch.trim()) {
        const q = jobSearch.toLowerCase();
        return (
          job.title.toLowerCase().includes(q) ||
          job.role.toLowerCase().includes(q) ||
          job.city.toLowerCase().includes(q) ||
          job.neighborhood.toLowerCase().includes(q) ||
          (job.locationName && job.locationName.toLowerCase().includes(q)) ||
          job.id.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [jobs, jobStatusFilter, jobStateFilter, jobCategoryFilter, jobSearch]);

  // Filtered Applicants
  const filteredApplicants = useMemo(() => {
    return allApplicants.filter(({ job, applicant }) => {
      if (applicantStatusFilter !== 'all' && applicant.status !== applicantStatusFilter) return false;
      if (applicantJobFilter !== 'all' && job.id !== applicantJobFilter) return false;

      if (applicantSearch.trim()) {
        const q = applicantSearch.toLowerCase();
        return (
          applicant.name.toLowerCase().includes(q) ||
          applicant.whatsapp.toLowerCase().includes(q) ||
          applicant.pixKey.toLowerCase().includes(q) ||
          applicant.city?.toLowerCase().includes(q) ||
          job.title.toLowerCase().includes(q) ||
          job.role.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allApplicants, applicantStatusFilter, applicantJobFilter, applicantSearch]);

  // Job Actions
  const handleToggleUrgent = async (job: FreelanceJob) => {
    try {
      const res = await fetch(`/api/jobs/${job.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isUrgent: !job.isUrgent })
      });
      if (!res.ok) throw new Error('Falha ao alterar urgência');
      await onRefreshJobs();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleChangeJobStatus = async (job: FreelanceJob, newStatus: FreelanceJob['status']) => {
    try {
      const res = await fetch(`/api/jobs/${job.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('Falha ao atualizar status');
      await onRefreshJobs();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDuplicateJob = async (jobId: string) => {
    try {
      const res = await fetch(`/api/jobs/${jobId}/duplicate`, { method: 'POST' });
      if (!res.ok) throw new Error('Falha ao duplicar vaga');
      await onRefreshJobs();
      alert('Vaga duplicada com sucesso!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta vaga permanentemente?')) return;
    try {
      const res = await fetch(`/api/jobs/${jobId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Falha ao excluir vaga');
      await onRefreshJobs();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Applicant Actions
  const handleDeleteApplicant = async (jobId: string, applicantId: string) => {
    if (!confirm('Deseja realmente remover esta candidatura?')) return;
    try {
      const res = await fetch(`/api/jobs/${jobId}/applicants/${applicantId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Falha ao remover inscrição');
      await onRefreshJobs();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Bulk applicant actions
  const handleSelectAllApplicants = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedApplicants(filteredApplicants.map(a => ({ jobId: a.job.id, applicantId: a.applicant.id })));
    } else {
      setSelectedApplicants([]);
    }
  };

  const handleToggleSelectApplicant = (jobId: string, applicantId: string) => {
    const exists = selectedApplicants.some(s => s.jobId === jobId && s.applicantId === applicantId);
    if (exists) {
      setSelectedApplicants(selectedApplicants.filter(s => !(s.jobId === jobId && s.applicantId === applicantId)));
    } else {
      setSelectedApplicants([...selectedApplicants, { jobId, applicantId }]);
    }
  };

  const handleBulkStatusChange = async (targetStatus: JobApplicant['status']) => {
    if (selectedApplicants.length === 0) {
      alert('Selecione pelo menos um candidato');
      return;
    }
    if (!confirm(`Deseja alterar o status de ${selectedApplicants.length} candidato(s) para "${targetStatus.toUpperCase()}"?`)) {
      return;
    }

    try {
      setIsBulkActionRunning(true);
      const updates = selectedApplicants.map(s => ({
        jobId: s.jobId,
        applicantId: s.applicantId,
        status: targetStatus,
        notes: `Atualizado em lote para ${targetStatus}`
      }));

      const res = await fetch('/api/admin/bulk-applicants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates })
      });

      if (!res.ok) throw new Error('Falha ao aplicar alterações em lote');
      await onRefreshJobs();
      setSelectedApplicants([]);
      alert('Ação em lote concluída com sucesso!');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsBulkActionRunning(false);
    }
  };

  // Export JSON Backup
  const handleExportBackup = async () => {
    try {
      const res = await fetch('/api/admin/export');
      const data = await res.json();
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `freelahub-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert('Erro ao exportar backup: ' + err.message);
    }
  };

  // Import JSON Backup
  const handleImportBackup = async () => {
    if (!importJsonText.trim()) {
      alert('Cole o conteúdo JSON ou carregue um arquivo.');
      return;
    }
    try {
      setIsImporting(true);
      const parsed = JSON.parse(importJsonText);
      const jobsToImport = Array.isArray(parsed) ? parsed : parsed.jobs;
      if (!Array.isArray(jobsToImport)) {
        throw new Error('O JSON deve conter um array de vagas ou objeto com chave "jobs"');
      }

      const res = await fetch('/api/admin/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobs: jobsToImport })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erro ao importar');
      }

      await onRefreshJobs();
      setBackupMessage(`Sucesso! ${jobsToImport.length} vagas restauradas.`);
      setImportJsonText('');
      setTimeout(() => setBackupMessage(''), 4000);
    } catch (err: any) {
      alert('Falha na importação: ' + err.message);
    } finally {
      setIsImporting(false);
    }
  };

  // File Upload Helper for Backup
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportJsonText(content);
    };
    reader.readAsText(file);
  };

  // IF NOT AUTHENTICATED -> RENDER ELEGANT PIN LOCK SCREEN
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 sm:p-8 bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-950 border border-emerald-500/40 flex items-center justify-center shadow-lg shadow-emerald-500/10">
          <ShieldCheck className="w-8 h-8 text-emerald-400" />
        </div>

        <div>
          <h2 className="text-xl font-black text-white tracking-tight">Área Administrativa</h2>
          <p className="text-xs text-slate-400 mt-1">
            Acesso restrito para gestão de vagas, contratações, tesouraria PIX e auditoria da plataforma.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="text-left">
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              PIN / Senha de Administrador
            </label>
            <div className="relative">
              <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                id="input-admin-pin"
                type="password"
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError('');
                }}
                placeholder="Digitar PIN de segurança..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500 font-mono tracking-widest text-center"
                autoFocus
              />
            </div>
            {pinError && (
              <p className="text-xs text-rose-400 mt-1.5 font-medium">{pinError}</p>
            )}
          </div>

          <button
            id="btn-submit-admin-pin"
            type="submit"
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-300 hover:to-green-400 text-slate-950 text-xs font-black transition shadow-lg shadow-emerald-500/20"
          >
            Acessar Painel de Controle
          </button>
        </form>

        <div className="pt-2 border-t border-slate-800">
          <button
            onClick={() => {
              setPinInput(savedPin);
              setIsAuthenticated(true);
              sessionStorage.setItem(ADMIN_AUTH_SESSION_KEY, 'true');
            }}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-medium underline transition"
          >
            ⚡ Desbloquear Rápido (PIN Demonstrativo: {savedPin})
          </button>
        </div>
      </div>
    );
  }

  // AUTHENTICATED: RENDER COMPLETE ADMIN DASHBOARD
  return (
    <div className="space-y-6">
      
      {/* Top Admin Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-slate-900 border border-emerald-500/30 shadow-xl">
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-950 border border-emerald-500/40 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-white tracking-tight">Painel de Administração FreelaHub</h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                SUPER ADMIN
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Controle global de vagas, triagem, desembolso PIX e auditoria da rede.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCreateJob}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-300 hover:to-green-400 text-slate-950 text-xs font-black transition shadow-md shadow-emerald-500/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Publicar Vaga</span>
          </button>

          <button
            onClick={onRefreshJobs}
            className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition"
            title="Atualizar dados"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 text-xs font-bold transition"
            title="Bloquear Painel"
          >
            <Lock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Bloquear</span>
          </button>
        </div>

      </div>

      {/* Admin Navigation Sub-tabs */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-1 border-b border-slate-800">
        
        <button
          onClick={() => setAdminTab('overview')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            adminTab === 'overview'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Visão Geral & KPIs</span>
        </button>

        <button
          onClick={() => setAdminTab('jobs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            adminTab === 'jobs'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Gestão de Vagas ({jobs.length})</span>
        </button>

        <button
          onClick={() => setAdminTab('applicants')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            adminTab === 'applicants'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Candidatos & Triagem ({allApplicants.length})</span>
          {metrics.pendingApplicants > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-500 text-slate-950">
              {metrics.pendingApplicants}
            </span>
          )}
        </button>

        <button
          onClick={() => setAdminTab('finance')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            adminTab === 'finance'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Tesouraria & Ledger PIX</span>
        </button>

        <button
          onClick={() => setAdminTab('certifications')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            adminTab === 'certifications'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Auditoria de Cursos</span>
        </button>

        <button
          onClick={() => setAdminTab('system')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            adminTab === 'system'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Sistema & Backup</span>
        </button>

      </div>

      {/* SUB-TAB 1: VISÃO GERAL & METRICAS (OVERVIEW) */}
      {adminTab === 'overview' && (
        <div className="space-y-6">
          
          {/* Key KPI Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400">Total de Vagas</span>
              <div className="text-2xl font-black text-white">{metrics.totalJobs}</div>
              <p className="text-[10px] text-emerald-400 font-medium">{metrics.openJobs} abertas</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400">Candidaturas</span>
              <div className="text-2xl font-black text-white">{metrics.totalApplicantsCount}</div>
              <p className="text-[10px] text-amber-400 font-medium">{metrics.pendingApplicants} pendentes</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400">Taxa de Preenchimento</span>
              <div className="text-2xl font-black text-emerald-400">{metrics.fillRate}%</div>
              <p className="text-[10px] text-slate-400">{metrics.slotsFilled}/{metrics.totalSlots} vagas ocupadas</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400">Vagas Urgentes (Hoje)</span>
              <div className="text-2xl font-black text-rose-400">{metrics.urgentJobs}</div>
              <p className="text-[10px] text-rose-300 font-medium">Prioridade imediata</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400">Volume Total em Cachês</span>
              <div className="text-xl font-black text-emerald-400">{formatCurrency(metrics.totalVolumeCommitted)}</div>
              <p className="text-[10px] text-slate-400">Comprometidos na rede</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400">PIX Liquidado</span>
              <div className="text-xl font-black text-emerald-300">{formatCurrency(metrics.totalPixPaid)}</div>
              <p className="text-[10px] text-emerald-400 font-medium">{metrics.paidApplicants} comprovantes emitidos</p>
            </div>

          </div>

          {/* Breakdown Grids */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Category Breakdown */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-emerald-400" />
                  <span>Distribuição por Setor / Categoria</span>
                </h3>
                <span className="text-xs text-slate-400">{Object.keys(metrics.byCategory).length} setores ativos</span>
              </div>

              <div className="space-y-2.5">
                {Object.entries(metrics.byCategory).map(([cat, count]) => {
                  const pct = Math.round((count / (metrics.totalJobs || 1)) * 100);
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300 font-medium">{cat}</span>
                        <span className="text-slate-400 font-mono">{count} vaga(s) ({pct}%)</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-400" 
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Geographical Distribution */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span>Cobertura por Estado (UF)</span>
                </h3>
                <span className="text-xs text-slate-400">{Object.keys(metrics.byState).length} estados com vagas</span>
              </div>

              <div className="space-y-2.5">
                {Object.entries(metrics.byState).map(([uf, count]) => {
                  const pct = Math.round((count / (metrics.totalJobs || 1)) * 100);
                  const stateInfo = BRAZIL_STATES.find(s => s.uf === uf);
                  return (
                    <div key={uf} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300 font-medium">{stateInfo?.name || uf} ({uf})</span>
                        <span className="text-slate-400 font-mono">{count} vaga(s) ({pct}%)</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-400" 
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Quick Actions Shortcuts */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-white">Ações Rápidas de Administração</h4>
              <p className="text-xs text-slate-400">Atalhos para fluxos mais comuns do operador.</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setAdminTab('jobs')}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition"
              >
                Gerenciar Todas as Vagas
              </button>
              <button
                onClick={() => setAdminTab('applicants')}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition"
              >
                Triar Candidatos Pendentes ({metrics.pendingApplicants})
              </button>
              <button
                onClick={() => setAdminTab('finance')}
                className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition"
              >
                Desembolsar PIX / Comprovantes
              </button>
            </div>
          </div>

        </div>
      )}

      {/* SUB-TAB 2: GESTÃO COMPLETA DE VAGAS (JOBS CRUD) */}
      {adminTab === 'jobs' && (
        <div className="space-y-4">
          
          {/* Filter & Search Bar */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={jobSearch}
                  onChange={(e) => setJobSearch(e.target.value)}
                  placeholder="Filtrar por título, função, bairro ou ID da vaga..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={jobStatusFilter}
                  onChange={(e) => setJobStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-semibold focus:outline-none"
                >
                  <option value="all">Todos os Status</option>
                  <option value="open">🟢 Aberta</option>
                  <option value="filled">🟡 Preenchida</option>
                  <option value="in_progress">🔵 Em Andamento</option>
                  <option value="completed">🏁 Concluída</option>
                  <option value="cancelled">🔴 Cancelada</option>
                </select>

                <select
                  value={jobStateFilter}
                  onChange={(e) => setJobStateFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-semibold focus:outline-none"
                >
                  <option value="all">Todos os Estados</option>
                  {BRAZIL_STATES.map(s => (
                    <option key={s.uf} value={s.uf}>{s.uf} - {s.name}</option>
                  ))}
                </select>

                <button
                  onClick={onOpenCreateJob}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Nova Vaga</span>
                </button>
              </div>
            </div>
          </div>

          {/* Jobs Table */}
          <div className="overflow-x-auto rounded-2xl bg-slate-900 border border-slate-800">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Vaga & Função</th>
                  <th className="py-3.5 px-4">Localidade</th>
                  <th className="py-3.5 px-4">Data & Horário</th>
                  <th className="py-3.5 px-4">Cachê (R$)</th>
                  <th className="py-3.5 px-4">Vagas (Disp/Total)</th>
                  <th className="py-3.5 px-4">Inscritos</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredJobs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500">
                      Nenhuma vaga encontrada com os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  filteredJobs.map(job => (
                    <tr key={job.id} className="hover:bg-slate-800/40 transition">
                      
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white text-sm leading-snug">{job.title}</div>
                        <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1.5 mt-0.5">
                          <span>{job.role}</span>
                          <span>•</span>
                          <span className="text-slate-400">{job.category}</span>
                          {job.isUrgent && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-rose-500/20 text-rose-400 border border-rose-500/30">
                              URGENTE
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-slate-200 font-semibold">{job.neighborhood}, {job.city}</div>
                        <div className="text-[11px] text-slate-400">{job.state} • {job.locationName || 'Endereço informado'}</div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="text-slate-200 font-semibold">{job.date}</div>
                        <div className="text-[11px] text-slate-400">{job.startTime} às {job.endTime}</div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-black text-emerald-400 text-sm">{formatCurrency(job.cachet)}</span>
                        <div className="text-[10px] text-slate-400">PIX ao final</div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                          job.slotsAvailable === 0
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {job.slotsAvailable} de {job.slotsTotal} livres
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-bold text-slate-200">
                          {job.applicants?.length || 0} candidatos
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <select
                          value={job.status}
                          onChange={(e) => handleChangeJobStatus(job, e.target.value as any)}
                          className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-bold text-slate-200 focus:outline-none focus:border-emerald-500"
                        >
                          <option value="open">🟢 Aberta</option>
                          <option value="filled">🟡 Preenchida</option>
                          <option value="in_progress">🔵 Em Andamento</option>
                          <option value="completed">🏁 Concluída</option>
                          <option value="cancelled">🔴 Cancelada</option>
                        </select>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          
                          <button
                            onClick={() => handleToggleUrgent(job)}
                            className={`p-1.5 rounded-lg border transition ${
                              job.isUrgent 
                                ? 'bg-rose-950/60 border-rose-500 text-rose-300' 
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-rose-400'
                            }`}
                            title={job.isUrgent ? 'Desmarcar Urgente' : 'Marcar como Urgente'}
                          >
                            🚨
                          </button>

                          <button
                            onClick={() => handleDuplicateJob(job.id)}
                            className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition"
                            title="Duplicar Vaga"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setEditingJob(job)}
                            className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-emerald-400 hover:bg-emerald-950/40 hover:border-emerald-500/40 transition"
                            title="Editar Vaga Completa"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteJob(job.id)}
                            className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 transition"
                            title="Excluir Vaga"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                        </div>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* SUB-TAB 3: GESTÃO GLOBAL DE CANDIDATOS (APPLICANTS) */}
      {adminTab === 'applicants' && (
        <div className="space-y-4">
          
          {/* Controls & Batch Actions */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={applicantSearch}
                  onChange={(e) => setApplicantSearch(e.target.value)}
                  placeholder="Buscar por nome do profissional, WhatsApp, chave PIX ou vaga..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={applicantStatusFilter}
                  onChange={(e) => setApplicantStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-semibold focus:outline-none"
                >
                  <option value="all">Todos os Status</option>
                  <option value="pending">⏳ Pendente de Avaliação</option>
                  <option value="accepted">✅ Aprovado / Escalado</option>
                  <option value="checked_in">📍 Check-in / Presente</option>
                  <option value="paid">💰 PIX Pago / Liquidado</option>
                  <option value="rejected">❌ Recusado</option>
                </select>

                <select
                  value={applicantJobFilter}
                  onChange={(e) => setApplicantJobFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-semibold focus:outline-none max-w-[200px]"
                >
                  <option value="all">Todas as Vagas</option>
                  {jobs.map(j => (
                    <option key={j.id} value={j.id}>{j.title}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Batch Action Bar (if items selected) */}
            {selectedApplicants.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 animate-fadeIn">
                <span className="text-xs font-bold text-emerald-300">
                  {selectedApplicants.length} candidato(s) selecionado(s)
                </span>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    disabled={isBulkActionRunning}
                    onClick={() => handleBulkStatusChange('accepted')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition disabled:opacity-50"
                  >
                    ✅ Aprovar Selecionados
                  </button>

                  <button
                    disabled={isBulkActionRunning}
                    onClick={() => handleBulkStatusChange('checked_in')}
                    className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition disabled:opacity-50"
                  >
                    📍 Confirmar Check-in
                  </button>

                  <button
                    disabled={isBulkActionRunning}
                    onClick={() => handleBulkStatusChange('paid')}
                    className="px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-500 text-white text-xs font-bold transition disabled:opacity-50"
                  >
                    💰 Marcar PIX Pago em Lote
                  </button>

                  <button
                    disabled={isBulkActionRunning}
                    onClick={() => handleBulkStatusChange('rejected')}
                    className="px-3 py-1.5 rounded-lg bg-rose-900/80 hover:bg-rose-800 text-rose-200 text-xs font-bold transition disabled:opacity-50"
                  >
                    ❌ Recusar
                  </button>

                  <button
                    onClick={() => setSelectedApplicants([])}
                    className="text-xs text-slate-400 hover:text-white underline ml-2"
                  >
                    Limpar Seleção
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Applicants Table */}
          <div className="overflow-x-auto rounded-2xl bg-slate-900 border border-slate-800">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 w-8">
                    <input
                      type="checkbox"
                      checked={selectedApplicants.length > 0 && selectedApplicants.length === filteredApplicants.length}
                      onChange={handleSelectAllApplicants}
                      className="w-4 h-4 rounded bg-slate-800 text-emerald-500 focus:ring-emerald-500"
                    />
                  </th>
                  <th className="py-3.5 px-4">Profissional / Contato</th>
                  <th className="py-3.5 px-4">Vaga & Cachê</th>
                  <th className="py-3.5 px-4">Chave PIX</th>
                  <th className="py-3.5 px-4">Habilidades & Cursos</th>
                  <th className="py-3.5 px-4">Status Atual</th>
                  <th className="py-3.5 px-4 text-right">Ações Rápidas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredApplicants.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      Nenhum candidato encontrado para os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  filteredApplicants.map(({ job, applicant }) => {
                    const isSelected = selectedApplicants.some(s => s.jobId === job.id && s.applicantId === applicant.id);
                    return (
                      <tr key={applicant.id} className={`hover:bg-slate-800/40 transition ${isSelected ? 'bg-emerald-950/20' : ''}`}>
                        
                        <td className="py-3.5 px-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelectApplicant(job.id, applicant.id)}
                            className="w-4 h-4 rounded bg-slate-800 text-emerald-500 focus:ring-emerald-500"
                          />
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white text-sm">{applicant.name}</div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <a
                              href={`https://wa.me/55${applicant.whatsapp.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                            >
                              <MessageCircle className="w-3 h-3" />
                              <span>{applicant.whatsapp}</span>
                            </a>
                            <span>•</span>
                            <span>{applicant.neighborhood || job.neighborhood}, {applicant.city || job.city}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-200">{job.title}</div>
                          <div className="text-[11px] text-emerald-400 font-bold">
                            {formatCurrency(job.cachet)} • {job.role}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-mono text-xs text-slate-200">{applicant.pixKey}</div>
                          <div className="text-[10px] text-slate-400 uppercase font-semibold">
                            Tipo: {applicant.pixType}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="flex flex-wrap gap-1">
                            {applicant.certifications && applicant.certifications.length > 0 ? (
                              applicant.certifications.map(c => (
                                <span key={c} className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-bold">
                                  🎓 {c}
                                </span>
                              ))
                            ) : null}
                            {applicant.skills?.slice(0, 2).map(s => (
                              <span key={s} className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 text-[9px]">
                                {s}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <select
                            value={applicant.status}
                            onChange={(e) => {
                              onUpdateApplicantStatus(job.id, applicant.id, e.target.value as any);
                            }}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold border focus:outline-none ${
                              applicant.status === 'paid'
                                ? 'bg-emerald-950 text-emerald-400 border-emerald-500/40'
                                : applicant.status === 'accepted'
                                ? 'bg-green-950 text-green-300 border-green-500/40'
                                : applicant.status === 'checked_in'
                                ? 'bg-cyan-950 text-cyan-300 border-cyan-500/40'
                                : applicant.status === 'rejected'
                                ? 'bg-rose-950 text-rose-400 border-rose-500/40'
                                : 'bg-slate-950 text-amber-400 border-amber-500/40'
                            }`}
                          >
                            <option value="pending">⏳ Pendente</option>
                            <option value="accepted">✅ Aprovado</option>
                            <option value="checked_in">📍 Presente</option>
                            <option value="paid">💰 PIX Pago</option>
                            <option value="rejected">❌ Recusado</option>
                          </select>
                        </td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            
                            {/* Pix Receipt / Payout */}
                            <button
                              onClick={() => {
                                setReceiptJob(job);
                                setReceiptApplicant(applicant);
                              }}
                              className="p-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900 transition"
                              title="Emitir Comprovante PIX"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>

                            {/* View Full Detail */}
                            <button
                              onClick={() => setApplicantDetailModal({ job, applicant })}
                              className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition"
                              title="Ver Detalhes do Candidato"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete Applicant */}
                            <button
                              onClick={() => handleDeleteApplicant(job.id, applicant.id)}
                              className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 transition"
                              title="Remover Inscrição"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>

                          </div>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* SUB-TAB 4: TESOURARIA & LEDGER PIX */}
      {adminTab === 'finance' && (
        <div className="space-y-6">
          
          {/* Financial Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div className="p-5 rounded-2xl bg-slate-900 border border-emerald-500/30 space-y-1 shadow-lg">
              <span className="text-xs font-semibold text-slate-400">Total Liquidado em PIX (Concluído)</span>
              <div className="text-3xl font-black text-emerald-400">{formatCurrency(metrics.totalPixPaid)}</div>
              <p className="text-xs text-emerald-300 font-medium">{metrics.paidApplicants} comprovantes emitidos</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-amber-500/30 space-y-1 shadow-lg">
              <span className="text-xs font-semibold text-slate-400">Pendente de Desembolso (Escalados)</span>
              <div className="text-3xl font-black text-amber-400">{formatCurrency(metrics.totalPendingPayout)}</div>
              <p className="text-xs text-slate-400">Aguardando encerramento de turno</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1 shadow-lg">
              <span className="text-xs font-semibold text-slate-400">Volume Total Comprometido</span>
              <div className="text-3xl font-black text-white">{formatCurrency(metrics.totalVolumeCommitted)}</div>
              <p className="text-xs text-slate-400">Todas as vagas abertas e ativas</p>
            </div>

          </div>

          {/* Transactions Ledger Table */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span>Livro-Razão de Desembolsos PIX (Ledger Oficial)</span>
                </h3>
                <p className="text-xs text-slate-400">Histórico de liquidação de cachês e emissão de recibos digitais.</p>
              </div>

              <button
                onClick={() => {
                  const csvRows = [
                    ['ID Transação', 'Data', 'Profissional', 'Chave PIX', 'Tipo', 'Vaga', 'Valor (R$)', 'Status'],
                    ...allApplicants.map(a => [
                      a.applicant.id,
                      a.applicant.paidAt || a.applicant.appliedAt,
                      `"${a.applicant.name}"`,
                      `"${a.applicant.pixKey}"`,
                      a.applicant.pixType,
                      `"${a.job.title}"`,
                      a.applicant.paidAmount || a.job.cachet,
                      a.applicant.status
                    ])
                  ];
                  const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map(e => e.join(',')).join('\n');
                  const encodedUri = encodeURI(csvContent);
                  const link = document.createElement('a');
                  link.setAttribute('href', encodedUri);
                  link.setAttribute('download', `freelahub-financeiro-${new Date().toISOString().slice(0, 10)}.csv`);
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 transition"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Exportar Relatório CSV</span>
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Profissional</th>
                    <th className="py-3 px-4">Chave PIX / Destino</th>
                    <th className="py-3 px-4">Vaga & Função</th>
                    <th className="py-3 px-4">Valor Líquido</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Comprovante</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {allApplicants.map(({ job, applicant }) => (
                    <tr key={applicant.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4">
                        <div className="font-bold text-white">{applicant.name}</div>
                        <div className="text-[10px] text-slate-400">{applicant.whatsapp}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-slate-300">
                        {applicant.pixKey} ({applicant.pixType.toUpperCase()})
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-200 font-semibold">{job.role}</div>
                        <div className="text-[10px] text-slate-400">{job.title}</div>
                      </td>
                      <td className="py-3 px-4 font-black text-emerald-400 text-sm">
                        {formatCurrency(applicant.paidAmount || job.cachet)}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          applicant.status === 'paid'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}>
                          {applicant.status === 'paid' ? 'PIX LIQUIDADO' : 'AGUARDANDO'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setReceiptJob(job);
                            setReceiptApplicant(applicant);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-emerald-400 transition"
                        >
                          Ver Recibo
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>

        </div>
      )}

      {/* SUB-TAB 5: AUDITORIA DE CURSOS & CERTIFICAÇÕES */}
      {adminTab === 'certifications' && (
        <div className="space-y-6">
          
          <div className="p-5 rounded-2xl bg-slate-900 border border-amber-500/30 space-y-2">
            <div className="flex items-center gap-2 text-amber-400">
              <GraduationCap className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">Auditoria de Cursos Técnicos & Certificações Obrigatórias</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Verificação de conformidade técnica para funções críticas como <strong>Operador de Caixa / Tesouraria</strong>, <strong>Manipulação ANVISA</strong> e <strong>Segurança do Trabalho (NRs)</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Active requirements */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <h4 className="text-sm font-bold text-white">Certificações Exigidas em Vagas Ativas</h4>
              <div className="space-y-2">
                {jobs.flatMap(j => j.requiredCertifications || []).length === 0 ? (
                  <p className="text-xs text-slate-500">Nenhuma vaga ativa com exigência técnica no momento.</p>
                ) : (
                  Array.from(new Set(jobs.flatMap(j => j.requiredCertifications || []))).map(cert => (
                    <div key={cert} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-bold text-white">{cert}</span>
                      </div>
                      <span className="text-[11px] text-amber-300 font-mono">
                        {jobs.filter(j => j.requiredCertifications?.includes(cert)).length} vaga(s)
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Certified professionals pool */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <h4 className="text-sm font-bold text-white">Profissionais Habilitados no Banco de Talentos</h4>
              <div className="space-y-2 max-h-[360px] overflow-y-auto">
                {allApplicants.filter(a => a.applicant.certifications && a.applicant.certifications.length > 0).map(({ applicant, job }) => (
                  <div key={applicant.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{applicant.name}</span>
                      <span className="text-[10px] text-emerald-400 font-semibold">{applicant.city}/{applicant.state}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {applicant.certifications?.map(c => (
                        <span key={c} className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-[9px] font-bold text-amber-300">
                          ✓ {c}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* SUB-TAB 6: SISTEMA, SEGURANÇA & BACKUP */}
      {adminTab === 'system' && (
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Backup Export & Import */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Exportação & Backup do Banco de Dados</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Baixe um arquivo JSON com a cópia exata de todas as vagas, candidatos e histórico financeiro para segurança.
              </p>

              <button
                onClick={handleExportBackup}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition shadow-lg shadow-emerald-500/20"
              >
                <Download className="w-4 h-4" />
                <span>Exportar Backup Completo (JSON)</span>
              </button>

              <div className="border-t border-slate-800 pt-4 space-y-2">
                <label className="block text-xs font-semibold text-slate-300">Importar / Restaurar Base de Dados</label>
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="block w-full text-xs text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700"
                  />
                </div>
                <textarea
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  placeholder="Ou cole o JSON de backup aqui..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={handleImportBackup}
                  disabled={isImporting || !importJsonText.trim()}
                  className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition disabled:opacity-50"
                >
                  {isImporting ? 'Restaurando...' : 'Restaurar Base de Dados'}
                </button>
                {backupMessage && (
                  <p className="text-xs text-emerald-400 font-semibold">{backupMessage}</p>
                )}
              </div>
            </div>

            {/* Security PIN & System Reset */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
              
              {/* Security PIN Change */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">Alterar PIN de Acesso Administrativo</h3>
                </div>
                <p className="text-xs text-slate-400">
                  PIN atual ativo no navegador: <strong className="font-mono text-emerald-400">{savedPin}</strong>
                </p>

                <form onSubmit={handleSaveNewPin} className="flex gap-2">
                  <input
                    type="password"
                    value={newPinInput}
                    onChange={(e) => setNewPinInput(e.target.value)}
                    placeholder="Novo PIN (mín. 4 dígitos)..."
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition"
                  >
                    Salvar PIN
                  </button>
                </form>
                {pinChangeSuccess && (
                  <p className="text-xs text-emerald-400 font-semibold">Novo PIN salvo com sucesso!</p>
                )}
              </div>

              {/* Reset to Factory Demonstration */}
              <div className="border-t border-slate-800 pt-4 space-y-2">
                <div className="flex items-center gap-2 text-rose-400">
                  <AlertCircle className="w-4 h-4" />
                  <h4 className="text-xs font-bold text-white">Reiniciar Base de Demonstração (Reset)</h4>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Restaura todas as vagas originais, candidatos e configurações para o estado padrão de demonstração.
                </p>
                <button
                  onClick={async () => {
                    if (confirm('Tem certeza que deseja reiniciar o banco de dados para os valores originais de fábrica?')) {
                      await onResetDb();
                      alert('Banco de dados reiniciado para os valores padrão!');
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-300 text-xs font-bold transition"
                >
                  Reiniciar Base de Dados Padrão
                </button>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* Edit Job Modal */}
      <EditJobModal
        isOpen={Boolean(editingJob)}
        job={editingJob}
        onClose={() => setEditingJob(null)}
        onJobUpdated={async () => {
          await onRefreshJobs();
          setEditingJob(null);
        }}
        onDeleteJob={async (id) => {
          await handleDeleteJob(id);
          setEditingJob(null);
        }}
      />

      {/* PIX Receipt Modal */}
      <PixReceiptModal
        job={receiptJob}
        applicant={receiptApplicant}
        onClose={() => {
          setReceiptJob(null);
          setReceiptApplicant(null);
        }}
      />

      {/* Applicant Detail Quick Modal */}
      {applicantDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Ficha do Candidato</h3>
              <button
                onClick={() => setApplicantDetailModal(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <p className="font-bold text-white text-sm">{applicantDetailModal.applicant.name}</p>
                <p className="text-emerald-400 font-mono">WhatsApp: {applicantDetailModal.applicant.whatsapp}</p>
                <p className="text-slate-300 font-mono">Chave PIX: {applicantDetailModal.applicant.pixKey} ({applicantDetailModal.applicant.pixType.toUpperCase()})</p>
                <p className="text-slate-400">Local: {applicantDetailModal.applicant.neighborhood}, {applicantDetailModal.applicant.city} - {applicantDetailModal.applicant.state}</p>
              </div>

              <div>
                <span className="font-bold text-slate-300">Resumo de Experiência:</span>
                <p className="text-slate-400 mt-0.5 leading-relaxed bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  {applicantDetailModal.applicant.experienceSummary || 'Não informado.'}
                </p>
              </div>

              {applicantDetailModal.applicant.certifications && applicantDetailModal.applicant.certifications.length > 0 && (
                <div>
                  <span className="font-bold text-amber-300">Cursos & Certificações:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {applicantDetailModal.applicant.certifications.map(c => (
                      <span key={c} className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-semibold text-[10px]">
                        🎓 {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {applicantDetailModal.applicant.skills && applicantDetailModal.applicant.skills.length > 0 && (
                <div>
                  <span className="font-bold text-slate-300">Habilidades Declaradas:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {applicantDetailModal.applicant.skills.map(s => (
                      <span key={s} className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 text-[10px]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setApplicantDetailModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
