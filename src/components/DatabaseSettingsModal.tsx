import React, { useState, useEffect } from 'react';
import { X, Database, Check, Copy, RefreshCw, Server, ShieldCheck, Download, Code } from 'lucide-react';
import { DbStatusInfo } from '../types';

interface DatabaseSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDbReset: () => Promise<void>;
}

export const DatabaseSettingsModal: React.FC<DatabaseSettingsModalProps> = ({
  isOpen,
  onClose,
  onDbReset
}) => {
  const [dbInfo, setDbInfo] = useState<DbStatusInfo | null>(null);
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/db-status')
        .then(res => res.json())
        .then(data => setDbInfo(data))
        .catch(err => console.error('Failed to fetch db status:', err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopySchema = () => {
    if (dbInfo?.sampleSqlSchema) {
      navigator.clipboard.writeText(dbInfo.sampleSqlSchema);
      setCopiedSchema(true);
      setTimeout(() => setCopiedSchema(false), 2000);
    }
  };

  const handleReset = async () => {
    if (confirm('Deseja recarregar as vagas e candidatos de demonstração oficiais do FreelaHub?')) {
      setIsResetting(true);
      try {
        await onDbReset();
        alert('Banco recarregado com sucesso com as vagas oficiais!');
        onClose();
      } catch (err: any) {
        alert(`Erro: ${err.message}`);
      } finally {
        setIsResetting(false);
      }
    }
  };

  const handleDownloadBackup = () => {
    fetch('/api/jobs')
      .then(res => res.json())
      .then(jobs => {
        const blob = new Blob([JSON.stringify(jobs, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `freelahub_backup_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
      });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-emerald-500/40 shadow-2xl p-6 text-slate-100 my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
          <Database className="w-4 h-4" />
          <span>Arquitetura de Dados & Cloud Database</span>
        </div>
        <h2 className="text-2xl font-black text-white mb-2">
          Integração Neon DB / PostgreSQL / Vercel
        </h2>
        <p className="text-xs text-slate-400 mb-6">
          O FreelaHub suporta armazenamento em nuvem PostgreSQL Serverless (Neon DB) na Vercel e persistência local garantida.
        </p>

        {/* Engine Status Card */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 mb-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5 text-emerald-400" />
              <div>
                <span className="text-xs text-slate-400 font-medium">Motor de Banco de Dados Ativo:</span>
                <div className="text-sm font-bold text-white">
                  {dbInfo?.engine === 'neon_postgres' ? '🟢 Neon PostgreSQL Conectado' : '⚡ Armazenamento JSON Persistente + Pronto para Neon DB'}
                </div>
              </div>
            </div>
            <div className="text-right text-xs">
              <span className="text-slate-400">Total Vagas: </span>
              <strong className="text-emerald-400">{dbInfo?.totalJobs ?? 5}</strong>
            </div>
          </div>

          <div className="text-xs text-slate-400 leading-relaxed pt-2 border-t border-slate-800/80">
            {dbInfo?.databaseUrlConfigured ? (
              <span className="text-emerald-400 font-semibold">
                ✓ Conexão via DATABASE_URL estabelecida com sucesso.
              </span>
            ) : (
              <span>
                Para conectar seu banco remoto Neon em produção, basta definir a variável de ambiente <code className="bg-slate-900 px-1.5 py-0.5 rounded text-emerald-300 font-mono">DATABASE_URL</code> no painel da Vercel ou no arquivo <code className="bg-slate-900 px-1.5 py-0.5 rounded text-emerald-300 font-mono">.env</code>.
              </span>
            )}
          </div>
        </div>

        {/* SQL Schema DDL */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Code className="w-4 h-4 text-emerald-400" />
              <span>Script SQL DDL (Neon / PostgreSQL / Vercel Postgres)</span>
            </label>
            <button
              onClick={handleCopySchema}
              className="flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition"
            >
              {copiedSchema ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSchema ? 'Copiado!' : 'Copiar SQL'}</span>
            </button>
          </div>

          <div className="rounded-xl bg-slate-950 border border-slate-800 p-3.5 max-h-48 overflow-y-auto font-mono text-[11px] text-emerald-300 select-all leading-relaxed">
            {dbInfo?.sampleSqlSchema || 'Carregando schema...'}
          </div>
        </div>

        {/* Deployment Steps Guide */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2.5 mb-6">
          <div className="font-bold text-white flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Como publicar na Vercel com Neon DB:
          </div>
          <ol className="list-decimal list-inside space-y-1 text-slate-400">
            <li>Acesse <strong>neon.tech</strong> e crie um projeto Serverless PostgreSQL gratuito.</li>
            <li>No SQL Editor do Neon, cole e execute o script SQL acima.</li>
            <li>Copie sua Connection String (<code className="text-emerald-300">postgres://...</code>).</li>
            <li>No painel da <strong>Vercel</strong>, adicione a variável de ambiente <strong>DATABASE_URL</strong>.</li>
            <li>Pronto! Todas as vagas e candidaturas serão persistidas em tempo real.</li>
          </ol>
        </div>

        {/* Actions row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800">
          <button
            onClick={handleDownloadBackup}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
          >
            <Download className="w-4 h-4" />
            <span>Baixar Backup JSON</span>
          </button>

          <button
            onClick={handleReset}
            disabled={isResetting}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-950 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition"
          >
            <RefreshCw className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} />
            <span>Restaurar Vagas Oficiais FreelaHub</span>
          </button>
        </div>

      </div>
    </div>
  );
};
