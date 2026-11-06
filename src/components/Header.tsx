import React from 'react';
import { Volume2, VolumeX, Maximize2, Minimize2, Sparkles, BookOpen } from 'lucide-react';

interface HeaderProps {
  isMuted: boolean;
  onToggleSound: () => void;
  isZenMode: boolean;
  onToggleZenMode: () => void;
  onOpenLookbook: () => void;
  savedLookCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  isMuted,
  onToggleSound,
  isZenMode,
  onToggleZenMode,
  onOpenLookbook,
  savedLookCount,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-30 pointer-events-none p-4 md:p-6 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-start justify-between">
        {/* Maison Brand Emblem */}
        <div className="pointer-events-auto flex flex-col items-start bg-[#0c0c10]/70 border border-[#d4af37]/25 px-4 py-3 rounded-lg shadow-2xl backdrop-blur-md">
          <div className="flex items-center space-x-2">
            <span className="text-[#d4af37] text-xs tracking-[0.3em] font-medium uppercase">
              Maison de Couture
            </span>
            <span className="h-1 w-1 rounded-full bg-[#d4af37]/60" />
            <span className="text-stone-400 text-[10px] tracking-wider uppercase font-light">
              Place Vendôme • Paris
            </span>
          </div>

          <h1 className="text-xl md:text-2xl font-serif tracking-[0.15em] text-[#f7f4ee] font-medium mt-0.5">
            AURELIA <span className="text-[#d4af37] font-light">SPATIAL ATELIER</span>
          </h1>

          <p className="text-[11px] md:text-xs text-stone-300 italic tracking-wide font-light mt-0.5 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-[#d4af37] inline-block shrink-0" />
            Your Imagination. Your Hands. Your Virtual Atelier.
          </p>
        </div>

        {/* Top Right Quick Controls */}
        <div className="pointer-events-auto flex items-center space-x-2 bg-[#0c0c10]/70 border border-[#d4af37]/25 p-1.5 rounded-lg shadow-2xl backdrop-blur-md">
          {/* Lookbook Badge */}
          <button
            onClick={onOpenLookbook}
            title="Open Collection Lookbook"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-sans tracking-wider uppercase text-stone-200 hover:text-[#d4af37] hover:bg-white/5 transition-colors border border-transparent hover:border-[#d4af37]/30"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#d4af37]" />
            <span className="hidden sm:inline">Lookbook</span>
            <span className="bg-[#d4af37]/20 text-[#d4af37] px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold">
              {savedLookCount}/3
            </span>
          </button>

          <div className="h-4 w-px bg-stone-700" />

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            title={isMuted ? 'Enable Sound FX' : 'Mute Sound FX'}
            className="p-1.5 rounded text-stone-300 hover:text-[#d4af37] hover:bg-white/5 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-stone-500" /> : <Volume2 className="w-4 h-4 text-[#d4af37]" />}
          </button>

          {/* Zen View Toggle */}
          <button
            onClick={onToggleZenMode}
            title={isZenMode ? 'Show Controls' : 'Zen View (Full Screen)'}
            className="p-1.5 rounded text-stone-300 hover:text-[#d4af37] hover:bg-white/5 transition-colors"
          >
            {isZenMode ? <Minimize2 className="w-4 h-4 text-[#d4af37]" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
