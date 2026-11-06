import React from 'react';
import { COUTURE_SILHOUETTES } from '../data/coutureData';
import { SilhouetteType } from '../types/atelier';
import { soundManager } from '../utils/audio';

interface SilhouetteSelectorProps {
  selectedSilhouette: SilhouetteType;
  onSelectSilhouette: (silhouette: SilhouetteType) => void;
}

export const SilhouetteSelector: React.FC<SilhouetteSelectorProps> = ({
  selectedSilhouette,
  onSelectSilhouette,
}) => {
  const handleSelect = (s: SilhouetteType) => {
    soundManager.playFabricTouch();
    soundManager.playChime(640);
    onSelectSilhouette(s);
  };

  return (
    <div className="flex flex-col space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] tracking-[0.25em] text-[#d4af37] font-semibold uppercase">
            Coupe & Silhouette
          </span>
          <h3 className="text-sm font-serif tracking-wider text-stone-100 font-medium">
            Gown Architecture
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {COUTURE_SILHOUETTES.map((sil) => {
          const isSelected = sil.id === selectedSilhouette;
          return (
            <button
              key={sil.id}
              onClick={() => handleSelect(sil.id)}
              className={`flex flex-col p-2.5 rounded-lg border text-left transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-b from-[#211d17] to-[#14120e] border-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.2)]'
                  : 'bg-[#111115]/90 border-stone-800 hover:border-stone-700 hover:bg-[#18181f]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-xs font-serif font-medium ${
                    isSelected ? 'text-[#f4e4b5]' : 'text-stone-200'
                  }`}
                >
                  {sil.name}
                </span>
                {isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" />
                )}
              </div>
              <span className="text-[10px] text-stone-400 italic font-serif leading-tight mb-1 truncate">
                {sil.frenchName}
              </span>
              <p className="text-[9px] text-stone-400 font-sans line-clamp-2 leading-relaxed">
                {sil.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
