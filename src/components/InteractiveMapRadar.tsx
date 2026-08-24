import React, { useState } from 'react';
import { MapPin, Navigation, ExternalLink, Compass, ShieldCheck, Clock, Users, ArrowRight } from 'lucide-react';
import { FreelanceJob } from '../types';
import { formatCurrency, createGoogleMapsDirectionsLink, createWazeLink } from '../utils/formatters';

interface InteractiveMapRadarProps {
  jobs: FreelanceJob[];
  onSelectJob: (job: FreelanceJob) => void;
}

export const InteractiveMapRadar: React.FC<InteractiveMapRadarProps> = ({
  jobs,
  onSelectJob
}) => {
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('all');

  // Extract unique neighborhoods/regions
  const neighborhoods = Array.from(new Set(jobs.map(j => j.neighborhood || 'São Paulo')));

  const filteredJobs = selectedNeighborhood === 'all'
    ? jobs
    : jobs.filter(j => j.neighborhood === selectedNeighborhood);

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Compass className="w-4 h-4" />
              <span>Geolocalização & Rotas</span>
            </div>
            <h2 className="text-2xl font-black text-white">
              Radar de Vagas por Bairro & Rotas no Maps
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Calcule seu tempo de deslocamento, confira o endereço exato das casas de eventos e trace a rota no Google Maps ou Waze.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Filtrar Região:</span>
            <select
              value={selectedNeighborhood}
              onChange={(e) => setSelectedNeighborhood(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="all">Todas as Regiões ({jobs.length} vagas)</option>
              {neighborhoods.map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Location Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredJobs.map((job) => {
          const mapsUrl = job.googleMapsUrl || createGoogleMapsDirectionsLink(job.locationAddress, job.locationName);
          const wazeUrl = createWazeLink(job.locationAddress);

          return (
            <div
              key={job.id}
              className="flex flex-col justify-between rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 p-5 transition shadow-lg group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    {job.neighborhood || 'São Paulo'}
                  </span>

                  {job.isUrgent && (
                    <span className="flex items-center gap-1 text-[10px] font-black text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/30">
                      <span>🚨</span> URGENTE
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-black text-white group-hover:text-emerald-300 transition">
                  {job.role}
                </h3>
                
                {job.locationName && (
                  <div className="text-xs font-bold text-slate-300 mt-0.5">
                    🏢 {job.locationName}
                  </div>
                )}

                <p className="text-xs text-slate-400 mt-2 flex items-start gap-1.5 leading-relaxed">
                  <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                  <span>{job.locationAddress}</span>
                </p>

                <div className="mt-4 p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Cachê PIX:</span>
                    <span className="font-black text-emerald-400">{formatCurrency(job.cachet)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Horário:</span>
                    <span className="font-semibold text-white">{job.startTime} às {job.endTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Vagas restantes:</span>
                    <span className="font-bold text-cyan-400">{job.slotsAvailable} de {job.slotsTotal}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-500/30 transition"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Abrir no Maps</span>
                  </a>

                  <a
                    href={wazeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-slate-950 hover:bg-slate-800 text-cyan-400 border border-slate-700 transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Waze</span>
                  </a>
                </div>

                <button
                  onClick={() => onSelectJob(job)}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-400 to-green-500 text-slate-950 hover:from-emerald-300 hover:to-green-400 transition"
                >
                  <span>Ver Detalhes & Candidatar</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
