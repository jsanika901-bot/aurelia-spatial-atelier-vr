import * as THREE from 'three';
import { FabricType, MetalFinish, SilhouetteType } from '../types/atelier';
import { createFabricBumpMap } from '../utils/proceduralTextures';

/**
 * Procedural Parisian Haute Couture Mannequin & Gown Model.
 * Implements the 3-12 part procedural model standard with realistic anatomy,
 * dress form stand, and dynamically swappable couture silhouettes & fabrics.
 */

export interface MannequinStyleConfig {
  fabricType: FabricType;
  colorHex: string;
  silhouette: SilhouetteType;
  metalFinish: MetalFinish;
}

export class MannequinModel {
  public group: THREE.Group;
  private dressMeshGroup: THREE.Group;
  private mannequinFormGroup: THREE.Group;
  private standGroup: THREE.Group;

  // Materials
  private gownMaterial: THREE.MeshPhysicalMaterial;
  private accentMaterial: THREE.MeshPhysicalMaterial;
  private mannequinLinenMaterial: THREE.MeshStandardMaterial;
  private standWoodMaterial: THREE.MeshStandardMaterial;
  private standMetalMaterial: THREE.MeshStandardMaterial;

  // Bump maps cache
  private bumpMaps: Map<FabricType, THREE.CanvasTexture> = new Map();

  // Current config
  private currentConfig: MannequinStyleConfig;

  constructor(initialConfig: MannequinStyleConfig) {
    this.currentConfig = { ...initialConfig };
    this.group = new THREE.Group();
    this.group.name = 'MannequinRoot';

    // Pre-create bump maps
    const fabricList: FabricType[] = ['silk', 'satin', 'velvet', 'organza', 'metallic'];
    fabricList.forEach((f) => {
      this.bumpMaps.set(f, createFabricBumpMap(f));
    });

    // Initialize base materials
    this.mannequinLinenMaterial = new THREE.MeshStandardMaterial({
      color: 0xded2c1,
      roughness: 0.88,
      metalness: 0.05,
    });

    this.standWoodMaterial = new THREE.MeshStandardMaterial({
      color: 0x181412,
      roughness: 0.35,
      metalness: 0.1,
    });

    this.standMetalMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.25,
      metalness: 0.92,
    });

    this.gownMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(this.currentConfig.colorHex),
      side: THREE.DoubleSide,
    });

    this.accentMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(this.currentConfig.colorHex).offsetHSL(0, 0, 0.05),
      side: THREE.DoubleSide,
    });

    // Sub-groups
    this.standGroup = new THREE.Group();
    this.mannequinFormGroup = new THREE.Group();
    this.dressMeshGroup = new THREE.Group();

    this.group.add(this.standGroup);
    this.group.add(this.mannequinFormGroup);
    this.group.add(this.dressMeshGroup);

    this.buildStand();
    this.buildMannequinForm();
    this.applyMaterialPreset(this.currentConfig.fabricType, this.currentConfig.colorHex);
    this.applyMetalFinish(this.currentConfig.metalFinish);
    this.buildGown(this.currentConfig.silhouette);
  }

  /**
   * Builds authentic Parisian atelier Stockman-style stand:
   * Vintage tripod base, turned central rod, height adjustment wheel, brass collar
   */
  private buildStand() {
    // 1. Central vertical pole (ebony wood / blackened brass)
    const poleGeo = new THREE.CylinderGeometry(0.022, 0.022, 1.85, 24);
    const poleMesh = new THREE.Mesh(poleGeo, this.standWoodMaterial);
    poleMesh.position.y = 0.925;
    poleMesh.castShadow = true;
    poleMesh.receiveShadow = true;
    this.standGroup.add(poleMesh);

    // 2. Brass finial at top of pole
    const neckCollarGeo = new THREE.CylinderGeometry(0.045, 0.048, 0.04, 32);
    const neckCollar = new THREE.Mesh(neckCollarGeo, this.standMetalMaterial);
    neckCollar.position.y = 1.76;
    neckCollar.castShadow = true;
    this.standGroup.add(neckCollar);

    const finialGeo = new THREE.SphereGeometry(0.04, 32, 16);
    finialGeo.scale(1, 1.35, 1);
    const finialMesh = new THREE.Mesh(finialGeo, this.standMetalMaterial);
    finialMesh.position.y = 1.82;
    finialMesh.castShadow = true;
    this.standGroup.add(finialMesh);

    // 3. Brass adjustment wheel / thumbscrew midway
    const wheelCenterGeo = new THREE.CylinderGeometry(0.038, 0.038, 0.06, 24);
    const wheelCenter = new THREE.Mesh(wheelCenterGeo, this.standMetalMaterial);
    wheelCenter.position.y = 0.68;
    this.standGroup.add(wheelCenter);

    const screwPinGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.12, 12);
    screwPinGeo.rotateZ(Math.PI / 2);
    const screwPin = new THREE.Mesh(screwPinGeo, this.standMetalMaterial);
    screwPin.position.set(0.045, 0.68, 0);
    this.standGroup.add(screwPin);

    // 4. Parisian tripod base: 3 graceful curved legs
    const legCount = 3;
    for (let i = 0; i < legCount; i++) {
      const angle = (i * Math.PI * 2) / legCount;
      const legCurve = new THREE.CubicBezierCurve3(
        new THREE.Vector3(0, 0.38, 0),
        new THREE.Vector3(Math.cos(angle) * 0.15, 0.28, Math.sin(angle) * 0.15),
        new THREE.Vector3(Math.cos(angle) * 0.35, 0.08, Math.sin(angle) * 0.35),
        new THREE.Vector3(Math.cos(angle) * 0.42, 0.015, Math.sin(angle) * 0.42)
      );
      const legGeo = new THREE.TubeGeometry(legCurve, 32, 0.018, 16, false);
      const legMesh = new THREE.Mesh(legGeo, this.standWoodMaterial);
      legMesh.castShadow = true;
      legMesh.receiveShadow = true;
      this.standGroup.add(legMesh);

      // Brass caster / foot cap
      const footGeo = new THREE.CylinderGeometry(0.024, 0.018, 0.03, 16);
      const footMesh = new THREE.Mesh(footGeo, this.standMetalMaterial);
      footMesh.position.set(Math.cos(angle) * 0.42, 0.015, Math.sin(angle) * 0.42);
      footMesh.castShadow = true;
      this.standGroup.add(footMesh);
    }

    // Tripod hub
    const hubGeo = new THREE.CylinderGeometry(0.065, 0.075, 0.1, 24);
    const hubMesh = new THREE.Mesh(hubGeo, this.standWoodMaterial);
    hubMesh.position.y = 0.36;
    hubMesh.castShadow = true;
    this.standGroup.add(hubMesh);

    const hubRingGeo = new THREE.TorusGeometry(0.07, 0.01, 12, 32);
    hubRingGeo.rotateX(Math.PI / 2);
    const hubRing = new THREE.Mesh(hubRingGeo, this.standMetalMaterial);
    hubRing.position.y = 0.36;
    this.standGroup.add(hubRing);
  }

  /**
   * Builds the sculpted female haute couture dress form (torso, bust, waist, hips, neck)
   */
  private buildMannequinForm() {
    // Sculpted torso using LatheGeometry with couture proportions
    // Height from hips ~0.90 to shoulders ~1.62
    const points: THREE.Vector2[] = [];
    const profiles = [
      { y: 0.88, r: 0.14 },  // Lower hip/pelvis bottom
      { y: 0.94, r: 0.19 },  // Full hips
      { y: 1.02, r: 0.175 }, // Upper hip
      { y: 1.12, r: 0.135 }, // Small couture waist (wasp waist)
      { y: 1.24, r: 0.17 },  // Underbust
      { y: 1.34, r: 0.20 },  // Full bust
      { y: 1.44, r: 0.185 }, // Upper chest
      { y: 1.54, r: 0.16 },  // Clavicle
      { y: 1.60, r: 0.08 },  // Base of neck
      { y: 1.74, r: 0.065 }, // High neck top
    ];

    profiles.forEach((p) => {
      points.push(new THREE.Vector2(p.r, p.y));
    });

    const torsoGeo = new THREE.LatheGeometry(points, 48);
    // Give anatomical oval flattening (wider front-to-back vs side-to-side)
    torsoGeo.scale(1.15, 1, 0.82);

    const torsoMesh = new THREE.Mesh(torsoGeo, this.mannequinLinenMaterial);
    torsoMesh.castShadow = true;
    torsoMesh.receiveShadow = true;
    this.mannequinFormGroup.add(torsoMesh);

    // Shoulder armhole end caps (traditional linen couture caps)
    const armholeGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.015, 24);
    armholeGeo.rotateZ(Math.PI / 2);

    const leftArmhole = new THREE.Mesh(armholeGeo, this.standWoodMaterial);
    leftArmhole.position.set(-0.21, 1.48, 0);
    this.mannequinFormGroup.add(leftArmhole);

    const rightArmhole = new THREE.Mesh(armholeGeo, this.standWoodMaterial);
    rightArmhole.position.set(0.21, 1.48, 0);
    this.mannequinFormGroup.add(rightArmhole);

    // Couture stitch line accents / seam tape on the dress form
    const seamMat = new THREE.MeshBasicMaterial({ color: 0x8a7e70 });

    // Center front seam
    const cfSeamGeo = new THREE.CylinderGeometry(0.0018, 0.0018, 0.82, 8);
    const cfSeam = new THREE.Mesh(cfSeamGeo, seamMat);
    cfSeam.position.set(0, 1.30, 0.175);
    this.mannequinFormGroup.add(cfSeam);

    // Waistline tape
    const waistTapeGeo = new THREE.TorusGeometry(0.14, 0.003, 8, 48);
    waistTapeGeo.rotateX(Math.PI / 2);
    waistTapeGeo.scale(1.15, 0.82, 1);
    const waistTape = new THREE.Mesh(waistTapeGeo, seamMat);
    waistTape.position.set(0, 1.12, 0);
    this.mannequinFormGroup.add(waistTape);
  }

  /**
   * Generates couture gown geometry based on silhouette
   */
  public buildGown(silhouette: SilhouetteType) {
    this.currentConfig.silhouette = silhouette;

    // Clear existing gown meshes
    while (this.dressMeshGroup.children.length > 0) {
      const child = this.dressMeshGroup.children[0] as THREE.Mesh;
      if (child.geometry) child.geometry.dispose();
      this.dressMeshGroup.remove(child);
    }

    // 1. Fitted Couture Corset / Bodice (Sweetheart drape)
    const bodicePoints: THREE.Vector2[] = [
      new THREE.Vector2(0.145, 1.10), // Waist seam
      new THREE.Vector2(0.155, 1.18),
      new THREE.Vector2(0.185, 1.26), // Mid ribs
      new THREE.Vector2(0.212, 1.34), // Apex of bust
      new THREE.Vector2(0.205, 1.40), // Sweetheart curve top
      new THREE.Vector2(0.170, 1.43),
    ];
    const bodiceGeo = new THREE.LatheGeometry(bodicePoints, 48);
    bodiceGeo.scale(1.18, 1, 0.86);
    const bodiceMesh = new THREE.Mesh(bodiceGeo, this.gownMaterial);
    bodiceMesh.castShadow = true;
    bodiceMesh.receiveShadow = true;
    this.dressMeshGroup.add(bodiceMesh);

    // 2. Sculpted off-shoulder cowl wrap / couture collar
    const wrapPoints: THREE.Vector3[] = [];
    const wrapSegments = 64;
    for (let i = 0; i <= wrapSegments; i++) {
      const u = (i / wrapSegments) * Math.PI * 2;
      const x = Math.cos(u) * 0.25;
      const z = Math.sin(u) * 0.19;
      // Elegant dip in front and back, cresting over shoulders
      const y = 1.42 + Math.cos(u * 2) * 0.06;
      wrapPoints.push(new THREE.Vector3(x, y, z));
    }
    const wrapCurve = new THREE.CatmullRomCurve3(wrapPoints, true);
    const wrapGeo = new THREE.TubeGeometry(wrapCurve, 64, 0.035, 16, true);
    const wrapMesh = new THREE.Mesh(wrapGeo, this.gownMaterial);
    wrapMesh.castShadow = true;
    this.dressMeshGroup.add(wrapMesh);

    // 3. Cinched Couture Waist Sash with Polished Buckle
    const sashGeo = new THREE.CylinderGeometry(0.148, 0.152, 0.05, 48, 1, true);
    sashGeo.scale(1.17, 1, 0.85);
    const sashMesh = new THREE.Mesh(sashGeo, this.accentMaterial);
    sashMesh.position.y = 1.12;
    sashMesh.castShadow = true;
    this.dressMeshGroup.add(sashMesh);

    // Gold buckle
    const buckleGeo = new THREE.BoxGeometry(0.045, 0.055, 0.015);
    const buckleMesh = new THREE.Mesh(buckleGeo, this.standMetalMaterial);
    buckleMesh.position.set(0, 1.12, 0.155);
    buckleMesh.castShadow = true;
    this.dressMeshGroup.add(buckleMesh);

    // 4. Skirt Geometry tailored to the selected silhouette
    if (silhouette === 'ballgown') {
      // Grand Ballgown: Dramatic sweeping volume, bell shape with parametric fluting folds and train
      this.buildBallgownSkirt();
    } else if (silhouette === 'mermaid') {
      // Siren Mermaid: Hugs thighs tightly then fans out into dramatic godets
      this.buildMermaidSkirt();
    } else {
      // Column Slip: Sleek Paris column silhouette with bias drape and elegant sweep
      this.buildColumnSkirt();
    }
  }

  /**
   * Procedural Ballgown with rich fluted pleats and sweeping train
   */
  private buildBallgownSkirt() {
    const radialSegments = 72;
    const heightSegments = 36;
    const geometry = new THREE.BufferGeometry();
    const vertices: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    const topY = 1.10;
    const bottomY = 0.04;
    const totalHeight = topY - bottomY;

    for (let j = 0; j <= heightSegments; j++) {
      const v = j / heightSegments;
      const y = topY - v * totalHeight;
      // Exponential flare from tight waist to wide hem
      const flare = Math.pow(v, 1.4);
      const baseRadius = 0.15 + flare * 0.72;

      for (let i = 0; i <= radialSegments; i++) {
        const u = i / radialSegments;
        const angle = u * Math.PI * 2;

        // Parametric pleat fluting folds
        const pleatCount = 14;
        const foldDepth = 0.035 * Math.sin(angle * pleatCount) * flare;
        // Back train extension
        const backFactor = Math.max(0, -Math.cos(angle));
        const trainOffset = backFactor * 0.35 * flare;

        const rx = (baseRadius + foldDepth) * 1.05;
        const rz = (baseRadius + foldDepth + trainOffset) * 0.95;

        const x = Math.sin(angle) * rx;
        const z = Math.cos(angle) * rz;

        vertices.push(x, y, z);
        uvs.push(u * 4, v * 3);
      }
    }

    for (let j = 0; j < heightSegments; j++) {
      for (let i = 0; i < radialSegments; i++) {
        const a = j * (radialSegments + 1) + i;
        const b = (j + 1) * (radialSegments + 1) + i;
        const c = (j + 1) * (radialSegments + 1) + (i + 1);
        const d = j * (radialSegments + 1) + (i + 1);

        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    const skirtMesh = new THREE.Mesh(geometry, this.gownMaterial);
    skirtMesh.castShadow = true;
    skirtMesh.receiveShadow = true;
    this.dressMeshGroup.add(skirtMesh);

    // Decorative couture hem trim ribbon
    const hemTrimGeo = new THREE.TorusGeometry(0.85, 0.015, 12, 64);
    hemTrimGeo.rotateX(Math.PI / 2);
    hemTrimGeo.scale(1.05, 1.25, 1);
    const hemTrimMesh = new THREE.Mesh(hemTrimGeo, this.accentMaterial);
    hemTrimMesh.position.set(0, 0.045, -0.15);
    hemTrimMesh.castShadow = true;
    this.dressMeshGroup.add(hemTrimMesh);
  }

  /**
   * Procedural Mermaid Skirt: Hourglass fit to mid-knee, then explosive fluting
   */
  private buildMermaidSkirt() {
    const radialSegments = 64;
    const heightSegments = 32;
    const geometry = new THREE.BufferGeometry();
    const vertices: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    const topY = 1.10;
    const bottomY = 0.04;
    const totalHeight = topY - bottomY;

    for (let j = 0; j <= heightSegments; j++) {
      const v = j / heightSegments;
      const y = topY - v * totalHeight;

      let radius = 0.15;
      if (v < 0.2) {
        // Hips
        radius = 0.15 + (v / 0.2) * 0.04;
      } else if (v < 0.6) {
        // Tight thighs/knees
        const t = (v - 0.2) / 0.4;
        radius = 0.19 - t * 0.065;
      } else {
        // Dramatic flare
        const t = (v - 0.6) / 0.4;
        radius = 0.125 + Math.pow(t, 2.2) * 0.45;
      }

      for (let i = 0; i <= radialSegments; i++) {
        const u = i / radialSegments;
        const angle = u * Math.PI * 2;

        const flutes = v > 0.6 ? Math.sin(angle * 12) * 0.025 * Math.pow((v - 0.6) / 0.4, 2) : 0;
        const backTrain = v > 0.5 && Math.cos(angle) < 0 ? Math.abs(Math.cos(angle)) * 0.2 * ((v - 0.5) / 0.5) : 0;

        const x = Math.sin(angle) * (radius + flutes) * 1.1;
        const z = Math.cos(angle) * (radius + flutes + backTrain) * 0.95;

        vertices.push(x, y, z);
        uvs.push(u * 3, v * 2);
      }
    }

    for (let j = 0; j < heightSegments; j++) {
      for (let i = 0; i < radialSegments; i++) {
        const a = j * (radialSegments + 1) + i;
        const b = (j + 1) * (radialSegments + 1) + i;
        const c = (j + 1) * (radialSegments + 1) + (i + 1);
        const d = j * (radialSegments + 1) + (i + 1);

        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    const skirtMesh = new THREE.Mesh(geometry, this.gownMaterial);
    skirtMesh.castShadow = true;
    skirtMesh.receiveShadow = true;
    this.dressMeshGroup.add(skirtMesh);
  }

  /**
   * Procedural Column Skirt: Minimalist sleek straight fall with subtle vertical folds
   */
  private buildColumnSkirt() {
    const radialSegments = 48;
    const heightSegments = 24;
    const geometry = new THREE.BufferGeometry();
    const vertices: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    const topY = 1.10;
    const bottomY = 0.04;
    const totalHeight = topY - bottomY;

    for (let j = 0; j <= heightSegments; j++) {
      const v = j / heightSegments;
      const y = topY - v * totalHeight;
      // Gentle A-line taper
      const radius = 0.15 + v * 0.12;

      for (let i = 0; i <= radialSegments; i++) {
        const u = i / radialSegments;
        const angle = u * Math.PI * 2;

        const ripples = Math.sin(angle * 8) * 0.015 * v;
        const x = Math.sin(angle) * (radius + ripples) * 1.12;
        const z = Math.cos(angle) * (radius + ripples) * 0.88;

        vertices.push(x, y, z);
        uvs.push(u * 2, v * 2);
      }
    }

    for (let j = 0; j < heightSegments; j++) {
      for (let i = 0; i < radialSegments; i++) {
        const a = j * (radialSegments + 1) + i;
        const b = (j + 1) * (radialSegments + 1) + i;
        const c = (j + 1) * (radialSegments + 1) + (i + 1);
        const d = j * (radialSegments + 1) + (i + 1);

        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    const skirtMesh = new THREE.Mesh(geometry, this.gownMaterial);
    skirtMesh.castShadow = true;
    skirtMesh.receiveShadow = true;
    this.dressMeshGroup.add(skirtMesh);
  }

  /**
   * Applies realistic PBR physical properties for the 5 haute couture fabrics
   */
  public applyMaterialPreset(fabricType: FabricType, colorHex: string) {
    this.currentConfig.fabricType = fabricType;
    this.currentConfig.colorHex = colorHex;

    const color = new THREE.Color(colorHex);
    this.gownMaterial.color.copy(color);

    // Accent tone (sash/ribbon)
    const accentCol = color.clone().offsetHSL(0, 0, 0.08);
    this.accentMaterial.color.copy(accentCol);

    const bumpTexture = this.bumpMaps.get(fabricType) || null;
    this.gownMaterial.bumpMap = bumpTexture;
    this.accentMaterial.bumpMap = bumpTexture;

    switch (fabricType) {
      case 'silk':
        // Soft liquid luster, delicate sheen, low metalness
        this.gownMaterial.roughness = 0.32;
        this.gownMaterial.metalness = 0.08;
        this.gownMaterial.clearcoat = 0.35;
        this.gownMaterial.clearcoatRoughness = 0.2;
        this.gownMaterial.sheen = 0.85;
        this.gownMaterial.sheenRoughness = 0.25;
        this.gownMaterial.sheenColor = new THREE.Color(0xffffff);
        this.gownMaterial.transmission = 0;
        this.gownMaterial.opacity = 1.0;
        this.gownMaterial.transparent = false;
        this.gownMaterial.bumpScale = 0.003;
        break;

      case 'satin':
        // High specular gloss, directional reflection, liquid fluidity
        this.gownMaterial.roughness = 0.16;
        this.gownMaterial.metalness = 0.18;
        this.gownMaterial.clearcoat = 0.75;
        this.gownMaterial.clearcoatRoughness = 0.1;
        this.gownMaterial.sheen = 0.95;
        this.gownMaterial.sheenRoughness = 0.18;
        this.gownMaterial.sheenColor = color.clone().lerp(new THREE.Color(0xffffff), 0.35);
        this.gownMaterial.transmission = 0;
        this.gownMaterial.opacity = 1.0;
        this.gownMaterial.transparent = false;
        this.gownMaterial.bumpScale = 0.0015;
        break;

      case 'velvet':
        // Deep absorbing facing angle, velvety fuzz grazing Fresnel rim
        this.gownMaterial.roughness = 0.78;
        this.gownMaterial.metalness = 0.0;
        this.gownMaterial.clearcoat = 0.05;
        this.gownMaterial.clearcoatRoughness = 0.8;
        this.gownMaterial.sheen = 1.0;
        this.gownMaterial.sheenRoughness = 0.5;
        this.gownMaterial.sheenColor = color.clone().offsetHSL(0, 0, 0.25);
        this.gownMaterial.transmission = 0;
        this.gownMaterial.opacity = 1.0;
        this.gownMaterial.transparent = false;
        this.gownMaterial.bumpScale = 0.008;
        break;

      case 'organza':
        // Semi-sheer, translucent crispness, iridescent gossamer
        this.gownMaterial.roughness = 0.22;
        this.gownMaterial.metalness = 0.12;
        this.gownMaterial.clearcoat = 0.8;
        this.gownMaterial.clearcoatRoughness = 0.15;
        this.gownMaterial.sheen = 0.7;
        this.gownMaterial.sheenRoughness = 0.2;
        this.gownMaterial.sheenColor = new THREE.Color(0xffffff);
        this.gownMaterial.transmission = 0.45;
        this.gownMaterial.opacity = 0.85;
        this.gownMaterial.transparent = true;
        this.gownMaterial.depthWrite = true;
        this.gownMaterial.bumpScale = 0.004;
        break;

      case 'metallic':
        // Haute couture molten lamé / liquid gold finish
        this.gownMaterial.roughness = 0.22;
        this.gownMaterial.metalness = 0.88;
        this.gownMaterial.clearcoat = 0.5;
        this.gownMaterial.clearcoatRoughness = 0.2;
        this.gownMaterial.sheen = 0.5;
        this.gownMaterial.sheenRoughness = 0.2;
        this.gownMaterial.sheenColor = color;
        this.gownMaterial.transmission = 0;
        this.gownMaterial.opacity = 1.0;
        this.gownMaterial.transparent = false;
        this.gownMaterial.bumpScale = 0.005;
        break;
    }

    this.gownMaterial.needsUpdate = true;
    this.accentMaterial.needsUpdate = true;
  }

  /**
   * Updates the color
   */
  public setColor(hex: string) {
    this.currentConfig.colorHex = hex;
    this.gownMaterial.color.set(hex);
    this.accentMaterial.color.set(hex).offsetHSL(0, 0, 0.08);

    if (this.currentConfig.fabricType === 'satin' || this.currentConfig.fabricType === 'velvet') {
      this.gownMaterial.sheenColor = new THREE.Color(hex).offsetHSL(0, 0, 0.2);
    }
  }

  /**
   * Applies metal finish to stand brass parts & buckles
   */
  public applyMetalFinish(metal: MetalFinish) {
    this.currentConfig.metalFinish = metal;
    switch (metal) {
      case 'champagne_gold':
        this.standMetalMaterial.color.set(0xdfc179);
        this.standMetalMaterial.roughness = 0.22;
        this.standMetalMaterial.metalness = 0.92;
        break;
      case 'rose_gold':
        this.standMetalMaterial.color.set(0xda9a8a);
        this.standMetalMaterial.roughness = 0.20;
        this.standMetalMaterial.metalness = 0.90;
        break;
      case 'antique_brass':
        this.standMetalMaterial.color.set(0x9e7c45);
        this.standMetalMaterial.roughness = 0.42;
        this.standMetalMaterial.metalness = 0.85;
        break;
      case 'polished_platinum':
        this.standMetalMaterial.color.set(0xe8edf2);
        this.standMetalMaterial.roughness = 0.12;
        this.standMetalMaterial.metalness = 0.95;
        break;
    }
  }

  public getConfig(): MannequinStyleConfig {
    return { ...this.currentConfig };
  }

  public dispose() {
    this.bumpMaps.forEach((tex) => tex.dispose());
    this.gownMaterial.dispose();
    this.accentMaterial.dispose();
    this.mannequinLinenMaterial.dispose();
    this.standWoodMaterial.dispose();
    this.standMetalMaterial.dispose();
  }
}
