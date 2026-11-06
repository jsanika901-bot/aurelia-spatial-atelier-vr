export type FabricType = 'silk' | 'satin' | 'velvet' | 'organza' | 'metallic';

export interface FabricDefinition {
  id: FabricType;
  name: string;
  frenchName: string;
  description: string;
  weight: string; // e.g. "85 g/m²"
  drapeGrade: string; // "Fluid Cascading"
  luster: string; // "Luminous Pearl"
  origin: string; // "Lyon, France"
  roughness: number;
  metalness: number;
  clearcoat: number;
  clearcoatRoughness: number;
  sheen: number;
  sheenRoughness: number;
  transmission: number;
  opacity: number;
  transparent: boolean;
  ior: number;
  bumpScale: number;
}

export interface CoutureColor {
  id: string;
  name: string;
  frenchName: string;
  hex: string;
  secondaryTone?: string;
  description: string;
}

export type SilhouetteType = 'ballgown' | 'mermaid' | 'column';

export interface SilhouetteDefinition {
  id: SilhouetteType;
  name: string;
  frenchName: string;
  description: string;
}

export type MetalFinish = 'champagne_gold' | 'rose_gold' | 'antique_brass' | 'polished_platinum';

export interface LookbookSlot {
  id: number;
  name: string;
  fabric: FabricType;
  color: string;
  colorName: string;
  silhouette: SilhouetteType;
  metalFinish: MetalFinish;
  timestamp: string | null;
  thumbnailUrl: string | null;
  notes: string;
}

export type CameraViewPreset = 'full' | 'bodice' | 'skirt' | 'profile' | 'top_down';
