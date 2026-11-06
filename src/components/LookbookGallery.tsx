import React, { useState } from 'react';
import { Camera, RefreshCw, Trash2, Eye, Download, X, Sparkles, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { LookbookSlot } from '../types/atelier';
import { soundManager } from '../utils/audio';

interface LookbookGalleryProps {
  slots: LookbookSlot[];
  isOpen: boolean;
  onClose: () => void;
  onSaveToSlot: (slotId: number) => void;
  onLoadSlot: (slot: LookbookSlot) => void;
  onClearSlot: (slotId: number) => void;
  currentFabric: string;
  currentColor: string;
  currentSilhouette: string;
}

export const LookbookGallery: React.FC<LookbookGalleryProps> = ({
  slots,
  isOpen,
  onClose,
  onSaveToSlot,
  onLoadSlot,
  onClearSlot,
  currentFabric,
  currentColor,
  currentSilhouette,
}) => {
  const [selectedSlotForModal, setSelectedSlotForModal] = useState<LookbookSlot | null>(null);
  const [justSavedSlotId, setJustSavedSlotId] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleSave = (slotId: number) => {
    soundManager.playShutter();
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#d4af37', '#f4e4b5', '#ffffff', '#e8c15a'],
      });
    } catch {
      // Ignored
    }
    setJustSavedSlotId(slotId);
    setTimeout(() => setJustSavedSlotId(null), 2000);
    onSaveToSlot(slotId);
  };

  const handleDownload = (slot: LookbookSlot) => {
    if (!slot.thumbnailUrl) return;
    const a = document.createElement('a');
    a.href = slot.thumbnailUrl;
    a.download = `aurelia-couture-${slot.name.toLowerCase().replace(/\s+/g, '-')}.jpg`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl bg-[#0e0e12] border border-[#d4af37]/40 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Salon Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-[#121217]">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[#d4af37] text-[10px] tracking-[0.28em] uppercase font-semibold">
                Haute Couture Lookbook
              </span>
              <span className="h-1 w-1 rounded-full bg-[#d4af37]/60" />
              <span className="text-stone-400 text-[10px] tracking-wider uppercase font-light">
                Collection Privée 2026
              </span>
            </div>
            <h2 className="text-xl font-serif text-[#f4eedb] tracking-wider font-medium mt-0.5">
              The Three Couture Display Slots
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-stone-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Design Bar */}
        <div className="px-6 py-2.5 bg-[#17161d] border-b border-stone-800/80 flex flex-wrap items-center justify-between text-xs text-stone-300">
          <div className="flex items-center space-x-3">
            <span className="text-stone-400 uppercase tracking-widest text-[10px]">
              Active Atelier Creation:
            </span>
            <span className="capitalize font-serif text-[#f4e4b5]">{currentFabric}</span>
            <span className="text-stone-600">•</span>
            <span className="capitalize font-serif text-[#f4e4b5]">{currentSilhouette}</span>
            <span className="text-stone-600">•</span>
            <div className="flex items-center space-x-1">
              <div
                className="w-3 h-3 rounded-full border border-white/20"
                style={{ backgroundColor: currentColor }}
              />
              <span className="font-mono text-[10px] text-stone-400">{currentColor.toUpperCase()}</span>
            </div>
          </div>
          <span className="text-[11px] text-[#d4af37] italic font-serif">
            Select an empty slot below to record this creation.
          </span>
        </div>

        {/* The 3 Display Slots Grid */}
        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {slots.map((slot) => {
              const isFilled = !!slot.thumbnailUrl;
              const isJustSaved = justSavedSlotId === slot.id;

              return (
                <div
                  key={slot.id}
                  className={`group relative flex flex-col rounded-xl overflow-hidden border transition-all duration-300 ${
                    isFilled
                      ? 'bg-[#15151c] border-stone-700/80 hover:border-[#d4af37]/80 shadow-lg'
                      : 'bg-[#111115]/60 border-dashed border-stone-700 hover:border-[#d4af37]/50'
                  }`}
                >
                  {/* Slot Title Banner */}
                  <div className="px-4 py-2.5 bg-black/40 border-b border-stone-800/60 flex items-center justify-between">
                    <span className="text-xs font-serif tracking-[0.15em] text-[#d4af37] font-medium">
                      {slot.name}
                    </span>
                    <span className="text-[10px] font-mono text-stone-400">
                      {isFilled ? slot.timestamp : 'Slot Available'}
                    </span>
                  </div>

                  {/* Thumbnail / Empty Frame */}
                  <div className="relative aspect-[3/4] w-full bg-[#0a0a0d] flex items-center justify-center overflow-hidden">
                    {isFilled && slot.thumbnailUrl ? (
                      <>
                        <img
                          src={slot.thumbnailUrl}
                          alt={slot.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {/* Overlay Actions on Hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3.5 space-y-2">
                          <button
                            onClick={() => onLoadSlot(slot)}
                            className="w-full py-1.5 px-3 rounded bg-[#d4af37] text-black text-xs font-serif font-semibold tracking-wider flex items-center justify-center space-x-1.5 hover:bg-[#ebd58d] transition-colors shadow-lg cursor-pointer"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Apply to Mannequin</span>
                          </button>

                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => setSelectedSlotForModal(slot)}
                              className="py-1 px-2 rounded bg-stone-800/80 hover:bg-stone-700 text-stone-200 text-[11px] font-sans flex items-center justify-center space-x-1 transition-colors"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Inspect</span>
                            </button>
                            <button
                              onClick={() => handleDownload(slot)}
                              className="py-1 px-2 rounded bg-stone-800/80 hover:bg-stone-700 text-stone-200 text-[11px] font-sans flex items-center justify-center space-x-1 transition-colors"
                            >
                              <Download className="w-3 h-3" />
                              <span>Export</span>
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
                        <div className="w-12 h-12 rounded-full border border-dashed border-[#d4af37]/40 flex items-center justify-center text-[#d4af37]/60 group-hover:text-[#d4af37] group-hover:border-[#d4af37] transition-colors">
                          <Camera className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-xs font-serif text-stone-300">
                            Couture Display Slot {slot.id}
                          </p>
                          <p className="text-[10px] text-stone-400 mt-0.5">
                            Empty slot ready for your custom creation
                          </p>
                        </div>

                        <button
                          onClick={() => handleSave(slot.id)}
                          className="px-3.5 py-1.5 rounded-lg border border-[#d4af37]/60 bg-[#d4af37]/10 hover:bg-[#d4af37] hover:text-black text-[#d4af37] text-xs font-serif tracking-wider transition-all duration-200 flex items-center space-x-1.5 shadow-sm cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Capture Design</span>
                        </button>
                      </div>
                    )}

                    {isJustSaved && (
                      <div className="absolute inset-0 bg-[#d4af37]/20 flex items-center justify-center animate-fade-in backdrop-blur-sm">
                        <div className="bg-black/90 text-[#d4af37] border border-[#d4af37] px-4 py-2 rounded-lg text-xs font-serif flex items-center space-x-1.5 shadow-2xl">
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span>Saved to Collection</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Slot Details Footer */}
                  {isFilled && (
                    <div className="p-3.5 bg-[#121218] flex items-center justify-between text-xs border-t border-stone-800">
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-white/20 inline-block"
                            style={{ backgroundColor: slot.color }}
                          />
                          <span className="font-serif text-stone-200 capitalize font-medium">
                            {slot.fabric} • {slot.silhouette}
                          </span>
                        </div>
                        <p className="text-[10px] text-stone-400 font-mono mt-0.5">
                          {slot.colorName}
                        </p>
                      </div>

                      <button
                        onClick={() => onClearSlot(slot.id)}
                        title="Clear Slot"
                        className="p-1.5 text-stone-500 hover:text-rose-400 hover:bg-rose-950/30 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer info note */}
        <div className="px-6 py-3 bg-[#0a0a0d] border-t border-stone-800/80 flex items-center justify-between text-[11px] text-stone-400">
          <span>Aurelia Haute Couture Archive • Place Vendôme</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-stone-700 hover:border-stone-500 text-stone-200 text-xs font-sans transition-colors"
          >
            Return to Atelier
          </button>
        </div>
      </div>

      {/* Single Slot Enlarge Inspection Modal */}
      {selectedSlotForModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90">
          <div className="relative max-w-2xl w-full bg-[#111116] border border-[#d4af37]/60 rounded-xl overflow-hidden p-6 shadow-2xl">
            <button
              onClick={() => setSelectedSlotForModal(null)}
              className="absolute top-4 right-4 text-stone-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-1/2 aspect-[3/4] rounded-lg overflow-hidden border border-stone-700 bg-black">
                {selectedSlotForModal.thumbnailUrl && (
                  <img
                    src={selectedSlotForModal.thumbnailUrl}
                    alt={selectedSlotForModal.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              <div className="w-full md:w-1/2 flex flex-col justify-between">
                <div>
                  <span className="text-[#d4af37] text-[10px] tracking-[0.25em] uppercase font-semibold">
                    Couture Specification
                  </span>
                  <h3 className="text-xl font-serif text-[#f4eedb] mt-1">
                    {selectedSlotForModal.name}
                  </h3>
                  <p className="text-xs text-stone-400 font-mono mt-0.5">
                    Archived: {selectedSlotForModal.timestamp}
                  </p>

                  <div className="mt-4 space-y-2 text-xs">
                    <div className="flex justify-between border-b border-stone-800 pb-1">
                      <span className="text-stone-400">Textile:</span>
                      <span className="font-serif capitalize text-stone-200">
                        {selectedSlotForModal.fabric}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-stone-800 pb-1">
                      <span className="text-stone-400">Silhouette:</span>
                      <span className="font-serif capitalize text-stone-200">
                        {selectedSlotForModal.silhouette}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-stone-800 pb-1">
                      <span className="text-stone-400">Color Dye:</span>
                      <div className="flex items-center space-x-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: selectedSlotForModal.color }}
                        />
                        <span className="font-serif text-stone-200">
                          {selectedSlotForModal.colorName}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between border-b border-stone-800 pb-1">
                      <span className="text-stone-400">Hardware Finish:</span>
                      <span className="capitalize text-stone-200">
                        {selectedSlotForModal.metalFinish.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex space-x-3">
                  <button
                    onClick={() => {
                      onLoadSlot(selectedSlotForModal);
                      setSelectedSlotForModal(null);
                      onClose();
                    }}
                    className="flex-1 py-2 rounded-lg bg-[#d4af37] text-black text-xs font-serif font-semibold tracking-wider hover:bg-[#ebd58d] transition-colors"
                  >
                    Load Onto Mannequin
                  </button>
                  <button
                    onClick={() => handleDownload(selectedSlotForModal)}
                    className="px-3 py-2 rounded-lg border border-stone-700 hover:border-stone-500 text-stone-200 text-xs transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
