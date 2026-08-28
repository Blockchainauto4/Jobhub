import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Building2, 
  Phone, 
  CreditCard, 
  MapPin, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Tag, 
  Save, 
  Briefcase,
  GraduationCap,
  Award,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile, BrazilState } from '../types';
import { BRAZIL_STATES, POPULAR_NEIGHBORHOODS_BY_CITY } from '../data/brazilLocations';
import { 
  formatPhone, 
  isValidPhone, 
  formatPixKey, 
  validatePixKey, 
  validateName, 
  formatCpfOrCnpj, 
  isValidCpfOrCnpj,
  formatCurrency 
} from '../utils/formatters';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile | null;
  onSaveProfile: (profile: UserProfile) => void;
  onOpenCertificationsGuide?: () => void;
  isFirstAccess?: boolean;
}

const SKILLS_SUGGESTIONS = [
  'Bandeja Alta & Salão',
  'Coquetelaria & Barman',
  'Carga Pesada 50kg+ & Logística',
  'Limpeza Pós-Evento & Facilities',
  'Atendimento VIP & Recepcionista',
  'Churrasqueiro / Auxiliar de Cozinha',
  'Montagem de Palco & Iluminação DMX',
  'Operador de Caixa & Sangria',
  'Garçom Volante',
  'Abertura de Vinhos & Sommelier',
  'Produtor de Campo',
  'Segurança de Apoio'
];

const POPULAR_CERTIFICATIONS = [
  'Operador de Caixa & Fechamento Financeiro',
  'Prevenção a Fraudes, Notas Falsas & PIX/TEF',
  'Boas Práticas e Manipulação de Alimentos (RDC 216/ANVISA)',
  'Certificação Financeira ANBIMA (CPA-10 / CPA-20)',
  'NR-10 - Segurança em Instalações e Serviços em Eletricidade',
  'NR-11 - Operador de Empilhadeira e Transpaleteira Elétrica',
  'NR-35 - Trabalho em Altura (Box Truss e Estruturas)',
  'NR-06 - Uso Seguro de EPIs & Biossegurança',
  'NR-23 - Brigadista de Incêndio & Evacuação',
  'APH - Primeiros Socorros & Ressuscitação Cardiopulmonar (DEA)'
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onSaveProfile,
  onOpenCertificationsGuide,
  isFirstAccess = false
}) => {
  const [userType, setUserType] = useState<'freelancer' | 'contractor' | 'both'>('freelancer');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [cpfOrCnpj, setCpfOrCnpj] = useState('');
  const [pixType, setPixType] = useState<'cpf' | 'email' | 'phone' | 'random'>('phone');
  const [pixKey, setPixKey] = useState('');
  
  // Strict Location State: State, City, Neighborhood
  const [state, setState] = useState<BrazilState>('SP');
  const [city, setCity] = useState('São Paulo');
  const [neighborhood, setNeighborhood] = useState('Centro');
  
  const [skills, setSkills] = useState<string[]>(['Bandeja Alta & Salão', 'Atendimento VIP & Recepcionista']);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [certifications, setCertifications] = useState<string[]>([]);
  const [newCertInput, setNewCertInput] = useState('');
  const [bio, setBio] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showAdvancedFields, setShowAdvancedFields] = useState(!isFirstAccess);
  const [formError, setFormError] = useState<string | null>(null);

  // Suggested cities for selected state
  const selectedStateInfo = BRAZIL_STATES.find(s => s.uf === state);
  const citySuggestions = selectedStateInfo?.popularCities || ['São Paulo'];
  const neighborhoodSuggestions = POPULAR_NEIGHBORHOODS_BY_CITY[city] || ['Centro', 'Jardins', 'Vila Madalena', 'Santana'];

  // Sync state when opening with existing profile
  useEffect(() => {
    if (userProfile) {
      setUserType(userProfile.userType || 'freelancer');
      setName(userProfile.name || '');
      setCompanyName(userProfile.companyName || '');
      setPhone(formatPhone(userProfile.phone || ''));
      setCpfOrCnpj(formatCpfOrCnpj(userProfile.cpfOrCnpj || ''));
      setPixType(userProfile.pixType || 'phone');
      setPixKey(userProfile.pixKey ? formatPixKey(userProfile.pixKey, userProfile.pixType || 'phone') : '');
      setState(userProfile.state || 'SP');
      setCity(userProfile.city || 'São Paulo');
      setNeighborhood(userProfile.neighborhood || 'Centro');
      setSkills(userProfile.skills || ['Bandeja Alta & Salão']);
      setCertifications(userProfile.certifications || []);
      setBio(userProfile.bio || '');
    }
  }, [userProfile, isOpen]);

  if (!isOpen) return null;

  // Real-time field validations
  const nameValidation = validateName(name);
  const isPhoneValid = isValidPhone(phone);
  const pixValidation = validatePixKey(pixKey || phone, pixType);
  const isCityValid = city.trim().length >= 2;
  const isNeighborhoodValid = neighborhood.trim().length >= 2;
  const isCpfCnpjValid = !cpfOrCnpj || isValidCpfOrCnpj(cpfOrCnpj);

  const toggleSkill = (skill: string) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter(s => s !== skill));
    } else {
      setSkills([...skills, skill]);
    }
  };

  const handleAddCustomSkill = () => {
    if (newSkillInput.trim() && !skills.includes(newSkillInput.trim())) {
      setSkills([...skills, newSkillInput.trim()]);
      setNewSkillInput('');
    }
  };

  const toggleCertification = (cert: string) => {
    if (certifications.includes(cert)) {
      setCertifications(certifications.filter(c => c !== cert));
    } else {
      setCertifications([...certifications, cert]);
    }
  };

  const handleAddCustomCert = () => {
    if (newCertInput.trim() && !certifications.includes(newCertInput.trim())) {
      setCertifications([...certifications, newCertInput.trim()]);
      setNewCertInput('');
    }
  };

  const handlePhoneChange = (val: string) => {
    const formatted = formatPhone(val);
    setPhone(formatted);
    setFormError(null);
    // If pixType is phone and user hasn't typed a custom pix key yet, sync it
    if (pixType === 'phone' && (!pixKey || pixKey === phone)) {
      setPixKey(formatted);
    }
  };

  const handlePixKeyChange = (val: string) => {
    const formatted = formatPixKey(val, pixType);
    setPixKey(formatted);
    setFormError(null);
  };

  const handlePixTypeChange = (newType: 'cpf' | 'email' | 'phone' | 'random') => {
    setPixType(newType);
    if (newType === 'phone') {
      setPixKey(phone);
    } else if (newType === 'cpf' && cpfOrCnpj) {
      setPixKey(cpfOrCnpj);
    } else {
      setPixKey('');
    }
    setFormError(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!nameValidation.isValid) {
      setFormError(`Nome inválido: ${nameValidation.message}`);
      return;
    }

    if (!isPhoneValid) {
      setFormError('WhatsApp inválido. Digite o DDD + 9 dígitos (ex: (11) 98765-4321).');
      return;
    }

    if (!isCityValid || !isNeighborhoodValid) {
      setFormError('Por favor, informe uma Cidade e Bairro válidos.');
      return;
    }

    const effectivePixKey = (pixKey.trim() || phone.trim());
    const finalPixVal = validatePixKey(effectivePixKey, pixType);
    if (!finalPixVal.isValid) {
      setFormError(`Chave PIX inválida: ${finalPixVal.message}`);
      return;
    }

    if (cpfOrCnpj && !isCpfCnpjValid) {
      setFormError('CPF ou CNPJ informado está incompleto ou inválido.');
      return;
    }

    const updatedProfile: UserProfile = {
      id: userProfile?.id || `user-${Date.now()}`,
      userType,
      name: name.trim(),
      companyName: companyName.trim() || undefined,
      phone: phone.trim(),
      cpfOrCnpj: cpfOrCnpj.trim() || undefined,
      pixType,
      pixKey: effectivePixKey,
      state,
      city: city.trim(),
      neighborhood: neighborhood.trim(),
      skills,
      certifications,
      bio: bio.trim(),
      completedJobsCount: userProfile?.completedJobsCount ?? 0,
      totalEarnings: userProfile?.totalEarnings ?? 0,
      credits: userProfile?.credits ?? 50,
      missionsCompleted: userProfile?.missionsCompleted || {
        tiktokReferral: false,
        kwaiReferral: false,
        whatsappGroupJoined: false
      },
      createdAt: userProfile?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSaveProfile(updatedProfile);
    setSavedSuccess(true);

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }

    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleLoadDemoData = () => {
    if (userType === 'contractor') {
      setName('Eduardo Silveira');
      setCompanyName('Viva Eventos SP');
      setPhone('(11) 98799-7872');
      setPixType('phone');
      setPixKey('(11) 98799-7872');
      setState('SP');
      setCity('São Paulo');
      setNeighborhood('Jardins');
    } else {
      setName('Lucas Oliveira');
      setCompanyName('');
      setPhone('(11) 98123-4567');
      setPixType('phone');
      setPixKey('(11) 98123-4567');
      setState('SP');
      setCity('São Paulo');
      setNeighborhood('Pinheiros');
    }
    setFormError(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md p-2 sm:p-4 flex justify-center items-start sm:items-center">
      <div className="relative w-full max-w-lg my-2 sm:my-auto max-h-[calc(100dvh-1rem)] sm:max-h-[90vh] flex flex-col rounded-2xl sm:rounded-3xl bg-slate-900 border border-emerald-500/50 shadow-2xl shadow-emerald-950/60 text-slate-100 overflow-hidden">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-400 hover:text-white transition border border-slate-700/60 shadow-md"
          title="Fechar"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {savedSuccess ? (
          <div className="text-center p-6 sm:p-8 space-y-4 overflow-y-auto custom-scrollbar flex-1 min-h-0">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-white">Cadastro Confirmado!</h3>
              <p className="text-xs text-slate-300 mt-1">
                Seus dados foram atualizados e salvos com sucesso.
              </p>
            </div>

            {/* Confirmed Data Card */}
            <div className="p-4 rounded-2xl bg-slate-950/90 border border-emerald-500/40 text-left text-xs space-y-2 max-w-md mx-auto">
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">Nome:</span>
                <span className="text-white font-bold">{name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">WhatsApp:</span>
                <span className="text-emerald-400 font-mono font-bold">{phone}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">Localização:</span>
                <span className="text-white font-medium">{neighborhood}, {city} - {state}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">Chave PIX:</span>
                <span className="text-amber-300 font-mono font-bold">{pixKey || phone} ({pixType.toUpperCase()})</span>
              </div>
              <div className="flex justify-between pt-0.5">
                <span className="text-slate-400">Saldo Inicial:</span>
                <span className="text-emerald-400 font-black">{formatCurrency(userProfile?.credits ?? 50)}</span>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="flex flex-col h-full min-h-0 flex-1 overflow-hidden">
            
            {/* Header (Pinned) */}
            <div className="p-3.5 sm:p-4 pb-2.5 sm:pb-3 shrink-0 border-b border-slate-800 bg-slate-900 sticky top-0 z-10 pr-12">
              <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-bold uppercase tracking-wider mb-0.5">
                <User className="w-3.5 h-3.5" />
                <span>{isFirstAccess ? 'Início Rápido • FreelaHub' : 'Perfil & Cadastro'}</span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white">
                {isFirstAccess ? 'Cadastro Rápido em 1 Minuto' : 'Minha Ficha FreelaHub'}
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {isFirstAccess 
                  ? 'Preencha seus dados para receber cachês no PIX e se candidatar.'
                  : 'Atualize seus dados de contato, localização e chave PIX.'}
              </p>
            </div>

            {/* Scrollable Form Body */}
            <div className="p-3.5 sm:p-4 overflow-y-auto min-h-0 flex-1 space-y-3 sm:space-y-3.5 overscroll-contain custom-scrollbar">
              {/* Error banner if invalid format */}
              {formError && (
                <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/50 text-rose-300 text-xs flex items-start gap-2 animate-shake">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span className="font-medium">{formError}</span>
                </div>
              )}

            {/* Profile Type Mini Toggle */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-950 border border-slate-800">
              <button
                type="button"
                onClick={() => setUserType('freelancer')}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  userType === 'freelancer'
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Sou Freelancer</span>
              </button>

              <button
                type="button"
                onClick={() => setUserType('contractor')}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  userType === 'contractor'
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Sou Contratante / Buffet</span>
              </button>
            </div>

            {/* Field 1 & 2: Name & WhatsApp with live formatting */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-300">
                    {userType === 'contractor' ? 'Nome do Responsável *' : 'Nome Completo *'}
                  </label>
                  {name.trim() && (
                    <span className={`text-[10px] flex items-center gap-1 font-bold ${
                      nameValidation.isValid ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      {nameValidation.isValid ? (
                        <>
                          <Check className="w-3 h-3" /> Formato correto
                        </>
                      ) : (
                        nameValidation.message
                      )}
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlos Silva"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setFormError(null);
                  }}
                  className={`w-full px-3 py-2 rounded-xl bg-slate-950 border text-white text-xs font-medium focus:outline-none transition ${
                    name.trim() 
                      ? nameValidation.isValid ? 'border-emerald-500/60 focus:border-emerald-400' : 'border-amber-500/60 focus:border-amber-400'
                      : 'border-slate-800 focus:border-emerald-400'
                  }`}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-300">
                    WhatsApp com DDD *
                  </label>
                  {phone.trim() && (
                    <span className={`text-[10px] flex items-center gap-1 font-bold ${
                      isPhoneValid ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      {isPhoneValid ? (
                        <>
                          <Check className="w-3 h-3" /> DDD + Número válido
                        </>
                      ) : (
                        'DDD + 9 dígitos'
                      )}
                    </span>
                  )}
                </div>
                <input
                  type="tel"
                  required
                  maxLength={15}
                  placeholder="(11) 98765-4321"
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl bg-slate-950 border font-mono text-xs font-medium focus:outline-none transition ${
                    phone.trim() 
                      ? isPhoneValid ? 'border-emerald-500/60 text-emerald-300 focus:border-emerald-400' : 'border-amber-500/60 text-amber-200 focus:border-amber-400'
                      : 'border-slate-800 text-white focus:border-emerald-400'
                  }`}
                />
              </div>
            </div>

            {/* Field 3: Strict Locality: Estado, Cidade e Bairro */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
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
                  className="w-full px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-bold focus:border-emerald-400"
                >
                  {BRAZIL_STATES.map(st => (
                    <option key={st.uf} value={st.uf}>{st.name} ({st.uf})</option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-slate-300">
                    Cidade *
                  </label>
                  {isCityValid && <Check className="w-3 h-3 text-emerald-400" />}
                </div>
                <input
                  type="text"
                  required
                  placeholder="Ex: São Paulo"
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    setFormError(null);
                  }}
                  list="quick-cities-list"
                  className={`w-full px-2.5 py-2 rounded-xl bg-slate-950 border text-white text-xs font-medium focus:outline-none transition ${
                    isCityValid ? 'border-slate-800 focus:border-emerald-400' : 'border-amber-500/60 focus:border-amber-400'
                  }`}
                />
                <datalist id="quick-cities-list">
                  {citySuggestions.map(c => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-slate-300">
                    Bairro *
                  </label>
                  {isNeighborhoodValid && <Check className="w-3 h-3 text-emerald-400" />}
                </div>
                <input
                  type="text"
                  required
                  placeholder="Ex: Centro / Pinheiros"
                  value={neighborhood}
                  onChange={(e) => {
                    setNeighborhood(e.target.value);
                    setFormError(null);
                  }}
                  list="quick-neighborhoods-list"
                  className={`w-full px-2.5 py-2 rounded-xl bg-slate-950 border text-white text-xs font-medium focus:outline-none transition ${
                    isNeighborhoodValid ? 'border-slate-800 focus:border-emerald-400' : 'border-amber-500/60 focus:border-amber-400'
                  }`}
                />
                <datalist id="quick-neighborhoods-list">
                  {neighborhoodSuggestions.map(n => (
                    <option key={n} value={n} />
                  ))}
                </datalist>
              </div>
            </div>

            {/* Field 4: PIX Key with live format confirmation */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Tipo Chave PIX
                </label>
                <select
                  value={pixType}
                  onChange={(e) => handlePixTypeChange(e.target.value as any)}
                  className="w-full px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-medium focus:outline-none focus:border-emerald-400"
                >
                  <option value="phone">Telefone / Celular</option>
                  <option value="cpf">CPF</option>
                  <option value="email">E-mail</option>
                  <option value="random">Chave Aleatória</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-semibold text-slate-400">
                    Chave PIX (Para receber/pagar cachês)
                  </label>
                  {(pixKey || phone) && (
                    <span className={`text-[10px] flex items-center gap-1 font-bold ${
                      pixValidation.isValid ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      {pixValidation.isValid ? (
                        <>
                          <Check className="w-3 h-3" /> Formato PIX válido
                        </>
                      ) : (
                        pixValidation.message
                      )}
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  placeholder={
                    pixType === 'phone' ? '(11) 98765-4321' :
                    pixType === 'cpf' ? '000.000.000-00' :
                    pixType === 'email' ? 'exemplo@email.com' :
                    'Chave aleatória'
                  }
                  value={pixKey}
                  onChange={(e) => handlePixKeyChange(e.target.value)}
                  className={`w-full px-2.5 py-2 rounded-xl bg-slate-950 border font-mono text-xs focus:outline-none transition ${
                    (pixKey || phone)
                      ? pixValidation.isValid ? 'border-emerald-500/60 text-emerald-300 focus:border-emerald-400' : 'border-amber-500/60 text-amber-200 focus:border-amber-400'
                      : 'border-slate-800 text-emerald-300 focus:border-emerald-400'
                  }`}
                />
              </div>
            </div>

            {/* Optional / Advanced Fields Accordion */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowAdvancedFields(!showAdvancedFields)}
                className="text-[11px] text-slate-400 hover:text-emerald-400 font-bold flex items-center gap-1 transition"
              >
                <span>{showAdvancedFields ? '− Ocultar Habilidades & Cursos' : '+ Adicionar Habilidades, Cursos & Bio (Opcional)'}</span>
              </button>

              {showAdvancedFields && (
                <div className="mt-3 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                  {/* CPF / CNPJ for advanced validation */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold text-slate-300">
                        CPF ou CNPJ (Opcional)
                      </label>
                      {cpfOrCnpj && (
                        <span className={`text-[10px] flex items-center gap-1 font-bold ${
                          isCpfCnpjValid ? 'text-emerald-400' : 'text-amber-400'
                        }`}>
                          {isCpfCnpjValid ? <><Check className="w-3 h-3" /> Formato válido</> : '11 ou 14 dígitos'}
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      maxLength={18}
                      placeholder="000.000.000-00 ou 00.000.000/0001-00"
                      value={cpfOrCnpj}
                      onChange={(e) => setCpfOrCnpj(formatCpfOrCnpj(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  {/* Skills */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Habilidades Principais
                    </label>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {SKILLS_SUGGESTIONS.slice(0, 6).map((skill) => {
                        const isSelected = skills.includes(skill);
                        return (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => toggleSkill(skill)}
                            className={`text-[11px] px-2 py-0.5 rounded-lg border transition ${
                              isSelected
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-bold'
                                : 'bg-slate-900 text-slate-400 border-slate-800'
                            }`}
                          >
                            {isSelected ? '✓ ' : '+ '}
                            {skill}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Certifications quick */}
                  <div>
                    <label className="block text-[11px] font-bold text-amber-300 mb-1 flex items-center justify-between">
                      <span>Cursos & Certificações</span>
                      {onOpenCertificationsGuide && (
                        <span onClick={onOpenCertificationsGuide} className="text-[10px] text-amber-400 cursor-pointer underline">
                          Ver Guia
                        </span>
                      )}
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {POPULAR_CERTIFICATIONS.slice(0, 4).map((cert) => {
                        const isSelected = certifications.includes(cert);
                        return (
                          <button
                            key={cert}
                            type="button"
                            onClick={() => toggleCertification(cert)}
                            className={`text-[10px] px-2 py-0.5 rounded-lg border transition text-left ${
                              isSelected
                                ? 'bg-amber-500/20 text-amber-200 border-amber-500/60 font-bold'
                                : 'bg-slate-900 text-slate-400 border-slate-800'
                            }`}
                          >
                            {isSelected ? '🏅 ' : '📜 '}
                            {cert}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
              </div>
            </div>

            {/* Actions Bar (Pinned Footer) */}
            <div className="p-3 sm:p-4 shrink-0 border-t border-slate-800 bg-slate-950 sticky bottom-0 z-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleLoadDemoData}
                className="text-[11px] text-slate-400 hover:text-emerald-400 flex items-center justify-center sm:justify-start gap-1.5 transition py-1 active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Preencher Exemplo Válido</span>
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 sm:flex-none px-3.5 py-2 sm:py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition text-center"
                >
                  {isFirstAccess ? 'Pular' : 'Cancelar'}
                </button>

                <button
                  type="submit"
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-300 hover:to-green-400 text-slate-950 text-xs font-black shadow-lg shadow-emerald-500/20 transition transform active:scale-95 text-center"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isFirstAccess ? 'Salvar' : 'Salvar Dados'}</span>
                </button>
              </div>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};

