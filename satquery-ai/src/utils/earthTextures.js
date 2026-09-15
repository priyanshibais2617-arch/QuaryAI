import * as THREE from 'three';

/**
 * SatQuery Cyber-Teal & Emerald Radar Earth Texture Engine
 * Matches the platform's signature Mission Control visual identity:
 * - Deep Obsidian Navy Oceans (#020817 -> #05142b)
 * - Luminous Electric Cyan Continental Coastlines (#06b6d4 / #22d3ee)
 * - Rich Emerald, Cyber-Teal & Malachite Landmasses (Zero Orange)
 * - Diamond Cyan-White Alpine & Polar Ice Caps (#ecfeff)
 * - Global Urban Telemetry Nodes in Electric Cyan & Warm Gold
 */

function drawWorldLandmasses(ctx, w = 2048, h = 1024) {
  const sx = w / 360;
  const sy = h / 180;

  const toX = (lon) => (lon + 180) * sx;
  const toY = (lat) => (90 - lat) * sy;

  const drawPoly = (pts) => {
    if (!pts || pts.length < 3) return;
    ctx.beginPath();
    ctx.moveTo(toX(pts[0][0]), toY(pts[0][1]));
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(toX(pts[i][0]), toY(pts[i][1]));
    }
    ctx.closePath();
    ctx.fill();
  };

  // 1. North America & Central America
  drawPoly([
    [-168, 65], [-160, 71], [-140, 71], [-125, 70], [-105, 74], [-92, 74],
    [-80, 68], [-75, 62], [-65, 58], [-58, 52], [-64, 46], [-71, 42],
    [-76, 36], [-81, 26], [-82, 30], [-89, 30], [-97, 26], [-97, 21],
    [-90, 19], [-87, 14], [-83, 9], [-79, 8], [-82, 14], [-88, 14],
    [-94, 16], [-104, 20], [-109, 23], [-111, 28], [-116, 31], [-121, 35],
    [-124, 40], [-124, 48], [-130, 54], [-136, 58], [-148, 60], [-164, 59],
    [-168, 65],
  ]);

  // Alaska
  drawPoly([
    [-168, 65], [-158, 71], [-142, 68], [-140, 60], [-153, 58], [-165, 54], [-168, 65],
  ]);

  // Greenland
  drawPoly([
    [-55, 60], [-40, 61], [-30, 66], [-19, 73], [-18, 78], [-24, 82],
    [-42, 83], [-58, 82], [-72, 77], [-64, 69], [-55, 60],
  ]);

  // 2. South America
  drawPoly([
    [-77, 8], [-72, 12], [-60, 9], [-50, 1], [-35, -5], [-35, -10],
    [-38, -17], [-41, -22], [-49, -29], [-55, -34], [-64, -40], [-66, -50],
    [-70, -54], [-75, -50], [-73, -42], [-71, -30], [-77, -15], [-81, -5],
    [-80, 2], [-77, 8],
  ]);

  // 3. Europe & Scandinavia
  drawPoly([
    [-9, 36], [-1, 37], [3, 42], [-2, 44], [-4, 48], [-5, 43], [-9, 36],
  ]);
  drawPoly([
    [-4, 48], [4, 44], [12, 44], [16, 38], [18, 40], [13, 46], [6, 49],
    [4, 53], [8, 55], [11, 56], [10, 60], [5, 62], [12, 65],
    [22, 70], [30, 68], [28, 60], [22, 54], [14, 54], [2, 51], [-4, 48],
  ]);
  // British Isles
  drawPoly([
    [-5, 50], [1, 51], [0, 54], [-2, 58], [-6, 56], [-5, 50],
  ]);
  drawPoly([
    [-10, 51], [-6, 52], [-6, 55], [-10, 54], [-10, 51],
  ]);

  // 4. Africa & Madagascar
  drawPoly([
    [-6, 36], [11, 37], [26, 32], [32, 31], [35, 27], [43, 12],
    [51, 11], [43, 0], [40, -10], [35, -20], [32, -28], [28, -34],
    [18, -34], [12, -20], [9, -8], [0, 5], [-12, 5], [-17, 14],
    [-17, 21], [-10, 28], [-6, 36],
  ]);
  drawPoly([
    [44, -12], [50, -14], [49, -25], [44, -25], [44, -12],
  ]);

  // 5. Asia, India, Indochina, East Asia
  drawPoly([
    [30, 68], [45, 68], [65, 72], [85, 74], [105, 76], [125, 74],
    [145, 72], [170, 68], [179, 66], [162, 56], [145, 50], [135, 44],
    [130, 38], [122, 31], [119, 23], [108, 22], [105, 12], [100, 4],
    [98, 10], [92, 21], [88, 22], [80, 13], [77, 8], [73, 18],
    [68, 24], [60, 25], [56, 26], [48, 30], [36, 36], [32, 32],
    [30, 40], [36, 42], [42, 48], [48, 47], [52, 40], [60, 40],
    [66, 46], [54, 55], [42, 60], [30, 68],
  ]);
  // Japan
  drawPoly([
    [130, 32], [136, 35], [141, 42], [145, 44], [141, 45], [138, 38], [130, 32],
  ]);
  // Indonesia & Maritime Archipelago
  drawPoly([
    [95, 5], [106, -6], [115, -8], [120, -8], [114, -5], [104, 0], [95, 5],
  ]);
  drawPoly([
    [108, 4], [118, 4], [116, -3], [110, -2], [108, 4],
  ]);
  drawPoly([
    [131, -2], [141, -3], [150, -8], [140, -8], [131, -2],
  ]);

  // 6. Australia & New Zealand
  drawPoly([
    [114, -22], [125, -15], [136, -12], [142, -11], [146, -18],
    [153, -28], [150, -36], [140, -38], [130, -32], [115, -34],
    [113, -25], [114, -22],
  ]);
  drawPoly([
    [166, -46], [174, -41], [178, -38], [174, -36], [168, -42], [166, -46],
  ]);

  // 7. Antarctica Ice Sheet
  drawPoly([
    [-180, -66], [180, -66], [180, -90], [-180, -90], [-180, -66],
  ]);
}

/**
 * 1. Cyber-Teal & Emerald Optical Texture (Zero Orange)
 * Aligns 100% with the platform's dark obsidian (#070b12), cyan, and emerald aesthetic.
 */
export function createEarthOpticalTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Deep Obsidian Space Navy Ocean (seamlessly integrates with #070b12)
  const oceanGrad = ctx.createRadialGradient(1024, 512, 60, 1024, 512, 1100);
  oceanGrad.addColorStop(0.0, '#061a2e');
  oceanGrad.addColorStop(0.4, '#041222');
  oceanGrad.addColorStop(0.8, '#020b17');
  oceanGrad.addColorStop(1.0, '#01060e');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, 2048, 1024);

  // Glowing Electric Cyan Continental Shelf Fringe
  ctx.fillStyle = '#064e3b';
  ctx.lineWidth = 16;
  ctx.strokeStyle = '#06b6d4';
  drawWorldLandmasses(ctx, 2048, 1024);
  ctx.stroke();

  // Terrestrial Landmasses in Deep Emerald & Cyber-Teal (ZERO ORANGE)
  const landGrad = ctx.createLinearGradient(0, 0, 0, 1024);
  landGrad.addColorStop(0.0, '#ecfeff'); // Arctic diamond cyan-white
  landGrad.addColorStop(0.15, '#0e7490'); // Deep turquoise sub-polar
  landGrad.addColorStop(0.28, '#065f46'); // Deep emerald taiga
  landGrad.addColorStop(0.42, '#059669'); // Saturated emerald
  landGrad.addColorStop(0.50, '#0f766e'); // Deep sage teal (arid zones, NO ORANGE)
  landGrad.addColorStop(0.58, '#10b981'); // Vibrant tropical emerald
  landGrad.addColorStop(0.72, '#047857'); // Southern savanna emerald
  landGrad.addColorStop(0.86, '#0891b2'); // Sub-antarctic cyan-teal
  landGrad.addColorStop(0.96, '#ecfeff'); // Antarctica diamond white
  ctx.fillStyle = landGrad;
  drawWorldLandmasses(ctx, 2048, 1024);

  // High-tech micro-surface texture variation
  const imgData = ctx.getImageData(0, 0, 2048, 1024);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 8) {
    if (data[i + 1] > 30) {
      const x = (i / 4) % 2048;
      const y = Math.floor((i / 4) / 2048);
      const relief = Math.sin(x * 0.15) * Math.cos(y * 0.15) * 14;
      data[i] = Math.min(Math.max(data[i] + relief * 0.3, 0), 255);
      data[i + 1] = Math.min(Math.max(data[i + 1] + relief * 0.9, 0), 255);
      data[i + 2] = Math.min(Math.max(data[i + 2] + relief * 0.8, 0), 255);
    }
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.generateMipmaps = true;
  return texture;
}

/**
 * 2. SAR Microwave Radar Texture (Sentinel-1 C-Band)
 */
export function createEarthSARTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Specular calm water in SAR appears deep obsidian black
  ctx.fillStyle = '#01050a';
  ctx.fillRect(0, 0, 2048, 1024);

  // Radar backscatter reflectance in electric cyan & emerald
  const sarGrad = ctx.createLinearGradient(0, 0, 2048, 1024);
  sarGrad.addColorStop(0, '#064e3b');
  sarGrad.addColorStop(0.5, '#059669');
  sarGrad.addColorStop(1, '#06b6d4');
  ctx.fillStyle = sarGrad;
  drawWorldLandmasses(ctx, 2048, 1024);

  // Microwave speckle
  const imgData = ctx.getImageData(0, 0, 2048, 1024);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 1] > 20) {
      const speckle = (Math.random() - 0.5) * 55;
      data[i] = Math.min(Math.max(10 + speckle * 0.3, 0), 255);
      data[i + 1] = Math.min(Math.max(data[i + 1] + speckle, 20), 255);
      data[i + 2] = Math.min(Math.max(data[i + 2] + speckle * 0.95, 20), 255);
    }
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

/**
 * 3. Multispectral NDVI / False-Color NIR Texture
 */
export function createEarthNDVITexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Absorptive deep space navy water
  ctx.fillStyle = '#01050d';
  ctx.fillRect(0, 0, 2048, 1024);

  // False-color NIR gradient (crimson biomass vs electric cyan barren)
  const ndviGrad = ctx.createLinearGradient(0, 0, 0, 1024);
  ndviGrad.addColorStop(0.0, '#cffafe'); // Cyan ice
  ndviGrad.addColorStop(0.25, '#e11d48'); // Dense biomass crimson
  ndviGrad.addColorStop(0.48, '#06b6d4'); // Electric cyan
  ndviGrad.addColorStop(0.56, '#be123c'); // Amazon ruby
  ndviGrad.addColorStop(0.75, '#f43f5e'); // Australasia rose
  ndviGrad.addColorStop(1.0, '#ecfeff'); // Antarctica
  ctx.fillStyle = ndviGrad;
  drawWorldLandmasses(ctx, 2048, 1024);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

/**
 * 4. Night Lights / Global Telemetry Settlements Texture
 */
export function createEarthNightTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, 2048, 1024);

  const sx = 2048 / 360;
  const sy = 1024 / 180;
  const toX = (lon) => (lon + 180) * sx;
  const toY = (lat) => (90 - lat) * sy;

  // Major global population clusters with cyan & golden telemetry glow
  const CITIES = [
    { lon: -74.0, lat: 40.7, r: 28, glow: '#22d3ee' }, // NYC (cyan)
    { lon: -118.2, lat: 34.0, r: 24, glow: '#22d3ee' }, // LA
    { lon: -87.6, lat: 41.8, r: 20, glow: '#34d399' }, // Chicago
    { lon: 2.3, lat: 48.8, r: 30, glow: '#38bdf8' },  // Paris
    { lon: -0.1, lat: 51.5, r: 28, glow: '#38bdf8' }, // London
    { lon: 13.4, lat: 52.5, r: 22, glow: '#34d399' }, // Berlin
    { lon: 77.2, lat: 28.6, r: 32, glow: '#22d3ee' }, // Delhi
    { lon: 72.8, lat: 19.0, r: 28, glow: '#34d399' }, // Mumbai
    { lon: 121.5, lat: 31.2, r: 34, glow: '#22d3ee' }, // Shanghai
    { lon: 116.4, lat: 39.9, r: 30, glow: '#22d3ee' }, // Beijing
    { lon: 139.7, lat: 35.6, r: 34, glow: '#38bdf8' }, // Tokyo
    { lon: 31.2, lat: 30.0, r: 22, glow: '#34d399' },  // Cairo
    { lon: -46.6, lat: -23.5, r: 26, glow: '#22d3ee' }, // São Paulo
    { lon: 151.2, lat: -33.8, r: 18, glow: '#38bdf8' }, // Sydney
    { lon: 103.8, lat: 1.3, r: 20, glow: '#22d3ee' },  // Singapore
    { lon: 55.3, lat: 25.2, r: 24, glow: '#34d399' },  // Dubai
  ];

  CITIES.forEach((city) => {
    const cx = toX(city.lon);
    const cy = toY(city.lat);
    const grad = ctx.createRadialGradient(cx, cy, 1, cx, cy, city.r);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.3, city.glow);
    grad.addColorStop(0.7, 'rgba(6, 182, 212, 0.35)');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, city.r, 0, Math.PI * 2);
    ctx.fill();
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

/**
 * 5. Ethereal Cyan Meteorological Cloud Swirls
 */
export function createEarthCloudTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = 'transparent';
  ctx.fillRect(0, 0, 1024, 512);

  // Equatorial cloud band with faint cyan glow
  for (let x = 0; x < 1024; x += 35) {
    const cy = 256 + Math.sin(x * 0.02) * 25;
    const r = 28 + Math.sin(x * 0.05) * 14;
    const grad = ctx.createRadialGradient(x, cy, 2, x, cy, r);
    grad.addColorStop(0, 'rgba(236, 254, 255, 0.5)');
    grad.addColorStop(0.5, 'rgba(34, 211, 238, 0.2)');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, cy, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Mid-latitude cyclone swirls
  const CYCLONES = [
    { x: 260, y: 140, r: 80 },
    { x: 740, y: 120, r: 90 },
    { x: 380, y: 380, r: 75 },
    { x: 860, y: 370, r: 85 },
  ];

  CYCLONES.forEach(({ x, y, r }) => {
    const grad = ctx.createRadialGradient(x, y, 5, x, y, r);
    grad.addColorStop(0, 'rgba(236, 254, 255, 0.6)');
    grad.addColorStop(0.4, 'rgba(34, 211, 238, 0.25)');
    grad.addColorStop(0.8, 'rgba(6, 182, 212, 0.08)');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}
