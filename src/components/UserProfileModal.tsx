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
  Tag, 
  Save, 
  Briefcase,
  GraduationCap,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile, BrazilState } from '../types';
import { BRAZIL_STATES, POPULAR_NEIGHBORHOODS_BY_CITY } from '../data/brazilLocations';

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
  const [neighborhood, setNeighborhood] = useState('Jardins');
  
  const [skills, setSkills] = useState<string[]>(['Bandeja Alta & Salão', 'Atendimento VIP & Recepcionista']);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [certifications, setCertifications] = useState<string[]>([]);
  const [newCertInput, setNewCertInput] = useState('');
  const [bio, setBio] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

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
      setPhone(userProfile.phone || '');
      setCpfOrCnpj(userProfile.cpfOrCnpj || '');
      setPixType(userProfile.pixType || 'phone');
      setPixKey(userProfile.pixKey || '');
      setState(userProfile.state || 'SP');
      setCity(userProfile.city || 'São Paulo');
      setNeighborhood(userProfile.neighborhood || 'Centro');
      setSkills(userProfile.skills || ['Bandeja Alta & Salão']);
      setCertifications(userProfile.certifications || []);
      setBio(userProfile.bio || '');
    }
  }, [userProfile, isOpen]);

  if (!isOpen) return null;

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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !phone.trim()) {
      alert('Por favor, informe seu Nome e Telefone / WhatsApp.');
      return;
    }

    if (!city.trim() || !neighborhood.trim()) {
      alert('Por favor, informe sua Cidade e Bairro.');
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
      pixKey: pixKey.trim() || phone.trim(),
      state,
      city: city.trim(),
      neighborhood: neighborhood.trim(),
      skills,
      certifications,
      bio: bio.trim(),
      completedJobsCount: userProfile?.completedJobsCount ?? 0,
      totalEarnings: userProfile?.totalEarnings ?? 0,
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
      setCompanyName('Viva Eventos & Gastronomia SP');
      setPhone('(11) 98799-7872');
      setCpfOrCnpj('12.345.678/0001-90');
      setPixType('email');
      setPixKey('financeiro@vivaeventos.com.br');
      setState('SP');
      setCity('São Paulo');
      setNeighborhood('Jardins');
      setBio('Produtora organizando casamentos, formaturas e eventos corporativos.');
      setSkills(['Gestão de Equipes', 'Produção de Eventos', 'Contratação Rápida']);
      setCertifications(['Operador de Caixa & Fechamento Financeiro']);
    } else {
      setName('Lucas Oliveira');
      setCompanyName('');
      setPhone('(11) 98123-4567');
      setCpfOrCnpj('432.198.765-00');
      setPixType('phone');
      setPixKey('(11) 98123-4567');
      setState('SP');
      setCity('São Paulo');
      setNeighborhood('Pinheiros');
      setSkills(['Bandeja Alta & Salão', 'Coquetelaria & Barman', 'Operador de Caixa & Sangria']);
      setCertifications([
        'Operador de Caixa & Fechamento Financeiro',
        'Boas Práticas e Manipulação de Alimentos (RDC 216/ANVISA)'
      ]);
      setBio('Experiência em buffets, casamentos e operação de caixa. Pontual e prestativo.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl my-8 rounded-3xl bg-slate-900 border border-emerald-500/50 shadow-2xl shadow-emerald-950/50 p-6 sm:p-8 text-slate-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {savedSuccess ? (
          <div className="text-center py-10 space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-white">Perfil Atualizado!</h3>
            <p className="text-sm text-slate-300">
              Seus dados de localização (<strong>{neighborhood}, {city} - {state}</strong>), qualificações e PIX foram gravados com sucesso.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-5">
            
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
                <User className="w-4 h-4" />
                <span>Perfil & Cadastro</span>
              </div>
              <h2 className="text-2xl font-black text-white">
                Meu Cadastro no FreelaHub
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Preencha seus dados de contato, sua localização (Estado, Cidade e Bairro) e sua chave PIX.
              </p>
            </div>

            {/* Profile Type Toggle */}
            <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-slate-950 border border-slate-800">
              <button
                type="button"
                onClick={() => setUserType('freelancer')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                  userType === 'freelancer'
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Sou Freelancer</span>
              </button>

              <button
                type="button"
                onClick={() => setUserType('contractor')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                  userType === 'contractor'
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Sou Contratante</span>
              </button>

              <button
                type="button"
                onClick={() => setUserType('both')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                  userType === 'both'
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Ambos</span>
              </button>
            </div>

            {/* Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {userType === 'contractor' ? 'Nome do Responsável / Produtor *' : 'Nome Completo *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlos Eduardo da Silva"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-400 text-white text-xs font-medium focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  WhatsApp com DDD *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="(11) 98765-4321"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-400 text-white text-xs font-medium focus:outline-none transition"
                />
              </div>
            </div>

            {/* Company Name & Document */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {userType !== 'freelancer' && (
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Nome da Empresa / Buffet / Espaço
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Prime Eventos & Gastronomia"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-400 text-white text-xs font-medium focus:outline-none transition"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {userType === 'contractor' ? 'CNPJ ou CPF (Opcional)' : 'CPF (Opcional)'}
                </label>
                <input
                  type="text"
                  placeholder="000.000.000-00"
                  value={cpfOrCnpj}
                  onChange={(e) => setCpfOrCnpj(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-400 text-white text-xs font-mono focus:outline-none transition"
                />
              </div>
            </div>

            {/* PIX Key Configuration */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <CreditCard className="w-4 h-4" />
                <span>Dados de Pagamento / Chave PIX Padrão</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Tipo de Chave
                  </label>
                  <select
                    value={pixType}
                    onChange={(e) => setPixType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-medium focus:outline-none focus:border-emerald-400"
                  >
                    <option value="phone">Telefone (Celular)</option>
                    <option value="cpf">CPF</option>
                    <option value="email">E-mail</option>
                    <option value="random">Chave Aleatória (EVP)</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Chave PIX
                  </label>
                  <input
                    type="text"
                    placeholder="Sua chave PIX para receber ou transferir cachês"
                    value={pixKey}
                    onChange={(e) => setPixKey(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-emerald-300 font-mono text-xs focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>
            </div>

            {/* Strict Locality: Estado, Cidade e Bairro */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
                <MapPin className="w-4 h-4" />
                <span>Informações de Localidade (Estado, Cidade e Bairro)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
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
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-bold focus:border-emerald-400"
                  >
                    {BRAZIL_STATES.map(st => (
                      <option key={st.uf} value={st.uf}>{st.name} ({st.uf})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Cidade *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: São Paulo"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    list="profile-cities-list"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-medium focus:border-emerald-400 focus:outline-none"
                  />
                  <datalist id="profile-cities-list">
                    {citySuggestions.map(c => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Bairro *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Pinheiros, Copacabana, Savassi"
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    list="profile-neighborhoods-list"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-medium focus:border-emerald-400 focus:outline-none"
                  />
                  <datalist id="profile-neighborhoods-list">
                    {neighborhoodSuggestions.map(n => (
                      <option key={n} value={n} />
                    ))}
                  </datalist>
                </div>
              </div>
            </div>

            {/* Skills & Specialties */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Habilidades & Competências Principais</span>
                <span className="text-[10px] text-emerald-400 font-normal">Clique para marcar/desmarcar</span>
              </label>

              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {SKILLS_SUGGESTIONS.map((skill) => {
                  const isSelected = skills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`text-xs px-2.5 py-1 rounded-lg transition border ${
                        isSelected
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-bold'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}
                      {skill}
                    </button>
                  );
                })}
              </div>

              {/* Add Custom Skill */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Adicionar outra habilidade..."
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomSkill(); } }}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-400"
                />
                <button
                  type="button"
                  onClick={handleAddCustomSkill}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200"
                >
                  Adicionar
                </button>
              </div>
            </div>

            {/* Cursos Técnicos & Certificações Oficiais (Finanças, ANVISA, NRs) */}
            <div className="p-4 rounded-2xl bg-slate-950/90 border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                      Cursos Técnicos & Certificações Oficiais
                      {certifications.length > 0 && (
                        <span className="px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/40">
                          {certifications.length} ativo{certifications.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      Cursos em Finanças, Caixa, Manipulação ANVISA e Normas MTE (NR-10/11/35).
                    </p>
                  </div>
                </div>

                {onOpenCertificationsGuide && (
                  <button
                    type="button"
                    onClick={onOpenCertificationsGuide}
                    className="text-[11px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 transition"
                  >
                    <span>Ver Guia Completo</span>
                    <Award className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Popular Certifications Pills */}
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_CERTIFICATIONS.map((cert) => {
                  const isSelected = certifications.includes(cert);
                  const isFinance = cert.includes('Caixa') || cert.includes('Fraudes') || cert.includes('ANBIMA');

                  return (
                    <button
                      key={cert}
                      type="button"
                      onClick={() => toggleCertification(cert)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg transition border text-left flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-amber-500/20 text-amber-200 border-amber-500/60 font-bold shadow-sm'
                          : 'bg-slate-900/90 text-slate-300 border-slate-700/80 hover:border-amber-500/40 hover:text-white'
                      }`}
                    >
                      <span>{isSelected ? '🏅' : isFinance ? '💰' : '📜'}</span>
                      <span>{cert}</span>
                      {isSelected && <span className="text-amber-400 font-bold ml-0.5">✓</span>}
                    </button>
                  );
                })}
              </div>

              {/* Add Custom Certification */}
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Outro curso/certificação (ex: SENAI, FEBRABAN, Brigada)..."
                  value={newCertInput}
                  onChange={(e) => setNewCertInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomCert(); } }}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                />
                <button
                  type="button"
                  onClick={handleAddCustomCert}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-xs font-black text-slate-950 transition"
                >
                  Adicionar Certificado
                </button>
              </div>
            </div>

            {/* Bio / Summary */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                {userType === 'contractor' ? 'Apresentação da Empresa / Produtora' : 'Resumo da sua Experiência Profissional'}
              </label>
              <textarea
                rows={2}
                placeholder={userType === 'contractor' ? 'Descreva os tipos de eventos que realiza e estrutura...' : 'Ex: Experiência em eventos, pontualidade e dedicação...'}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-medium focus:border-emerald-400 focus:outline-none"
              />
            </div>

            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={handleLoadDemoData}
                className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1.5 transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Preencher dados de exemplo</span>
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
                >
                  {isFirstAccess ? 'Explorar Vagas sem Salvar' : 'Cancelar'}
                </button>

                <button
                  type="submit"
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-300 hover:to-green-400 text-slate-950 text-xs font-black shadow-lg shadow-emerald-500/20 transition transform active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Dados no Navegador</span>
                </button>
              </div>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
