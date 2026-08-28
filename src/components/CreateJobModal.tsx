import React, { useState, useEffect } from 'react';
import { X, Sparkles, Plus, Wand2, GraduationCap, Check } from 'lucide-react';
import { FreelanceJob, BrazilState, UserProfile, JobSector } from '../types';
import { getCertificationsForSector } from '../data/certificationsData';
import { BRAZIL_STATES, POPULAR_NEIGHBORHOODS_BY_CITY } from '../data/brazilLocations';
import { formatPhone, isValidPhone } from '../utils/formatters';

interface CreateJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile?: UserProfile | null;
  onJobCreated: (job: FreelanceJob) => void;
}

const COMMON_SKILLS_OPTIONS = [
  'Bandeja Alta',
  'Coquetelaria',
  'Carga Pesada 50kg+',
  'Limpeza Rápida',
  'Pontualidade',
  'Atendimento VIP',
  'Operador de Caixa & POS',
  'Abertura de Vinho',
  'Montagem de Palco / Áudio',
  'Inglês Básico'
];

export const CreateJobModal: React.FC<CreateJobModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onJobCreated
}) => {
  const [activeTab, setActiveTab] = useState<'ai' | 'manual'>('ai');
  const [rawWhatsAppText, setRawWhatsAppText] = useState(
`🚨 VAGA PARA HOJE (URGENTE/AGORA) 🚨

💼 Função: Bartender / Barman (2 vagas)
📅 Data: Hoje (24/08/2026)
⏰ Horário: Das 18h às 02h
💰 Cachê: R$ 220,00 (Pagamento ao final via PIX)
👕 Vestimenta: Camisa Social Preta + Calça Preta + Sapato Social
📍 Local: Espaço Vista Jardins, Alameda Santos, 1200 - Jardins, São Paulo - SP
🗺️ Traçar rota no Maps: https://www.google.com/maps/dir/?api=1&destination=Alameda+Santos,+1200
📞 Contato: (11) 98799-7872 (Chamar no privado)`
  );
  const [isParsing, setIsParsing] = useState(false);

  // Form states
  const [role, setRole] = useState('');
  const [category, setCategory] = useState<JobSector>('Eventos & Festas');
  
  // Locality: State, City, Neighborhood
  const [state, setState] = useState<BrazilState>(userProfile?.state || 'SP');
  const [city, setCity] = useState(userProfile?.city || 'São Paulo');
  const [neighborhood, setNeighborhood] = useState(userProfile?.neighborhood || 'Jardins');
  
  const [slotsTotal, setSlotsTotal] = useState<number>(1);
  const [date, setDate] = useState('Hoje (24/08/2026)');
  const [startTime, setStartTime] = useState('18:00');
  const [endTime, setEndTime] = useState('02:00');
  const [cachet, setCachet] = useState<number>(220);
  const [paymentDetails, setPaymentDetails] = useState('Pagamento ao final via PIX');
  const [benefits, setBenefits] = useState('Alimentação no local + Uber volta');
  const [dressCode, setDressCode] = useState('Roupa TODA PRETA social');
  const [locationName, setLocationName] = useState('');
  const [locationAddress, setLocationAddress] = useState('');
  const [contactPhone, setContactPhone] = useState(userProfile?.phone || '(11) 98799-7872');
  const [contactName, setContactName] = useState(userProfile?.companyName || userProfile?.name || 'Coordenação FreelaHub');
  const [isUrgent, setIsUrgent] = useState(true);
  const [desiredSkills, setDesiredSkills] = useState<string[]>(['Pontualidade', 'Coquetelaria']);
  const [requiredCertifications, setRequiredCertifications] = useState<string[]>([]);
  const [customCertInput, setCustomCertInput] = useState('');
  const [requirementsStr, setRequirementsStr] = useState('Chegar 15 minutos antes, Pontualidade');

  const [requiresMissionToUnlockContact, setRequiresMissionToUnlockContact] = useState(false);
  const [sponsorMissionUrl, setSponsorMissionUrl] = useState('https://www.tiktok.com/d/1/ZS9BMchsVwW1a-x3E0j/');
  const [genderRequirement, setGenderRequirement] = useState<'todos' | 'homens' | 'mulheres'>('todos');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const suggestedCerts = getCertificationsForSector(category);
  const selectedStateInfo = BRAZIL_STATES.find(s => s.uf === state);
  const citySuggestions = selectedStateInfo?.popularCities || ['São Paulo'];
  const neighborhoodSuggestions = POPULAR_NEIGHBORHOODS_BY_CITY[city] || ['Centro', 'Jardins', 'Vila Madalena', 'Santana'];

  useEffect(() => {
    if (userProfile) {
      if (userProfile.phone) setContactPhone(userProfile.phone);
      if (userProfile.companyName) setContactName(userProfile.companyName);
      else if (userProfile.name) setContactName(userProfile.name);
      if (userProfile.state) setState(userProfile.state);
      if (userProfile.city) setCity(userProfile.city);
      if (userProfile.neighborhood) setNeighborhood(userProfile.neighborhood);
    }
  }, [userProfile, isOpen]);

  if (!isOpen) return null;

  const toggleDesiredSkill = (skill: string) => {
    if (desiredSkills.includes(skill)) {
      setDesiredSkills(desiredSkills.filter(s => s !== skill));
    } else {
      setDesiredSkills([...desiredSkills, skill]);
    }
  };

  const toggleRequiredCert = (cert: string) => {
    if (requiredCertifications.includes(cert)) {
      setRequiredCertifications(requiredCertifications.filter(c => c !== cert));
    } else {
      setRequiredCertifications([...requiredCertifications, cert]);
    }
  };

  const handleAddCustomCert = () => {
    if (customCertInput.trim() && !requiredCertifications.includes(customCertInput.trim())) {
      setRequiredCertifications([...requiredCertifications, customCertInput.trim()]);
      setCustomCertInput('');
    }
  };

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
      if (parsed.state) setState(parsed.state);
      if (parsed.city) setCity(parsed.city);
      if (parsed.neighborhood) setNeighborhood(parsed.neighborhood);
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
      if (parsed.desiredSkills && Array.isArray(parsed.desiredSkills)) {
        setDesiredSkills(parsed.desiredSkills);
      }
      if (parsed.requirements && Array.isArray(parsed.requirements)) {
        setRequirementsStr(parsed.requirements.join(', '));
      }

      // Detect certifications from text
      const lower = rawWhatsAppText.toLowerCase();
      const detectedCerts: string[] = [];
      if (lower.includes('caixa') || lower.includes('fechamento') || lower.includes('tesouraria') || lower.includes('financeir')) {
        detectedCerts.push('Operador de Caixa & Fechamento Financeiro');
      }
      if (lower.includes('anvisa') || lower.includes('manipula') || lower.includes('alimento') || lower.includes('cozinha') || lower.includes('higiene')) {
        detectedCerts.push('Boas Práticas e Manipulação de Alimentos (RDC 216/ANVISA)');
      }
      if (lower.includes('nr11') || lower.includes('nr-11') || lower.includes('empilhadeira')) {
        detectedCerts.push('NR-11 - Operador de Empilhadeira e Transpaleteira Elétrica');
      }
      if (lower.includes('nr10') || lower.includes('nr-10') || lower.includes('elétric') || lower.includes('eletric')) {
        detectedCerts.push('NR-10 - Segurança em Instalações e Serviços em Eletricidade');
      }
      if (lower.includes('nr35') || lower.includes('nr-35') || lower.includes('altura') || lower.includes('truss')) {
        detectedCerts.push('NR-35 - Trabalho em Altura (Box Truss e Estruturas)');
      }
      if (detectedCerts.length > 0) {
        setRequiredCertifications(detectedCerts);
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
    if (!role || !cachet || !locationAddress || !contactPhone || !city || !neighborhood) {
      alert('Preencha os campos obrigatórios: Função, Cachê, Cidade, Bairro, Endereço e Contato.');
      return;
    }

    setIsSubmitting(true);
    try {
      const requirements = requirementsStr
        .split(',')
        .map(r => r.trim())
        .filter(Boolean);

      const payload = {
        title: `${role} - ${neighborhood}, ${city}`,
        role,
        category,
        state,
        city,
        neighborhood,
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
        googleMapsUrl: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent((locationName ? `${locationName}, ` : '') + locationAddress + `, ${neighborhood}, ${city} - ${state}`)}`,
        contactPhone,
        contactName,
        isUrgent,
        desiredSkills,
        requiredCertifications,
        status: 'open' as const,
        requirements,
        requiresMissionToUnlockContact,
        sponsorMissionUrl: requiresMissionToUnlockContact ? sponsorMissionUrl : undefined,
        genderRequirement
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-sm p-2 sm:p-4 flex justify-center items-start sm:items-center">
      <div className="relative w-full max-w-2xl my-2 sm:my-auto max-h-[calc(100dvh-1rem)] sm:max-h-[88vh] flex flex-col rounded-2xl sm:rounded-3xl bg-slate-900 border border-emerald-500/40 shadow-2xl p-4 sm:p-6 text-slate-100 overflow-y-auto min-h-0 custom-scrollbar">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-400 hover:text-white transition border border-slate-700/60 shadow-md"
          title="Fechar"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Header */}
        <div className="mb-4 sm:mb-5 pr-12">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Publicador de Vagas FreelaHub</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Criar e Divulgar Nova Vaga
          </h2>
          <p className="text-xs text-slate-400">
            Publique no mural com informações de localidade padronizadas (Estado, Cidade e Bairro).
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
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Cole o texto bruto da vaga (do WhatsApp ou Telegram):
              </label>
              <textarea
                rows={8}
                value={rawWhatsAppText}
                onChange={(e) => setRawWhatsAppText(e.target.value)}
                placeholder="Cole aqui a mensagem do grupo..."
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-emerald-300 font-mono text-xs focus:outline-none focus:border-emerald-400"
              />
            </div>

            <button
              type="button"
              disabled={isParsing}
              onClick={handleParseAi}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/20 transition transform active:scale-95 disabled:opacity-50"
            >
              <Wand2 className="w-4 h-4" />
              <span>{isParsing ? 'Estruturando Vaga com IA...' : 'Analisar e Preencher Automaticamente'}</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Locality: Estado, Cidade e Bairro */}
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5">
              <div className="text-xs font-bold text-cyan-400">
                📍 Localidade da Vaga (Estado, Cidade e Bairro)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Estado (UF) *
                  </label>
                  <select
                    value={state}
                    onChange={(e) => {
                      const newUf = e.target.value as BrazilState;
                      setState(newUf);
                      const stInfo = BRAZIL_STATES.find(s => s.uf === newUf);
                      if (stInfo && stInfo.popularCities[0]) {
                        setCity(stInfo.popularCities[0]);
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500 font-bold"
                  >
                    {BRAZIL_STATES.map(st => (
                      <option key={st.uf} value={st.uf}>{st.name} ({st.uf})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Cidade *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: São Paulo"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    list="job-cities-list"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                  <datalist id="job-cities-list">
                    {citySuggestions.map(c => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Bairro *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Jardins, Moema, Centro"
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    list="job-neighborhoods-list"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                  <datalist id="job-neighborhoods-list">
                    {neighborhoodSuggestions.map(n => (
                      <option key={n} value={n} />
                    ))}
                  </datalist>
                </div>
              </div>
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
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Setor / Categoria *
                </label>
                <select
                  value={category}
                  onChange={(e: any) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                >
                  <option value="Finanças & Caixa de Eventos">💰 Finanças & Caixa de Eventos (Certificações Requeridas)</option>
                  <option value="Eventos & Festas">🎉 Eventos & Festas</option>
                  <option value="Bares & Restaurantes">🍹 Bares & Restaurantes</option>
                  <option value="Logística & Cargas">📦 Logística & Cargas (NR-11)</option>
                  <option value="Limpeza & Serviços">🧹 Limpeza & Facilities (NR-06)</option>
                  <option value="Hotelaria & Recepção">🏨 Hotelaria & Recepção</option>
                  <option value="Segurança & Apoio">🛡️ Segurança & Apoio (NR-23 / APH)</option>
                  <option value="Audiovisual & Montagem">⚡ Audiovisual & Montagem (NR-10 / NR-35)</option>
                  <option value="Outros">🏷️ Outros</option>
                </select>
              </div>
            </div>

            {/* Cursos & Certificações Requeridas ou Recomendadas */}
            <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-amber-300">
                    Exigir Cursos Técnicos ou Certificações Específicas
                  </span>
                </div>
                {requiredCertifications.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/40">
                    {requiredCertifications.length} selecionada{requiredCertifications.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Candidatos com estes certificados ganham destaque no ranking de triagem da vaga:
              </p>

              {/* Suggestions for current category */}
              <div className="flex flex-wrap gap-1.5">
                {suggestedCerts.map(cert => {
                  const isSel = requiredCertifications.includes(cert.name);
                  return (
                    <button
                      type="button"
                      key={cert.id}
                      onClick={() => toggleRequiredCert(cert.name)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg transition border text-left flex items-center gap-1.5 ${
                        isSel
                          ? 'bg-amber-500/30 text-amber-200 border-amber-500 font-bold shadow-sm'
                          : 'bg-slate-900/90 text-slate-300 border-slate-700/80 hover:border-amber-500/40 hover:text-white'
                      }`}
                    >
                      <span>{isSel ? '🏅' : '📜'}</span>
                      <span>{cert.name}</span>
                      {isSel && <span className="text-amber-400 font-bold ml-0.5">✓</span>}
                    </button>
                  );
                })}
              </div>

              {/* Custom cert input */}
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Exigir outro curso/órgão emissor..."
                  value={customCertInput}
                  onChange={(e) => setCustomCertInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomCert(); } }}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                />
                <button
                  type="button"
                  onClick={handleAddCustomCert}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-xs font-black text-slate-950 transition"
                >
                  Adicionar
                </button>
              </div>
            </div>

            {/* Desired Skills */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Habilidades Técnicas Desejadas:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_SKILLS_OPTIONS.map(skill => {
                  const isSel = desiredSkills.includes(skill);
                  return (
                    <button
                      type="button"
                      key={skill}
                      onClick={() => toggleDesiredSkill(skill)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                        isSel
                          ? 'bg-emerald-500 text-slate-950 shadow-sm'
                          : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {isSel && <Check className="w-3 h-3" />}
                      <span>{skill}</span>
                    </button>
                  );
                })}
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
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
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
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
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
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
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
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500 font-bold text-emerald-400"
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
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Location Details */}
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
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Logradouro / Número *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Alameda Santos, 1200"
                  value={locationAddress}
                  onChange={(e) => setLocationAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
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
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
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
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-300">
                    Telefone / WhatsApp de Contato *
                  </label>
                  {contactPhone.trim() && (
                    <span className={`text-[10px] font-bold ${
                      isValidPhone(contactPhone) ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      {isValidPhone(contactPhone) ? '✓ DDD Válido' : 'DDD + 9 dígitos'}
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  required
                  maxLength={15}
                  placeholder="(11) 98799-7872"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(formatPhone(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
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
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Requisitos adicionais (separados por vírgula)
              </label>
              <input
                type="text"
                placeholder="Ex: Maior de 18 anos, Pontualidade, Experiência prévia"
                value={requirementsStr}
                onChange={(e) => setRequirementsStr(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Gender Requirement & Sponsor Mission Unlock */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Restrição de Perfil / Gênero (Operacional):
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setGenderRequirement('todos')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition ${
                      genderRequirement === 'todos'
                        ? 'bg-slate-700 text-white border border-slate-500'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    Qualquer Perfil
                  </button>
                  <button
                    type="button"
                    onClick={() => setGenderRequirement('homens')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 ${
                      genderRequirement === 'homens'
                        ? 'bg-sky-500 text-slate-950 font-black'
                        : 'bg-slate-900 text-sky-400 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    APENAS HOMENS
                  </button>
                  <button
                    type="button"
                    onClick={() => setGenderRequirement('mulheres')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 ${
                      genderRequirement === 'mulheres'
                        ? 'bg-pink-500 text-slate-950 font-black'
                        : 'bg-slate-900 text-pink-400 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    APENAS MULHERES
                  </button>
                </div>
              </div>

              {/* Sponsor Mission Unlock Toggle */}
              <div className="pt-2 border-t border-slate-800/80">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requiresMissionToUnlockContact}
                    onChange={(e) => setRequiresMissionToUnlockContact(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700 focus:ring-0"
                  />
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>🔒 Bloquear contato até completar Missão TikTok/Patrocinador</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Engajamento
                    </span>
                  </span>
                </label>

                {requiresMissionToUnlockContact && (
                  <div className="mt-2.5 space-y-1 pl-6">
                    <label className="block text-[11px] font-bold text-slate-400">
                      Link da Missão (Ex: TikTok do Patrocinador / Campanha):
                    </label>
                    <input
                      type="url"
                      value={sponsorMissionUrl}
                      onChange={(e) => setSponsorMissionUrl(e.target.value)}
                      placeholder="https://www.tiktok.com/d/1/ZS9BMchsVwW1a-x3E0j/"
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
                    />
                    <p className="text-[10px] text-slate-500">
                      O candidato precisará acessar este link para liberar o telefone de contato no privado.
                    </p>
                  </div>
                )}
              </div>
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
