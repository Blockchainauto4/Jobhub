import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid 
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Briefcase, 
  Gift, 
  RefreshCw, 
  ArrowUpRight, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  DollarSign, 
  Clock, 
  Share2, 
  ExternalLink, 
  Layers, 
  Zap, 
  Activity, 
  Download,
  Filter,
  Lock,
  LogOut,
  UserCheck,
  Shield,
  Plus
} from 'lucide-react';
import { 
  AdminDashboardMetrics, 
  FreelanceJob, 
  UserGrowthDataPoint, 
  CategoryMetric,
  SystemAdmin 
} from '../types';
import { formatCurrency } from '../utils/formatters';
import { AdminGatekeeper } from './AdminGatekeeper';
import { AdminJobsManager } from './AdminJobsManager';
import { AdminApplicantsManager } from './AdminApplicantsManager';
import { AdminSystemUsersManager } from './AdminSystemUsersManager';
import { AdminTikTokMissionManager } from './AdminTikTokMissionManager';

interface AdminDashboardProps {
  jobs: FreelanceJob[];
  onNavigateToTab: (tab: 'jobs' | 'candidates' | 'radar' | 'calculator' | 'dashboard') => void;
  onOpenCreateJob: () => void;
  onRefreshJobs?: () => void;
}

type AdminSubTab = 'indicators' | 'jobs' | 'applicants' | 'system_users' | 'tiktok_mission';

const ADMIN_SESSION_STORAGE_KEY = 'freelahub_admin_session';
const ADMIN_TOKEN_STORAGE_KEY = 'freelahub_admin_token';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  jobs,
  onNavigateToTab,
  onOpenCreateJob,
  onRefreshJobs
}) => {
  // Authentication State
  const [currentAdmin, setCurrentAdmin] = useState<SystemAdmin | null>(() => {
    try {
      const saved = localStorage.getItem(ADMIN_SESSION_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [adminToken, setAdminToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY) || null;
    } catch {
      return null;
    }
  });

  // Active Sub-Tab
  const [activeSubTab, setActiveSubTab] = useState<AdminSubTab>('indicators');
  const [selectedJobIdForCandidates, setSelectedJobIdForCandidates] = useState<string | undefined>(undefined);

  // Metrics State
  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '6m' | '1y'>('30d');
  const [growthViewMode, setGrowthViewMode] = useState<'cumulative' | 'breakdown'>('cumulative');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());
  const [activeCategoryIndex, setActiveCategoryIndex] = useState<number | null>(null);
  const [liveStreamEvents, setLiveStreamEvents] = useState<any[]>([]);

  const handleAuthenticated = (admin: SystemAdmin, token: string) => {
    setCurrentAdmin(admin);
    setAdminToken(token);
    try {
      localStorage.setItem(ADMIN_SESSION_STORAGE_KEY, JSON.stringify(admin));
      localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, token);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    setCurrentAdmin(null);
    setAdminToken(null);
    try {
      localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
      localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }
  };

  // Fetch metrics from backend API
  const fetchMetrics = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const res = await fetch('/api/admin/metrics');
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data: AdminDashboardMetrics = await res.json();
        setMetrics(data);
        if (data.missions?.liveEvents) {
          setLiveStreamEvents(data.missions.liveEvents);
        }
      }
      setLastRefreshedAt(new Date());
    } catch (err) {
      console.warn('Erro ao carregar dados do dashboard da API:', err);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentAdmin && adminToken) {
      fetchMetrics(true);
    }
  }, [currentAdmin, adminToken]);

  // Real-time auto-refresh interval (every 10 seconds if enabled)
  useEffect(() => {
    if (!autoRefresh || !currentAdmin || activeSubTab !== 'indicators') return;
    const interval = setInterval(() => {
      fetchMetrics(false);
    }, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh, currentAdmin, activeSubTab]);

  // Real-time live event simulator to demonstrate instant telemetry updates
  useEffect(() => {
    if (!currentAdmin || activeSubTab !== 'indicators') return;
    const liveTimer = setInterval(() => {
      const names = [
        'Guilherme M.', 'Ana Clara S.', 'Rodrigo B.', 'Juliana F.', 
        'Matheus V.', 'Camila D.', 'Lucas T.', 'Fernanda O.',
        'Gabriel P.', 'Larissa M.', 'Diego R.', 'Beatriz N.'
      ];
      const roles = [
        'Garçom de Evento', 'Recepcionista VIP', 'Auxiliar de Limpeza', 
        'Barman / Bartender', 'Operador de Caixa', 'Carregador & Montagem',
        'Segurança & Apoio'
      ];
      const missionTypes = ['tiktok', 'kwai', 'whatsapp_group', 'contact_unlock'];

      const randomName = names[Math.floor(Math.random() * names.length)];
      const randomRole = roles[Math.floor(Math.random() * roles.length)];
      const randomMission = missionTypes[Math.floor(Math.random() * missionTypes.length)];

      const newEvt = {
        id: `evt-${Date.now()}`,
        userName: randomName,
        jobRole: randomRole,
        missionType: randomMission,
        timestamp: 'Agora'
      };

      setLiveStreamEvents(prev => [newEvt, ...prev.slice(0, 7)]);
    }, 8000);

    return () => clearInterval(liveTimer);
  }, [currentAdmin, activeSubTab]);

  // Fallback if not authenticated
  if (!currentAdmin || !adminToken) {
    return <AdminGatekeeper onAuthenticated={handleAuthenticated} />;
  }

  // Derived indicator calculations
  const totalJobsCount = metrics?.kpis.totalJobsCount ?? jobs.length;
  const totalApplicantsCount = metrics?.kpis.totalApplicants ?? jobs.reduce((acc, j) => acc + (j.applicants?.length || 0), 0);
  const totalPaidCachets = metrics?.kpis.totalPaidCachet ?? jobs.reduce((acc, j) => {
    const paidApps = j.applicants?.filter(a => a.status === 'paid') || [];
    return acc + (paidApps.length * j.cachet);
  }, 0);

  const missionsData = metrics?.missions;

  // Custom Chart Tooltips
  const CustomGrowthTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700/80 p-3 rounded-xl shadow-xl text-xs space-y-1.5 backdrop-blur-md">
          <p className="font-bold text-slate-200 border-b border-slate-800 pb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span>{entry.name}:</span>
              </span>
              <span className="font-mono font-bold text-white">
                {entry.value.toLocaleString('pt-BR')}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const CustomCategoryTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700/80 p-3 rounded-xl shadow-xl text-xs space-y-1 backdrop-blur-md">
          <p className="font-bold text-white flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
            <span>{data.category}</span>
          </p>
          <div className="text-slate-300">
            Vagas Publicadas: <strong className="text-emerald-400 font-mono">{data.count}</strong>
          </div>
          <div className="text-slate-400 text-[11px]">
            Participação: <strong className="text-white font-mono">{data.percentage}%</strong>
          </div>
          <div className="text-slate-400 text-[11px]">
            Cachê Médio: <strong className="text-cyan-400 font-mono">{formatCurrency(data.avgCachet)}</strong>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      
      {/* Top Admin Identification & Sub-Navigation Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl relative overflow-hidden">
        
        {/* Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          
          {/* Admin Identity */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-slate-950 font-black text-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
              {currentAdmin.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Painel de Controle Administrativo
                </h1>
                <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold">
                  {currentAdmin.roleLabel || currentAdmin.role}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <span className="flex items-center gap-1 text-emerald-400 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" /> Sessão Autenticada
                </span>
                <span>•</span>
                <span>{currentAdmin.name} ({currentAdmin.email})</span>
              </div>
            </div>
          </div>

          {/* Quick Actions & Logout */}
          <div className="flex items-center gap-2.5 shrink-0 self-end lg:self-center">
            <button
              onClick={onOpenCreateJob}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Vaga</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-400 border border-slate-700/80 text-xs font-semibold transition"
              title="Encerrar sessão administrativa"
            >
              <LogOut className="w-4 h-4" />
              <span>Bloquear / Sair</span>
            </button>
          </div>

        </div>

        {/* Main Administrative Sub-Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-5">
          
          <button
            onClick={() => setActiveSubTab('indicators')}
            className={`flex items-center justify-center gap-2 py-3 px-2 rounded-2xl text-xs sm:text-sm font-bold transition ${
              activeSubTab === 'indicators'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 scale-[1.01]'
                : 'bg-slate-950/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <TrendingUp className="w-4 h-4 shrink-0" />
            <span>Indicadores & BI</span>
          </button>

          <button
            onClick={() => setActiveSubTab('jobs')}
            className={`flex items-center justify-center gap-2 py-3 px-2 rounded-2xl text-xs sm:text-sm font-bold transition ${
              activeSubTab === 'jobs'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 scale-[1.01]'
                : 'bg-slate-950/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Briefcase className="w-4 h-4 shrink-0" />
            <span>Postagem de Vagas</span>
          </button>

          <button
            onClick={() => {
              setSelectedJobIdForCandidates(undefined);
              setActiveSubTab('applicants');
            }}
            className={`flex items-center justify-center gap-2 py-3 px-2 rounded-2xl text-xs sm:text-sm font-bold transition ${
              activeSubTab === 'applicants'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 scale-[1.01]'
                : 'bg-slate-950/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Users className="w-4 h-4 shrink-0" />
            <span>Candidatos</span>
          </button>

          <button
            onClick={() => setActiveSubTab('tiktok_mission')}
            className={`flex items-center justify-center gap-2 py-3 px-2 rounded-2xl text-xs sm:text-sm font-bold transition ${
              activeSubTab === 'tiktok_mission'
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/30 scale-[1.01]'
                : 'bg-slate-950/80 text-pink-300 hover:text-white hover:bg-pink-950/40 border border-pink-500/30'
            }`}
          >
            <Sparkles className="w-4 h-4 shrink-0 text-pink-400" />
            <span>TikTok 24h & Bloqueio</span>
          </button>

          <button
            onClick={() => setActiveSubTab('system_users')}
            className={`flex items-center justify-center gap-2 py-3 px-2 rounded-2xl text-xs sm:text-sm font-bold transition col-span-2 sm:col-span-1 ${
              activeSubTab === 'system_users'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 scale-[1.01]'
                : 'bg-slate-950/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Shield className="w-4 h-4 shrink-0" />
            <span>Administradores</span>
          </button>

        </div>

      </div>

      {/* SUB-TAB CONTENT: TIKTOK MISSION 24H & CONTRACT GATEKEEPER */}
      {activeSubTab === 'tiktok_mission' && (
        <AdminTikTokMissionManager
          currentAdmin={currentAdmin}
          onRefreshJobs={() => onRefreshJobs && onRefreshJobs()}
        />
      )}

      {/* SUB-TAB CONTENT 1: POSTAGEM DE VAGAS */}
      {activeSubTab === 'jobs' && (
        <AdminJobsManager
          jobs={jobs}
          currentAdmin={currentAdmin}
          onOpenCreateJob={onOpenCreateJob}
          onRefreshJobs={() => onRefreshJobs && onRefreshJobs()}
          onSelectJobForCandidates={(jobId) => {
            setSelectedJobIdForCandidates(jobId);
            setActiveSubTab('applicants');
          }}
        />
      )}

      {/* SUB-TAB CONTENT 2: CANDIDATOS ÀS VAGAS */}
      {activeSubTab === 'applicants' && (
        <AdminApplicantsManager
          jobs={jobs}
          currentAdmin={currentAdmin}
          selectedJobId={selectedJobIdForCandidates}
          onRefreshJobs={() => onRefreshJobs && onRefreshJobs()}
        />
      )}

      {/* SUB-TAB CONTENT 3: ADMINISTRADORES DE SISTEMAS */}
      {activeSubTab === 'system_users' && (
        <AdminSystemUsersManager
          currentAdmin={currentAdmin}
          onAdminProfileUpdated={(adm) => {
            setCurrentAdmin(adm);
            localStorage.setItem(ADMIN_SESSION_STORAGE_KEY, JSON.stringify(adm));
          }}
        />
      )}

      {/* SUB-TAB CONTENT 4: INDICADORES & BI (RECHARTS) */}
      {activeSubTab === 'indicators' && (
        <div className="space-y-6">
          
          {/* Real-time Indicator Refresh Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-xs text-slate-300 font-medium">
                Telemetria em tempo real • Atualizado às {lastRefreshedAt.toLocaleTimeString('pt-BR')}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded accent-emerald-500"
                />
                <span>Auto-refresh (10s)</span>
              </label>

              <button
                onClick={() => fetchMetrics(true)}
                disabled={isLoading}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                title="Recarregar métricas agora"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
              </button>
            </div>
          </div>

          {/* 4 Main KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Total Users */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl p-5 shadow-xl space-y-2 hover:border-slate-700 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Freelancers & Contratantes</span>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white">
                {(metrics?.kpis.totalRegisteredUsers ?? 15420).toLocaleString('pt-BR')}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+18.4% este mês</span>
              </div>
            </div>

            {/* Card 2: Total Jobs */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl p-5 shadow-xl space-y-2 hover:border-slate-700 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Vagas Publicadas</span>
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  <Briefcase className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white">
                {totalJobsCount}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-medium">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>{jobs.filter(j => j.status === 'open').length} vagas abertas agora</span>
              </div>
            </div>

            {/* Card 3: Total Applicants */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl p-5 shadow-xl space-y-2 hover:border-slate-700 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Candidaturas Registradas</span>
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30">
                  <UserCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white">
                {totalApplicantsCount}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-purple-400 font-medium">
                <span>Média: {(totalApplicantsCount / Math.max(1, totalJobsCount)).toFixed(1)} cand/vaga</span>
              </div>
            </div>

            {/* Card 4: Missions & Rewards */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl p-5 shadow-xl space-y-2 hover:border-slate-700 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Taxa de Conclusão Missões</span>
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  <Gift className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white">
                {missionsData?.completionRate ?? 76.8}%
              </div>
              <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{(missionsData?.totalCompleted ?? 8940).toLocaleString('pt-BR')} missões concluídas</span>
              </div>
            </div>

          </div>

          {/* Recharts Indicator 1: User Growth Chart (AreaChart) */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  <span>Crescimento de Usuários na Plataforma</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Evolução temporal de novos cadastros (Freelancers vs. Contratantes).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setGrowthViewMode('cumulative')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    growthViewMode === 'cumulative'
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  Acumulado Total
                </button>
                <button
                  onClick={() => setGrowthViewMode('breakdown')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    growthViewMode === 'breakdown'
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  Novos por Mês
                </button>
              </div>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics?.userGrowth || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorFreelancers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorClients" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomGrowthTooltip />} />
                  <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />

                  {growthViewMode === 'cumulative' ? (
                    <Area 
                      type="monotone" 
                      dataKey="totalUsers" 
                      name="Total Acumulado de Usuários" 
                      stroke="#10b981" 
                      strokeWidth={2.5} 
                      fillOpacity={1} 
                      fill="url(#colorTotal)" 
                    />
                  ) : (
                    <>
                      <Area 
                        type="monotone" 
                        dataKey="freelancers" 
                        name="Novos Freelancers" 
                        stroke="#06b6d4" 
                        strokeWidth={2} 
                        fillOpacity={1} 
                        fill="url(#colorFreelancers)" 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="clients" 
                        name="Novos Contratantes" 
                        stroke="#a855f7" 
                        strokeWidth={2} 
                        fillOpacity={1} 
                        fill="url(#colorClients)" 
                      />
                    </>
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>

          </div>

          {/* Recharts Indicator 2 & 3: Jobs by Category (BarChart & PieChart) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Bar Chart (7 cols) */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-cyan-400" />
                    <span>Vagas Publicadas por Categoria</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Volume de oportunidades ativas em cada setor profissional.</p>
                </div>
              </div>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics?.categories || []} margin={{ top: 10, right: 10, left: 0, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis 
                      dataKey="category" 
                      stroke="#64748b" 
                      fontSize={10} 
                      tickLine={false} 
                      angle={-25} 
                      textAnchor="end"
                      interval={0}
                    />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomCategoryTooltip />} />
                    <Bar dataKey="count" name="Vagas" radius={[6, 6, 0, 0]}>
                      {(metrics?.categories || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie Chart (5 cols) */}
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
              <div className="border-b border-slate-800/80 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-purple-400" />
                  <span>Distribuição Percentual (%)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Concentração da demanda por área de atuação.</p>
              </div>

              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip content={<CustomCategoryTooltip />} />
                    <Pie
                      data={metrics?.categories || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="count"
                    >
                      {(metrics?.categories || []).map((entry, index) => (
                        <Cell key={`pie-cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Recharts Indicator 4: Mission Completion Rates & Telemetry (LineChart & Live Feed) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Line Chart (8 cols) */}
            <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Gift className="w-5 h-5 text-amber-400" />
                    <span>Taxa de Conclusão de Missões em Tempo Real</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Engajamento nas missões de TikTok, Kwai, WhatsApp e Desbloqueios.</p>
                </div>
              </div>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={missionsData?.hourlyTrends || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="hour" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomGrowthTooltip />} />
                    <Legend verticalAlign="top" height={32} wrapperStyle={{ fontSize: '11px' }} />
                    <Line type="monotone" dataKey="tiktok" name="TikTok Patrocinador" stroke="#ec4899" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="kwai" name="Kwai Referral" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="whatsapp" name="Entrada Grupo VIP" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="unlocks" name="Desbloqueio de Vagas" stroke="#06b6d4" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Live Telemetry Stream (4 cols) */}
            <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-sm font-bold text-white">Feed de Missões ao Vivo</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono">Stream Ativo</span>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                {liveStreamEvents.map((evt) => (
                  <div 
                    key={evt.id}
                    className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs flex items-center justify-between gap-2"
                  >
                    <div className="space-y-0.5 truncate">
                      <div className="font-bold text-slate-200 truncate flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                        <span className="truncate">{evt.userName}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {evt.jobRole}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-emerald-500/20 text-emerald-300">
                        {evt.missionType === 'contact_unlock' ? '🔓 Desbloqueou' : '+R$ 50'}
                      </span>
                      <div className="text-[10px] text-slate-500 mt-0.5">{evt.timestamp}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
