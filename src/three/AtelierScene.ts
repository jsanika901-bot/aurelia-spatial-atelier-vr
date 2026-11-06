import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { CameraViewPreset, FabricType, MetalFinish, SilhouetteType } from '../types/atelier';
import { createContactShadowTexture, createMarbleRoughnessMap, createMarbleTexture } from '../utils/proceduralTextures';
import { MannequinModel, MannequinStyleConfig } from './MannequinModel';

export class AtelierScene {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;
  private pmremGenerator: THREE.PMREMGenerator | null = null;
  private mannequin: MannequinModel;

  // Animation & loop
  private frameId: number = 0;
  private clock: THREE.Clock;
  private isSoftwareGl: boolean = false;
  private isDisposed: boolean = false;

  // Camera animation
  private targetCameraPos: THREE.Vector3 = new THREE.Vector3();
  private targetLookAt: THREE.Vector3 = new THREE.Vector3();
  private isTransitioningCamera: boolean = false;

  // Turntable
  private isTurntableActive: boolean = false;

  constructor(container: HTMLElement, initialConfig: MannequinStyleConfig) {
    this.container = container;
    this.clock = new THREE.Clock();

    // 1. Detect software WebGL
    this.isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    // 2. Setup WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true, // Needed for lookbook snapshot capture
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.18;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    this.renderer.setSize(width, height);
    container.appendChild(this.renderer.domElement);

    // 3. Scene & Fog
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x08080a);
    this.scene.fog = new THREE.FogExp2(0x08080a, 0.045);

    // 4. Camera
    this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 40);
    this.camera.position.set(0, 1.35, 3.8);

    // 5. OrbitControls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = !this.isSoftwareGl;
    this.controls.dampingFactor = 0.05;
    this.controls.target.set(0, 1.15, 0);
    this.controls.minDistance = 1.2;
    this.controls.maxDistance = 6.5;
    this.controls.maxPolarAngle = Math.PI / 2 + 0.04; // Don't go below floor
    this.controls.minPolarAngle = 0.15;

    // Stop programmatic transitions on user interaction
    this.controls.addEventListener('start', () => {
      this.isTransitioningCamera = false;
    });

    // 6. Studio PBR Environment
    this.pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = this.pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

    // 7. Lighting & Studio Environment
    this.setupLighting();
    this.setupStudioArchitecture();

    // 8. Mannequin Model
    this.mannequin = new MannequinModel(initialConfig);
    // Position mannequin comfortably on top of the display platform (dais is at y = 0.12)
    this.mannequin.group.position.set(0, 0.12, 0);
    this.scene.add(this.mannequin.group);

    // Listeners
    window.addEventListener('resize', this.onWindowResize);

    // Start loop
    this.animate();
  }

  private setupLighting() {
    // 1. Warm Key Light (Spot/Directional casting soft Parisian studio shadows)
    const keyLight = new THREE.DirectionalLight(0xfff1dc, 2.8);
    keyLight.position.set(2.5, 4.2, 3.2);
    keyLight.castShadow = !this.isSoftwareGl;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 12;
    keyLight.shadow.camera.left = -2.2;
    keyLight.shadow.camera.right = 2.2;
    keyLight.shadow.camera.top = 2.6;
    keyLight.shadow.camera.bottom = -0.5;
    keyLight.shadow.bias = -0.0004;
    keyLight.shadow.normalBias = 0.02;
    this.scene.add(keyLight);

    // 2. Cool/Warm Studio Fill (Hemisphere)
    const hemiLight = new THREE.HemisphereLight(0xfff6eb, 0x14121a, 1.1);
    this.scene.add(hemiLight);

    // 3. Champagne Gold Rim Lights (Haute Couture edge separation)
    const rimLightLeft = new THREE.DirectionalLight(0xf2cf8d, 2.2);
    rimLightLeft.position.set(-3.2, 2.5, -2.5);
    this.scene.add(rimLightLeft);

    const rimLightRight = new THREE.DirectionalLight(0xe4aa5e, 1.8);
    rimLightRight.position.set(3.0, 2.0, -2.8);
    this.scene.add(rimLightRight);

    // 4. Soft Overhead Chandelier Sconce
    const chandelier = new THREE.PointLight(0xffebd2, 1.6, 6, 1.5);
    chandelier.position.set(0, 3.4, 0.4);
    this.scene.add(chandelier);

    // 5. Stepped Platform Recessed Underglow (Warmer amber champagne)
    const platformGlow = new THREE.PointLight(0xffd58c, 1.4, 3, 2);
    platformGlow.position.set(0, 0.16, 0);
    this.scene.add(platformGlow);
  }

  private setupStudioArchitecture() {
    // 1. Black Marquina Marble Floor
    const marbleTex = createMarbleTexture(this.renderer);
    const marbleRoughness = createMarbleRoughnessMap();

    const floorGeo = new THREE.PlaneGeometry(30, 30);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x121214,
      map: marbleTex,
      roughnessMap: marbleRoughness,
      roughness: 0.22,
      metalness: 0.15,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = 0;
    floorMesh.receiveShadow = true;
    this.scene.add(floorMesh);

    // 2. Elevated Haute Couture Display Platform (Tiered circular dais)
    const daisGroup = new THREE.Group();

    // Bottom tier (brushed brass rim with dark marble inlay)
    const tier1Geo = new THREE.CylinderGeometry(1.4, 1.46, 0.06, 64);
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.25,
      metalness: 0.9,
    });
    const tier1Mesh = new THREE.Mesh(tier1Geo, brassMat);
    tier1Mesh.position.y = 0.03;
    tier1Mesh.receiveShadow = true;
    tier1Mesh.castShadow = true;
    daisGroup.add(tier1Mesh);

    // Top tier (Black marble circular plate)
    const tier2Geo = new THREE.CylinderGeometry(1.32, 1.32, 0.06, 64);
    const tier2Mat = new THREE.MeshStandardMaterial({
      color: 0x0e0e11,
      map: marbleTex,
      roughness: 0.18,
      metalness: 0.2,
    });
    const tier2Mesh = new THREE.Mesh(tier2Geo, tier2Mat);
    tier2Mesh.position.y = 0.09;
    tier2Mesh.receiveShadow = true;
    daisGroup.add(tier2Mesh);

    // Polished gold ring trim on the platform edge
    const goldRingGeo = new THREE.TorusGeometry(1.33, 0.012, 16, 64);
    goldRingGeo.rotateX(Math.PI / 2);
    const goldRing = new THREE.Mesh(goldRingGeo, brassMat);
    goldRing.position.y = 0.12;
    daisGroup.add(goldRing);

    // Soft Radial Contact Shadow under the platform
    const shadowTex = createContactShadowTexture();
    const shadowGeo = new THREE.PlaneGeometry(3.6, 3.6);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.65,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = 0.002;
    daisGroup.add(shadowMesh);

    // Soft Contact Shadow directly under the mannequin stand on the dais
    const standShadowGeo = new THREE.PlaneGeometry(1.2, 1.2);
    const standShadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    });
    const standShadow = new THREE.Mesh(standShadowGeo, standShadowMat);
    standShadow.rotation.x = -Math.PI / 2;
    standShadow.position.y = 0.121;
    daisGroup.add(standShadow);

    this.scene.add(daisGroup);

    // 3. Luxurious Atelier Architectural Backdrop: Slender brass arches and wall fluting
    const studioWallMat = new THREE.MeshStandardMaterial({
      color: 0x0b0a0e,
      roughness: 0.85,
      metalness: 0.1,
    });

    // Curved back wall
    const backWallGeo = new THREE.CylinderGeometry(8, 8, 7, 32, 1, true, -Math.PI * 0.6, Math.PI * 1.2);
    const backWall = new THREE.Mesh(backWallGeo, studioWallMat);
    backWall.position.set(0, 3.5, 2.5);
    backWall.scale.set(1, 1, -1); // Inward facing
    backWall.receiveShadow = true;
    this.scene.add(backWall);

    // Classical Parisian Atelier Minimalist Arch Frame in the background
    const archGroup = new THREE.Group();
    const archCurve = new THREE.CurvePath<THREE.Vector3>();
    archCurve.add(new THREE.LineCurve3(new THREE.Vector3(-1.8, 0, 0), new THREE.Vector3(-1.8, 3.2, 0)));
    archCurve.add(new THREE.EllipseCurve(0, 3.2, 1.8, 1.2, 0, Math.PI, false, 0) as unknown as THREE.Curve<THREE.Vector3>);
    archCurve.add(new THREE.LineCurve3(new THREE.Vector3(1.8, 3.2, 0), new THREE.Vector3(1.8, 0, 0)));

    const archPts = [
      new THREE.Vector3(-1.6, 0, -2.8),
      new THREE.Vector3(-1.6, 3.0, -2.8),
      new THREE.Vector3(-1.1, 3.8, -2.8),
      new THREE.Vector3(0, 4.1, -2.8),
      new THREE.Vector3(1.1, 3.8, -2.8),
      new THREE.Vector3(1.6, 3.0, -2.8),
      new THREE.Vector3(1.6, 0, -2.8),
    ];
    const catmullArch = new THREE.CatmullRomCurve3(archPts);
    const archTubeGeo = new THREE.TubeGeometry(catmullArch, 48, 0.025, 12, false);
    const archMesh = new THREE.Mesh(archTubeGeo, brassMat);
    archMesh.castShadow = true;
    archGroup.add(archMesh);

    // Warm linear glow strip behind the arch
    const glowLineMat = new THREE.MeshBasicMaterial({ color: 0xffd99b });
    const glowLineGeo = new THREE.TubeGeometry(catmullArch, 48, 0.008, 8, false);
    const glowLine = new THREE.Mesh(glowLineGeo, glowLineMat);
    glowLine.position.z = -0.01;
    archGroup.add(glowLine);

    this.scene.add(archGroup);
  }

  /**
   * Sets camera view preset with silky smooth damping
   */
  public setCameraView(preset: CameraViewPreset) {
    this.isTransitioningCamera = true;
    switch (preset) {
      case 'full':
        // Full silhouette view
        this.targetCameraPos.set(0, 1.25, 3.8);
        this.targetLookAt.set(0, 1.05, 0);
        break;
      case 'bodice':
        // Close-up on couture neckline, bodice and waist
        this.targetCameraPos.set(0, 1.45, 1.65);
        this.targetLookAt.set(0, 1.35, 0);
        break;
      case 'skirt':
        // Low angle showing dramatic sweeping hem, flutes & train
        this.targetCameraPos.set(0.9, 0.45, 2.2);
        this.targetLookAt.set(0, 0.65, -0.1);
        break;
      case 'profile':
        // High-fashion side profile showing hourglass silhouette
        this.targetCameraPos.set(2.8, 1.25, 0.6);
        this.targetLookAt.set(0, 1.15, 0);
        break;
      case 'top_down':
        // Atelier bird's-eye architectural perspective
        this.targetCameraPos.set(0, 3.2, 2.2);
        this.targetLookAt.set(0, 0.8, 0);
        break;
    }
  }

  /**
   * Toggle 360° slow runway turntable
   */
  public setTurntable(active: boolean) {
    this.isTurntableActive = active;
    this.controls.autoRotate = active;
    this.controls.autoRotateSpeed = 1.2;
  }

  public isTurntable(): boolean {
    return this.isTurntableActive;
  }

  /**
   * Fabric selection
   */
  public updateFabric(fabricType: FabricType, colorHex: string) {
    this.mannequin.applyMaterialPreset(fabricType, colorHex);
  }

  /**
   * Color selection
   */
  public updateColor(colorHex: string) {
    this.mannequin.setColor(colorHex);
  }

  /**
   * Silhouette selection
   */
  public updateSilhouette(silhouette: SilhouetteType) {
    this.mannequin.buildGown(silhouette);
  }

  /**
   * Metal finish
   */
  public updateMetalFinish(metal: MetalFinish) {
    this.mannequin.applyMetalFinish(metal);
  }

  public getConfig(): MannequinStyleConfig {
    return this.mannequin.getConfig();
  }

  /**
   * Captures high-res snapshot thumbnail for lookbook gallery
   */
  public captureSnapshot(): string {
    // Render immediately to ensure drawing buffer contains fresh frame
    this.renderer.render(this.scene, this.camera);
    return this.renderer.domElement.toDataURL('image/jpeg', 0.88);
  }

  private onWindowResize = () => {
    if (!this.container || this.isDisposed) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private animate = () => {
    if (this.isDisposed) return;

    this.frameId = requestAnimationFrame(this.animate);
    const delta = Math.min(this.clock.getDelta(), 0.1);

    // Smooth camera damping if a preset transition is active
    if (this.isTransitioningCamera) {
      const dampFactor = 5.0;
      this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, this.targetCameraPos.x, dampFactor, delta);
      this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, this.targetCameraPos.y, dampFactor, delta);
      this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, this.targetCameraPos.z, dampFactor, delta);

      this.controls.target.x = THREE.MathUtils.damp(this.controls.target.x, this.targetLookAt.x, dampFactor, delta);
      this.controls.target.y = THREE.MathUtils.damp(this.controls.target.y, this.targetLookAt.y, dampFactor, delta);
      this.controls.target.z = THREE.MathUtils.damp(this.controls.target.z, this.targetLookAt.z, dampFactor, delta);

      if (this.camera.position.distanceTo(this.targetCameraPos) < 0.02) {
        this.isTransitioningCamera = false;
      }
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };

  public dispose() {
    this.isDisposed = true;
    cancelAnimationFrame(this.frameId);
    window.removeEventListener('resize', this.onWindowResize);

    this.mannequin.dispose();
    this.controls.dispose();
    this.pmremGenerator?.dispose();
    this.renderer.dispose();

    if (this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}
