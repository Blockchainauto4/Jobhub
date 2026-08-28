import React, { useState } from 'react';
import { X, CheckCircle2, Phone, ArrowRight, Tag, Plus, Check, GraduationCap, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { FreelanceJob, BrazilState, UserProfile } from '../types';
import { 
  formatCurrency, 
  createWhatsAppLink, 
  formatPhone, 
  isValidPhone, 
  formatPixKey, 
  validatePixKey, 
  validateName 
} from '../utils/formatters';
import { BRAZIL_STATES, POPULAR_NEIGHBORHOODS_BY_CITY } from '../data/brazilLocations';

interface ApplyModalProps {
  job: FreelanceJob | null;
  onClose: () => void;
  userProfile?: UserProfile | null;
  onSubmitApplication: (jobId: string, applicationData: {
    name: string;
    whatsapp: string;
    pixKey: string;
    pixType: 'cpf' | 'email' | 'phone' | 'random';
    experienceSummary: string;
    skills?: string[];
    certifications?: string[];
    equipmentOwned?: string[];
    state?: BrazilState;
    city?: string;
    neighborhood?: string;
  }) => Promise<void>;
}

const COMMON_SKILLS_POOL = [
  'Pontualidade & Compromisso',
  'Bandeja Alta & Salão',
  'Coquetelaria & Bar',
  'Operador de Caixa & Sangria',
  'Higienização & Limpeza Rápida',
  'Carga Pesada 50kg+',
  'Atendimento VIP',
  'Auxiliar de Chapa / Grelha',
  'Inglês Básico',
  'Montagem de Palco / DMX',
  'Abertura de Vinhos'
];

export const ApplyModal: React.FC<ApplyModalProps> = ({
  job,
  onClose,
  userProfile,
  onSubmitApplication
}) => {
  const [name, setName] = useState(userProfile?.name || '');
  const [whatsapp, setWhatsapp] = useState(formatPhone(userProfile?.phone || ''));
  const [pixType, setPixType] = useState<'cpf' | 'email' | 'phone' | 'random'>(userProfile?.pixType || 'phone');
  const [pixKey, setPixKey] = useState(userProfile?.pixKey ? formatPixKey(userProfile.pixKey, userProfile.pixType || 'phone') : (userProfile?.phone ? formatPhone(userProfile.phone) : ''));
  
  // Locality: State, City, Neighborhood
  const [state, setState] = useState<BrazilState>(userProfile?.state || job?.state || 'SP');
  const [city, setCity] = useState<string>(userProfile?.city || job?.city || 'São Paulo');
  const [neighborhood, setNeighborhood] = useState<string>(userProfile?.neighborhood || job?.neighborhood || 'Centro');
  
  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    userProfile?.skills && userProfile.skills.length > 0 
      ? userProfile.skills 
      : ['Pontualidade & Compromisso', job?.role ? `Especialista em ${job.role}` : 'Experiência em Eventos']
  );
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [selectedCertifications, setSelectedCertifications] = useState<string[]>(
    userProfile?.certifications || []
  );
  const [customCertInput, setCustomCertInput] = useState('');
  const [experienceSummary, setExperienceSummary] = useState(userProfile?.bio || '');
  const [agreedDressCode, setAgreedDressCode] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successSubmitted, setSuccessSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const selectedStateInfo = BRAZIL_STATES.find(s => s.uf === state);
  const citySuggestions = selectedStateInfo?.popularCities || ['São Paulo'];
  const neighborhoodSuggestions = POPULAR_NEIGHBORHOODS_BY_CITY[city] || ['Centro', 'Jardins', 'Vila Madalena', 'Santana'];

  // Sync when userProfile or job changes
  React.useEffect(() => {
    if (userProfile) {
      if (userProfile.name) setName(userProfile.name);
      if (userProfile.phone) setWhatsapp(formatPhone(userProfile.phone));
      if (userProfile.pixType) setPixType(userProfile.pixType);
      if (userProfile.pixKey) setPixKey(formatPixKey(userProfile.pixKey, userProfile.pixType || 'phone'));
      else if (userProfile.phone) setPixKey(formatPhone(userProfile.phone));
      if (userProfile.state) setState(userProfile.state);
      if (userProfile.city) setCity(userProfile.city);
      if (userProfile.neighborhood) setNeighborhood(userProfile.neighborhood);
      if (userProfile.skills && userProfile.skills.length > 0) setSelectedSkills(userProfile.skills);
      if (userProfile.certifications) setSelectedCertifications(userProfile.certifications);
      if (userProfile.bio) setExperienceSummary(userProfile.bio);
    }
  }, [userProfile, job]);

  if (!job) return null;

  const isNameValid = validateName(name).isValid;
  const isWhatsappValid = isValidPhone(whatsapp);
  const isPixValid = validatePixKey(pixKey, pixType).isValid;
  const pixValidationMsg = validatePixKey(pixKey, pixType).message;

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleAddCustomSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if (customSkillInput.trim() && !selectedSkills.includes(customSkillInput.trim())) {
      setSelectedSkills([...selectedSkills, customSkillInput.trim()]);
      setCustomSkillInput('');
    }
  };

  const toggleCert = (cert: string) => {
    if (selectedCertifications.includes(cert)) {
      setSelectedCertifications(selectedCertifications.filter(c => c !== cert));
    } else {
      setSelectedCertifications([...selectedCertifications, cert]);
    }
  };

  const handleAddCustomCert = (e: React.KeyboardEvent | React.MouseEvent) => {
    if (customCertInput.trim() && !selectedCertifications.includes(customCertInput.trim())) {
      setSelectedCertifications([...selectedCertifications, customCertInput.trim()]);
      setCustomCertInput('');
    }
  };

  const handleWhatsappChange = (val: string) => {
    const formatted = formatPhone(val);
    setWhatsapp(formatted);
    setFormError(null);
    if (pixType === 'phone' && (!pixKey || pixKey === whatsapp)) {
      setPixKey(formatted);
    }
  };

  const handlePixKeyChange = (val: string) => {
    const formatted = formatPixKey(val, pixType);
    setPixKey(formatted);
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!isNameValid) {
      setFormError('Por favor, informe seu Nome Completo (mínimo 3 caracteres).');
      return;
    }

    if (!isWhatsappValid) {
      setFormError('WhatsApp inválido. Digite DDD + 9 dígitos (ex: (11) 98765-4321).');
      return;
    }

    if (!isPixValid) {
      setFormError(`Chave PIX inválida: ${pixValidationMsg}`);
      return;
    }

    if (!city.trim() || !neighborhood.trim()) {
      setFormError('Por favor, informe sua Cidade e Bairro.');
      return;
    }

    if (!agreedDressCode) {
      setFormError('Você precisa confirmar a conformidade com a vestimenta exigida.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmitApplication(job.id, {
        name: name.trim(),
        whatsapp: whatsapp.trim(),
        pixKey: pixKey.trim(),
        pixType,
        state,
        city: city.trim(),
        neighborhood: neighborhood.trim(),
        skills: selectedSkills,
        certifications: selectedCertifications,
        experienceSummary: experienceSummary || 'Tenho total disponibilidade para o horário e função solicitada.'
      });

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });

      setSuccessSubmitted(true);
    } catch (err: any) {
      setFormError(`Erro ao enviar candidatura: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const whatsappMessage = `Olá! Me candidatei no FreelaHub para a vaga de *${job.role}* do dia *${job.date}* (${job.startTime} às ${job.endTime}).\n\nNome: ${name}\nLocalidade: ${neighborhood}, ${city} - ${state}\nPIX cadastrado: ${pixKey} (${pixType.toUpperCase()})\n\nEstou confirmado e pronto com a vestimenta (${job.dressCode})!`;
  const whatsappUrl = createWhatsAppLink(job.contactPhone, whatsappMessage);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-sm p-2 sm:p-4 flex justify-center items-start sm:items-center">
      <div className="relative w-full max-w-lg my-2 sm:my-auto max-h-[calc(100dvh-1rem)] sm:max-h-[88vh] flex flex-col rounded-2xl sm:rounded-3xl bg-slate-900 border border-emerald-500/40 shadow-2xl text-slate-100 overflow-hidden">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-400 hover:text-white transition border border-slate-700/60 shadow-md"
          title="Fechar"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {successSubmitted ? (
          <div className="text-center p-5 sm:p-7 space-y-4 overflow-y-auto min-h-0 flex-1 custom-scrollbar">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-black text-white">Candidatura Enviada!</h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Seus dados foram registrados com sucesso no sistema.
              </p>
            </div>

            <div className="p-3.5 sm:p-4 rounded-xl bg-slate-950 border border-slate-800 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Vaga:</span>
                <span className="font-bold text-white">{job.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Local:</span>
                <span className="text-slate-200">{job.neighborhood || ''}, {job.city || ''} ({job.state || 'SP'})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Cachê Previsto:</span>
                <span className="font-bold text-emerald-400">{formatCurrency(job.cachet)} ({job.paymentDetails})</span>
              </div>
            </div>

            <p className="text-xs text-slate-400">
              Para acelerar sua confirmação imediata, envie uma mensagem direta no WhatsApp do contratante:
            </p>

            <div className="pt-2 flex flex-col gap-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-green-500/20 transition transform active:scale-95"
              >
                <Phone className="w-4 h-4" />
                <span>Avisar no WhatsApp do Contratante</span>
              </a>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition"
              >
                Fechar e Ver Mais Vagas
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col h-full min-h-0 flex-1 overflow-hidden">
            {/* Pinned Modal Header */}
            <div className="p-3.5 sm:p-4 pb-2.5 sm:pb-3 shrink-0 border-b border-slate-800 bg-slate-900 sticky top-0 z-10 pr-12">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Candidatar-se à Vaga</span>
              <h2 className="text-base sm:text-lg font-black text-white mt-0.5">{job.role}</h2>
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                <span>📍 {job.neighborhood || ''}, {job.city || ''} ({job.state || 'SP'})</span>
                <span>•</span>
                <span className="font-bold text-emerald-400">{formatCurrency(job.cachet)}</span>
              </div>
            </div>

            {/* Scrollable Form Body */}
            <div className="p-3.5 sm:p-4 overflow-y-auto min-h-0 flex-1 space-y-3 sm:space-y-3.5 overscroll-contain custom-scrollbar">

            {/* Error message */}
            {formError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/50 text-rose-300 text-xs flex items-start gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="font-medium">{formError}</span>
              </div>
            )}

            {/* Special Gender / Dress Code Notice */}
            {(job.genderRequirement === 'homens' || job.role.toUpperCase().includes('HOMENS')) && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-300">
                  <span>⚠️ Vaga com Perfil Operacional: APENAS HOMENS</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Obrigatoriedade: Vestimenta completa sem detalhes (calça preta, sapato fechado antiderrapante) e <strong>SEM ADORNOS</strong> (sem brincos, anéis, correntes ou relógios).
                </p>
              </div>
            )}

            {/* Candidate Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-300">
                    Seu Nome Completo *
                  </label>
                  {name.trim() && (
                    <span className={`text-[10px] flex items-center gap-0.5 font-bold ${
                      isNameValid ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      {isNameValid ? <><Check className="w-3 h-3" /> Válido</> : 'Mín. 3 letras'}
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  required
                  placeholder="Carlos Silva"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setFormError(null);
                  }}
                  className={`w-full px-3 py-2 rounded-xl bg-slate-950 border text-white text-xs focus:outline-none transition ${
                    name.trim()
                      ? isNameValid ? 'border-emerald-500/60 focus:border-emerald-400' : 'border-amber-500/60 focus:border-amber-400'
                      : 'border-slate-700 focus:border-emerald-500'
                  }`}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-300">
                    Seu WhatsApp com DDD *
                  </label>
                  {whatsapp.trim() && (
                    <span className={`text-[10px] flex items-center gap-0.5 font-bold ${
                      isWhatsappValid ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      {isWhatsappValid ? <><Check className="w-3 h-3" /> DDD Válido</> : 'DDD + 9 dígitos'}
                    </span>
                  )}
                </div>
                <input
                  type="tel"
                  required
                  maxLength={15}
                  placeholder="(11) 98765-4321"
                  value={whatsapp}
                  onChange={(e) => handleWhatsappChange(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl bg-slate-950 border font-mono text-xs focus:outline-none transition ${
                    whatsapp.trim()
                      ? isWhatsappValid ? 'border-emerald-500/60 text-emerald-300 focus:border-emerald-400' : 'border-amber-500/60 text-amber-200 focus:border-amber-400'
                      : 'border-slate-700 text-white focus:border-emerald-500'
                  }`}
                />
              </div>
            </div>

            {/* Candidate Locality: Estado, Cidade e Bairro */}
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="text-[11px] font-bold text-cyan-400">
                📍 Onde Você Reside (Estado, Cidade e Bairro)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
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
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500 font-bold"
                  >
                    {BRAZIL_STATES.map(st => (
                      <option key={st.uf} value={st.uf}>{st.uf}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Cidade *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: São Paulo"
                    value={city}
                    onChange={(e) => {
                      setCity(e.target.value);
                      setFormError(null);
                    }}
                    list="candidate-cities-list"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                  <datalist id="candidate-cities-list">
                    {citySuggestions.map(c => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Bairro *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Pinheiros, Centro"
                    value={neighborhood}
                    onChange={(e) => {
                      setNeighborhood(e.target.value);
                      setFormError(null);
                    }}
                    list="candidate-neighborhoods-list"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                  <datalist id="candidate-neighborhoods-list">
                    {neighborhoodSuggestions.map(n => (
                      <option key={n} value={n} />
                    ))}
                  </datalist>
                </div>
              </div>
            </div>

            {/* PIX Key */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Tipo de Chave PIX *
                </label>
                <select
                  value={pixType}
                  onChange={(e) => {
                    const nextType = e.target.value as any;
                    setPixType(nextType);
                    if (nextType === 'phone') setPixKey(whatsapp);
                    else setPixKey('');
                    setFormError(null);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                >
                  <option value="phone">Telefone</option>
                  <option value="cpf">CPF</option>
                  <option value="email">E-mail</option>
                  <option value="random">Chave Aleatória (EVP)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-300">
                    Chave PIX para Recebimento *
                  </label>
                  {pixKey && (
                    <span className={`text-[10px] flex items-center gap-0.5 font-bold ${
                      isPixValid ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      {isPixValid ? <><Check className="w-3 h-3" /> Chave Válida</> : pixValidationMsg}
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  required
                  placeholder={
                    pixType === 'phone' ? '(11) 98765-4321' :
                    pixType === 'cpf' ? '000.000.000-00' :
                    pixType === 'email' ? 'exemplo@email.com' :
                    'Chave aleatória'
                  }
                  value={pixKey}
                  onChange={(e) => handlePixKeyChange(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl bg-slate-950 border font-mono text-xs focus:outline-none transition ${
                    pixKey
                      ? isPixValid ? 'border-emerald-500/60 text-emerald-300 focus:border-emerald-400' : 'border-amber-500/60 text-amber-200 focus:border-amber-400'
                      : 'border-slate-700 text-emerald-400 focus:border-emerald-500'
                  }`}
                />
              </div>
            </div>

            {/* Cursos e Certificados do Candidato */}
            {job.requiredCertifications && job.requiredCertifications.length > 0 && (
              <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                  <GraduationCap className="w-4 h-4" />
                  <span>Certificados Exigidos nesta Vaga:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {job.requiredCertifications.map(reqCert => {
                    const hasCert = selectedCertifications.includes(reqCert);
                    return (
                      <button
                        type="button"
                        key={reqCert}
                        onClick={() => toggleCert(reqCert)}
                        className={`text-xs px-2.5 py-1 rounded-lg transition border flex items-center gap-1 ${
                          hasCert
                            ? 'bg-amber-500/30 text-amber-200 border-amber-500 font-bold'
                            : 'bg-slate-950 text-slate-400 border-slate-700 hover:text-white'
                        }`}
                      >
                        <span>{hasCert ? '✓ Tenho:' : '+ Tenho:'}</span>
                        <span>{reqCert}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Skills & Experience */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Habilidades & Diferenciais (Clique para marcar):
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-slate-950 rounded-xl border border-slate-800">
                {COMMON_SKILLS_POOL.map(skill => {
                  const isSel = selectedSkills.includes(skill);
                  return (
                    <button
                      type="button"
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition flex items-center gap-1 ${
                        isSel
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      {isSel && <Check className="w-3 h-3" />}
                      <span>{skill}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Experience Summary */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Breve Resumo da sua Experiência (Opcional):
              </label>
              <textarea
                rows={2}
                placeholder="Ex: 3 anos de experiência em buffet e casamentos, pontual e ágil..."
                value={experienceSummary}
                onChange={(e) => setExperienceSummary(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Dress code agreement */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2.5">
              <input
                type="checkbox"
                id="dresscode-agree"
                checked={agreedDressCode}
                onChange={(e) => setAgreedDressCode(e.target.checked)}
                className="mt-0.5 rounded text-emerald-500 focus:ring-emerald-500 w-4 h-4"
              />
              <label htmlFor="dresscode-agree" className="text-xs text-slate-300 cursor-pointer">
                <span className="font-bold text-white">Confirmo que possuo a vestimenta exigida:</span> {job.dressCode}
              </label>
            </div>

            </div>

            {/* Submit (Pinned Footer) */}
            <div className="p-4 shrink-0 border-t border-slate-800 bg-slate-950/90">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-300 hover:to-green-400 text-slate-950 font-black text-sm shadow-md shadow-emerald-500/20 transition transform active:scale-95 disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Gravando...' : 'Confirmar Candidatura'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
