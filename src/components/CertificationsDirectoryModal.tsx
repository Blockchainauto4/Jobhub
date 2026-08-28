import React, { useState } from 'react';
import { 
  X, 
  Award, 
  BookOpen, 
  ShieldCheck, 
  ExternalLink, 
  CheckCircle2, 
  DollarSign, 
  Sparkles, 
  AlertTriangle, 
  Search, 
  Building2, 
  FileCheck,
  Zap,
  Tag,
  GraduationCap
} from 'lucide-react';
import { ALL_CERTIFICATIONS, SECTOR_CERTIFICATIONS } from '../data/certificationsData';
import { JobSector, UserProfile, CertificationItem } from '../types';

interface CertificationsDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile?: UserProfile | null;
  onAddCertificationToProfile?: (certName: string) => void;
}

export const CertificationsDirectoryModal: React.FC<CertificationsDirectoryModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onAddCertificationToProfile
}) => {
  const [selectedSector, setSelectedSector] = useState<string>('Todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [onlyMandatory, setOnlyMandatory] = useState(false);
  const [addedCertToast, setAddedCertToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const sectors = ['Todas', ...Object.keys(SECTOR_CERTIFICATIONS)];

  const filteredCertifications = ALL_CERTIFICATIONS.filter(cert => {
    const matchesSector = selectedSector === 'Todas' || cert.category === selectedSector;
    const matchesSearch = 
      cert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.issuingEntity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMandatory = onlyMandatory ? cert.isMandatoryByLaw : true;

    return matchesSector && matchesSearch && matchesMandatory;
  });

  const handleAddCert = (cert: CertificationItem) => {
    if (onAddCertificationToProfile) {
      onAddCertificationToProfile(cert.name);
      setAddedCertToast(`"${cert.name}" adicionado à sua Ficha Profissional!`);
      setTimeout(() => setAddedCertToast(null), 3000);
    }
  };

  const isCertInProfile = (certName: string) => {
    return userProfile?.certifications?.includes(certName);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/90 backdrop-blur-md flex justify-center items-center p-2 sm:p-4 animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[92dvh] sm:max-h-[88vh] flex flex-col bg-slate-900 border border-emerald-500/40 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden min-h-0">
        
        {/* Modal Header (Pinned) */}
        <div className="p-3.5 sm:p-5 shrink-0 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border-b border-emerald-900/50">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <h2 className="text-base sm:text-lg font-bold text-white">
                    Guia de Cursos & Certificações
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-semibold">
                    Cachês +45%
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5 line-clamp-1 sm:line-clamp-none">
                  Exigências legais e capacitações técnicas (ANVISA, NRs, Finanças e Segurança).
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition shrink-0"
              title="Fechar"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Toast Notification */}
          {addedCertToast && (
            <div className="mt-3 p-3 bg-emerald-900/90 border border-emerald-400 rounded-xl text-emerald-100 text-xs sm:text-sm flex items-center gap-2 shadow-lg animate-fade-in">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-300 flex-shrink-0" />
              <span className="font-semibold">{addedCertToast}</span>
            </div>
          )}

          {/* Search and Filters */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-2.5">
            <div className="md:col-span-6 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="text"
                placeholder="Buscar por curso, ANBIMA, ANVISA, NR-11, Caixa, etc..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-400 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="md:col-span-4">
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="w-full py-2.5 px-3 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-emerald-500"
              >
                {sectors.map((sec) => (
                  <option key={sec} value={sec}>
                    {sec}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2 flex items-center">
              <button
                type="button"
                onClick={() => setOnlyMandatory(!onlyMandatory)}
                className={`w-full py-2 px-2.5 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                  onlyMandatory
                    ? 'bg-amber-950/80 border-amber-500 text-amber-300'
                    : 'bg-slate-950 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Obrigatório</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 flex-1 overflow-y-auto custom-scrollbar space-y-4">
          {/* Important Sector Highlights Banner */}
          <div className="p-4 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/40 rounded-xl border border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-emerald-300">
                  Por que cursos específicos aumentam seus ganhos?
                </h4>
                <p className="text-xs text-slate-400">
                  Contratantes de grandes eventos, camarotes e produções pagam cachês superiores (R$ 180 a R$ 350/diária) para freelancers que apresentam comprovante técnico.
                </p>
              </div>
            </div>
          </div>

          {filteredCertifications.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <FileCheck className="w-12 h-12 mx-auto text-slate-600 mb-2" />
              <p className="text-base font-semibold text-slate-300">Nenhuma certificação encontrada com esses filtros</p>
              <p className="text-sm">Tente buscar por termos mais genéricos como "Caixa", "NR" ou "Alimentos".</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCertifications.map((cert) => {
                const inProfile = isCertInProfile(cert.name);

                return (
                  <div
                    key={cert.id}
                    className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-emerald-500/50 transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[11px] font-semibold">
                          {cert.category}
                        </span>

                        {cert.isMandatoryByLaw ? (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
                            <AlertTriangle className="w-3 h-3 text-amber-400" />
                            Exigência Legal
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold">
                            <Sparkles className="w-3 h-3 text-emerald-400" />
                            Diferencial VIP
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-white mb-1">
                        {cert.name}
                      </h3>

                      <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                        {cert.description}
                      </p>

                      <div className="text-[11px] text-slate-400 bg-slate-900/90 p-2 rounded-lg border border-slate-800/80 mb-3">
                        <strong className="text-slate-300 block mb-0.5">Órgão Emissor / Normativa:</strong>
                        <span>{cert.issuingEntity}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/60">
                      {cert.officialUrl ? (
                        <a
                          href={cert.officialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Onde Fazer / Consultar</span>
                          <ExternalLink className="w-3 h-3 ml-0.5" />
                        </a>
                      ) : (
                        <span className="text-[11px] text-slate-500">Curso Livre / Reconhecido</span>
                      )}

                      {onAddCertificationToProfile && (
                        <button
                          type="button"
                          onClick={() => handleAddCert(cert)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                            inProfile
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                              : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950'
                          }`}
                        >
                          {inProfile ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Na Ficha</span>
                            </>
                          ) : (
                            <>
                              <Award className="w-3.5 h-3.5" />
                              <span>Adicionar à Minha Ficha</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Certificados cadastrados em sua Ficha Profissional são destacados automaticamente nas candidaturas.</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
