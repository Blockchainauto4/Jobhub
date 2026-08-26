import React, { useState, useEffect } from 'react';
import { 
  Navbar 
} from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { NationalStatsBanner } from './components/NationalStatsBanner';
import { SkillsDirectoryModal } from './components/SkillsDirectoryModal';
import { CertificationsDirectoryModal } from './components/CertificationsDirectoryModal';
import { JobCard } from './components/JobCard';
import { ApplyModal } from './components/ApplyModal';
import { CreateJobModal } from './components/CreateJobModal';
import { CandidatesManager } from './components/CandidatesManager';
import { InteractiveMapRadar } from './components/InteractiveMapRadar';
import { FreelancerCalculator } from './components/FreelancerCalculator';
import { WhatsAppPreviewModal } from './components/WhatsAppPreviewModal';
import { DatabaseSettingsModal } from './components/DatabaseSettingsModal';
import { UserProfileModal } from './components/UserProfileModal';
import { MissionsRewardsModal } from './components/MissionsRewardsModal';
import { SponsorContactUnlockModal } from './components/SponsorContactUnlockModal';
import { FreelanceJob, JobApplicant, BrazilState, UserProfile } from './types';
import { Briefcase, RefreshCw, Filter, UserCheck, GraduationCap, Tag, Gift, Sparkles, Lock } from 'lucide-react';

const CATEGORIES = [
  'Todas',
  'Finanças & Caixa de Eventos',
  'Eventos & Festas',
  'Bares & Restaurantes',
  'Logística & Cargas',
  'Limpeza & Serviços',
  'Hotelaria & Recepção',
  'Segurança & Apoio',
  'Audiovisual & Montagem'
];

const USER_PROFILE_STORAGE_KEY = 'freelahub_user_profile';

export default function App() {
  const [jobs, setJobs] = useState<FreelanceJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'jobs' | 'candidates' | 'calculator' | 'radar'>('jobs');
  
  // User Profile in LocalStorage (Cache)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);
  const [isFirstAccessOnboarding, setIsFirstAccessOnboarding] = useState(false);
  const [isMissionsModalOpen, setIsMissionsModalOpen] = useState(false);

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [selectedState, setSelectedState] = useState('Todos');
  const [selectedCity, setSelectedCity] = useState('Todas as Cidades');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('Todos os Bairros');
  const [onlyUrgent, setOnlyUrgent] = useState(false);

  // Modals state
  const [applyModalJob, setApplyModalJob] = useState<FreelanceJob | null>(null);
  const [whatsAppModalJob, setWhatsAppModalJob] = useState<FreelanceJob | null>(null);
  const [unlockModalJob, setUnlockModalJob] = useState<FreelanceJob | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDbSettingsOpen, setIsDbSettingsOpen] = useState(false);
  const [isSkillsDirectoryOpen, setIsSkillsDirectoryOpen] = useState(false);
  const [isCertificationsDirectoryOpen, setIsCertificationsDirectoryOpen] = useState(false);
  const [candidateManagerJobId, setCandidateManagerJobId] = useState<string | undefined>(undefined);

  // Load User Profile from Cache on first mount
  useEffect(() => {
    try {
      const cached = localStorage.getItem(USER_PROFILE_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        setUserProfile(parsed);
      } else {
        // First access: prompt onboarding modal to setup profile/company
        setIsFirstAccessOnboarding(true);
        setIsUserProfileOpen(true);
      }
    } catch (err) {
      console.warn('Erro ao carregar perfil em cache:', err);
    }
  }, []);

  const handleSaveUserProfile = (profile: UserProfile) => {
    try {
      const isFirst = isFirstAccessOnboarding;
      localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(profile));
      setUserProfile(profile);
      setIsFirstAccessOnboarding(false);

      // On first onboarding complete, seamlessly open the TikTok & Kwai referral missions & 50 credits
      if (isFirst) {
        setTimeout(() => {
          setIsMissionsModalOpen(true);
        }, 1100);
      }
    } catch (err) {
      console.error('Erro ao salvar perfil:', err);
    }
  };

  const handleUpdateMissions = (updatedMissions: UserProfile['missionsCompleted'], newCredits: number) => {
    if (!userProfile) {
      const tempProfile: UserProfile = {
        id: `user-${Date.now()}`,
        userType: 'freelancer',
        name: 'Usuário FreelaHub',
        phone: '',
        pixType: 'phone',
        pixKey: '',
        state: 'SP',
        city: 'São Paulo',
        neighborhood: 'Centro',
        skills: ['Atendimento VIP & Recepcionista'],
        certifications: [],
        completedJobsCount: 0,
        totalEarnings: 0,
        credits: newCredits,
        missionsCompleted: updatedMissions,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      handleSaveUserProfile(tempProfile);
      return;
    }

    const updated: UserProfile = {
      ...userProfile,
      credits: newCredits,
      missionsCompleted: updatedMissions,
      updatedAt: new Date().toISOString()
    };
    handleSaveUserProfile(updated);
  };

  const handleContactUnlocked = (jobId: string) => {
    if (!userProfile) {
      const tempProfile: UserProfile = {
        id: `user-${Date.now()}`,
        userType: 'freelancer',
        name: 'Usuário FreelaHub',
        phone: '',
        pixType: 'phone',
        pixKey: '',
        state: 'SP',
        city: 'São Paulo',
        neighborhood: 'Centro',
        skills: ['Logística de Eventos', 'Pontualidade'],
        certifications: [],
        completedJobsCount: 0,
        totalEarnings: 0,
        credits: 50,
        unlockedJobContacts: [jobId],
        missionsCompleted: {
          tiktokReferral: true,
          kwaiReferral: false,
          whatsappGroupJoined: false
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      handleSaveUserProfile(tempProfile);
      return;
    }

    const existingUnlocked = userProfile.unlockedJobContacts || [];
    const updatedList = existingUnlocked.includes(jobId) ? existingUnlocked : [...existingUnlocked, jobId];
    const updated: UserProfile = {
      ...userProfile,
      unlockedJobContacts: updatedList,
      missionsCompleted: {
        ...(userProfile.missionsCompleted || { kwaiReferral: false, whatsappGroupJoined: false }),
        tiktokReferral: true
      },
      updatedAt: new Date().toISOString()
    };
    handleSaveUserProfile(updated);
  };

  // Fetch initial jobs
  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/jobs');
      if (!res.ok) throw new Error('Falha ao obter vagas');
      const data = await res.json();
      setJobs(data);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Filtered jobs logic by State, City, Neighborhood, Category and Text Search
  const filteredJobs = jobs.filter(job => {
    if (onlyUrgent && !job.isUrgent) return false;
    if (selectedCategory !== 'Todas' && job.category !== selectedCategory) return false;
    if (selectedState !== 'Todos' && job.state && job.state !== selectedState) return false;
    if (selectedCity !== 'Todas as Cidades' && job.city && job.city !== selectedCity) return false;
    if (selectedNeighborhood !== 'Todos os Bairros' && job.neighborhood && job.neighborhood !== selectedNeighborhood) return false;
    
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const skillsMatch = job.desiredSkills?.some(s => s.toLowerCase().includes(q));
      const certsMatch = job.requiredCertifications?.some(c => c.toLowerCase().includes(q));
      return (
        job.title.toLowerCase().includes(q) ||
        job.role.toLowerCase().includes(q) ||
        job.locationAddress.toLowerCase().includes(q) ||
        (job.locationName && job.locationName.toLowerCase().includes(q)) ||
        (job.neighborhood && job.neighborhood.toLowerCase().includes(q)) ||
        (job.city && job.city.toLowerCase().includes(q)) ||
        (job.state && job.state.toLowerCase().includes(q)) ||
        job.dressCode.toLowerCase().includes(q) ||
        Boolean(skillsMatch) ||
        Boolean(certsMatch)
      );
    }
    return true;
  });

  // Apply handler
  const handleApply = async (jobId: string, applicantData: {
    name: string;
    whatsapp: string;
    pixKey: string;
    pixType: 'cpf' | 'email' | 'phone' | 'random';
    experienceSummary: string;
    skills?: string[];
    certifications?: string[];
    state?: BrazilState;
    city?: string;
    neighborhood?: string;
  }) => {
    const res = await fetch(`/api/jobs/${jobId}/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(applicantData)
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao enviar candidatura');
    }

    await fetchJobs();
  };

  // Update candidate status
  const handleUpdateApplicantStatus = async (
    jobId: string, 
    applicantId: string, 
    status: JobApplicant['status'], 
    notes?: string,
    paidAmount?: number
  ) => {
    const res = await fetch(`/api/jobs/${jobId}/applicants/${applicantId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notes, paidAmount })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Falha ao atualizar candidato');
    }

    await fetchJobs();
  };

  // Job created callback
  const handleJobCreated = (newJob: FreelanceJob) => {
    setJobs(prev => [newJob, ...prev]);
    setActiveTab('jobs');
  };

  // DB reset callback
  const handleDbReset = async () => {
    const res = await fetch('/api/db-reset', { method: 'POST' });
    if (!res.ok) throw new Error('Falha ao reiniciar banco');
    await fetchJobs();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        jobs={jobs}
        userProfile={userProfile}
        onOpenUserProfile={() => setIsUserProfileOpen(true)}
        onOpenCreateJob={() => setIsCreateModalOpen(true)}
        onOpenDbSettings={() => setIsDbSettingsOpen(true)}
        onOpenMissionsModal={() => setIsMissionsModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Tab 1: Feed de Vagas */}
        {activeTab === 'jobs' && (
          <div className="space-y-6">
            
            {/* National Platform Stats */}
            <NationalStatsBanner />

            {/* Main Interactive Hero Banner with Search, State/City/Neighborhood Filters */}
            <HeroBanner
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              categories={CATEGORIES}
              selectedState={selectedState}
              setSelectedState={setSelectedState}
              selectedCity={selectedCity}
              setSelectedCity={setSelectedCity}
              selectedNeighborhood={selectedNeighborhood}
              setSelectedNeighborhood={setSelectedNeighborhood}
              onlyUrgent={onlyUrgent}
              setOnlyUrgent={setOnlyUrgent}
              onOpenSkillsDirectory={() => setIsSkillsDirectoryOpen(true)}
              onOpenCertificationsGuide={() => setIsCertificationsDirectoryOpen(true)}
              onOpenCreateJob={() => setIsCreateModalOpen(true)}
              onOpenMissionsModal={() => setIsMissionsModalOpen(true)}
            />

            {/* Results count & quick actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 px-1">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Filter className="w-4 h-4 text-emerald-400" />
                <span>
                  Mostrando <strong className="text-white">{filteredJobs.length}</strong> vagas disponíveis
                  {selectedState !== 'Todos' && ` em ${selectedState}`}
                  {selectedCity !== 'Todas as Cidades' && ` • ${selectedCity}`}
                  {selectedNeighborhood !== 'Todos os Bairros' && ` (${selectedNeighborhood})`}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMissionsModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/20 to-emerald-500/20 hover:from-amber-500/30 hover:to-emerald-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Gift className="w-3.5 h-3.5 text-amber-400" />
                  <span>R$ 50,00 & Missões</span>
                </button>

                <button
                  onClick={() => setIsUserProfileOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-emerald-300 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Minha Ficha Profissional</span>
                </button>

                <button
                  onClick={() => setIsCertificationsDirectoryOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-amber-950/60 hover:bg-amber-900/70 border border-amber-500/40 text-amber-300 text-xs font-bold transition flex items-center gap-1.5"
                  title="Guia de Cursos e Certificações Técnicas Obrigatórias"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Cursos & Certificações</span>
                </button>

                <button
                  onClick={() => setIsSkillsDirectoryOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Tag className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Habilidades</span>
                </button>

                <button
                  onClick={fetchJobs}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition flex items-center gap-1.5 text-xs font-semibold"
                  title="Atualizar feed"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Atualizar</span>
                </button>
              </div>
            </div>

            {/* Jobs List / Grid */}
            {isLoading && jobs.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
                <p className="text-sm text-slate-400">Carregando oportunidades FreelaHub Brasil...</p>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-16 rounded-2xl bg-slate-900/60 border border-slate-800 p-6 space-y-3">
                <Briefcase className="w-12 h-12 text-slate-600 mx-auto" />
                <h3 className="text-lg font-bold text-white">Nenhuma vaga encontrada para os filtros selecionados</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Tente alterar o estado, cidade, bairro ou limpar a busca textual.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('Todas');
                    setSelectedState('Todos');
                    setSelectedCity('Todas as Cidades');
                    setSelectedNeighborhood('Todos os Bairros');
                    setOnlyUrgent(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition"
                >
                  Limpar Todos os Filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredJobs.map(job => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onApply={(j) => setApplyModalJob(j)}
                    onPreviewWhatsApp={(j) => setWhatsAppModalJob(j)}
                    onUnlockContact={(j) => setUnlockModalJob(j)}
                    isContactUnlocked={Boolean(
                      userProfile?.unlockedJobContacts?.includes(job.id) || 
                      userProfile?.missionsCompleted?.tiktokReferral
                    )}
                    onSelectCandidateManager={(j) => {
                      setCandidateManagerJobId(j.id);
                      setActiveTab('candidates');
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Gestão de Contratações */}
        {activeTab === 'candidates' && (
          <CandidatesManager
            jobs={jobs}
            selectedJobId={candidateManagerJobId}
            onUpdateApplicantStatus={handleUpdateApplicantStatus}
          />
        )}

        {/* Tab 3: Radar de Vagas & Rotas */}
        {activeTab === 'radar' && (
          <InteractiveMapRadar
            jobs={jobs}
            onSelectJob={(j) => {
              setApplyModalJob(j);
            }}
          />
        )}

        {/* Tab 4: Calculadora de Ganhos PIX */}
        {activeTab === 'calculator' && (
          <FreelancerCalculator />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-8 px-4 sm:px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img 
              src="/freelahub_logo.png" 
              alt="FreelaHub" 
              className="w-6 h-6 rounded-md object-cover border border-emerald-500/30"
              referrerPolicy="no-referrer"
            />
            <span className="font-extrabold text-white">Freela<span className="text-emerald-400">Hub</span></span>
            <span>• Trabalho que conecta em todo o Brasil</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <button onClick={() => setIsMissionsModalOpen(true)} className="hover:text-amber-400 transition text-amber-300 font-bold">
              🎁 Missões & R$ 50
            </button>
            <span>•</span>
            <button onClick={() => setIsUserProfileOpen(true)} className="hover:text-emerald-400 transition">
              Minha Ficha / Perfil
            </button>
            <span>•</span>
            <button onClick={() => setIsCertificationsDirectoryOpen(true)} className="hover:text-emerald-400 transition">
              Cursos & Certificações
            </button>
            <span>•</span>
            <button onClick={() => setIsSkillsDirectoryOpen(true)} className="hover:text-emerald-400 transition">
              Diretório de Habilidades
            </button>
            <span>•</span>
            <button onClick={() => setIsDbSettingsOpen(true)} className="hover:text-emerald-400 transition">
              PostgreSQL & Neon DB
            </button>
            <span>•</span>
            <button onClick={() => setIsCreateModalOpen(true)} className="hover:text-emerald-400 transition">
              Publicar Vaga
            </button>
          </div>

          <div className="text-[11px] text-slate-600">
            © {new Date().getFullYear()} FreelaHub Brasil. Todos os direitos reservados.
          </div>
        </div>
      </footer>

      {/* Modals */}
      <UserProfileModal
        isOpen={isUserProfileOpen}
        onClose={() => setIsUserProfileOpen(false)}
        userProfile={userProfile}
        onSaveProfile={handleSaveUserProfile}
        isFirstAccess={isFirstAccessOnboarding}
      />

      <MissionsRewardsModal
        isOpen={isMissionsModalOpen}
        onClose={() => setIsMissionsModalOpen(false)}
        userProfile={userProfile}
        onUpdateMissions={handleUpdateMissions}
      />

      <ApplyModal
        job={applyModalJob}
        userProfile={userProfile}
        onClose={() => setApplyModalJob(null)}
        onSubmitApplication={handleApply}
      />

      <CreateJobModal
        isOpen={isCreateModalOpen}
        userProfile={userProfile}
        onClose={() => setIsCreateModalOpen(false)}
        onJobCreated={handleJobCreated}
      />

      <WhatsAppPreviewModal
        job={whatsAppModalJob}
        onClose={() => setWhatsAppModalJob(null)}
      />

      <SkillsDirectoryModal
        isOpen={isSkillsDirectoryOpen}
        onClose={() => setIsSkillsDirectoryOpen(false)}
        onSelectSkill={(skill) => {
          setSearchTerm(skill);
          setActiveTab('jobs');
        }}
      />

      <CertificationsDirectoryModal
        isOpen={isCertificationsDirectoryOpen}
        onClose={() => setIsCertificationsDirectoryOpen(false)}
        userProfile={userProfile}
        onAddCertificationToProfile={(certName) => {
          if (userProfile) {
            const current = userProfile.certifications || [];
            if (!current.includes(certName)) {
              const updated = { ...userProfile, certifications: [...current, certName] };
              handleSaveUserProfile(updated);
            }
          }
        }}
      />

      <DatabaseSettingsModal
        isOpen={isDbSettingsOpen}
        onClose={() => setIsDbSettingsOpen(false)}
        onDbReset={handleDbReset}
      />

      <SponsorContactUnlockModal
        isOpen={Boolean(unlockModalJob)}
        job={unlockModalJob}
        userProfile={userProfile}
        onClose={() => setUnlockModalJob(null)}
        onContactUnlocked={handleContactUnlocked}
      />

    </div>
  );
}
