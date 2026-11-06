import React from 'react';
import { COUTURE_FABRICS } from '../data/coutureData';
import { FabricType } from '../types/atelier';
import { soundManager } from '../utils/audio';

interface FabricSelectorProps {
  selectedFabric: FabricType;
  onSelectFabric: (fabric: FabricType) => void;
}

export const FabricSelector: React.FC<FabricSelectorProps> = ({
  selectedFabric,
  onSelectFabric,
}) => {
  const currentFabric = COUTURE_FABRICS.find((f) => f.id === selectedFabric) || COUTURE_FABRICS[0];

  const handleSelect = (id: FabricType) => {
    soundManager.playFabricTouch();
    soundManager.playChime(760);
    onSelectFabric(id);
  };

  return (
    <div className="flex flex-col space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] tracking-[0.25em] text-[#d4af37] font-semibold uppercase">
            Haute Couture Textiles
          </span>
          <h3 className="text-sm font-serif tracking-wider text-stone-100 font-medium">
            Select Atelier Fabric
          </h3>
        </div>
        <span className="text-[10px] text-stone-400 font-mono tracking-wider">
          {currentFabric.weight} • {currentFabric.origin}
        </span>
      </div>

      {/* Fabric Cards Grid */}
      <div className="grid grid-cols-5 gap-1.5 md:gap-2">
        {COUTURE_FABRICS.map((fabric) => {
          const isSelected = fabric.id === selectedFabric;
          return (
            <button
              key={fabric.id}
              onClick={() => handleSelect(fabric.id)}
              className={`group relative flex flex-col items-center justify-between p-2 md:p-2.5 rounded-lg border text-left transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-b from-[#211d17] to-[#14120e] border-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.25)]'
                  : 'bg-[#111115]/90 border-stone-800 hover:border-stone-600 hover:bg-[#18181f]'
              }`}
            >
              {/* Fabric visual swatch representation */}
              <div
                className={`w-full h-8 md:h-10 rounded flex items-center justify-center mb-1.5 overflow-hidden transition-transform group-hover:scale-[1.02] border ${
                  isSelected ? 'border-[#d4af37]/60' : 'border-stone-800'
                }`}
                style={{
                  background:
                    fabric.id === 'silk'
                      ? 'linear-gradient(135deg, #ded8cf 0%, #aa9e8e 100%)'
                      : fabric.id === 'satin'
                      ? 'linear-gradient(135deg, #ffffff 0%, #e8e3d8 35%, #888173 100%)'
                      : fabric.id === 'velvet'
                      ? 'radial-gradient(circle at 30% 30%, #4a1d26 0%, #17090d 100%)'
                      : fabric.id === 'organza'
                      ? 'linear-gradient(135deg, rgba(230,225,215,0.7) 0%, rgba(120,115,105,0.3) 100%)'
                      : 'linear-gradient(135deg, #ffe08a 0%, #b8860b 45%, #ffd700 70%, #5c4308 100%)',
                }}
              >
                {/* Micro pattern overlay */}
                <span className="text-[9px] font-mono tracking-tighter opacity-80 uppercase px-1 py-0.5 rounded bg-black/40 text-stone-200">
                  {fabric.id}
                </span>
              </div>

              <div className="w-full text-center">
                <span
                  className={`block text-[11px] md:text-xs font-serif font-medium leading-tight truncate ${
                    isSelected ? 'text-[#f4e4b5]' : 'text-stone-300'
                  }`}
                >
                  {fabric.name}
                </span>
                <span className="hidden md:block text-[9px] text-stone-500 font-sans truncate">
                  {fabric.luster}
                </span>
              </div>

              {isSelected && (
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#d4af37] ring-2 ring-black" />
              )}
            </button>
          );
        })}
      </div>

      {/* Active Fabric Physical Specification Card */}
      <div className="flex items-center justify-between bg-black/40 border border-stone-800/80 px-3 py-1.5 rounded text-[11px] text-stone-300">
        <span className="text-[#d4af37] font-serif italic truncate max-w-[50%]">
          {currentFabric.frenchName}
        </span>
        <div className="flex items-center space-x-3 text-[10px] text-stone-400 font-mono">
          <span>Drape: <strong className="text-stone-200 font-normal">{currentFabric.drapeGrade}</strong></span>
          <span>Luster: <strong className="text-stone-200 font-normal">{currentFabric.luster}</strong></span>
        </div>
      </div>
    </div>
  );
};
