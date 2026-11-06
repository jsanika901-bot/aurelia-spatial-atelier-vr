import React from 'react';
import { COUTURE_COLORS } from '../data/coutureData';
import { MetalFinish } from '../types/atelier';
import { soundManager } from '../utils/audio';

interface ColorPaletteProps {
  selectedColor: string;
  onSelectColor: (hex: string) => void;
  selectedMetal: MetalFinish;
  onSelectMetal: (metal: MetalFinish) => void;
}

const METAL_OPTIONS: { id: MetalFinish; name: string; hex: string }[] = [
  { id: 'champagne_gold', name: 'Champagne Gold', hex: '#dfc179' },
  { id: 'rose_gold', name: 'Rose Gold', hex: '#da9a8a' },
  { id: 'antique_brass', name: 'Antique Brass', hex: '#9e7c45' },
  { id: 'polished_platinum', name: 'Platinum', hex: '#e8edf2' },
];

export const ColorPalette: React.FC<ColorPaletteProps> = ({
  selectedColor,
  onSelectColor,
  selectedMetal,
  onSelectMetal,
}) => {
  const activeColorObj = COUTURE_COLORS.find(
    (c) => c.hex.toLowerCase() === selectedColor.toLowerCase()
  );

  const handleColorClick = (hex: string) => {
    soundManager.playChime(820);
    onSelectColor(hex);
  };

  const handleMetalClick = (metal: MetalFinish) => {
    soundManager.playChime(950);
    onSelectMetal(metal);
  };

  return (
    <div className="flex flex-col space-y-3">
      {/* Header and selected color readout */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] tracking-[0.25em] text-[#d4af37] font-semibold uppercase">
            Teintures Haute Couture
          </span>
          <h3 className="text-sm font-serif tracking-wider text-stone-100 font-medium">
            Couture Palette & Finishes
          </h3>
        </div>
        <div className="flex items-center space-x-1.5 text-xs text-stone-300 font-mono">
          <div
            className="w-3.5 h-3.5 rounded-full border border-stone-600 shadow-inner"
            style={{ backgroundColor: selectedColor }}
          />
          <span className="text-[11px] font-medium text-stone-200">
            {activeColorObj ? activeColorObj.name : selectedColor.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Color Swatches Grid */}
      <div className="flex flex-wrap items-center gap-2">
        {COUTURE_COLORS.map((color) => {
          const isSelected = selectedColor.toLowerCase() === color.hex.toLowerCase();
          return (
            <button
              key={color.id}
              onClick={() => handleColorClick(color.hex)}
              title={`${color.name} (${color.frenchName})`}
              className={`group relative flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-full transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'ring-2 ring-[#d4af37] ring-offset-2 ring-offset-[#0d0d11] scale-110 shadow-lg'
                  : 'hover:scale-105 opacity-85 hover:opacity-100'
              }`}
            >
              <span
                className="w-full h-full rounded-full border border-white/20 shadow-inner"
                style={{ backgroundColor: color.hex }}
              />
              {isSelected && (
                <span className="absolute inset-0 m-auto w-1.5 h-1.5 rounded-full bg-white shadow" />
              )}
            </button>
          );
        })}

        {/* Custom Color Picker Input */}
        <div className="relative group ml-auto">
          <label
            title="Custom Dye Pigment"
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-full border border-stone-700 bg-stone-900 hover:border-[#d4af37]/60 cursor-pointer text-[10px] font-mono text-stone-300 transition-colors"
          >
            <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-pink-500 via-amber-400 to-indigo-500 border border-white/30" />
            <span>Custom</span>
            <input
              type="color"
              value={selectedColor}
              onChange={(e) => onSelectColor(e.target.value)}
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
            />
          </label>
        </div>
      </div>

      {/* Stand Metal Hardware & Buckle Finish */}
      <div className="flex items-center justify-between pt-1 border-t border-stone-800/80">
        <span className="text-[10px] text-stone-400 uppercase tracking-widest font-sans">
          Atelier Hardware:
        </span>
        <div className="flex items-center space-x-1.5">
          {METAL_OPTIONS.map((m) => {
            const isSelected = selectedMetal === m.id;
            return (
              <button
                key={m.id}
                onClick={() => handleMetalClick(m.id)}
                title={m.name}
                className={`flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-sans transition-all ${
                  isSelected
                    ? 'bg-[#262118] text-[#f4e4b5] border border-[#d4af37]/70'
                    : 'text-stone-400 hover:text-stone-200 border border-transparent'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full border border-black/30"
                  style={{ backgroundColor: m.hex }}
                />
                <span className="hidden sm:inline">{m.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
