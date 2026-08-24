import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, AlertCircle, Phone, ArrowRight, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { FreelanceJob } from '../types';
import { formatCurrency, createWhatsAppLink } from '../utils/formatters';

interface ApplyModalProps {
  job: FreelanceJob | null;
  onClose: () => void;
  onSubmitApplication: (jobId: string, applicationData: {
    name: string;
    whatsapp: string;
    pixKey: string;
    pixType: 'cpf' | 'email' | 'phone' | 'random';
    experienceSummary: string;
  }) => Promise<void>;
}

export const ApplyModal: React.FC<ApplyModalProps> = ({
  job,
  onClose,
  onSubmitApplication
}) => {
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [pixType, setPixType] = useState<'cpf' | 'email' | 'phone' | 'random'>('cpf');
  const [pixKey, setPixKey] = useState('');
  const [experienceSummary, setExperienceSummary] = useState('');
  const [agreedDressCode, setAgreedDressCode] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successSubmitted, setSuccessSubmitted] = useState(false);

  if (!job) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !whatsapp || !pixKey) {
      alert('Por favor, preencha seu Nome, WhatsApp e Chave PIX.');
      return;
    }

    if (!agreedDressCode) {
      alert('Você precisa confirmar a conformidade com a vestimenta exigida.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmitApplication(job.id, {
        name,
        whatsapp,
        pixKey,
        pixType,
        experienceSummary: experienceSummary || 'Tenho total disponibilidade para o horário e função solicitada.'
      });

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });

      setSuccessSubmitted(true);
    } catch (err: any) {
      alert(`Erro ao enviar candidatura: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDirectWhatsApp = () => {
    const text = `Olá! Acabei de me candidatar no FreelaHub para a vaga de *${job.role}* para *${job.date}* (${job.startTime} às ${job.endTime}).\n\n👤 *Meu Nome:* ${name}\n📱 *WhatsApp:* ${whatsapp}\n💳 *Chave PIX:* ${pixKey} (${pixType.toUpperCase()})\n👔 *Vestimenta:* Confirmada de acordo com o anúncio.\n\nEstou à disposição para confirmação da vaga!`;
    window.open(createWhatsAppLink(job.contactPhone, text), '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-emerald-500/40 shadow-2xl p-6 text-slate-100 my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {successSubmitted ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <h3 className="text-2xl font-black text-white mb-2">
              Candidatura Enviada!
            </h3>
            <p className="text-sm text-slate-300 mb-6 max-w-sm mx-auto">
              Seus dados foram registrados com sucesso para a vaga de <strong className="text-emerald-400">{job.role}</strong> no valor de <strong className="text-emerald-400">{formatCurrency(job.cachet)}</strong>.
            </p>

            <div className="space-y-3">
              <button
                onClick={handleOpenDirectWhatsApp}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 font-black text-sm transition shadow-lg shadow-emerald-500/20"
              >
                <Phone className="w-4 h-4" />
                <span>Confirmar Vaga Direto no WhatsApp</span>
              </button>

              <button
                onClick={onClose}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition"
              >
                Voltar ao Mural de Vagas
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Candidatura Rápida FreelaHub</span>
            </div>
            <h2 className="text-2xl font-black text-white mb-1">
              Candidatar-se: {job.role}
            </h2>
            <p className="text-xs text-slate-400 mb-5">
              Cachê: <span className="text-emerald-400 font-bold">{formatCurrency(job.cachet)}</span> ({job.paymentDetails}) • {job.date}
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlos Eduardo da Silva"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    WhatsApp com DDD *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="(11) 98765-4321"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Tipo de Chave PIX *
                  </label>
                  <select
                    value={pixType}
                    onChange={(e: any) => setPixType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500"
                  >
                    <option value="cpf">CPF</option>
                    <option value="phone">Celular</option>
                    <option value="email">E-mail</option>
                    <option value="random">Chave Aleatória</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Chave PIX (para receber o pagamento) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Digite sua chave PIX exata"
                  value={pixKey}
                  onChange={(e) => setPixKey(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Experiência ou Observações (Opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Já trabalhei em eventos na região, tenho pontualidade e agilidade..."
                  value={experienceSummary}
                  onChange={(e) => setExperienceSummary(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500"
                ></textarea>
              </div>

              {/* Dress Code Notice */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                <div className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white">Exigência de Vestimenta:</span>
                    <p className="text-slate-300">{job.dressCode}</p>
                  </div>
                </div>
                
                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={agreedDressCode}
                    onChange={(e) => setAgreedDressCode(e.target.checked)}
                    className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-900"
                  />
                  <span className="text-slate-300 text-xs font-medium">
                    Declaro que tenho a vestimenta e chegarei 15 minutos antes.
                  </span>
                </label>
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-300 hover:to-green-400 text-slate-950 font-black text-sm shadow-md shadow-emerald-500/20 transition transform active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Registrando...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirmar Minha Candidatura</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        )}

      </div>
    </div>
  );
};
