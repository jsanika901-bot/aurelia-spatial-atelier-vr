import * as THREE from 'three';

/**
 * Procedural texture generator for luxury fabrics, black marble, and contact shadows.
 * Zero external image dependencies to avoid 404s.
 */

/**
 * Creates high-detail Nero Marquina marble floor texture with golden/champagne veins
 */
export function createMarbleTexture(renderer?: THREE.WebGLRenderer): THREE.CanvasTexture {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Deep obsidian/charcoal base
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, '#0a0a0c');
  grad.addColorStop(0.5, '#050507');
  grad.addColorStop(1, '#0c0b0f');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // Subtle tonal clouding
  for (let i = 0; i < 40; i++) {
    const cx = Math.random() * size;
    const cy = Math.random() * size;
    const r = 50 + Math.random() * 200;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, 'rgba(25, 23, 30, 0.25)');
    g.addColorStop(1, 'rgba(5, 5, 7, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Draw intricate golden & white marble veins
  const drawVein = (
    startX: number,
    startY: number,
    color: string,
    width: number,
    segments: number,
    waviness: number
  ) => {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();

    let x = startX;
    let y = startY;
    ctx.moveTo(x, y);

    for (let s = 0; s < segments; s++) {
      const angle = (Math.PI / 4) + (Math.random() - 0.5) * waviness;
      const step = 20 + Math.random() * 35;
      x += Math.cos(angle) * step;
      y += Math.sin(angle) * step;
      ctx.lineTo(x, y);

      // Micro branch
      if (Math.random() > 0.65 && s > 2) {
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
        const branchAngle = angle + (Math.random() > 0.5 ? 0.7 : -0.7);
        const bx = x + Math.cos(branchAngle) * (15 + Math.random() * 25);
        const by = y + Math.sin(branchAngle) * (15 + Math.random() * 25);
        ctx.save();
        ctx.lineWidth = width * 0.5;
        ctx.lineTo(bx, by);
        ctx.stroke();
        ctx.restore();
        ctx.beginPath();
        ctx.moveTo(x, y);
      }
    }
    ctx.stroke();
    ctx.restore();
  };

  // Primary champagne veins
  for (let v = 0; v < 6; v++) {
    const sx = Math.random() * size * 0.4;
    const sy = Math.random() * size * 0.3;
    drawVein(sx, sy, 'rgba(212, 175, 55, 0.45)', 2.5, 25, 0.9);
    drawVein(sx + 3, sy + 3, 'rgba(255, 240, 200, 0.3)', 1.2, 22, 0.8);
  }

  // Secondary fine mist veins
  for (let v = 0; v < 10; v++) {
    const sx = Math.random() * size;
    const sy = Math.random() * size;
    drawVein(sx, sy, 'rgba(220, 220, 235, 0.18)', 0.8, 18, 1.2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  texture.colorSpace = THREE.SRGBColorSpace;
  if (renderer) {
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  }
  return texture;
}

/**
 * Creates roughness map for marble to give realistic glossy & matte vein contrast
 */
export function createMarbleRoughnessMap(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Polished marble base is smooth (darker = glossier)
  ctx.fillStyle = '#222222';
  ctx.fillRect(0, 0, size, size);

  // Subtle natural roughness variations
  for (let i = 0; i < 50; i++) {
    const cx = Math.random() * size;
    const cy = Math.random() * size;
    const r = 20 + Math.random() * 80;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, 'rgba(60, 60, 60, 0.15)');
    g.addColorStop(1, 'rgba(30, 30, 30, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}

/**
 * Creates procedural fabric weave bump map according to fabric type
 */
export function createFabricBumpMap(type: 'silk' | 'satin' | 'velvet' | 'organza' | 'metallic'): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, size, size);

  if (type === 'silk') {
    // Elegant diagonal twill micro-weave
    ctx.strokeStyle = '#909090';
    ctx.lineWidth = 1;
    for (let x = -size; x < size * 2; x += 4) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + size, size);
      ctx.stroke();
    }
    ctx.strokeStyle = '#707070';
    for (let x = -size; x < size * 2; x += 8) {
      ctx.beginPath();
      ctx.moveTo(x, size);
      ctx.lineTo(x + size, 0);
      ctx.stroke();
    }
  } else if (type === 'satin') {
    // Ultra smooth satin weave with high-density vertical filament sheen
    ctx.fillStyle = '#858585';
    for (let x = 0; x < size; x += 2) {
      if (Math.random() > 0.4) {
        ctx.fillRect(x, 0, 1, size);
      }
    }
  } else if (type === 'velvet') {
    // Micro velvet pile stippling
    const imgData = ctx.getImageData(0, 0, size, size);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 50;
      const v = Math.min(255, Math.max(0, 128 + noise));
      data[i] = v;
      data[i + 1] = v;
      data[i + 2] = v;
    }
    ctx.putImageData(imgData, 0, 0);
  } else if (type === 'organza') {
    // Fine sheer grid / gossamer grid
    ctx.strokeStyle = '#959595';
    ctx.lineWidth = 1;
    for (let x = 0; x < size; x += 6) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, size);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, x);
      ctx.lineTo(size, x);
      ctx.stroke();
    }
  } else if (type === 'metallic') {
    // Brushed lamé metallic grain
    for (let y = 0; y < size; y += 2) {
      const shade = 115 + Math.floor(Math.random() * 30);
      ctx.fillStyle = `rgb(${shade}, ${shade}, ${shade})`;
      ctx.fillRect(0, y, size, 1);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(type === 'velvet' ? 16 : 12, type === 'velvet' ? 16 : 12);
  return texture;
}

/**
 * Soft radial contact shadow texture to ground the mannequin and pedestal
 */
export function createContactShadowTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const center = size / 2;
  const grad = ctx.createRadialGradient(center, center, 0, center, center, center * 0.95);
  grad.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
  grad.addColorStop(0.4, 'rgba(0, 0, 0, 0.45)');
  grad.addColorStop(0.75, 'rgba(0, 0, 0, 0.15)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(center, center, center, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}
