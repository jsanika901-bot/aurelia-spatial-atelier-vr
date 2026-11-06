import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Layers, Palette, Scissors, Sparkles, BookOpen } from 'lucide-react';
import { CameraViewPreset, FabricType, MetalFinish, SilhouetteType } from '../types/atelier';
import { CameraControls } from './CameraControls';
import { ColorPalette } from './ColorPalette';
import { FabricSelector } from './FabricSelector';
import { SilhouetteSelector } from './SilhouetteSelector';
import { soundManager } from '../utils/audio';

type ActiveTab = 'fabrics' | 'colors' | 'silhouette';

interface BottomDockProps {
  selectedFabric: FabricType;
  onSelectFabric: (f: FabricType) => void;
  selectedColor: string;
  onSelectColor: (c: string) => void;
  selectedSilhouette: SilhouetteType;
  onSelectSilhouette: (s: SilhouetteType) => void;
  selectedMetal: MetalFinish;
  onSelectMetal: (m: MetalFinish) => void;
  cameraPreset: CameraViewPreset;
  onSelectCameraPreset: (p: CameraViewPreset) => void;
  isTurntable: boolean;
  onToggleTurntable: () => void;
  onOpenLookbook: () => void;
  onSaveCurrentToNextAvailableSlot: () => void;
}

export const BottomDock: React.FC<BottomDockProps> = ({
  selectedFabric,
  onSelectFabric,
  selectedColor,
  onSelectColor,
  selectedSilhouette,
  onSelectSilhouette,
  selectedMetal,
  onSelectMetal,
  cameraPreset,
  onSelectCameraPreset,
  isTurntable,
  onToggleTurntable,
  onOpenLookbook,
  onSaveCurrentToNextAvailableSlot,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('fabrics');

  const toggleCollapse = () => {
    soundManager.playChime(600);
    setIsCollapsed(!isCollapsed);
  };

  const handleTabChange = (tab: ActiveTab) => {
    soundManager.playChime(750);
    setActiveTab(tab);
  };

  return (
    <div
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[94vw] max-w-4xl transition-all duration-300 pointer-events-auto ${
        isCollapsed ? 'translate-y-[calc(100%-44px)]' : 'translate-y-0'
      }`}
    >
      {/* Collapse / Expand Tab attached to top edge */}
      <div className="flex items-center justify-between px-4 pb-1">
        <button
          onClick={toggleCollapse}
          className="mx-auto flex items-center space-x-1.5 px-3 py-1 rounded-t-lg bg-[#14141a] border-t border-x border-[#d4af37]/40 text-stone-300 hover:text-[#d4af37] text-xs font-serif tracking-widest uppercase transition-colors shadow-lg cursor-pointer"
        >
          {isCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Show Atelier Controls</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Hide Controls (Cinema View)</span>
            </>
          )}
        </button>
      </div>

      {/* Main Glassmorphic Dock Container */}
      <div className="bg-[#0e0e13]/95 border border-[#d4af37]/35 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.85)] p-3 md:p-4.5 flex flex-col space-y-3.5">
        {/* Top Control Bar: Studio Tabs & Quick Lookbook Trigger */}
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-stone-800/80 pb-2.5">
          {/* Navigation Tabs */}
          <div className="flex items-center space-x-1.5 bg-black/50 p-1 rounded-lg border border-stone-800">
            <button
              onClick={() => handleTabChange('fabrics')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-serif tracking-wider transition-all cursor-pointer ${
                activeTab === 'fabrics'
                  ? 'bg-[#292215] text-[#f4e4b5] border border-[#d4af37]/60 shadow-sm'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-white/5'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Textiles & Fabrics</span>
            </button>

            <button
              onClick={() => handleTabChange('colors')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-serif tracking-wider transition-all cursor-pointer ${
                activeTab === 'colors'
                  ? 'bg-[#292215] text-[#f4e4b5] border border-[#d4af37]/60 shadow-sm'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-white/5'
              }`}
            >
              <Palette className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Dye Palette & Metal</span>
            </button>

            <button
              onClick={() => handleTabChange('silhouette')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-serif tracking-wider transition-all cursor-pointer ${
                activeTab === 'silhouette'
                  ? 'bg-[#292215] text-[#f4e4b5] border border-[#d4af37]/60 shadow-sm'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-white/5'
              }`}
            >
              <Scissors className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Silhouette</span>
            </button>
          </div>

          {/* Quick Action: Lookbook Gallery & Save Button */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onSaveCurrentToNextAvailableSlot}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-[#d4af37] text-black hover:bg-[#ebd58d] text-xs font-serif font-semibold tracking-wider transition-all shadow-[0_0_12px_rgba(212,175,55,0.25)] cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-black" />
              <span>Record to Lookbook</span>
            </button>

            <button
              onClick={onOpenLookbook}
              title="Open Collection Gallery"
              className="p-1.5 rounded-md border border-stone-700 bg-stone-900/80 hover:border-[#d4af37]/60 text-stone-300 hover:text-[#d4af37] transition-colors"
            >
              <BookOpen className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Content Panel */}
        <div className="min-h-[105px]">
          {activeTab === 'fabrics' && (
            <FabricSelector
              selectedFabric={selectedFabric}
              onSelectFabric={onSelectFabric}
            />
          )}

          {activeTab === 'colors' && (
            <ColorPalette
              selectedColor={selectedColor}
              onSelectColor={onSelectColor}
              selectedMetal={selectedMetal}
              onSelectMetal={onSelectMetal}
            />
          )}

          {activeTab === 'silhouette' && (
            <SilhouetteSelector
              selectedSilhouette={selectedSilhouette}
              onSelectSilhouette={onSelectSilhouette}
            />
          )}
        </div>

        {/* Bottom Camera Angle Presets & Turntable Controller */}
        <div className="border-t border-stone-800/80 pt-2.5">
          <CameraControls
            currentPreset={cameraPreset}
            onSelectPreset={onSelectCameraPreset}
            isTurntable={isTurntable}
            onToggleTurntable={onToggleTurntable}
          />
        </div>
      </div>
    </div>
  );
};
