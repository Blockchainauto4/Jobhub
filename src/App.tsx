import React, { useState, useEffect } from 'react';
import { 
  Navbar 
} from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { JobCard } from './components/JobCard';
import { ApplyModal } from './components/ApplyModal';
import { CreateJobModal } from './components/CreateJobModal';
import { CandidatesManager } from './components/CandidatesManager';
import { InteractiveMapRadar } from './components/InteractiveMapRadar';
import { FreelancerCalculator } from './components/FreelancerCalculator';
import { WhatsAppPreviewModal } from './components/WhatsAppPreviewModal';
import { DatabaseSettingsModal } from './components/DatabaseSettingsModal';
import { FreelanceJob, JobApplicant } from './types';
import { Briefcase, AlertCircle, RefreshCw, Sparkles, Filter } from 'lucide-react';

const CATEGORIES = [
  'Todas',
  'Eventos & Festas',
  'Bares & Restaurantes',
  'Logística & Cargas',
  'Limpeza & Serviços',
  'Hotelaria & Recepção'
];

export default function App() {
  const [jobs, setJobs] = useState<FreelanceJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'jobs' | 'candidates' | 'calculator' | 'radar'>('jobs');
  
  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [onlyUrgent, setOnlyUrgent] = useState(false);

  // Modals state
  const [applyModalJob, setApplyModalJob] = useState<FreelanceJob | null>(null);
  const [whatsAppModalJob, setWhatsAppModalJob] = useState<FreelanceJob | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDbSettingsOpen, setIsDbSettingsOpen] = useState(false);
  const [candidateManagerJobId, setCandidateManagerJobId] = useState<string | undefined>(undefined);

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

  // Filtered jobs logic
  const filteredJobs = jobs.filter(job => {
    if (onlyUrgent && !job.isUrgent) return false;
    if (selectedCategory !== 'Todas' && job.category !== selectedCategory) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        job.title.toLowerCase().includes(q) ||
        job.role.toLowerCase().includes(q) ||
        job.locationAddress.toLowerCase().includes(q) ||
        (job.locationName && job.locationName.toLowerCase().includes(q)) ||
        (job.neighborhood && job.neighborhood.toLowerCase().includes(q)) ||
        job.dressCode.toLowerCase().includes(q)
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
        onOpenCreateJob={() => setIsCreateModalOpen(true)}
        onOpenDbSettings={() => setIsDbSettingsOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Tab 1: Feed de Vagas */}
        {activeTab === 'jobs' && (
          <div className="space-y-6">
            <HeroBanner
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              categories={CATEGORIES}
              onlyUrgent={onlyUrgent}
              setOnlyUrgent={setOnlyUrgent}
            />

            {/* Results count & quick actions */}
            <div className="flex items-center justify-between gap-4 px-1">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Filter className="w-4 h-4 text-emerald-400" />
                <span>Mostrando <strong className="text-white">{filteredJobs.length}</strong> vagas disponíveis</span>
              </div>

              <button
                onClick={fetchJobs}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition flex items-center gap-1.5 text-xs font-semibold"
                title="Atualizar feed"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Atualizar</span>
              </button>
            </div>

            {/* Jobs List / Grid */}
            {isLoading && jobs.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
                <p className="text-sm text-slate-400">Carregando oportunidades FreelaHub...</p>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-16 rounded-2xl bg-slate-900/60 border border-slate-800 p-6 space-y-3">
                <Briefcase className="w-12 h-12 text-slate-600 mx-auto" />
                <h3 className="text-lg font-bold text-white">Nenhuma vaga encontrada com estes filtros</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Tente limpar a busca ou seja o primeiro a publicar uma nova oportunidade no mural.
                </p>
                <button
                  onClick={() => { setSearchTerm(''); setSelectedCategory('Todas'); setOnlyUrgent(false); }}
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
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white">Freela<span className="text-emerald-400">Hub</span></span>
            <span>• Trabalho que conecta</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <button onClick={() => setIsDbSettingsOpen(true)} className="hover:text-emerald-400 transition">
              PostgreSQL & Neon DB
            </button>
            <span>•</span>
            <button onClick={() => setIsCreateModalOpen(true)} className="hover:text-emerald-400 transition">
              Publicar Vaga
            </button>
          </div>

          <div className="text-[11px] text-slate-600">
            © {new Date().getFullYear()} FreelaHub. Todos os direitos reservados.
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ApplyModal
        job={applyModalJob}
        onClose={() => setApplyModalJob(null)}
        onSubmitApplication={handleApply}
      />

      <CreateJobModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onJobCreated={handleJobCreated}
      />

      <WhatsAppPreviewModal
        job={whatsAppModalJob}
        onClose={() => setWhatsAppModalJob(null)}
      />

      <DatabaseSettingsModal
        isOpen={isDbSettingsOpen}
        onClose={() => setIsDbSettingsOpen(false)}
        onDbReset={handleDbReset}
      />

    </div>
  );
}
