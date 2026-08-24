import React, { useRef } from 'react';
import { X, CheckCircle2, Printer, Share2, Copy, ShieldCheck, Download, Building2, Calendar, Clock, DollarSign, User } from 'lucide-react';
import { FreelanceJob, JobApplicant } from '../types';
import { formatCurrency } from '../utils/formatters';

interface PixReceiptModalProps {
  job: FreelanceJob | null;
  applicant: JobApplicant | null;
  onClose: () => void;
}

export const PixReceiptModal: React.FC<PixReceiptModalProps> = ({
  job,
  applicant,
  onClose
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = React.useState(false);

  if (!job || !applicant) return null;

  const paidAmount = applicant.paidAmount || job.cachet;
  const transactionDate = applicant.paidAt 
    ? new Date(applicant.paidAt).toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' })
    : new Date().toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' });
  
  const authCode = `PIX-${(job.id || 'HUB').toUpperCase()}-${(applicant.id || 'APP').slice(-6).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const text = `🧾 *COMPROVANTE OFICIAL DE PAGAMENTO PIX - FREELAHUB BRASIL*\n\n` +
      `📌 *Autenticação:* ${authCode}\n` +
      `👤 *Favorecido:* ${applicant.name}\n` +
      `🔑 *Chave PIX:* ${applicant.pixKey} (${applicant.pixType.toUpperCase()})\n` +
      `💵 *Valor do Cachê:* ${formatCurrency(paidAmount)}\n` +
      `💼 *Vaga:* ${job.title} (${job.role})\n` +
      `📍 *Local:* ${job.locationName || job.locationAddress} - ${job.city}/${job.state}\n` +
      `📅 *Data do Evento:* ${job.date} (${job.startTime} às ${job.endTime})\n` +
      `✅ *Status:* LIQUIDADO E CONCLUÍDO VIA PIX\n` +
      `🕒 *Data/Hora da Liquidação:* ${transactionDate}\n\n` +
      `Plataforma FreelaHub Brasil - Trabalho e Pagamento Justo.`;
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-emerald-500/40 rounded-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Comprovante de Pagamento PIX</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Content Body */}
        <div ref={receiptRef} className="p-6 sm:p-8 space-y-6 bg-slate-900 text-slate-100 print:bg-white print:text-black">
          
          {/* Receipt Top Badge & Brand */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-950 border border-emerald-500/40 flex items-center justify-center overflow-hidden">
                <img 
                  src="/freelahub_logo.png" 
                  alt="FreelaHub" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <h4 className="text-lg font-black text-white tracking-tight">Freela<span className="text-emerald-400">Hub</span></h4>
                <p className="text-xs text-slate-400">Sistema Oficial de Desembolso de Cachês</p>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                PIX LIQUIDADO
              </span>
              <p className="text-[11px] text-slate-400 mt-1 font-mono">{authCode}</p>
            </div>
          </div>

          {/* Amount Display */}
          <div className="p-5 rounded-xl bg-slate-950/80 border border-emerald-500/30 text-center space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Valor Líquido Recebido</span>
            <div className="text-3xl sm:text-4xl font-black text-emerald-400">
              {formatCurrency(paidAmount)}
            </div>
            <p className="text-xs text-emerald-300/80 font-medium">100% repassado ao freelancer sem descontos de taxas</p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="text-slate-400 font-semibold flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span>Dados do Freelancer (Favorecido)</span>
              </div>
              <p className="font-bold text-white text-sm">{applicant.name}</p>
              <p className="text-slate-300 font-mono">Chave PIX: {applicant.pixKey}</p>
              <p className="text-slate-400">Tipo: {applicant.pixType.toUpperCase()}</p>
              {applicant.whatsapp && <p className="text-slate-400">WhatsApp: {applicant.whatsapp}</p>}
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="text-slate-400 font-semibold flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Serviço & Localidade</span>
              </div>
              <p className="font-bold text-white text-sm">{job.role}</p>
              <p className="text-slate-300">{job.title}</p>
              <p className="text-slate-400">📍 {job.neighborhood}, {job.city} - {job.state}</p>
              <p className="text-slate-400">🏢 {job.locationName || job.locationAddress}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="text-slate-400 font-semibold flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                <span>Turno & Data da Prestação</span>
              </div>
              <p className="font-bold text-white">Data: {job.date}</p>
              <p className="text-slate-300">Horário: {job.startTime} às {job.endTime}</p>
              <p className="text-slate-400">Setor: {job.category}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="text-slate-400 font-semibold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Autenticação & Registro</span>
              </div>
              <p className="font-bold text-white">Data/Hora: {transactionDate}</p>
              <p className="text-slate-300 font-mono">ID: {applicant.id}</p>
              <p className="text-emerald-400 font-semibold">Garantia FreelaHub Brasil</p>
            </div>

          </div>

          {/* Legal / Authenticity Note */}
          <div className="text-[11px] text-slate-400 text-center border-t border-slate-800 pt-4 leading-relaxed">
            Documento emitido eletronicamente pela plataforma FreelaHub. Este comprovante confirma o registro do repasse de cachê correspondente à prestação de serviços autônomos/freelance nos termos acordados.
          </div>

        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-slate-950 border-t border-slate-800">
          <button
            onClick={handleCopyText}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 transition"
          >
            <Copy className="w-4 h-4 text-emerald-400" />
            <span>{copied ? 'Copiado para WhatsApp!' : 'Copiar Resumo'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition"
            >
              Fechar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
