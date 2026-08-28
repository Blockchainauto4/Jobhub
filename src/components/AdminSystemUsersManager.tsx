import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  UserPlus, 
  KeyRound, 
  Lock, 
  Unlock, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  AlertTriangle, 
  Activity, 
  Clock, 
  Shield, 
  User, 
  Check, 
  X, 
  RotateCcw,
  Sparkles,
  Layers,
  ChevronRight,
  Eye,
  EyeOff
} from 'lucide-react';
import { SystemAdmin, AdminRole, AdminPermissions, AdminAuditLog } from '../types';

interface AdminSystemUsersManagerProps {
  currentAdmin: SystemAdmin | null;
  onAdminProfileUpdated?: (updatedAdmin: SystemAdmin) => void;
}

const DEFAULT_PERMISSIONS: Record<AdminRole, AdminPermissions> = {
  super_admin: {
    canPostJobs: true,
    canEditJobs: true,
    canDeleteJobs: true,
    canManageApplicants: true,
    canApprovePixPayments: true,
    canManageAdmins: true,
    canViewTelemetry: true,
    canExportReports: true
  },
  job_manager: {
    canPostJobs: true,
    canEditJobs: true,
    canDeleteJobs: false,
    canManageApplicants: true,
    canApprovePixPayments: false,
    canManageAdmins: false,
    canViewTelemetry: true,
    canExportReports: true
  },
  candidate_reviewer: {
    canPostJobs: false,
    canEditJobs: false,
    canDeleteJobs: false,
    canManageApplicants: true,
    canApprovePixPayments: false,
    canManageAdmins: false,
    canViewTelemetry: true,
    canExportReports: true
  },
  financial_operator: {
    canPostJobs: false,
    canEditJobs: false,
    canDeleteJobs: false,
    canManageApplicants: true,
    canApprovePixPayments: true,
    canManageAdmins: false,
    canViewTelemetry: true,
    canExportReports: true
  }
};

export const AdminSystemUsersManager: React.FC<AdminSystemUsersManagerProps> = ({
  currentAdmin,
  onAdminProfileUpdated
}) => {
  const [admins, setAdmins] = useState<SystemAdmin[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'admins' | 'security' | 'audit'>('admins');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<SystemAdmin | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Form States - Add Admin
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<AdminRole>('job_manager');
  const [newAdminPermissions, setNewAdminPermissions] = useState<AdminPermissions>(DEFAULT_PERMISSIONS.job_manager);
  const [newAdminNotes, setNewAdminNotes] = useState('');

  // Password Form
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch Admins & Logs
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [adminsRes, logsRes] = await Promise.all([
        fetch('/api/admin/admins'),
        fetch('/api/admin/audit-logs')
      ]);

      if (adminsRes.ok) {
        const adminsData = await adminsRes.json();
        setAdmins(adminsData);
      }
      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setAuditLogs(logsData);
      }
    } catch (err) {
      console.error('Erro ao carregar administradores:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update permissions preset when role changes in Add modal
  const handleRoleChange = (role: AdminRole) => {
    setNewAdminRole(role);
    setNewAdminPermissions(DEFAULT_PERMISSIONS[role]);
  };

  // Create new Admin
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const res = await fetch('/api/admin/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newAdminName,
          email: newAdminEmail,
          role: newAdminRole,
          permissions: newAdminPermissions,
          notes: newAdminNotes,
          requesterAdmin: currentAdmin ? { id: currentAdmin.id, name: currentAdmin.name } : undefined
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Falha ao cadastrar administrador');
      }

      showToast(`Administrador "${newAdminName}" cadastrado com sucesso!`);
      setIsAddAdminOpen(false);
      setNewAdminName('');
      setNewAdminEmail('');
      setNewAdminNotes('');
      fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update existing Admin
  const handleUpdateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdmin) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/admin/admins/${editingAdmin.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editingAdmin,
          requesterAdmin: currentAdmin ? { id: currentAdmin.id, name: currentAdmin.name } : undefined
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Falha ao atualizar administrador');
      }

      showToast(`Administrador "${editingAdmin.name}" atualizado com sucesso!`);
      setEditingAdmin(null);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Admin Status (Active / Blocked)
  const handleToggleStatus = async (admin: SystemAdmin) => {
    const newStatus = admin.status === 'active' ? 'blocked' : 'active';
    try {
      const res = await fetch(`/api/admin/admins/${admin.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          requesterAdmin: currentAdmin ? { id: currentAdmin.id, name: currentAdmin.name } : undefined
        })
      });

      if (!res.ok) throw new Error('Falha ao alterar status');
      showToast(`Administrador "${admin.name}" ${newStatus === 'active' ? 'ativado' : 'bloqueado'}!`);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Delete Admin
  const handleDeleteAdmin = async (admin: SystemAdmin) => {
    if (!confirm(`Tem certeza de que deseja remover o acesso do administrador "${admin.name}"?`)) return;

    try {
      const url = `/api/admin/admins/${admin.id}?requesterAdminId=${currentAdmin?.id || 'admin-1'}&requesterAdminName=${encodeURIComponent(currentAdmin?.name || 'Super Admin')}`;
      const res = await fetch(url, { method: 'DELETE' });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Falha ao remover administrador');
      }

      showToast(`Administrador "${admin.name}" removido com sucesso.`);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Change Master Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('A nova senha e a confirmação não coincidem.');
      return;
    }
    if (newPassword.length < 6) {
      alert('A nova senha deve ter no mínimo 6 dígitos.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oldPassword,
          newPassword,
          requesterAdmin: currentAdmin ? { id: currentAdmin.id, name: currentAdmin.name } : undefined
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Falha ao alterar senha');

      showToast('Senha mestra de acesso administrativo alterada com sucesso!');
      setIsPasswordModalOpen(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
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
          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white">Administradores de Sistemas & Acessos</h2>
            <p className="text-xs text-slate-400">
              Controle de usuários autorizados, permissões operacionais, senhas de segurança e logs de auditoria.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsPasswordModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs sm:text-sm border border-slate-700 transition"
            title="Alterar senha mestra de acesso administrativo"
          >
            <KeyRound className="w-4 h-4 text-amber-400" />
            <span>Alterar Senha</span>
          </button>

          <button
            onClick={() => setIsAddAdminOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-purple-600/20 hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Novo Administrador</span>
          </button>
        </div>
      </div>

      {/* Sub-tab Pills */}
      <div className="flex items-center gap-2 bg-slate-900/50 p-2 rounded-2xl border border-slate-800/80 w-fit">
        <button
          onClick={() => setActiveTab('admins')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
            activeTab === 'admins'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Equipe Administrativa ({admins.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
            activeTab === 'security'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Parâmetros de Segurança</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
            activeTab === 'audit'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Registro de Auditoria ({auditLogs.length})</span>
        </button>
      </div>

      {/* TAB 1: ADMINS LIST */}
      {activeTab === 'admins' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {admins.map((admin) => {
              const isSuper = admin.role === 'super_admin';
              const isBlocked = admin.status === 'blocked';

              return (
                <div 
                  key={admin.id}
                  className={`bg-slate-900 border rounded-2xl sm:rounded-3xl p-5 transition shadow-lg space-y-4 flex flex-col justify-between ${
                    isBlocked 
                      ? 'border-rose-900/40 opacity-75' 
                      : isSuper 
                        ? 'border-purple-500/40 bg-gradient-to-b from-purple-950/20 to-slate-900' 
                        : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  
                  <div className="space-y-3">
                    {/* Header: Avatar, Name, Status */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center font-bold text-purple-300 text-sm">
                          {admin.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white leading-tight">{admin.name}</h4>
                          <span className="text-xs text-slate-400">{admin.email}</span>
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isBlocked ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {isBlocked ? 'Bloqueado' : 'Ativo'}
                      </span>
                    </div>

                    {/* Role Tag */}
                    <div>
                      <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold ${
                        isSuper 
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' 
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}>
                        {admin.roleLabel || admin.role}
                      </span>
                    </div>

                    {/* Permissions Mini Grid */}
                    <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 space-y-1.5 text-xs text-slate-400">
                      <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Permissões:</div>
                      <div className="grid grid-cols-2 gap-1 text-[11px]">
                        <span className={admin.permissions.canPostJobs ? 'text-emerald-400' : 'text-slate-600 line-through'}>
                          ✓ Postar Vagas
                        </span>
                        <span className={admin.permissions.canManageApplicants ? 'text-emerald-400' : 'text-slate-600 line-through'}>
                          ✓ Triar Candidatos
                        </span>
                        <span className={admin.permissions.canApprovePixPayments ? 'text-emerald-400' : 'text-slate-600 line-through'}>
                          ✓ Liquidação PIX
                        </span>
                        <span className={admin.permissions.canManageAdmins ? 'text-emerald-400' : 'text-slate-600 line-through'}>
                          ✓ Gerir Admins
                        </span>
                      </div>
                    </div>

                    {admin.lastLoginAt && (
                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Último login: {new Date(admin.lastLoginAt).toLocaleString('pt-BR')}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-800/80">
                    <button
                      onClick={() => handleToggleStatus(admin)}
                      className={`text-xs px-2.5 py-1 rounded-lg font-medium transition ${
                        isBlocked ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {isBlocked ? 'Desbloquear' : 'Bloquear'}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setEditingAdmin(admin)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                        title="Editar permissões"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {!isSuper && (
                        <button
                          onClick={() => handleDeleteAdmin(admin)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition"
                          title="Remover administrador"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: SECURITY SETTINGS */}
      {activeTab === 'security' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Master Password Policy Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Senha Mestra Administrativa</h3>
                <p className="text-xs text-slate-400">Autenticação obrigatória para acessar o Console FreelaHub.</p>
              </div>
            </div>

            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Bloqueio de tela com isolamento de sessão ativado</span>
              </div>
              <p className="text-slate-400">
                Qualquer acesso às abas de Postagem de Vagas, Triagem e Configurações de Administrador exige autenticação via senha mestra criptografada.
              </p>
            </div>

            <button
              onClick={() => setIsPasswordModalOpen(true)}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition cursor-pointer"
            >
              Alterar Senha Mestra de Acesso
            </button>
          </div>

          {/* Session & Security Parameters */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Parâmetros de Segurança Operacional</h3>
                <p className="text-xs text-slate-400">Políticas de sessão e proteção contra fraudes.</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">Expiração de Sessão</span>
                  <span className="text-slate-400">Bloqueio automático após 8 horas de inatividade</span>
                </div>
                <span className="text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/30">Ativo</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">Registro de Auditoria Imutável</span>
                  <span className="text-slate-400">Histórico completo de postagens e pagamentos PIX</span>
                </div>
                <span className="text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/30">Ativo</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">Proteção Anti-Brute Force</span>
                  <span className="text-slate-400">Bloqueio temporário após 5 tentativas incorretas</span>
                </div>
                <span className="text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/30">Ativo</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-400" />
              <span>Linha do Tempo de Auditoria Administrativa</span>
            </h3>
            <button
              onClick={fetchData}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Atualizar
            </button>
          </div>

          <div className="space-y-2.5 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
            {auditLogs.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">Nenhum registro de auditoria registrado ainda.</p>
            ) : (
              auditLogs.map((log) => (
                <div 
                  key={log.id} 
                  className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs"
                >
                  <div className="flex items-start gap-3">
                    <span className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                      log.severity === 'success' ? 'bg-emerald-500/20 text-emerald-400' :
                      log.severity === 'warning' ? 'bg-amber-500/20 text-amber-400' :
                      log.severity === 'danger' ? 'bg-rose-500/20 text-rose-400' :
                      'bg-purple-500/20 text-purple-400'
                    }`}>
                      <Shield className="w-3.5 h-3.5" />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{log.title}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                          {log.adminName} ({log.adminRole})
                        </span>
                      </div>
                      <p className="text-slate-400 mt-0.5">{log.details}</p>
                    </div>
                  </div>

                  <span className="text-[11px] text-slate-500 shrink-0">
                    {new Date(log.timestamp).toLocaleString('pt-BR')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Add Admin Modal */}
      {isAddAdminOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-sm p-3 sm:p-5 flex justify-center items-center">
          <div className="relative w-full max-w-lg max-h-[92dvh] my-auto overflow-y-auto min-h-0 custom-scrollbar rounded-2xl sm:rounded-3xl bg-slate-900 border border-purple-500/40 shadow-2xl p-5 sm:p-7 text-slate-100">
            
            <button
              onClick={() => setIsAddAdminOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/30">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Cadastrar Administrador</h3>
                <p className="text-xs text-slate-400">Defina o nome, e-mail e nível de privilégio no sistema.</p>
              </div>
            </div>

            <form onSubmit={handleCreateAdmin} className="space-y-4">
              
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nome Completo</label>
                <input
                  type="text"
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  required
                  placeholder="Ex: Fernanda Lima"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">E-mail Corporativo</label>
                <input
                  type="email"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  required
                  placeholder="fernanda@freelahub.com"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Papel / Função</label>
                <select
                  value={newAdminRole}
                  onChange={(e) => handleRoleChange(e.target.value as AdminRole)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-purple-500 focus:outline-none"
                >
                  <option value="super_admin">Super Administrador (Acesso Total)</option>
                  <option value="job_manager">Gestor de Vagas (Postagem & Vagas)</option>
                  <option value="candidate_reviewer">Coordenação de Candidatos (Triagem)</option>
                  <option value="financial_operator">Operador Financeiro (PIX & Pagamentos)</option>
                </select>
              </div>

              {/* Permission checkboxes */}
              <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-purple-400 block mb-1">Permissões Específicas:</span>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newAdminPermissions.canPostJobs}
                      onChange={(e) => setNewAdminPermissions({ ...newAdminPermissions, canPostJobs: e.target.checked })}
                      className="rounded accent-purple-500"
                    />
                    <span>Postar Vagas</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newAdminPermissions.canEditJobs}
                      onChange={(e) => setNewAdminPermissions({ ...newAdminPermissions, canEditJobs: e.target.checked })}
                      className="rounded accent-purple-500"
                    />
                    <span>Editar Vagas</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newAdminPermissions.canManageApplicants}
                      onChange={(e) => setNewAdminPermissions({ ...newAdminPermissions, canManageApplicants: e.target.checked })}
                      className="rounded accent-purple-500"
                    />
                    <span>Triar Candidatos</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newAdminPermissions.canApprovePixPayments}
                      onChange={(e) => setNewAdminPermissions({ ...newAdminPermissions, canApprovePixPayments: e.target.checked })}
                      className="rounded accent-purple-500"
                    />
                    <span>Liquidação PIX</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddAdminOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold shadow-lg shadow-purple-600/20 transition cursor-pointer"
                >
                  {isSubmitting ? 'Cadastrando...' : 'Cadastrar Administrador'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Edit Admin Modal */}
      {editingAdmin && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-sm p-3 sm:p-5 flex justify-center items-center">
          <div className="relative w-full max-w-lg max-h-[92dvh] my-auto overflow-y-auto min-h-0 custom-scrollbar rounded-2xl sm:rounded-3xl bg-slate-900 border border-purple-500/40 shadow-2xl p-5 sm:p-7 text-slate-100">
            
            <button
              onClick={() => setEditingAdmin(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">Editar Permissões de Administrador</h3>
            <p className="text-xs text-slate-400 mb-4">{editingAdmin.name} ({editingAdmin.email})</p>

            <form onSubmit={handleUpdateAdmin} className="space-y-4">
              
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Papel / Nível</label>
                <select
                  value={editingAdmin.role}
                  onChange={(e) => setEditingAdmin({ ...editingAdmin, role: e.target.value as AdminRole })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-purple-500 focus:outline-none"
                >
                  <option value="super_admin">Super Administrador (Acesso Total)</option>
                  <option value="job_manager">Gestor de Vagas</option>
                  <option value="candidate_reviewer">Coordenação de Candidatos</option>
                  <option value="financial_operator">Operador Financeiro PIX</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Status da Conta</label>
                <select
                  value={editingAdmin.status}
                  onChange={(e) => setEditingAdmin({ ...editingAdmin, status: e.target.value as 'active' | 'blocked' })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-purple-500 focus:outline-none"
                >
                  <option value="active">🟢 Ativo (Acesso Liberado)</option>
                  <option value="blocked">🔴 Bloqueado (Acesso Negado)</option>
                </select>
              </div>

              <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-purple-400 block mb-1">Permissões Individuais:</span>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingAdmin.permissions.canPostJobs}
                      onChange={(e) => setEditingAdmin({
                        ...editingAdmin,
                        permissions: { ...editingAdmin.permissions, canPostJobs: e.target.checked }
                      })}
                      className="rounded accent-purple-500"
                    />
                    <span>Postar Vagas</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingAdmin.permissions.canManageApplicants}
                      onChange={(e) => setEditingAdmin({
                        ...editingAdmin,
                        permissions: { ...editingAdmin.permissions, canManageApplicants: e.target.checked }
                      })}
                      className="rounded accent-purple-500"
                    />
                    <span>Triar Candidatos</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingAdmin.permissions.canApprovePixPayments}
                      onChange={(e) => setEditingAdmin({
                        ...editingAdmin,
                        permissions: { ...editingAdmin.permissions, canApprovePixPayments: e.target.checked }
                      })}
                      className="rounded accent-purple-500"
                    />
                    <span>Liquidação PIX</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingAdmin.permissions.canManageAdmins}
                      onChange={(e) => setEditingAdmin({
                        ...editingAdmin,
                        permissions: { ...editingAdmin.permissions, canManageAdmins: e.target.checked }
                      })}
                      className="rounded accent-purple-500"
                    />
                    <span>Gerir Admins</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingAdmin(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold shadow-lg shadow-purple-600/20 transition cursor-pointer"
                >
                  {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-sm p-3 sm:p-5 flex justify-center items-center">
          <div className="relative w-full max-w-md max-h-[92dvh] my-auto overflow-y-auto min-h-0 custom-scrollbar rounded-2xl sm:rounded-3xl bg-slate-900 border border-amber-500/40 shadow-2xl p-5 sm:p-7 text-slate-100">
            
            <button
              onClick={() => setIsPasswordModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Alterar Senha Mestra</h3>
                <p className="text-xs text-slate-400">Atualize a senha de proteção do painel administrativo.</p>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Senha Atual</label>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                  placeholder="Senha atual (ex: admin123)"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nova Senha (Mínimo 6 dígitos)</label>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Nova senha segura"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Confirmar Nova Senha</label>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Repita a nova senha"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="hover:text-white flex items-center gap-1"
                >
                  {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showPass ? 'Ocultar Senhas' : 'Ver Senhas'}</span>
                </button>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-bold shadow-lg shadow-amber-500/20 transition cursor-pointer"
                >
                  {isSubmitting ? 'Atualizando...' : 'Salvar Nova Senha'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
