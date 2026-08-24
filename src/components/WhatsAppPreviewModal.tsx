import React, { useState } from 'react';
import { X, Copy, Check, Share2, Phone, Sparkles } from 'lucide-react';
import { FreelanceJob } from '../types';
import { generateWhatsAppBroadcast } from '../../server/gemini';

interface WhatsAppPreviewModalProps {
  job: FreelanceJob | null;
  onClose: () => void;
}

export const WhatsAppPreviewModal: React.FC<WhatsAppPreviewModalProps> = ({
  job,
  onClose
}) => {
  const [copied, setCopied] = useState(false);

  if (!job) return null;

  const rawMessage = generateWhatsAppBroadcast(job);

  const handleCopy = () => {
    navigator.clipboard.writeText(rawMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareToWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(rawMessage)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-emerald-500/40 shadow-2xl p-6 text-slate-100">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
          <Share2 className="w-4 h-4" />
          <span>Disparo para WhatsApp & Grupos</span>
        </div>
        <h3 className="text-2xl font-black text-white mb-1">
          Mensagem Formatada FreelaHub
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Pronta com emojis, rotas no Google Maps e informações completas para colar diretamente em grupos.
        </p>

        {/* WhatsApp Preview Bubble */}
        <div className="rounded-2xl bg-[#0b141a] border border-emerald-900/40 p-4 shadow-inner mb-5">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-emerald-950/80 text-[11px] text-emerald-400 font-mono">
            <span>WhatsApp Message Preview</span>
            <span className="text-slate-500">Hoje às {job.startTime}</span>
          </div>

          <div className="rounded-xl bg-[#005c4b]/30 p-3.5 border border-[#005c4b]/40 text-slate-200 text-xs font-mono whitespace-pre-wrap leading-relaxed select-all">
            {rawMessage}
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-2.5">
          <button
            onClick={handleShareToWhatsApp}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:opacity-90 text-slate-950 font-black text-sm transition shadow-lg"
          >
            <Share2 className="w-4 h-4 text-slate-950" />
            <span>Abrir e Compartilhar no WhatsApp</span>
          </button>

          <button
            onClick={handleCopy}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition border border-slate-700"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Copiado para a Área de Transferência!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copiar Texto Formatado</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
