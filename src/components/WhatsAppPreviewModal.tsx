import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Share2, 
  Phone, 
  Users, 
  UserCheck, 
  MessageSquare, 
  Send, 
  ExternalLink,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { FreelanceJob } from '../types';
import { generateWhatsAppBroadcast } from '../../server/gemini';
import { cleanPhone, formatCurrency, createGoogleMapsDirectionsLink } from '../utils/formatters';

interface WhatsAppPreviewModalProps {
  job: FreelanceJob | null;
  onClose: () => void;
  defaultRecipientPhone?: string;
}

export const WhatsAppPreviewModal: React.FC<WhatsAppPreviewModalProps> = ({
  job,
  onClose,
  defaultRecipientPhone = ''
}) => {
  const [shareMode, setShareMode] = useState<'groups' | 'single_contact'>('groups');
  const [recipientPhone, setRecipientPhone] = useState(defaultRecipientPhone || job?.contactPhone || '');
  const [recipientName, setRecipientName] = useState('');
  const [customNote, setCustomNote] = useState('');
  const [copiedGroupText, setCopiedGroupText] = useState(false);
  const [copiedSingleText, setCopiedSingleText] = useState(false);
  const [copiedLinkOnly, setCopiedLinkOnly] = useState(false);

  if (!job) return null;

  // 1. Raw Message for BROADCAST TO MULTIPLE GROUPS
  const groupBroadcastMessage = generateWhatsAppBroadcast(job);

  const locationDisplay = `${job.neighborhood || ''}${job.neighborhood && job.city ? ', ' : ''}${job.city || ''} (${job.state || 'SP'})`;

  // 2. Formatted Message for SINGLE CONTACT (1 on 1)
  const recipientGreeting = recipientName.trim() ? `Olá, ${recipientName.trim()}!` : 'Olá!';
  const singleContactMessage = `${recipientGreeting} Tudo bem?

Vi esta vaga urgente no *FreelaHub* e lembrei de você:

💼 *${job.role}* (${job.category})
💰 Cachê: *${formatCurrency(job.cachet)}* (${job.paymentDetails})
📅 Data: *${job.date}* (Das ${job.startTime} às ${job.endTime})
📍 Local: ${job.locationName ? `${job.locationName} - ` : ''}${job.locationAddress} (${locationDisplay})
🗺️ Rota no Maps: ${job.googleMapsUrl || createGoogleMapsDirectionsLink(job.locationAddress, job.locationName)}
👕 Vestimenta: ${job.dressCode}
📞 Contato do Responsável: ${job.contactPhone} (${job.contactName || 'Coordenação'})

${customNote.trim() ? `💬 *Recado:* ${customNote.trim()}\n\n` : ''}Caso tenha interesse, responda rápido ou chame diretamente o coordenador da vaga!`;

  // WhatsApp Universal URL for multiple groups (No phone number -> opens group selector)
  const groupShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(groupBroadcastMessage)}`;

  // WhatsApp Direct URL for specific single contact (With phone number -> opens 1 on 1 chat)
  const cleanedDigits = cleanPhone(recipientPhone);
  const formattedRecipientDigits = cleanedDigits.startsWith('55') ? cleanedDigits : `55${cleanedDigits}`;
  const singleContactUrl = `https://wa.me/${formattedRecipientDigits}?text=${encodeURIComponent(singleContactMessage)}`;

  // Telegram Share URL
  const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(job.googleMapsUrl || 'https://freelahub.com.br')}&text=${encodeURIComponent(groupBroadcastMessage)}`;

  const handleCopyGroupText = () => {
    navigator.clipboard.writeText(groupBroadcastMessage);
    setCopiedGroupText(true);
    setTimeout(() => setCopiedGroupText(false), 2000);
  };

  const handleCopySingleText = () => {
    navigator.clipboard.writeText(singleContactMessage);
    setCopiedSingleText(true);
    setTimeout(() => setCopiedSingleText(false), 2000);
  };

  const handleCopyGroupLink = () => {
    navigator.clipboard.writeText(groupShareUrl);
    setCopiedLinkOnly(true);
    setTimeout(() => setCopiedLinkOnly(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Vaga FreelaHub: ${job.role}`,
          text: groupBroadcastMessage,
        });
      } catch (err) {
        // user cancelled or failed, fallback to whatsapp url
        window.open(groupShareUrl, '_blank');
      }
    } else {
      window.open(groupShareUrl, '_blank');
    }
  };

  const handleSendToSingleContact = () => {
    if (!cleanedDigits || cleanedDigits.length < 8) {
      alert('Por favor, informe um número de telefone com DDD válido.');
      return;
    }
    window.open(singleContactUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md p-2 sm:p-4 flex justify-center items-start sm:items-center">
      <div className="relative w-full max-w-2xl max-h-[calc(100dvh-1rem)] sm:max-h-[88vh] my-2 sm:my-auto overflow-y-auto min-h-0 custom-scrollbar rounded-2xl sm:rounded-3xl bg-slate-900 border border-emerald-500/50 shadow-2xl shadow-emerald-950/50 p-4 sm:p-6 md:p-8 text-slate-100 overscroll-contain">
        
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-400 hover:text-white transition border border-slate-700/60 shadow-md"
          title="Fechar"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#25D366] to-[#128C7E] flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Central de Compartilhamento
              </span>
              <span className="text-[11px] text-slate-400">WhatsApp & Redes</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Compartilhar Vaga: {job.role}
            </h2>
          </div>
        </div>

        <p className="text-xs text-slate-400 mb-5">
          Escolha se deseja realizar um <strong>disparo para múltiplos grupos</strong> ou enviar diretamente para o <strong>WhatsApp de um contato específico</strong>.
        </p>

        {/* Mode Selector Tabs (Groups vs Single Contact) */}
        <div className="grid grid-cols-2 gap-3 mb-6 p-1.5 bg-slate-950 rounded-2xl border border-slate-800">
          <button
            onClick={() => setShareMode('groups')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition ${
              shareMode === 'groups'
                ? 'bg-gradient-to-r from-[#25D366] to-[#128C7E] text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>1. Enviar para Vários Grupos</span>
          </button>

          <button
            onClick={() => setShareMode('single_contact')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition ${
              shareMode === 'single_contact'
                ? 'bg-gradient-to-r from-[#25D366] to-[#128C7E] text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>2. Enviar para 1 Contato Específico</span>
          </button>
        </div>

        {/* TAB 1: Enviar para Vários Grupos */}
        {shareMode === 'groups' && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-300 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong>Como funciona o envio para grupos:</strong> O link universal abre o WhatsApp diretamente na tela de seleção, permitindo marcar vários grupos e listas de transmissão de uma só vez.
              </div>
            </div>

            {/* Message Bubble Preview */}
            <div className="rounded-2xl bg-[#0b141a] border border-emerald-900/40 p-4 shadow-inner">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-emerald-950/80 text-[11px] text-emerald-400 font-mono">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  <span>Mensagem para Múltiplos Grupos</span>
                </span>
                <span className="text-slate-500 font-mono">Formatação Oficial FreelaHub</span>
              </div>

              <div className="max-h-56 overflow-y-auto rounded-xl bg-[#005c4b]/30 p-3.5 border border-[#005c4b]/40 text-slate-200 text-xs font-mono whitespace-pre-wrap leading-relaxed select-all">
                {groupBroadcastMessage}
              </div>
            </div>

            {/* Action Buttons for Groups */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleNativeShare}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:opacity-90 text-slate-950 font-black text-xs sm:text-sm transition shadow-lg"
              >
                <Share2 className="w-4 h-4 text-slate-950" />
                <span>Abrir Seletor de Grupos no WhatsApp</span>
              </button>

              <button
                onClick={handleCopyGroupText}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition border border-slate-700"
              >
                {copiedGroupText ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Texto Copiado com Sucesso!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copiar Texto Completo com Emojis</span>
                  </>
                )}
              </button>
            </div>

            {/* Extra Quick Share Options */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs text-slate-400 border-t border-slate-800">
              <button
                onClick={() => window.open(telegramShareUrl, '_blank')}
                className="hover:text-cyan-400 transition flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5 text-cyan-400" />
                <span>Compartilhar no Telegram</span>
              </button>

              <button
                onClick={handleCopyGroupLink}
                className="hover:text-emerald-400 transition flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{copiedLinkOnly ? 'Link Direto Copiado!' : 'Copiar Link de Disparo WhatsApp'}</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: Enviar para 1 Contato Específico */}
        {shareMode === 'single_contact' && (
          <div className="space-y-4">
            
            {/* Recipient Input Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Telefone / WhatsApp do Destinatário *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-emerald-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-bold focus:border-emerald-400 focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <button
                    type="button"
                    onClick={() => setRecipientPhone(job.contactPhone)}
                    className="text-[10px] text-emerald-400 hover:underline"
                  >
                    Usar telefone do coordenador da vaga ({job.contactPhone})
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Nome do Freelancer / Contato (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Matheus, Juliana..."
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-medium focus:border-emerald-400 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Recado Personalizado Adicional (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Segura essa vaga para nós, o cachê é no PIX hoje!"
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-medium focus:border-emerald-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Direct Message Bubble Preview */}
            <div className="rounded-2xl bg-[#0b141a] border border-emerald-900/40 p-4 shadow-inner">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-emerald-950/80 text-[11px] text-emerald-400 font-mono">
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Mensagem Direta 1 a 1 ({recipientPhone || 'Defina o número'})</span>
                </span>
                <span className="text-slate-500 font-mono">Link direto wa.me</span>
              </div>

              <div className="max-h-48 overflow-y-auto rounded-xl bg-[#005c4b]/30 p-3.5 border border-[#005c4b]/40 text-slate-200 text-xs font-mono whitespace-pre-wrap leading-relaxed select-all">
                {singleContactMessage}
              </div>
            </div>

            {/* Action Buttons for Single Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleSendToSingleContact}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:opacity-90 text-slate-950 font-black text-xs sm:text-sm transition shadow-lg"
              >
                <Send className="w-4 h-4 text-slate-950" />
                <span>Enviar no WhatsApp Privado</span>
              </button>

              <button
                onClick={handleCopySingleText}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition border border-slate-700"
              >
                {copiedSingleText ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Mensagem Direta Copiada!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copiar Mensagem 1 a 1</span>
                  </>
                )}
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
