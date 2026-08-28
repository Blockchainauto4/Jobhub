import React, { useState } from 'react';
import { X, Sparkles, Check, Search, Tag, Award, Users, ShieldCheck, Star } from 'lucide-react';

interface SkillsDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSkill?: (skill: string) => void;
}

export const POPULAR_SKILLS = [
  { name: 'Bandeja Alta & Serviço Volante', category: 'Eventos & Salão', demand: 'Alta', count: '1.420 profissionais' },
  { name: 'Coquetelaria Clássica & Mixologia', category: 'Bares & Bebidas', demand: 'Muito Alta', count: '980 profissionais' },
  { name: 'Higienização & Limpeza Pós-Evento', category: 'Facilities & Limpeza', demand: 'Alta', count: '2.100 profissionais' },
  { name: 'Carga Pesada & Montagem 50kg+', category: 'Logística & Palco', demand: 'Alta', count: '1.250 profissionais' },
  { name: 'Recepção VIP & Credenciamento', category: 'Eventos & Corporativo', demand: 'Alta', count: '890 profissionais' },
  { name: 'Inglês Básico / Atendimento Internacional', category: 'Idiomas', demand: 'Muito Alta', count: '640 profissionais' },
  { name: 'Auxiliar de Chapa, Forno e Grelha', category: 'Cozinha & Gastronomia', demand: 'Alta', count: '1.180 profissionais' },
  { name: 'Abertura e Serviço de Vinhos/Espumantes', category: 'Eventos & Salão', demand: 'Alta', count: '730 profissionais' },
  { name: 'Iluminação de Palco DMX & Refletores', category: 'Audiovisual & Shows', demand: 'Alta', count: '410 profissionais' },
  { name: 'Montagem de Estruturas Box Truss', category: 'Audiovisual & Montagem', demand: 'Média', count: '520 profissionais' },
  { name: 'Operação de Lavadora e Enceradeira Industrial', category: 'Facilities & Limpeza', demand: 'Média', count: '610 profissionais' },
  { name: 'Speed Bartending & Caipirinhas Rápidas', category: 'Bares & Bebidas', demand: 'Muito Alta', count: '1.300 profissionais' },
  { name: 'Atendimento Bilíngue e Cerimonial', category: 'Eventos & Recepção', demand: 'Alta', count: '480 profissionais' },
  { name: 'Condução de Carrinho de Golfe / Valet', category: 'Logística & Recepção', demand: 'Média', count: '390 profissionais' }
];

export const SkillsDirectoryModal: React.FC<SkillsDirectoryModalProps> = ({
  isOpen,
  onClose,
  onSelectSkill
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');

  if (!isOpen) return null;

  const categories = ['Todas', 'Eventos & Salão', 'Bares & Bebidas', 'Facilities & Limpeza', 'Logística & Palco', 'Cozinha & Gastronomia', 'Audiovisual & Shows'];

  const filteredSkills = POPULAR_SKILLS.filter(skill => {
    if (selectedCategory !== 'Todas' && skill.category !== selectedCategory) return false;
    if (searchTerm) {
      return skill.name.toLowerCase().includes(searchTerm.toLowerCase()) || skill.category.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/90 backdrop-blur-md p-2 sm:p-4 flex justify-center items-center animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[92dvh] sm:max-h-[88vh] overflow-y-auto min-h-0 custom-scrollbar rounded-2xl sm:rounded-3xl bg-slate-900 border border-emerald-500/40 shadow-2xl p-4 sm:p-6 md:p-8 text-slate-100 overscroll-contain">
        
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
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-black uppercase tracking-wider mb-2">
          <div className="p-1 rounded bg-emerald-500/10 border border-emerald-500/30">
            <Tag className="w-4 h-4" />
          </div>
          <span>Diretório Nacional de Competências & Talentos</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
          Identificação de Habilidades FreelaHub
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">
          Explore as qualificações técnicas verificadas de garçons, bartenders, carregadores e equipes de limpeza no Brasil.
        </p>

        {/* Search Input */}
        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por habilidade (ex: Bandeja Alta, Coquetelaria, DMX, Chapa)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none text-xs text-white placeholder:text-slate-600"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1 mb-6">
          {filteredSkills.map(skill => (
            <div
              key={skill.name}
              onClick={() => {
                if (onSelectSkill) {
                  onSelectSkill(skill.name);
                  onClose();
                }
              }}
              className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-emerald-500/50 cursor-pointer transition flex flex-col justify-between gap-2 group"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-extrabold text-white group-hover:text-emerald-400 transition">
                  {skill.name}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 whitespace-nowrap">
                  {skill.demand} Demanda
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-900">
                <span>{skill.category}</span>
                <span className="text-slate-500">{skill.count}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition"
          >
            Fechar Diretório
          </button>
        </div>

      </div>
    </div>
  );
};
