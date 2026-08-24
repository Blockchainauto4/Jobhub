import React, { useState } from 'react';
import { X, Sparkles, Plus, AlertCircle, Wand2, MapPin, CheckCircle2, Copy } from 'lucide-react';
import { FreelanceJob } from '../types';

interface CreateJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJobCreated: (job: FreelanceJob) => void;
}

export const CreateJobModal: React.FC<CreateJobModalProps> = ({
  isOpen,
  onClose,
  onJobCreated
}) => {
  const [activeTab, setActiveTab] = useState<'ai' | 'manual'>('ai');
  const [rawWhatsAppText, setRawWhatsAppText] = useState(
`🚨 VAGA PARA HOJE (URGENTE/AGORA) 🚨

💼 Função: Limpeza (3 vagas)
📅 Data: Hoje (24/08/2026)
⏰ Horário: Das 13h às 22h
💰 Cachê: R$ 140,00 (Pagamento ao final via PIX)
👕 Vestimenta: Roupa TODA PRETA (sem detalhes ou rasgos) + tênis/sapato escuro e confortável
📍 Local: Rua Chile, 113 - Jardins, São Paulo - SP
🗺️ Traçar rota no Maps: https://www.google.com/maps/dir/?api=1&destination=Rua+Chile,+113+-+Jardim+Paulista,+Sao+Paulo
📞 Contato: (11) 98799-7872 (Chamar no privado)`
  );
  const [isParsing, setIsParsing] = useState(false);

  // Form states
  const [role, setRole] = useState('');
  const [category, setCategory] = useState<FreelanceJob['category']>('Eventos & Festas');
  const [slotsTotal, setSlotsTotal] = useState<number>(1);
  const [date, setDate] = useState('Hoje (24/08/2026)');
  const [startTime, setStartTime] = useState('13:00');
  const [endTime, setEndTime] = useState('22:00');
  const [cachet, setCachet] = useState<number>(140);
  const [paymentDetails, setPaymentDetails] = useState('Pagamento ao final via PIX');
  const [benefits, setBenefits] = useState('Alimentação no local');
  const [dressCode, setDressCode] = useState('Roupa TODA PRETA + sapato escuro e confortável');
  const [locationName, setLocationName] = useState('');
  const [locationAddress, setLocationAddress] = useState('');
  const [contactPhone, setContactPhone] = useState('(11) 98799-7872');
  const [contactName, setContactName] = useState('Coordenação FreelaHub');
  const [isUrgent, setIsUrgent] = useState(true);
  const [requirementsStr, setRequirementsStr] = useState('Chegar 15 minutos antes, Pontualidade');

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleParseAi = async () => {
    if (!rawWhatsAppText.trim()) {
      alert('Cole o texto da mensagem do WhatsApp primeiro.');
      return;
    }

    setIsParsing(true);
    try {
      const res = await fetch('/api/parse-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: rawWhatsAppText })
      });
      const parsed = await res.json();

      if (parsed.role) setRole(parsed.role);
      if (parsed.category) setCategory(parsed.category);
      if (parsed.slotsTotal) setSlotsTotal(parsed.slotsTotal);
      if (parsed.date) setDate(parsed.date);
      if (parsed.startTime) setStartTime(parsed.startTime);
      if (parsed.endTime) setEndTime(parsed.endTime);
      if (parsed.cachet) setCachet(parsed.cachet);
      if (parsed.paymentDetails) setPaymentDetails(parsed.paymentDetails);
      if (parsed.benefits) setBenefits(parsed.benefits);
      if (parsed.dressCode) setDressCode(parsed.dressCode);
      if (parsed.locationName) setLocationName(parsed.locationName);
      if (parsed.locationAddress) setLocationAddress(parsed.locationAddress);
      if (parsed.contactPhone) setContactPhone(parsed.contactPhone);
      if (parsed.contactName) setContactName(parsed.contactName);
      if (parsed.isUrgent !== undefined) setIsUrgent(parsed.isUrgent);
      if (parsed.requirements && Array.isArray(parsed.requirements)) {
        setRequirementsStr(parsed.requirements.join(', '));
      }

      setActiveTab('manual');
    } catch (e: any) {
      alert(`Falha ao analisar texto: ${e.message}`);
    } finally {
      setIsParsing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role || !cachet || !locationAddress || !contactPhone) {
      alert('Preencha os campos obrigatórios: Função, Cachê, Endereço e Contato.');
      return;
    }

    setIsSubmitting(true);
    try {
      const requirements = requirementsStr
        .split(',')
        .map(r => r.trim())
        .filter(Boolean);

      const payload = {
        title: `${role} - ${locationName || locationAddress.split(',')[0]}`,
        role,
        category,
        slotsTotal: Number(slotsTotal) || 1,
        slotsAvailable: Number(slotsTotal) || 1,
        date,
        startTime,
        endTime,
        cachet: Number(cachet),
        paymentDetails,
        benefits,
        dressCode,
        locationName,
        locationAddress,
        neighborhood: locationAddress.split('-')[1]?.trim() || 'São Paulo',
        city: 'São Paulo - SP',
        googleMapsUrl: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent((locationName ? `${locationName}, ` : '') + locationAddress)}`,
        contactPhone,
        contactName,
        isUrgent,
        status: 'open' as const,
        requirements
      };

      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error('Falha ao criar vaga no servidor');
      }

      const created = await res.json();
      onJobCreated(created);
      onClose();
    } catch (err: any) {
      alert(`Erro: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
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
        <div className="mb-5">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Publicador de Vagas FreelaHub</span>
          </div>
          <h2 className="text-2xl font-black text-white">
            Criar e Divulgar Nova Vaga
          </h2>
          <p className="text-xs text-slate-400">
            Publique no mural e gere mensagens formatadas para grupos de WhatsApp e Telegram.
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-950 border border-slate-800 mb-5">
          <button
            type="button"
            onClick={() => setActiveTab('ai')}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'ai'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Wand2 className="w-4 h-4" />
            <span>Colar do WhatsApp (IA)</span>
          </button>
          
          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'manual'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Preenchimento Estruturado</span>
          </button>
        </div>

        {/* AI Tab */}
        {activeTab === 'ai' ? (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-300 space-y-1">
              <span className="font-bold flex items-center gap-1.5 text-emerald-400">
                <Sparkles className="w-4 h-4" /> Extração Inteligente de Mensagem:
              </span>
              <p>
                Cole abaixo o texto de uma vaga de grupo do WhatsApp. O FreelaHub identificará função, horários, cachê PIX, vestimenta e rotas no Google Maps automaticamente!
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Texto bruto da vaga (WhatsApp):
              </label>
              <textarea
                rows={9}
                value={rawWhatsAppText}
                onChange={(e) => setRawWhatsAppText(e.target.value)}
                placeholder="Cole a mensagem aqui..."
                className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-emerald-500 leading-relaxed"
              ></textarea>
            </div>

            <button
              type="button"
              disabled={isParsing}
              onClick={handleParseAi}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-300 hover:to-green-400 text-slate-950 font-black text-sm transition shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              {isParsing ? (
                <span>Processando com IA...</span>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Analisar e Preencher Formulário</span>
                </>
              )}
            </button>
          </div>
        ) : (
          /* Manual Form */
          <form onSubmit={handleSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            
            {/* Urgent Switch */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xl">🚨</span>
                <div>
                  <div className="text-xs font-bold text-white">Vaga Urgente / Para Hoje?</div>
                  <div className="text-[11px] text-slate-400">Destaca com badge vermelho pulsante no topo</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isUrgent}
                onChange={(e) => setIsUrgent(e.target.checked)}
                className="w-5 h-5 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-900 cursor-pointer"
              />
            </div>

            {/* Role & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Função / Cargo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Limpeza, Carregador, Bartender"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Categoria *
                </label>
                <select
                  value={category}
                  onChange={(e: any) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500"
                >
                  <option value="Eventos & Festas">Eventos & Festas</option>
                  <option value="Bares & Restaurantes">Bares & Restaurantes</option>
                  <option value="Logística & Cargas">Logística & Cargas</option>
                  <option value="Limpeza & Serviços">Limpeza & Serviços</option>
                  <option value="Hotelaria & Recepção">Hotelaria & Recepção</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>
            </div>

            {/* Slots, Date & Times */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Nº de Vagas *
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  required
                  value={slotsTotal}
                  onChange={(e) => setSlotsTotal(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Horário Início *
                </label>
                <input
                  type="text"
                  placeholder="13:00"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Horário Término *
                </label>
                <input
                  type="text"
                  placeholder="22:00"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Cachet & Payment */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Valor do Cachê (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="140.00"
                  value={cachet}
                  onChange={(e) => setCachet(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Condição de Pagamento *
                </label>
                <input
                  type="text"
                  placeholder="Pagamento ao final via PIX / Acabou levou"
                  value={paymentDetails}
                  onChange={(e) => setPaymentDetails(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Nome do Local (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Usina Espaço A / Buffet Jardins"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Endereço Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Av. Alcides Sangirardi, S/N - Cidade Jardim, SP"
                  value={locationAddress}
                  onChange={(e) => setLocationAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Dress Code & Benefits */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Vestimenta Exigida *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Roupa TODA PRETA + tênis/sapato escuro"
                  value={dressCode}
                  onChange={(e) => setDressCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Benefícios (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Alimentação no local, VT Incluso"
                  value={benefits}
                  onChange={(e) => setBenefits(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Telefone / WhatsApp de Contato *
                </label>
                <input
                  type="text"
                  required
                  placeholder="(11) 98799-7872"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Nome do Contratante / Responsável
                </label>
                <input
                  type="text"
                  placeholder="Ex: Coordenação FreelaHub / Marcelo"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Requisitos (separados por vírgula)
              </label>
              <input
                type="text"
                placeholder="Ex: Maior de 18 anos, Pontualidade, Experiência prévia"
                value={requirementsStr}
                onChange={(e) => setRequirementsStr(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-300 hover:to-green-400 text-slate-950 font-black text-sm shadow-md shadow-emerald-500/20 transition transform active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? <span>Publicando...</span> : <span>Publicar no Mural FreelaHub</span>}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
