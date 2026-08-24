import React, { useState } from 'react';
import { 
  Clock, 
  MapPin, 
  Share2, 
  ExternalLink, 
  CheckCircle2, 
  Users, 
  Navigation, 
  Copy, 
  Check, 
  Tag, 
  Phone,
  GraduationCap
} from 'lucide-react';
import { FreelanceJob } from '../types';
import { formatCurrency, formatDateBr, createGoogleMapsDirectionsLink, createWazeLink, createWhatsAppLink } from '../utils/formatters';

interface JobCardProps {
  job: FreelanceJob;
  onApply: (job: FreelanceJob) => void;
  onPreviewWhatsApp: (job: FreelanceJob) => void;
  onSelectCandidateManager?: (job: FreelanceJob) => void;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  onApply,
  onPreviewWhatsApp,
  onSelectCandidateManager
}) => {
  const [copied, setCopied] = useState(false);

  const isFilled = job.slotsAvailable <= 0 || job.status === 'filled';
  const mapsUrl = job.googleMapsUrl || createGoogleMapsDirectionsLink(job.locationAddress, job.locationName);
  const wazeUrl = createWazeLink(job.locationAddress);

  const locationDisplay = `${job.neighborhood || ''}${job.neighborhood && job.city ? ', ' : ''}${job.city || ''} (${job.state || 'SP'})`;

  const handleCopyLink = () => {
    const textToCopy = `🚨 VAGA FREELAHUB: ${job.role}\n📍 ${locationDisplay} - ${job.locationAddress}\n💰 Cachê: ${formatCurrency(job.cachet)} (${job.paymentDetails})\n🗺️ Rota: ${mapsUrl}\n📞 Contato: ${job.contactPhone}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDirectWhatsAppContact = () => {
    const msg = `Olá! Vi a vaga de *${job.role}* (${locationDisplay}) para *${job.date}* (${job.startTime} às ${job.endTime}) no FreelaHub com cachê de ${formatCurrency(job.cachet)} e tenho interesse imediato. Como posso confirmar minha presença?`;
    window.open(createWhatsAppLink(job.contactPhone, msg), '_blank');
  };

  return (
    <div 
      id={`job-card-${job.id}`}
      className={`group relative rounded-2xl p-5 sm:p-6 transition-all duration-200 ${
        job.isUrgent
          ? 'bg-slate-900/95 border-2 border-emerald-500/50 hover:border-emerald-400 shadow-xl shadow-emerald-950/30'
          : 'bg-slate-900/80 border border-slate-800 hover:border-slate-700 shadow-lg'
      } ${isFilled ? 'opacity-85' : ''}`}
    >
      {/* Top Tag & Status */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {job.isUrgent ? (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-500 text-white shadow-md shadow-rose-500/30 animate-pulse">
              <span>🚨</span>
              <span>VAGA PARA HOJE (URGENTE)</span>
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              {job.category || 'Eventos & Festas'}
            </span>
          )}

          {/* Strict Locality Badge: Estado, Cidade, Bairro */}
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-950 text-slate-300 border border-slate-700">
            <MapPin className="w-3 h-3 text-cyan-400" />
            <span>{job.neighborhood ? `${job.neighborhood}, ` : ''}{job.city || 'São Paulo'} - {job.state || 'SP'}</span>
          </span>

          {isFilled ? (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              Vagas Preenchidas
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>{job.slotsAvailable} de {job.slotsTotal} {job.slotsTotal === 1 ? 'vaga restante' : 'vagas restantes'}</span>
            </span>
          )}
        </div>

        {/* Quick share actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onPreviewWhatsApp(job)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-slate-300 bg-slate-800 hover:bg-emerald-950/80 hover:text-emerald-300 hover:border-emerald-500/40 border border-slate-700/80 text-[11px] font-bold transition"
            title="Compartilhar vaga em grupos ou para um contato"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Compartilhar Vaga</span>
          </button>
          <button
            onClick={handleCopyLink}
            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 border border-transparent hover:border-slate-700 transition"
            title="Copiar dados da vaga"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Role Title & Cachet Highlight */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white group-hover:text-emerald-300 transition tracking-tight">
            💼 {job.role}
          </h2>
          {job.locationName && (
            <p className="text-xs sm:text-sm text-slate-400 font-medium mt-0.5">
              {job.locationName} • <span className="text-slate-300 font-semibold">{locationDisplay}</span>
            </p>
          )}
        </div>

        {/* Big Cachet Box */}
        <div className="inline-flex sm:flex-col items-baseline sm:items-end justify-between px-3.5 py-2 sm:p-0 rounded-xl bg-slate-950 sm:bg-transparent border sm:border-0 border-slate-800">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold sm:mb-0.5">
            Cachê Freelancer
          </div>
          <div className="text-2xl font-black text-emerald-400 tracking-tight">
            {formatCurrency(job.cachet)}
          </div>
          <div className="text-[11px] text-emerald-300/80 font-medium">
            ({job.paymentDetails})
          </div>
        </div>
      </div>

      {/* Structured Job Meta Specs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4 text-xs text-slate-300 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80">
        
        {/* Date & Time */}
        <div className="flex items-start gap-2">
          <Clock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-white">📅 Data & Horário:</span>
            <div className="text-slate-300">
              {formatDateBr(job.date)} • <span className="font-semibold text-emerald-300">Das {job.startTime} às {job.endTime}</span>
            </div>
          </div>
        </div>

        {/* Location & Directions */}
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <span className="font-bold text-white">📍 Local ({locationDisplay}):</span>
            <div className="text-slate-300 truncate font-medium" title={job.locationAddress}>
              {job.locationAddress}
            </div>
            <div className="flex items-center gap-3 mt-1 text-[11px]">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-bold underline underline-offset-2"
              >
                <Navigation className="w-3 h-3" />
                <span>Traçar Rota no Maps</span>
              </a>
              <a
                href={wazeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-medium"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Waze</span>
              </a>
            </div>
          </div>
        </div>

        {/* Dress Code */}
        <div className="flex items-start gap-2">
          <span className="text-blue-400 shrink-0 mt-0.5">👕</span>
          <div>
            <span className="font-bold text-white">Vestimenta:</span>
            <div className="text-slate-300 font-medium">
              {job.dressCode}
            </div>
          </div>
        </div>

        {/* Benefits or Contact */}
        <div className="flex items-start gap-2">
          {job.benefits ? (
            <>
              <span className="text-amber-400 shrink-0 mt-0.5">🍔</span>
              <div>
                <span className="font-bold text-white">Benefícios:</span>
                <div className="text-slate-300">
                  {job.benefits}
                </div>
              </div>
            </>
          ) : (
            <>
              <Phone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white">Contato:</span>
                <div className="text-slate-300">
                  {job.contactPhone} {job.contactName && `(${job.contactName})`}
                </div>
              </div>
            </>
          )}
        </div>

      </div>

      {/* Desired Skills */}
      {job.desiredSkills && job.desiredSkills.length > 0 && (
        <div className="mb-2.5">
          <div className="text-[11px] font-bold text-slate-400 mb-1 flex items-center gap-1">
            <Tag className="w-3 h-3 text-emerald-400" />
            <span>Habilidades & Competências:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {job.desiredSkills.map((skill, idx) => (
              <span key={idx} className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                ★ {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Required Certifications / Cursos Técnicos */}
      {job.requiredCertifications && job.requiredCertifications.length > 0 && (
        <div className="mb-3 p-2 rounded-xl bg-amber-950/30 border border-amber-500/40">
          <div className="text-[11px] font-bold text-amber-300 mb-1.5 flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Cursos & Certificações Requeridas:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {job.requiredCertifications.map((cert, idx) => (
              <span key={idx} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-200 border border-amber-500/40">
                🏅 {cert}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Requirements Tags */}
      {job.requirements && job.requirements.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {job.requirements.map((req, idx) => (
            <span key={idx} className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/60">
              ✓ {req}
            </span>
          ))}
        </div>
      )}

      {/* Bottom Actions Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-3 border-t border-slate-800/80">
        
        {/* Contact direct link */}
        <button
          onClick={handleDirectWhatsAppContact}
          className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-400 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 transition"
        >
          <Phone className="w-3.5 h-3.5" />
          <span>Chamar no WhatsApp ({job.contactPhone})</span>
        </button>

        <div className="flex items-center gap-2">
          {onSelectCandidateManager && (
            <button
              onClick={() => onSelectCandidateManager(job)}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition"
              title="Gerenciar inscritos e pagar PIX"
            >
              Inscritos ({job.applicants?.length || 0})
            </button>
          )}

          <button
            id={`btn-apply-${job.id}`}
            disabled={isFilled}
            onClick={() => onApply(job)}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition transform active:scale-95 ${
              isFilled
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-300 hover:to-green-400 text-slate-950 shadow-md shadow-emerald-500/20'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isFilled ? 'Vagas Esgotadas' : 'Candidatar-se na Vaga'}</span>
          </button>
        </div>

      </div>

    </div>
  );
};
