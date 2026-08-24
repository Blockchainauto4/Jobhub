import React, { useState, useEffect } from 'react';
import { X, Save, Sparkles, GraduationCap, Check, Trash2, MapPin } from 'lucide-react';
import { FreelanceJob, BrazilState, JobSector } from '../types';
import { getCertificationsForSector } from '../data/certificationsData';
import { BRAZIL_STATES, POPULAR_NEIGHBORHOODS_BY_CITY, BrazilStateInfo } from '../data/brazilLocations';

interface EditJobModalProps {
  isOpen: boolean;
  job: FreelanceJob | null;
  onClose: () => void;
  onJobUpdated: (job: FreelanceJob) => void;
  onDeleteJob?: (jobId: string) => void;
}

const CATEGORIES: JobSector[] = [
  'Eventos & Festas',
  'Bares & Restaurantes',
  'Finanças & Caixa de Eventos',
  'Logística & Cargas',
  'Limpeza & Serviços',
  'Limpeza & Facilities',
  'Hotelaria & Recepção',
  'Audiovisual & Montagem',
  'Segurança & Apoio',
  'Outros'
];

export const EditJobModal: React.FC<EditJobModalProps> = ({
  isOpen,
  job,
  onClose,
  onJobUpdated,
  onDeleteJob
}) => {
  const [title, setTitle] = useState('');
  const [role, setRole] = useState('');
  const [category, setCategory] = useState<JobSector>('Eventos & Festas');
  const [state, setState] = useState<BrazilState>('SP');
  const [city, setCity] = useState('São Paulo');
  const [neighborhood, setNeighborhood] = useState('Jardins');
  const [slotsTotal, setSlotsTotal] = useState(1);
  const [slotsAvailable, setSlotsAvailable] = useState(1);
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('18:00');
  const [endTime, setEndTime] = useState('02:00');
  const [cachet, setCachet] = useState(200);
  const [paymentDetails, setPaymentDetails] = useState('');
  const [benefits, setBenefits] = useState('');
  const [dressCode, setDressCode] = useState('');
  const [locationName, setLocationName] = useState('');
  const [locationAddress, setLocationAddress] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactName, setContactName] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [status, setStatus] = useState<'open' | 'filled' | 'in_progress' | 'completed' | 'cancelled'>('open');
  const [desiredSkills, setDesiredSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [requiredCertifications, setRequiredCertifications] = useState<string[]>([]);
  const [customCertInput, setCustomCertInput] = useState('');
  const [requirementsStr, setRequirementsStr] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (job) {
      setTitle(job.title || '');
      setRole(job.role || '');
      setCategory(job.category || 'Eventos & Festas');
      setState(job.state || 'SP');
      setCity(job.city || 'São Paulo');
      setNeighborhood(job.neighborhood || 'Centro');
      setSlotsTotal(job.slotsTotal || 1);
      setSlotsAvailable(job.slotsAvailable ?? 1);
      setDate(job.date || '');
      setStartTime(job.startTime || '18:00');
      setEndTime(job.endTime || '02:00');
      setCachet(job.cachet || 200);
      setPaymentDetails(job.paymentDetails || 'Pagamento via PIX ao final');
      setBenefits(job.benefits || '');
      setDressCode(job.dressCode || '');
      setLocationName(job.locationName || '');
      setLocationAddress(job.locationAddress || '');
      setContactPhone(job.contactPhone || '');
      setContactName(job.contactName || '');
      setIsUrgent(Boolean(job.isUrgent));
      setStatus(job.status || 'open');
      setDesiredSkills(job.desiredSkills || []);
      setRequiredCertifications(job.requiredCertifications || []);
      setRequirementsStr(job.requirements?.join(', ') || '');
    }
  }, [job]);

  if (!isOpen || !job) return null;

  const selectedStateInfo = BRAZIL_STATES.find(s => s.uf === state);
  const citySuggestions = selectedStateInfo?.popularCities || ['São Paulo'];
  const neighborhoodSuggestions = POPULAR_NEIGHBORHOODS_BY_CITY[city] || ['Centro', 'Jardins', 'Vila Madalena', 'Santana'];
  const suggestedCerts = getCertificationsForSector(category);

  const handleAddSkill = () => {
    if (skillInput.trim() && !desiredSkills.includes(skillInput.trim())) {
      setDesiredSkills([...desiredSkills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (sk: string) => {
    setDesiredSkills(desiredSkills.filter(s => s !== sk));
  };

  const toggleCert = (certName: string) => {
    if (requiredCertifications.includes(certName)) {
      setRequiredCertifications(requiredCertifications.filter(c => c !== certName));
    } else {
      setRequiredCertifications([...requiredCertifications, certName]);
    }
  };

  const handleAddCustomCert = () => {
    if (customCertInput.trim() && !requiredCertifications.includes(customCertInput.trim())) {
      setRequiredCertifications([...requiredCertifications, customCertInput.trim()]);
      setCustomCertInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const reqList = requirementsStr
        .split(',')
        .map(r => r.trim())
        .filter(Boolean);

      const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(locationAddress || `${neighborhood}, ${city}`)}`;

      const payload = {
        title: title || `${role} - ${neighborhood}, ${city}`,
        role,
        category,
        state,
        city,
        neighborhood,
        slotsTotal: Number(slotsTotal),
        slotsAvailable: Number(slotsAvailable),
        date,
        startTime,
        endTime,
        cachet: Number(cachet),
        paymentDetails,
        benefits,
        dressCode,
        locationName,
        locationAddress,
        googleMapsUrl: mapsUrl,
        contactPhone,
        contactName,
        isUrgent,
        status,
        desiredSkills,
        requiredCertifications,
        requirements: reqList.length > 0 ? reqList : ['Pontualidade e responsabilidade']
      };

      const res = await fetch(`/api/jobs/${job.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erro ao atualizar vaga');
      }

      const updated = await res.json();
      onJobUpdated(updated);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Falha ao salvar vaga');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-white">Editar Vaga Freelancer (Admin)</h3>
              <p className="text-xs text-slate-400 font-mono">ID: {job.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* Status & Urgency Quick Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Status da Vaga</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-bold focus:outline-none focus:border-emerald-500"
              >
                <option value="open">🟢 Aberta (Recebendo)</option>
                <option value="filled">🟡 Preenchida / Vagas Esgotadas</option>
                <option value="in_progress">🔵 Em Andamento</option>
                <option value="completed">🏁 Concluída</option>
                <option value="cancelled">🔴 Cancelada / Pausada</option>
              </select>
            </div>

            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-xs font-semibold text-slate-300">🚨 Vaga Urgente (Hoje)</span>
              <input
                type="checkbox"
                checked={isUrgent}
                onChange={(e) => setIsUrgent(e.target.checked)}
                className="w-4 h-4 rounded text-rose-500 focus:ring-rose-500 bg-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-slate-400">Total Vagas</label>
                <input
                  type="number"
                  min="1"
                  value={slotsTotal}
                  onChange={(e) => setSlotsTotal(Number(e.target.value))}
                  className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white text-center font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400">Disponíveis</label>
                <input
                  type="number"
                  min="0"
                  max={slotsTotal}
                  value={slotsAvailable}
                  onChange={(e) => setSlotsAvailable(Number(e.target.value))}
                  className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white text-center font-bold"
                />
              </div>
            </div>
          </div>

          {/* Title & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Título Público da Vaga</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Bartender Coquetelaria - Jardins"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Função / Cargo</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Ex: Garçom VIP, Operador de Caixa"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          {/* Category, Date & Times */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Categoria / Setor</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as JobSector)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Data</label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="Ex: 24/08/2026"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Início</label>
              <input
                type="text"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="18:00"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs text-center focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Término</label>
              <input
                type="text"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                placeholder="02:00"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs text-center focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          {/* Cachê & Pagamento */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Valor do Cachê (R$)</label>
              <input
                type="number"
                value={cachet}
                onChange={(e) => setCachet(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-emerald-500/40 text-emerald-400 font-bold text-sm focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Detalhes do Pagamento PIX</label>
              <input
                type="text"
                value={paymentDetails}
                onChange={(e) => setPaymentDetails(e.target.value)}
                placeholder="Ex: Pagamento ao final via PIX na hora"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Localidade: Estado, Cidade, Bairro, Endereço */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <MapPin className="w-4 h-4" />
              <span>Localização Geográfica (Estado, Cidade, Bairro)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Estado (UF)</label>
                <select
                  value={state}
                  onChange={(e) => {
                    const newUf = e.target.value as BrazilState;
                    setState(newUf);
                    const stateObj = BRAZIL_STATES.find(s => s.uf === newUf);
                    if (stateObj && stateObj.popularCities.length > 0) {
                      setCity(stateObj.popularCities[0]);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white font-semibold focus:outline-none focus:border-emerald-500"
                >
                  {BRAZIL_STATES.map((s: BrazilStateInfo) => (
                    <option key={s.uf} value={s.uf}>{s.name} ({s.uf})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Cidade</label>
                <input
                  type="text"
                  list="edit-city-options"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                <datalist id="edit-city-options">
                  {citySuggestions.map((c: string) => <option key={c} value={c} />)}
                </datalist>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Bairro</label>
                <input
                  type="text"
                  list="edit-neighborhood-options"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                <datalist id="edit-neighborhood-options">
                  {neighborhoodSuggestions.map((n: string) => <option key={n} value={n} />)}
                </datalist>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Nome do Local (Espaço/Buffet/Empresa)</label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="Ex: Villa Bisutti / Espaço Gardens"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Endereço Completo</label>
                <input
                  type="text"
                  value={locationAddress}
                  onChange={(e) => setLocationAddress(e.target.value)}
                  placeholder="Ex: Rua Gomes de Carvalho, 1000 - Vila Olímpia"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Vestimenta & Benefícios */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Código de Vestimenta (Dress Code)</label>
              <input
                type="text"
                value={dressCode}
                onChange={(e) => setDressCode(e.target.value)}
                placeholder="Ex: Roupa TODA PRETA social sem detalhes"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Benefícios / Apoio</label>
              <input
                type="text"
                value={benefits}
                onChange={(e) => setBenefits(e.target.value)}
                placeholder="Ex: Alimentação no local + Uber volta"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Contato do Contratante */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Nome do Contratante/Coordenação</label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Ex: Maitre Juliana / Coordenação"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">WhatsApp / Telefone de Contato</label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="Ex: (11) 98799-7872"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Habilidades Desejadas */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">Habilidades Desejadas</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); } }}
                placeholder="Digitar habilidade e pressionar Enter (Ex: Bandeja Alta, Sangria)"
                className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition"
              >
                Adicionar
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {desiredSkills.map(sk => (
                <span
                  key={sk}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold"
                >
                  <span>{sk}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(sk)}
                    className="hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Cursos & Certificações Técnicas Obrigatórias */}
          <div className="space-y-2 p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
              <GraduationCap className="w-4 h-4 text-amber-400" />
              <span>Cursos & Certificações Técnicas Requeridas</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {suggestedCerts.map(cert => {
                const isSelected = requiredCertifications.includes(cert.name);
                return (
                  <button
                    key={cert.id}
                    type="button"
                    onClick={() => toggleCert(cert.name)}
                    className={`flex items-start gap-2 p-2 rounded-lg text-left text-xs transition border ${
                      isSelected
                        ? 'bg-amber-950/80 border-amber-400 text-amber-200 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected ? 'bg-amber-500 text-slate-950 font-bold' : 'border border-slate-700'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </span>
                    <div>
                      <p className="font-semibold leading-snug">{cert.name}</p>
                      <p className="text-[10px] opacity-75">{cert.issuingEntity}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2 pt-2">
              <input
                type="text"
                value={customCertInput}
                onChange={(e) => setCustomCertInput(e.target.value)}
                placeholder="Outro curso ou certificação personalizada..."
                className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={handleAddCustomCert}
                className="px-3 py-1.5 rounded-lg bg-amber-900/60 hover:bg-amber-800 border border-amber-500/40 text-xs font-bold text-amber-300 transition"
              >
                + Incluir
              </button>
            </div>
          </div>

          {/* Requisitos Gerais */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Requisitos Específicos (separados por vírgula)</label>
            <textarea
              value={requirementsStr}
              onChange={(e) => setRequirementsStr(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
            {onDeleteJob && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Tem certeza que deseja excluir a vaga "${job.title}"? Esta ação não pode ser desfeita.`)) {
                    onDeleteJob(job.id);
                    onClose();
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-300 text-xs font-bold transition"
              >
                <Trash2 className="w-4 h-4" />
                <span>Excluir Vaga</span>
              </button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition shadow-lg shadow-emerald-500/20 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Salvando...' : 'Salvar Alterações'}</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
