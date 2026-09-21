import * as THREE from 'three';
import { CelestialBodyId, SurfaceMode } from '../types';

// Simple fast pseudo-noise helper
function pseudoNoise2D(x: number, y: number): number {
  const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453123;
  return n - Math.floor(n);
}

function smoothNoise(x: number, y: number): number {
  const i = Math.floor(x);
  const j = Math.floor(y);
  const fx = x - i;
  const fy = y - j;
  // Smooth cubic interpolation
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);

  const n00 = pseudoNoise2D(i, j);
  const n10 = pseudoNoise2D(i + 1, j);
  const n01 = pseudoNoise2D(i, j + 1);
  const n11 = pseudoNoise2D(i + 1, j + 1);

  const nx0 = n00 * (1 - sx) + n10 * sx;
  const nx1 = n01 * (1 - sx) + n11 * sx;
  return nx0 * (1 - sy) + nx1 * sy;
}

function fbm(x: number, y: number, octaves = 5): number {
  let val = 0;
  let amp = 0.5;
  let freq = 1;
  let totalAmp = 0;
  for (let o = 0; o < octaves; o++) {
    val += smoothNoise(x * freq, y * freq) * amp;
    totalAmp += amp;
    amp *= 0.5;
    freq *= 2.05;
  }
  return val / totalAmp;
}

// Convert spherical lon/lat to canvas pixel coordinates
function toCanvasCoords(lonDeg: number, latDeg: number, width: number, height: number): [number, number] {
  // lon: -180 to 180 -> 0 to width
  // lat: -90 to 90 -> height to 0
  const x = ((lonDeg + 180) / 360) * width;
  const y = ((90 - latDeg) / 180) * height;
  return [x, y];
}

// Texture Cache
const textureCache: Record<string, { diffuse: THREE.CanvasTexture; bump?: THREE.CanvasTexture }> = {};

export function getCelestialTextures(
  bodyId: CelestialBodyId,
  mode: SurfaceMode = 'natural'
): { diffuse: THREE.CanvasTexture; bump?: THREE.CanvasTexture } {
  const cacheKey = `${bodyId}_${mode}`;
  if (textureCache[cacheKey]) {
    return textureCache[cacheKey];
  }

  const width = 2048;
  const height = 1024;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = width;
  bumpCanvas.height = height;
  const bumpCtx = bumpCanvas.getContext('2d')!;

  switch (bodyId) {
    case 'moon':
      generateMoonTexture(ctx, bumpCtx, width, height);
      break;
    case 'mars':
      generateMarsTexture(ctx, bumpCtx, width, height);
      break;
    case 'venus':
      if (mode === 'radar_surface') {
        generateVenusRadarTexture(ctx, bumpCtx, width, height);
      } else {
        generateVenusAtmosphereTexture(ctx, bumpCtx, width, height);
      }
      break;
    case 'io':
      generateIoTexture(ctx, bumpCtx, width, height);
      break;
    case 'titan':
      if (mode === 'infrared_surface') {
        generateTitanSurfaceTexture(ctx, bumpCtx, width, height);
      } else {
        generateTitanAtmosphereTexture(ctx, bumpCtx, width, height);
      }
      break;
  }

  const diffuseTexture = new THREE.CanvasTexture(canvas);
  diffuseTexture.wrapS = THREE.RepeatWrapping;
  diffuseTexture.wrapT = THREE.ClampToEdgeWrapping;
  diffuseTexture.colorSpace = THREE.SRGBColorSpace;
  diffuseTexture.needsUpdate = true;

  const bumpTexture = new THREE.CanvasTexture(bumpCanvas);
  bumpTexture.wrapS = THREE.RepeatWrapping;
  bumpTexture.wrapT = THREE.ClampToEdgeWrapping;
  bumpTexture.needsUpdate = true;

  const result = { diffuse: diffuseTexture, bump: bumpTexture };
  textureCache[cacheKey] = result;
  return result;
}

// -------------------------------------------------------------
// 1. THE MOON
// -------------------------------------------------------------
function generateMoonTexture(
  ctx: CanvasRenderingContext2D,
  bumpCtx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  const imgData = ctx.createImageData(width, height);
  const bumpData = bumpCtx.createImageData(width, height);
  const data = imgData.data;
  const bdata = bumpData.data;

  // Key Maria locations [lon, lat, radiusLonDeg, radiusLatDeg, intensity]
  const maria: [number, number, number, number, number][] = [
    [-45, 20, 32, 28, 0.75], // Oceanus Procellarum
    [-16, 33, 16, 14, 0.85], // Mare Imbrium
    [18, 28, 14, 12, 0.8], // Mare Serenitatis
    [31, 8, 15, 12, 0.82], // Mare Tranquillitatis
    [59, 17, 10, 8, 0.88], // Mare Crisium
    [51, -8, 14, 12, 0.78], // Mare Fecunditatis
    [35, -15, 10, 9, 0.75], // Mare Nectaris
    [-17, -21, 14, 11, 0.72], // Mare Nubium
    [-38, -24, 9, 8, 0.7], // Mare Humorum
    [170, -70, 24, 18, 0.45], // South Pole-Aitken (Far side basin)
    [95, -18, 12, 10, 0.5] // Mare Smythii / Marginis
  ];

  for (let y = 0; y < height; y++) {
    const lat = 90 - (y / height) * 180;
    const latRad = (lat * Math.PI) / 180;
    const cosLat = Math.cos(latRad);

    for (let x = 0; x < width; x++) {
      const lon = (x / width) * 360 - 180;
      const idx = (y * width + x) * 4;

      // Base anorthosite highlands noise
      const n1 = fbm(x * 0.015, y * 0.015, 4);
      const n2 = fbm(x * 0.05, y * 0.05, 3);
      const craterNoise = smoothNoise(x * 0.12, y * 0.12);

      let mareFactor = 0;
      for (const [mX, mY, rX, rY, weight] of maria) {
        let dLon = Math.abs(lon - mX);
        if (dLon > 180) dLon = 360 - dLon;
        const dx = (dLon * cosLat) / rX;
        const dy = (lat - mY) / rY;
        const distSq = dx * dx + dy * dy;
        if (distSq < 1.0) {
          const edgeNoise = (fbm(x * 0.02, y * 0.02, 3) - 0.5) * 0.35;
          const falloff = Math.max(0, 1.0 - Math.sqrt(distSq) + edgeNoise);
          mareFactor = Math.max(mareFactor, falloff * weight);
        }
      }

      // Highlands tone ~ 170-210, Maria tone ~ 65-105
      let tone = 185 + (n1 - 0.5) * 45 + (n2 - 0.5) * 20 - (craterNoise > 0.85 ? 25 : 0);
      tone = tone * (1 - mareFactor * 0.65) + 68 * (mareFactor * 0.65);

      data[idx] = Math.min(255, Math.max(0, tone + 2));
      data[idx + 1] = Math.min(255, Math.max(0, tone));
      data[idx + 2] = Math.min(255, Math.max(0, tone - 2));
      data[idx + 3] = 255;

      // Bump data: highlands rough & elevated, maria flat & low
      const bumpVal = Math.min(255, Math.max(0, (tone - 60) * 1.3));
      bdata[idx] = bumpVal;
      bdata[idx + 1] = bumpVal;
      bdata[idx + 2] = bumpVal;
      bdata[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  bumpCtx.putImageData(bumpData, 0, 0);

  // Draw Ray Crater Systems (Tycho and Copernicus)
  drawRayCrater(ctx, bumpCtx, width, height, -11.2, -43.3, 18, 280, '#f1f5f9');
  drawRayCrater(ctx, bumpCtx, width, height, -20.1, 9.6, 22, 190, '#e2e8f0');
  drawRayCrater(ctx, bumpCtx, width, height, -38.0, 8.0, 14, 110, '#cbd5e1'); // Kepler
}

function drawRayCrater(
  ctx: CanvasRenderingContext2D,
  bumpCtx: CanvasRenderingContext2D,
  width: number,
  height: number,
  lon: number,
  lat: number,
  radius: number,
  rayLength: number,
  rayColor: string
) {
  const [cx, cy] = toCanvasCoords(lon, lat, width, height);

  ctx.save();
  bumpCtx.save();

  // Ejecta rays
  ctx.strokeStyle = rayColor;
  ctx.globalAlpha = 0.45;
  const numRays = 32;
  for (let i = 0; i < numRays; i++) {
    const angle = (i / numRays) * Math.PI * 2 + (pseudoNoise2D(i, lon) - 0.5) * 0.25;
    const len = rayLength * (0.6 + pseudoNoise2D(i, lat) * 0.6);
    ctx.lineWidth = 1.5 + pseudoNoise2D(i * 3, 5) * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle) * len, cy + Math.sin(angle) * len * 0.8);
    ctx.stroke();
  }

  // Crater rim highlight & shadow floor
  ctx.globalAlpha = 1.0;
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.arc(cx - radius * 0.25, cy - radius * 0.25, radius * 0.35, 0, Math.PI * 2);
  ctx.fill();

  // Central peak
  ctx.fillStyle = '#cbd5e1';
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Bump representation
  bumpCtx.fillStyle = '#ffffff';
  bumpCtx.beginPath();
  bumpCtx.arc(cx, cy, radius * 1.2, 0, Math.PI * 2);
  bumpCtx.fill();

  bumpCtx.fillStyle = '#101010';
  bumpCtx.beginPath();
  bumpCtx.arc(cx, cy, radius * 0.8, 0, Math.PI * 2);
  bumpCtx.fill();

  bumpCtx.fillStyle = '#cccccc';
  bumpCtx.beginPath();
  bumpCtx.arc(cx, cy, radius * 0.2, 0, Math.PI * 2);
  bumpCtx.fill();

  ctx.restore();
  bumpCtx.restore();
}

// -------------------------------------------------------------
// 2. MARS
// -------------------------------------------------------------
function generateMarsTexture(
  ctx: CanvasRenderingContext2D,
  bumpCtx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  const imgData = ctx.createImageData(width, height);
  const bumpData = bumpCtx.createImageData(width, height);
  const data = imgData.data;
  const bdata = bumpData.data;

  // Mars Dark Albedo regions: [lon, lat, rLon, rLat, weight]
  const darkRegions: [number, number, number, number, number][] = [
    [70, 10, 22, 18, 0.7], // Syrtis Major Planum (prominent wedge)
    [-40, 45, 30, 20, 0.65], // Acidalia Planitia
    [5, -5, 45, 12, 0.6], // Sinus Sabaeus / Sinus Meridiani
    [140, -25, 40, 18, 0.65], // Mare Cimmerium
    [-130, -35, 35, 15, 0.55], // Mare Sirenum
    [-65, -30, 25, 12, 0.5] // Solis Lacus (Eye of Mars)
  ];

  for (let y = 0; y < height; y++) {
    const lat = 90 - (y / height) * 180;
    const latRad = (lat * Math.PI) / 180;
    const cosLat = Math.cos(latRad);

    for (let x = 0; x < width; x++) {
      const lon = (x / width) * 360 - 180;
      const idx = (y * width + x) * 4;

      const n1 = fbm(x * 0.012, y * 0.012, 5);
      const n2 = fbm(x * 0.04, y * 0.04, 3);

      let darkFactor = 0;
      for (const [mX, mY, rX, rY, weight] of darkRegions) {
        let dLon = Math.abs(lon - mX);
        if (dLon > 180) dLon = 360 - dLon;
        const dx = (dLon * cosLat) / rX;
        const dy = (lat - mY) / rY;
        const distSq = dx * dx + dy * dy;
        if (distSq < 1.0) {
          const rough = (fbm(x * 0.02, y * 0.02, 3) - 0.5) * 0.3;
          const falloff = Math.max(0, 1.0 - Math.sqrt(distSq) + rough);
          darkFactor = Math.max(darkFactor, falloff * weight);
        }
      }

      // Base rusty desert colors
      let r = 195 + (n1 - 0.5) * 50;
      let g = 85 + (n1 - 0.5) * 30 + (n2 - 0.5) * 15;
      let b = 45 + (n1 - 0.5) * 20;

      // Dark basalt plains (#4a3b32)
      r = r * (1 - darkFactor * 0.6) + 70 * (darkFactor * 0.6);
      g = g * (1 - darkFactor * 0.6) + 55 * (darkFactor * 0.6);
      b = b * (1 - darkFactor * 0.6) + 48 * (darkFactor * 0.6);

      let bumpVal = 120 + (n1 - 0.5) * 60;

      // Polar Ice Caps
      if (lat > 76) {
        const polarDist = (90 - lat) / 14;
        const spiral = Math.sin(lon * 0.08 + polarDist * 4) * 0.15;
        if (polarDist + spiral < 0.95) {
          const capIntensity = Math.min(1.0, (1.0 - (polarDist + spiral)) * 3);
          r = r * (1 - capIntensity) + 248 * capIntensity;
          g = g * (1 - capIntensity) + 250 * capIntensity;
          b = b * (1 - capIntensity) + 255 * capIntensity;
          bumpVal = bumpVal * (1 - capIntensity) + 230 * capIntensity;
        }
      } else if (lat < -78) {
        const polarDist = (lat - -90) / 12;
        const spiral = Math.sin(lon * 0.08 + polarDist * 4) * 0.15;
        if (polarDist + spiral < 0.85) {
          const capIntensity = Math.min(1.0, (1.0 - (polarDist + spiral)) * 3);
          r = r * (1 - capIntensity) + 245 * capIntensity;
          g = g * (1 - capIntensity) + 248 * capIntensity;
          b = b * (1 - capIntensity) + 255 * capIntensity;
          bumpVal = bumpVal * (1 - capIntensity) + 230 * capIntensity;
        }
      }

      data[idx] = Math.min(255, Math.max(0, r));
      data[idx + 1] = Math.min(255, Math.max(0, g));
      data[idx + 2] = Math.min(255, Math.max(0, b));
      data[idx + 3] = 255;

      bdata[idx] = Math.min(255, Math.max(0, bumpVal));
      bdata[idx + 1] = Math.min(255, Math.max(0, bumpVal));
      bdata[idx + 2] = Math.min(255, Math.max(0, bumpVal));
      bdata[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  bumpCtx.putImageData(bumpData, 0, 0);

  // Draw Olympus Mons Shield Volcano & Caldera
  drawVolcanoMons(ctx, bumpCtx, width, height, -133.8, 18.6, 32, 'Olympus Mons');

  // Draw Tharsis Montes (Ascraeus, Pavonis, Arsia)
  drawVolcanoMons(ctx, bumpCtx, width, height, -104.5, 11.9, 18, 'Ascraeus');
  drawVolcanoMons(ctx, bumpCtx, width, height, -112.9, 0.8, 17, 'Pavonis');
  drawVolcanoMons(ctx, bumpCtx, width, height, -120.9, -9.0, 18, 'Arsia');

  // Draw Valles Marineris Canyon
  drawVallesMarineris(ctx, bumpCtx, width, height);
}

function drawVolcanoMons(
  ctx: CanvasRenderingContext2D,
  bumpCtx: CanvasRenderingContext2D,
  width: number,
  height: number,
  lon: number,
  lat: number,
  radius: number,
  _name: string
) {
  const [cx, cy] = toCanvasCoords(lon, lat, width, height);

  ctx.save();
  bumpCtx.save();

  // Outer shield flank
  const grad = ctx.createRadialGradient(cx, cy, radius * 0.2, cx, cy, radius);
  grad.addColorStop(0, '#b94723');
  grad.addColorStop(0.7, '#8f3319');
  grad.addColorStop(1, 'rgba(180, 75, 40, 0)');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();

  // Summit caldera depression
  ctx.fillStyle = '#4a1d12';
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.22, 0, Math.PI * 2);
  ctx.fill();

  // Bump mapping: high mountain summit, sunken caldera
  const bgrad = bumpCtx.createRadialGradient(cx, cy, radius * 0.2, cx, cy, radius);
  bgrad.addColorStop(0, '#ffffff');
  bgrad.addColorStop(0.7, '#d0d0d0');
  bgrad.addColorStop(1, '#808080');

  bumpCtx.fillStyle = bgrad;
  bumpCtx.beginPath();
  bumpCtx.arc(cx, cy, radius, 0, Math.PI * 2);
  bumpCtx.fill();

  bumpCtx.fillStyle = '#202020';
  bumpCtx.beginPath();
  bumpCtx.arc(cx, cy, radius * 0.22, 0, Math.PI * 2);
  bumpCtx.fill();

  ctx.restore();
  bumpCtx.restore();
}

function drawVallesMarineris(
  ctx: CanvasRenderingContext2D,
  bumpCtx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  // Canyon path across Mars equator: ~ lon -95 to -45, lat -14
  const startCoord = toCanvasCoords(-96, -8, width, height);
  const mid1Coord = toCanvasCoords(-78, -12, width, height);
  const mid2Coord = toCanvasCoords(-60, -15, width, height);
  const endCoord = toCanvasCoords(-42, -18, width, height);

  ctx.save();
  bumpCtx.save();

  ctx.strokeStyle = '#38160f';
  ctx.lineWidth = 9;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(startCoord[0], startCoord[1]);
  ctx.bezierCurveTo(mid1Coord[0], mid1Coord[1], mid2Coord[0], mid2Coord[1], endCoord[0], endCoord[1]);
  ctx.stroke();

  // Tributary chasms (Coprates, Ophir, Candor Chasma)
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(mid1Coord[0] - 12, mid1Coord[1] - 8);
  ctx.lineTo(mid1Coord[0] + 18, mid1Coord[1] + 6);
  ctx.moveTo(mid2Coord[0] - 10, mid2Coord[1] - 10);
  ctx.lineTo(mid2Coord[0] + 14, mid2Coord[1] + 4);
  ctx.stroke();

  // Bump: deep cut
  bumpCtx.strokeStyle = '#101010';
  bumpCtx.lineWidth = 11;
  bumpCtx.lineCap = 'round';
  bumpCtx.beginPath();
  bumpCtx.moveTo(startCoord[0], startCoord[1]);
  bumpCtx.bezierCurveTo(mid1Coord[0], mid1Coord[1], mid2Coord[0], mid2Coord[1], endCoord[0], endCoord[1]);
  bumpCtx.stroke();

  ctx.restore();
  bumpCtx.restore();
}

// -------------------------------------------------------------
// 3. VENUS (Atmosphere & Radar Surface)
// -------------------------------------------------------------
function generateVenusAtmosphereTexture(
  ctx: CanvasRenderingContext2D,
  bumpCtx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  const imgData = ctx.createImageData(width, height);
  const bumpData = bumpCtx.createImageData(width, height);
  const data = imgData.data;
  const bdata = bumpData.data;

  for (let y = 0; y < height; y++) {
    const lat = 90 - (y / height) * 180;
    const latRad = (lat * Math.PI) / 180;

    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;

      // Super-rotating atmospheric bands with UV chevron swirl
      const shearX = x + Math.cos(latRad) * 45;
      const nZonal = Math.sin(latRad * 8 + fbm(shearX * 0.015, y * 0.02, 3) * 2.5);
      const chevron = Math.abs(Math.sin((x / width) * Math.PI * 2 - Math.abs(latRad) * 1.5));

      const n1 = fbm(x * 0.01, y * 0.02, 4);

      // Pale cream yellowish atmosphere with subtle UV darkening
      const baseLuma = 0.88 + nZonal * 0.06 - chevron * 0.08 + (n1 - 0.5) * 0.08;
      const r = Math.min(255, Math.floor(242 * baseLuma));
      const g = Math.min(255, Math.floor(224 * baseLuma));
      const b = Math.min(255, Math.floor(168 * baseLuma));

      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = 255;

      // Very smooth bump (just subtle high cloud ridges)
      const bval = 128 + Math.floor(nZonal * 15);
      bdata[idx] = bval;
      bdata[idx + 1] = bval;
      bdata[idx + 2] = bval;
      bdata[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  bumpCtx.putImageData(bumpData, 0, 0);
}

function generateVenusRadarTexture(
  ctx: CanvasRenderingContext2D,
  bumpCtx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  const imgData = ctx.createImageData(width, height);
  const bumpData = bumpCtx.createImageData(width, height);
  const data = imgData.data;
  const bdata = bumpData.data;

  // Major Venus radar highlands:
  // Ishtar Terra (lat 65-75, lon 0-60)
  // Aphrodite Terra (lat -10 to 10, lon 60-150)
  // Beta Regio / Rhea Regio (lat 25, lon -78)
  for (let y = 0; y < height; y++) {
    const lat = 90 - (y / height) * 180;
    const latRad = (lat * Math.PI) / 180;
    const cosLat = Math.cos(latRad);

    for (let x = 0; x < width; x++) {
      const lon = (x / width) * 360 - 180;
      const idx = (y * width + x) * 4;

      const n1 = fbm(x * 0.015, y * 0.015, 5);
      const n2 = fbm(x * 0.04, y * 0.04, 3);

      let highland = 0;

      // Ishtar Terra
      let dLonIshtar = Math.abs(lon - 25);
      if (dLonIshtar > 180) dLonIshtar = 360 - dLonIshtar;
      const dIshtar = Math.hypot((dLonIshtar * cosLat) / 28, (lat - 70) / 12);
      if (dIshtar < 1.0) highland = Math.max(highland, (1.0 - dIshtar) * 0.95);

      // Aphrodite Terra
      let dLonAph = Math.abs(lon - 105);
      if (dLonAph > 180) dLonAph = 360 - dLonAph;
      const dAph = Math.hypot((dLonAph * cosLat) / 45, (lat - -5) / 14);
      if (dAph < 1.0) highland = Math.max(highland, (1.0 - dAph) * 0.85);

      // Beta Regio
      let dLonBeta = Math.abs(lon - -75);
      if (dLonBeta > 180) dLonBeta = 360 - dLonBeta;
      const dBeta = Math.hypot((dLonBeta * cosLat) / 20, (lat - 25) / 14);
      if (dBeta < 1.0) highland = Math.max(highland, (1.0 - dBeta) * 0.8);

      const elev = Math.min(1.0, Math.max(0, n1 * 0.5 + highland * 0.65 + (n2 - 0.5) * 0.15));

      // Radar False Color: low volcanic plains (#78350f / #92400e) -> midlands (#b45309) -> highlands / Maxwell (#fbbf24 to #fef08a)
      let r = 110 + elev * 140;
      let g = 50 + elev * 125;
      let b = 15 + elev * 70;

      // Maxwell Montes metallic peak at lat 65.2, lon 3.3
      let dLonMax = Math.abs(lon - 3.3);
      if (dLonMax > 180) dLonMax = 360 - dLonMax;
      const dMax = Math.hypot((dLonMax * cosLat) / 6, (lat - 65.2) / 4);
      if (dMax < 1.0) {
        const p = Math.pow(1.0 - dMax, 2);
        r = r * (1 - p) + 255 * p;
        g = g * (1 - p) + 245 * p;
        b = b * (1 - p) + 220 * p;
      }

      data[idx] = Math.min(255, Math.floor(r));
      data[idx + 1] = Math.min(255, Math.floor(g));
      data[idx + 2] = Math.min(255, Math.floor(b));
      data[idx + 3] = 255;

      const bumpVal = Math.min(255, Math.floor(elev * 240 + (dMax < 1 ? (1 - dMax) * 50 : 0)));
      bdata[idx] = bumpVal;
      bdata[idx + 1] = bumpVal;
      bdata[idx + 2] = bumpVal;
      bdata[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  bumpCtx.putImageData(bumpData, 0, 0);
}

// -------------------------------------------------------------
// 4. IO
// -------------------------------------------------------------
function generateIoTexture(
  ctx: CanvasRenderingContext2D,
  bumpCtx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  const imgData = ctx.createImageData(width, height);
  const bumpData = bumpCtx.createImageData(width, height);
  const data = imgData.data;
  const bdata = bumpData.data;

  // Major volcanic centers on Io: [lon, lat, type]
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;

      const n1 = fbm(x * 0.02, y * 0.02, 4);
      const n2 = fbm(x * 0.06, y * 0.06, 3);
      const whiteFrost = smoothNoise(x * 0.05, y * 0.05);

      // Base bright sulfur yellow
      let r = 235 + (n1 - 0.5) * 35;
      let g = 195 + (n1 - 0.5) * 45;
      let b = 55 + (n2 - 0.5) * 35;

      // Orange-red sulfur allotrope patches
      if (n2 > 0.6) {
        const patch = (n2 - 0.6) / 0.4;
        r = r * (1 - patch) + 215 * patch;
        g = g * (1 - patch) + 105 * patch;
        b = b * (1 - patch) + 25 * patch;
      }

      // Brilliant white SO2 snow/frost
      if (whiteFrost > 0.78) {
        const fInt = (whiteFrost - 0.78) / 0.22;
        r = r * (1 - fInt) + 250 * fInt;
        g = g * (1 - fInt) + 252 * fInt;
        b = b * (1 - fInt) + 255 * fInt;
      }

      data[idx] = Math.min(255, Math.floor(r));
      data[idx + 1] = Math.min(255, Math.floor(g));
      data[idx + 2] = Math.min(255, Math.floor(b));
      data[idx + 3] = 255;

      const bval = 120 + Math.floor((n1 - 0.5) * 40);
      bdata[idx] = bval;
      bdata[idx + 1] = bval;
      bdata[idx + 2] = bval;
      bdata[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  bumpCtx.putImageData(bumpData, 0, 0);

  // Draw Pele Volcano's gigantic red elliptical ring
  drawPeleRing(ctx, width, height);

  // Draw Loki Patera lava lake
  drawLokiPatera(ctx, bumpCtx, width, height);

  // Draw scattered active volcanic calderas & sulfur rings
  const volcanos: [number, number, number][] = [
    [-123.5, 62.8, 14], // Tvashtar
    [-88.5, -39.8, 16], // Babbar
    [153.0, 1.5, 12], // Amirani
    [-152.0, -1.5, 13], // Prometheus
    [3.0, -21.0, 10], // Culann
    [-177.0, -32.0, 11] // Marduk
  ];

  for (const [vLon, vLat, vRad] of volcanos) {
    drawVolcanicPatera(ctx, bumpCtx, width, height, vLon, vLat, vRad);
  }
}

function drawPeleRing(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const [cx, cy] = toCanvasCoords(104.7, -18.7, width, height);

  ctx.save();
  // Giant 1,200 km red sulfur plume ring
  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 14;
  ctx.globalAlpha = 0.75;
  ctx.beginPath();
  ctx.ellipse(cx, cy, 65, 45, 0.2, 0, Math.PI * 2);
  ctx.stroke();

  // Outer orange halo
  ctx.strokeStyle = '#ea580c';
  ctx.lineWidth = 18;
  ctx.globalAlpha = 0.4;
  ctx.beginPath();
  ctx.ellipse(cx, cy, 80, 56, 0.2, 0, Math.PI * 2);
  ctx.stroke();

  // Central dark caldera vent
  ctx.globalAlpha = 1.0;
  ctx.fillStyle = '#1c1917';
  ctx.beginPath();
  ctx.arc(cx, cy, 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawLokiPatera(
  ctx: CanvasRenderingContext2D,
  bumpCtx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  const [cx, cy] = toCanvasCoords(-52.8, 13.0, width, height);

  ctx.save();
  bumpCtx.save();

  // Horseshoe-shaped active lava lake
  ctx.fillStyle = '#171717';
  ctx.beginPath();
  ctx.arc(cx, cy, 18, 0, Math.PI * 2);
  ctx.fill();

  // Glowing orange crust margin
  ctx.strokeStyle = '#f97316';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, 17, 0, Math.PI * 2);
  ctx.stroke();

  // Central island raft
  ctx.fillStyle = '#ca8a04';
  ctx.beginPath();
  ctx.arc(cx + 4, cy - 2, 7, 0, Math.PI * 2);
  ctx.fill();

  // Bump: depression
  bumpCtx.fillStyle = '#181818';
  bumpCtx.beginPath();
  bumpCtx.arc(cx, cy, 18, 0, Math.PI * 2);
  bumpCtx.fill();

  ctx.restore();
  bumpCtx.restore();
}

function drawVolcanicPatera(
  ctx: CanvasRenderingContext2D,
  bumpCtx: CanvasRenderingContext2D,
  width: number,
  height: number,
  lon: number,
  lat: number,
  radius: number
) {
  const [cx, cy] = toCanvasCoords(lon, lat, width, height);

  ctx.save();
  bumpCtx.save();

  // Red/orange halo
  ctx.fillStyle = 'rgba(234, 88, 12, 0.55)';
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 1.8, 0, Math.PI * 2);
  ctx.fill();

  // Black silicate caldera floor
  ctx.fillStyle = '#1c1917';
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();

  // Center molten flare
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Bump
  bumpCtx.fillStyle = '#202020';
  bumpCtx.beginPath();
  bumpCtx.arc(cx, cy, radius, 0, Math.PI * 2);
  bumpCtx.fill();

  ctx.restore();
  bumpCtx.restore();
}

// -------------------------------------------------------------
// 5. TITAN (Atmosphere & Surface)
// -------------------------------------------------------------
function generateTitanAtmosphereTexture(
  ctx: CanvasRenderingContext2D,
  bumpCtx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  const imgData = ctx.createImageData(width, height);
  const bumpData = bumpCtx.createImageData(width, height);
  const data = imgData.data;
  const bdata = bumpData.data;

  for (let y = 0; y < height; y++) {
    const lat = 90 - (y / height) * 180;
    const latNorm = lat / 90; // -1 to 1

    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;

      // Soft uniform tholin hydrocarbon smog
      const n1 = fbm(x * 0.008, y * 0.015, 3);

      // Deep golden amber at equator, darker towards poles
      const limbShade = 1.0 - Math.pow(Math.abs(latNorm), 2.2) * 0.22;
      // North polar hood (winter smog collar)
      const northHood = lat > 65 ? 0.85 : 1.0;

      const r = Math.floor((225 + (n1 - 0.5) * 15) * limbShade * northHood);
      const g = Math.floor((142 + (n1 - 0.5) * 12) * limbShade * northHood);
      const b = Math.floor((38 + (n1 - 0.5) * 8) * limbShade * northHood);

      data[idx] = Math.min(255, Math.max(0, r));
      data[idx + 1] = Math.min(255, Math.max(0, g));
      data[idx + 2] = Math.min(255, Math.max(0, b));
      data[idx + 3] = 255;

      // Perfectly smooth atmosphere
      bdata[idx] = 128;
      bdata[idx + 1] = 128;
      bdata[idx + 2] = 128;
      bdata[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  bumpCtx.putImageData(bumpData, 0, 0);
}

function generateTitanSurfaceTexture(
  ctx: CanvasRenderingContext2D,
  bumpCtx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  const imgData = ctx.createImageData(width, height);
  const bumpData = bumpCtx.createImageData(width, height);
  const data = imgData.data;
  const bdata = bumpData.data;

  // Cassini Radar / Infrared features:
  // Liquid Methane Seas (Kraken Mare, Ligeia Mare, Punga Mare) in northern polar region
  // Equatorial Dark Sand Dunes (Shangri-La, Belet, Fensal)
  // Bright Icy Continent (Xanadu Regio at lon 100, lat -15)
  for (let y = 0; y < height; y++) {
    const lat = 90 - (y / height) * 180;
    const latRad = (lat * Math.PI) / 180;
    const cosLat = Math.cos(latRad);

    for (let x = 0; x < width; x++) {
      const lon = (x / width) * 360 - 180;
      const idx = (y * width + x) * 4;

      const n1 = fbm(x * 0.015, y * 0.015, 4);
      const n2 = fbm(x * 0.04, y * 0.04, 3);

      // Base icy regolith tone (brownish-ochre)
      let r = 160 + (n1 - 0.5) * 40;
      let g = 110 + (n1 - 0.5) * 30;
      let b = 65 + (n2 - 0.5) * 20;
      let bumpVal = 128 + (n1 - 0.5) * 40;

      // 1. Equatorial Dark Dunes (lon -60 to 40, lat -20 to 10)
      if (Math.abs(lat) < 22) {
        const duneBelt = (1.0 - Math.abs(lat) / 22) * (n1 > 0.45 ? 0.75 : 0.4);
        r = r * (1 - duneBelt) + 45 * duneBelt;
        g = g * (1 - duneBelt) + 38 * duneBelt;
        b = b * (1 - duneBelt) + 32 * duneBelt;
      }

      // 2. Xanadu Regio (Bright ice continent, lon 100, lat -15, radius ~35 deg)
      let dLonXanadu = Math.abs(lon - 100);
      if (dLonXanadu > 180) dLonXanadu = 360 - dLonXanadu;
      const dXanadu = Math.hypot((dLonXanadu * cosLat) / 35, (lat - -15) / 22);
      if (dXanadu < 1.0) {
        const xFactor = Math.pow(1.0 - dXanadu, 1.5) * (0.8 + n2 * 0.3);
        r = r * (1 - xFactor) + 215 * xFactor;
        g = g * (1 - xFactor) + 185 * xFactor;
        b = b * (1 - xFactor) + 145 * xFactor;
        bumpVal = bumpVal * (1 - xFactor) + 200 * xFactor;
      }

      // 3. Liquid Methane Seas (Kraken Mare, Ligeia Mare)
      // Kraken Mare: lat 68, lon -50, r ~ 18 deg
      let dLonKraken = Math.abs(lon - -50);
      if (dLonKraken > 180) dLonKraken = 360 - dLonKraken;
      const dKraken = Math.hypot((dLonKraken * cosLat) / 18, (lat - 68) / 9);

      // Ligeia Mare: lat 79, lon -112, r ~ 12 deg
      let dLonLigeia = Math.abs(lon - -112);
      if (dLonLigeia > 180) dLonLigeia = 360 - dLonLigeia;
      const dLigeia = Math.hypot((dLonLigeia * cosLat) / 14, (lat - 79) / 7);

      const seaRough = (fbm(x * 0.03, y * 0.03, 3) - 0.5) * 0.35;
      const inSea = (dKraken + seaRough < 0.95) || (dLigeia + seaRough < 0.95);

      if (inSea) {
        // Inky dark hydrocarbon sea
        r = 14;
        g = 28;
        b = 38;
        bumpVal = 30; // perfectly flat sunken seabed
      }

      data[idx] = Math.min(255, Math.floor(r));
      data[idx + 1] = Math.min(255, Math.floor(g));
      data[idx + 2] = Math.min(255, Math.floor(b));
      data[idx + 3] = 255;

      bdata[idx] = Math.min(255, Math.floor(bumpVal));
      bdata[idx + 1] = Math.min(255, Math.floor(bumpVal));
      bdata[idx + 2] = Math.min(255, Math.floor(bumpVal));
      bdata[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  bumpCtx.putImageData(bumpData, 0, 0);
}
