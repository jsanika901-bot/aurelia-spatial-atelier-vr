import React from 'react';
import { RotateCw, Eye, Sparkles } from 'lucide-react';
import { CameraViewPreset } from '../types/atelier';
import { soundManager } from '../utils/audio';

interface CameraControlsProps {
  currentPreset: CameraViewPreset;
  onSelectPreset: (preset: CameraViewPreset) => void;
  isTurntable: boolean;
  onToggleTurntable: () => void;
}

const PRESETS: { id: CameraViewPreset; label: string; desc: string }[] = [
  { id: 'full', label: 'Full Silhouette', desc: 'Front view' },
  { id: 'bodice', label: 'Bodice & Neck', desc: 'Close-up' },
  { id: 'skirt', label: 'Drapery & Train', desc: 'Low angle' },
  { id: 'profile', label: 'Side Profile', desc: 'Couture curve' },
];

export const CameraControls: React.FC<CameraControlsProps> = ({
  currentPreset,
  onSelectPreset,
  isTurntable,
  onToggleTurntable,
}) => {
  const handlePreset = (preset: CameraViewPreset) => {
    soundManager.playChime(700);
    onSelectPreset(preset);
  };

  const handleTurntable = () => {
    soundManager.playChime(850);
    onToggleTurntable();
  };

  return (
    <div className="flex items-center justify-between flex-wrap gap-2">
      {/* Camera angle pills */}
      <div className="flex items-center space-x-1.5 overflow-x-auto py-1">
        <span className="text-[10px] uppercase font-sans tracking-widest text-stone-400 mr-1 flex items-center gap-1">
          <Eye className="w-3 h-3 text-[#d4af37]" />
          <span className="hidden sm:inline">Perspective:</span>
        </span>

        {PRESETS.map((p) => {
          const isSelected = currentPreset === p.id && !isTurntable;
          return (
            <button
              key={p.id}
              onClick={() => handlePreset(p.id)}
              title={p.desc}
              className={`px-2.5 py-1 rounded-md text-[11px] font-sans tracking-wide transition-all cursor-pointer whitespace-nowrap ${
                isSelected
                  ? 'bg-[#d4af37] text-black font-semibold shadow-[0_0_10px_rgba(212,175,55,0.3)]'
                  : 'bg-stone-900/80 text-stone-300 hover:text-white hover:bg-stone-800 border border-stone-800'
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* 360° Runway Turntable Toggle */}
      <button
        onClick={handleTurntable}
        title="Toggle continuous 360° runway rotation"
        className={`flex items-center space-x-1.5 px-3 py-1 rounded-md text-[11px] font-sans tracking-wide transition-all border cursor-pointer ${
          isTurntable
            ? 'bg-[#2b2414] text-[#f4e4b5] border-[#d4af37] shadow-[0_0_12px_rgba(212,175,55,0.25)]'
            : 'bg-stone-900/80 text-stone-400 hover:text-stone-200 border-stone-800'
        }`}
      >
        <RotateCw className={`w-3 h-3 ${isTurntable ? 'animate-spin text-[#d4af37]' : ''}`} />
        <span>360° Turntable</span>
        {isTurntable && (
          <Sparkles className="w-2.5 h-2.5 text-[#d4af37]" />
        )}
      </button>
    </div>
  );
};
