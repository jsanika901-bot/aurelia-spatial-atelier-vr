import { useEffect, useRef, useState } from 'react';
import { COUTURE_COLORS, INITIAL_LOOKBOOK_SLOTS } from './data/coutureData';
import { AtelierScene } from './three/AtelierScene';
import { CameraViewPreset, FabricType, LookbookSlot, MetalFinish, SilhouetteType } from './types/atelier';
import { Header } from './components/Header';
import { BottomDock } from './components/BottomDock';
import { LookbookGallery } from './components/LookbookGallery';
import { soundManager } from './utils/audio';

export default function App() {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<AtelierScene | null>(null);

  // Studio Design State
  const [selectedFabric, setSelectedFabric] = useState<FabricType>('silk');
  const [selectedColor, setSelectedColor] = useState<string>('#f3e6d2');
  const [selectedSilhouette, setSelectedSilhouette] = useState<SilhouetteType>('ballgown');
  const [selectedMetal, setSelectedMetal] = useState<MetalFinish>('champagne_gold');

  // Camera & Turntable State
  const [cameraPreset, setCameraPreset] = useState<CameraViewPreset>('full');
  const [isTurntable, setIsTurntable] = useState<boolean>(false);

  // Gallery & Lookbook State
  const [lookbookSlots, setLookbookSlots] = useState<LookbookSlot[]>(INITIAL_LOOKBOOK_SLOTS);
  const [isLookbookOpen, setIsLookbookOpen] = useState<boolean>(false);

  // UI Modes
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isZenMode, setIsZenMode] = useState<boolean>(false);

  // Initialize Three.js AtelierScene
  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new AtelierScene(mountRef.current, {
      fabricType: selectedFabric,
      colorHex: selectedColor,
      silhouette: selectedSilhouette,
      metalFinish: selectedMetal,
    });
    sceneRef.current = scene;

    return () => {
      scene.dispose();
      sceneRef.current = null;
    };
  }, []);

  // Update fabric & color in 3D scene
  const handleSelectFabric = (fabric: FabricType) => {
    setSelectedFabric(fabric);
    sceneRef.current?.updateFabric(fabric, selectedColor);
  };

  const handleSelectColor = (hex: string) => {
    setSelectedColor(hex);
    sceneRef.current?.updateColor(hex);
  };

  const handleSelectSilhouette = (silhouette: SilhouetteType) => {
    setSelectedSilhouette(silhouette);
    sceneRef.current?.updateSilhouette(silhouette);
  };

  const handleSelectMetal = (metal: MetalFinish) => {
    setSelectedMetal(metal);
    sceneRef.current?.updateMetalFinish(metal);
  };

  const handleSelectCameraPreset = (preset: CameraViewPreset) => {
    setCameraPreset(preset);
    setIsTurntable(false);
    sceneRef.current?.setTurntable(false);
    sceneRef.current?.setCameraView(preset);
  };

  const handleToggleTurntable = () => {
    const next = !isTurntable;
    setIsTurntable(next);
    sceneRef.current?.setTurntable(next);
  };

  const handleToggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundManager.setMuted(next);
    if (!next) {
      soundManager.playChime(880);
    }
  };

  // Lookbook Actions
  const handleSaveToSlot = (slotId: number) => {
    if (!sceneRef.current) return;
    const thumbnail = sceneRef.current.captureSnapshot();
    const colorObj = COUTURE_COLORS.find(
      (c) => c.hex.toLowerCase() === selectedColor.toLowerCase()
    );
    const colorName = colorObj ? colorObj.name : selectedColor.toUpperCase();
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')} • Paris`;

    setLookbookSlots((prev) =>
      prev.map((slot) => {
        if (slot.id === slotId) {
          return {
            ...slot,
            fabric: selectedFabric,
            color: selectedColor,
            colorName,
            silhouette: selectedSilhouette,
            metalFinish: selectedMetal,
            timestamp: timeStr,
            thumbnailUrl: thumbnail,
            notes: `${selectedFabric.toUpperCase()} gown in ${colorName}`,
          };
        }
        return slot;
      })
    );
  };

  const handleSaveCurrentToNextAvailableSlot = () => {
    // Find first empty slot or fallback to slot 1
    const emptySlot = lookbookSlots.find((s) => !s.thumbnailUrl);
    const targetId = emptySlot ? emptySlot.id : 1;
    handleSaveToSlot(targetId);
    setIsLookbookOpen(true);
  };

  const handleLoadSlot = (slot: LookbookSlot) => {
    soundManager.playChime(920);
    setSelectedFabric(slot.fabric);
    setSelectedColor(slot.color);
    setSelectedSilhouette(slot.silhouette);
    setSelectedMetal(slot.metalFinish);

    if (sceneRef.current) {
      sceneRef.current.updateFabric(slot.fabric, slot.color);
      sceneRef.current.updateSilhouette(slot.silhouette);
      sceneRef.current.updateMetalFinish(slot.metalFinish);
    }
  };

  const handleClearSlot = (slotId: number) => {
    soundManager.playChime(500);
    setLookbookSlots((prev) =>
      prev.map((slot) => {
        if (slot.id === slotId) {
          return {
            ...slot,
            timestamp: null,
            thumbnailUrl: null,
            notes: 'Empty Couture Slot - Ready for Creation',
          };
        }
        return slot;
      })
    );
  };

  const savedCount = lookbookSlots.filter((s) => !!s.thumbnailUrl).length;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#08080a] select-none text-[#f5f2eb]">
      {/* 3D WebGL Canvas Mounting Container (Unobstructed full bleed) */}
      <div
        ref={mountRef}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing z-0"
      />

      {/* Subtle Studio Interaction Hint (Bottom-Right or Top-Center) */}
      {!isZenMode && (
        <div className="absolute top-20 right-6 z-20 pointer-events-none hidden lg:flex items-center space-x-2 text-[11px] text-stone-400 font-sans bg-black/40 border border-stone-800/60 px-3 py-1.5 rounded-full backdrop-blur-sm">
          <span>Rotate: <strong>Left Click + Drag</strong></span>
          <span className="text-stone-600">•</span>
          <span>Zoom: <strong>Scroll</strong></span>
          <span className="text-stone-600">•</span>
          <span>Pan: <strong>Right Click</strong></span>
        </div>
      )}

      {/* Haute Couture Parisian Header */}
      {!isZenMode && (
        <Header
          isMuted={isMuted}
          onToggleSound={handleToggleSound}
          isZenMode={isZenMode}
          onToggleZenMode={() => setIsZenMode(true)}
          onOpenLookbook={() => setIsLookbookOpen(true)}
          savedLookCount={savedCount}
        />
      )}

      {/* Zen Mode Exit Button */}
      {isZenMode && (
        <button
          onClick={() => setIsZenMode(false)}
          className="fixed top-6 right-6 z-50 px-4 py-2 rounded-lg bg-[#0e0e13]/85 border border-[#d4af37]/40 text-[#d4af37] text-xs font-serif tracking-widest uppercase hover:bg-black transition-colors backdrop-blur-md shadow-2xl cursor-pointer"
        >
          Exit Zen Mode
        </button>
      )}

      {/* Unified Ergonomic Collapsible Bottom Control Dock */}
      {!isZenMode && (
        <BottomDock
          selectedFabric={selectedFabric}
          onSelectFabric={handleSelectFabric}
          selectedColor={selectedColor}
          onSelectColor={handleSelectColor}
          selectedSilhouette={selectedSilhouette}
          onSelectSilhouette={handleSelectSilhouette}
          selectedMetal={selectedMetal}
          onSelectMetal={handleSelectMetal}
          cameraPreset={cameraPreset}
          onSelectCameraPreset={handleSelectCameraPreset}
          isTurntable={isTurntable}
          onToggleTurntable={handleToggleTurntable}
          onOpenLookbook={() => setIsLookbookOpen(true)}
          onSaveCurrentToNextAvailableSlot={handleSaveCurrentToNextAvailableSlot}
        />
      )}

      {/* The 3-Slot Haute Couture Lookbook Gallery Modal */}
      <LookbookGallery
        slots={lookbookSlots}
        isOpen={isLookbookOpen}
        onClose={() => setIsLookbookOpen(false)}
        onSaveToSlot={handleSaveToSlot}
        onLoadSlot={handleLoadSlot}
        onClearSlot={handleClearSlot}
        currentFabric={selectedFabric}
        currentColor={selectedColor}
        currentSilhouette={selectedSilhouette}
      />
    </div>
  );
}
