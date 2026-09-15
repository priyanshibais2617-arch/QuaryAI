// Generates realistic SVG data URLs for satellite imagery scenarios

export const getSatelliteSvgUrl = (type, options = {}) => {
  let svgContent = '';

  if (type === 'optical-baseline') {
    // 2024 Baseline: Green agricultural parcels, meandering river, moderate urban clusters
    svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
        <defs>
          <radialGradient id="sun" cx="70%" cy="30%" r="60%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.05"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="0.2"/>
          </radialGradient>
          <pattern id="grain" width="20" height="20" patternUnits="userSpaceOnUse">
            <rect width="10" height="10" fill="#2d4a22"/>
            <rect x="10" width="10" height="10" fill="#385e2b"/>
            <rect y="10" width="10" height="10" fill="#325426"/>
            <rect x="10" y="10" width="10" height="10" fill="#2a4520"/>
          </pattern>
        </defs>
        
        <!-- Base Terrain -->
        <rect width="800" height="600" fill="#2b4226"/>
        <rect width="800" height="600" fill="url(#grain)" opacity="0.6"/>

        <!-- Agricultural plots -->
        <rect x="40" y="50" width="180" height="130" fill="#3d6632" stroke="#4a7c3d" stroke-width="1.5"/>
        <rect x="230" y="40" width="160" height="140" fill="#4d6139" stroke="#5d7545" stroke-width="1.5"/>
        <rect x="50" y="190" width="340" height="150" fill="#34542c" stroke="#446e3a" stroke-width="1.5"/>
        <rect x="60" y="360" width="220" height="200" fill="#3e6334" stroke="#4c7a40" stroke-width="1.5"/>
        <rect x="290" y="360" width="230" height="210" fill="#495e38" stroke="#597345" stroke-width="1.5"/>

        <!-- Scrubland in Northern Region (Prior to 2026 expansion) -->
        <rect x="420" y="40" width="340" height="220" fill="#54523e" stroke="#63614a" stroke-width="1"/>
        <circle cx="580" cy="140" r="45" fill="#4a4835" opacity="0.7"/>
        <circle cx="680" cy="110" r="35" fill="#4a4835" opacity="0.7"/>

        <!-- River System (Water Body) -->
        <path d="M 520,600 C 510,480 540,360 480,280 C 430,220 450,140 440,0" fill="none" stroke="#162e3d" stroke-width="38" stroke-linecap="round"/>
        <path d="M 520,600 C 510,480 540,360 480,280 C 430,220 450,140 440,0" fill="none" stroke="#22475e" stroke-width="24" stroke-linecap="round"/>

        <!-- Highways & Roads -->
        <path d="M 0,320 L 800,260" stroke="#787a7d" stroke-width="6"/>
        <path d="M 370,0 L 400,600" stroke="#696b6e" stroke-width="5"/>
        <path d="M 550,270 L 760,550" stroke="#5a5c5e" stroke-width="4"/>

        <!-- Urban Cluster (Baseline moderate built-up) -->
        <rect x="540" y="320" width="190" height="160" fill="#717378" stroke="#898c94" stroke-width="1"/>
        <g fill="#9ea1a8" opacity="0.8">
          <rect x="555" y="335" width="25" height="25"/>
          <rect x="590" y="335" width="30" height="20"/>
          <rect x="635" y="340" width="20" height="30"/>
          <rect x="560" y="375" width="35" height="25"/>
          <rect x="610" y="380" width="40" height="40"/>
          <rect x="665" y="360" width="45" height="30"/>
          <rect x="570" y="420" width="30" height="40"/>
          <rect x="620" y="435" width="50" height="25"/>
          <rect x="685" y="410" width="30" height="50"/>
        </g>

        <!-- Coordinate & Grid Marks -->
        <g stroke="#ffffff" stroke-opacity="0.15" stroke-width="1" stroke-dasharray="4 8">
          <line x1="200" y1="0" x2="200" y2="600"/>
          <line x1="400" y1="0" x2="400" y2="600"/>
          <line x1="600" y1="0" x2="600" y2="600"/>
          <line x1="0" y1="150" x2="800" y2="150"/>
          <line x1="0" y1="300" x2="800" y2="300"/>
          <line x1="0" y1="450" x2="800" y2="450"/>
        </g>
        
        <!-- Sensor Watermark -->
        <text x="25" y="580" fill="#ffffff" fill-opacity="0.6" font-family="monospace" font-size="12">SENTINEL-2 L2A | RGB(4-3-2) | 2024-03-15 | 10M GSD</text>
        <rect width="800" height="600" fill="url(#sun)"/>
      </svg>
    `;
  } else if (type === 'optical-target') {
    // 2026 Target: Northern scrubland replaced by dense new built-up area and new spur roads
    svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
        <defs>
          <radialGradient id="sun" cx="70%" cy="30%" r="60%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.05"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="0.2"/>
          </radialGradient>
          <pattern id="grain" width="20" height="20" patternUnits="userSpaceOnUse">
            <rect width="10" height="10" fill="#2d4a22"/>
            <rect x="10" width="10" height="10" fill="#385e2b"/>
            <rect y="10" width="10" height="10" fill="#325426"/>
            <rect x="10" y="10" width="10" height="10" fill="#2a4520"/>
          </pattern>
        </defs>

        <!-- Base Terrain -->
        <rect width="800" height="600" fill="#2b4226"/>
        <rect width="800" height="600" fill="url(#grain)" opacity="0.6"/>

        <!-- Agricultural plots (mostly stable) -->
        <rect x="40" y="50" width="180" height="130" fill="#3d6632" stroke="#4a7c3d" stroke-width="1.5"/>
        <rect x="230" y="40" width="160" height="140" fill="#425732" stroke="#526c3e" stroke-width="1.5"/>
        <rect x="50" y="190" width="340" height="150" fill="#34542c" stroke="#446e3a" stroke-width="1.5"/>
        <rect x="60" y="360" width="220" height="200" fill="#3e6334" stroke="#4c7a40" stroke-width="1.5"/>
        <rect x="290" y="360" width="230" height="210" fill="#495e38" stroke="#597345" stroke-width="1.5"/>

        <!-- EXPANDED BUILT-UP ZONE IN NORTHERN REGION (2026 Change) -->
        <rect x="420" y="40" width="340" height="220" fill="#7a7c82" stroke="#90949c" stroke-width="1.5"/>
        <!-- New Highway spurs -->
        <path d="M 420,110 L 760,110" stroke="#a0a3ab" stroke-width="5"/>
        <path d="M 420,180 L 760,180" stroke="#a0a3ab" stroke-width="4"/>
        <path d="M 520,40 L 520,260" stroke="#a0a3ab" stroke-width="4"/>
        <path d="M 640,40 L 640,260" stroke="#a0a3ab" stroke-width="4"/>
        <!-- Dense new structural complexes -->
        <g fill="#c8cbd1" opacity="0.95">
          <rect x="440" y="55" width="32" height="40"/>
          <rect x="480" y="60" width="28" height="35"/>
          <rect x="540" y="50" width="42" height="45"/>
          <rect x="595" y="55" width="35" height="40"/>
          <rect x="660" y="50" width="45" height="50"/>
          <rect x="440" y="125" width="45" height="40"/>
          <rect x="535" y="125" width="38" height="40"/>
          <rect x="585" y="125" width="42" height="42"/>
          <rect x="655" y="125" width="50" height="45"/>
          <rect x="450" y="195" width="50" height="45"/>
          <rect x="540" y="195" width="40" height="45"/>
          <rect x="600" y="195" width="50" height="45"/>
          <rect x="670" y="195" width="55" height="45"/>
        </g>

        <!-- River System -->
        <path d="M 520,600 C 510,480 540,360 480,280 C 430,220 450,140 440,0" fill="none" stroke="#162e3d" stroke-width="38" stroke-linecap="round"/>
        <path d="M 520,600 C 510,480 540,360 480,280 C 430,220 450,140 440,0" fill="none" stroke="#22475e" stroke-width="24" stroke-linecap="round"/>

        <!-- Highways & Roads -->
        <path d="M 0,320 L 800,260" stroke="#787a7d" stroke-width="6"/>
        <path d="M 370,0 L 400,600" stroke="#696b6e" stroke-width="5"/>
        <path d="M 550,270 L 760,550" stroke="#5a5c5e" stroke-width="4"/>

        <!-- Urban Cluster (Original southern cluster) -->
        <rect x="540" y="320" width="190" height="160" fill="#717378" stroke="#898c94" stroke-width="1"/>
        <g fill="#9ea1a8" opacity="0.8">
          <rect x="555" y="335" width="25" height="25"/>
          <rect x="590" y="335" width="30" height="20"/>
          <rect x="635" y="340" width="20" height="30"/>
          <rect x="560" y="375" width="35" height="25"/>
          <rect x="610" y="380" width="40" height="40"/>
          <rect x="665" y="360" width="45" height="30"/>
          <rect x="570" y="420" width="30" height="40"/>
          <rect x="620" y="435" width="50" height="25"/>
          <rect x="685" y="410" width="30" height="50"/>
        </g>

        <!-- Coordinate & Grid Marks -->
        <g stroke="#ffffff" stroke-opacity="0.15" stroke-width="1" stroke-dasharray="4 8">
          <line x1="200" y1="0" x2="200" y2="600"/>
          <line x1="400" y1="0" x2="400" y2="600"/>
          <line x1="600" y1="0" x2="600" y2="600"/>
          <line x1="0" y1="150" x2="800" y2="150"/>
          <line x1="0" y1="300" x2="800" y2="300"/>
          <line x1="0" y1="450" x2="800" y2="450"/>
        </g>
        
        <!-- Sensor Watermark -->
        <text x="25" y="580" fill="#ffffff" fill-opacity="0.6" font-family="monospace" font-size="12">SENTINEL-2 L2A | RGB(4-3-2) | 2026-02-28 | 10M GSD</text>
        <rect width="800" height="600" fill="url(#sun)"/>
      </svg>
    `;
  } else if (type === 'optical-highlight') {
    // Optical Target with AI Heatmap and bounding highlight overlays
    svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
        <!-- Base is optical target -->
        <rect width="800" height="600" fill="#1b2e1a"/>
        
        <!-- Base paths similar to target -->
        <rect x="420" y="40" width="340" height="220" fill="#3d444e"/>
        <path d="M 520,600 C 510,480 540,360 480,280 C 430,220 450,140 440,0" fill="none" stroke="#122430" stroke-width="28"/>
        
        <!-- AI DETECTED CHANGE HIGHLIGHT REGION (Glowing Red/Cyan Mask) -->
        <rect x="415" y="35" width="350" height="230" rx="8" fill="#ff4d4f" fill-opacity="0.28" stroke="#ff4d4f" stroke-width="3" stroke-dasharray="6 4"/>
        
        <!-- Highlight Callout Pins -->
        <g fill="#ff4d4f">
          <circle cx="490" cy="90" r="14" fill="#ff4d4f" fill-opacity="0.9"/>
          <text x="490" y="94" fill="#ffffff" font-size="11" font-weight="bold" text-anchor="middle">1</text>
          
          <circle cx="620" cy="140" r="14" fill="#ff4d4f" fill-opacity="0.9"/>
          <text x="620" y="144" fill="#ffffff" font-size="11" font-weight="bold" text-anchor="middle">2</text>

          <circle cx="700" cy="200" r="14" fill="#ff4d4f" fill-opacity="0.9"/>
          <text x="700" y="204" fill="#ffffff" font-size="11" font-weight="bold" text-anchor="middle">3</text>
        </g>

        <!-- Detection Badge Overlay -->
        <rect x="430" y="45" width="220" height="32" rx="6" fill="#080B10" fill-opacity="0.9" stroke="#ff4d4f" stroke-width="1.5"/>
        <text x="442" y="66" fill="#ff7875" font-family="monospace" font-size="12" font-weight="bold">● NEW BUILT-UP ZONE (+14.8 ha)</text>

        <!-- AI Confidence HUD -->
        <rect x="25" y="25" width="250" height="60" rx="6" fill="#080B10" fill-opacity="0.85" stroke="#4FD1C5" stroke-width="1.5"/>
        <text x="40" y="48" fill="#4FD1C5" font-family="monospace" font-size="13" font-weight="bold">AI DIFFERENTIAL MAP</text>
        <text x="40" y="70" fill="#ffffff" font-family="monospace" font-size="11">Confidence: 91% | Siamese CNN</text>
      </svg>
    `;
  } else if (type === 'sar-radar') {
    // SAR Microwave Radar: Characteristic speckle, intense double-bounce corner reflection on buildings, dark smooth water
    svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
        <defs>
          <radialGradient id="sarGlow" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stop-color="#4FD1C5" stop-opacity="0.05"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="0.4"/>
          </radialGradient>
        </defs>

        <!-- Grayscale SAR Speckle Background -->
        <rect width="800" height="600" fill="#181c22"/>
        
        <!-- Radar Backscatter Fields (Mid-tone speckle textures) -->
        <rect x="40" y="40" width="360" height="300" fill="#2d333d" opacity="0.8"/>
        <rect x="60" y="360" width="340" height="200" fill="#242932" opacity="0.9"/>
        
        <!-- Calm Water Body: Zero backscatter (Deep Black specular reflection) -->
        <path d="M 520,600 C 510,480 540,360 480,280 C 430,220 450,140 440,0" fill="none" stroke="#040608" stroke-width="40" stroke-linecap="round"/>
        <text x="350" y="260" fill="#7C83FD" font-family="monospace" font-size="11" opacity="0.8">◄ LOW RETURN (WATER)</text>

        <!-- Strong Double-Bounce Urban Returns (Bright White/Cyan Points) -->
        <rect x="420" y="40" width="340" height="220" fill="#3e4754" opacity="0.9"/>
        <g fill="#ffffff">
          <circle cx="450" cy="80" r="4" fill="#ffffff"/>
          <circle cx="465" cy="82" r="3" fill="#ffffff"/>
          <circle cx="500" cy="70" r="5" fill="#4FD1C5"/>
          <circle cx="550" cy="75" r="5" fill="#ffffff"/>
          <circle cx="610" cy="70" r="6" fill="#4FD1C5"/>
          <circle cx="670" cy="80" r="5" fill="#ffffff"/>
          <circle cx="450" cy="140" r="5" fill="#4FD1C5"/>
          <circle cx="540" cy="140" r="6" fill="#ffffff"/>
          <circle cx="600" cy="140" r="5" fill="#ffffff"/>
          <circle cx="680" cy="140" r="6" fill="#4FD1C5"/>
          <circle cx="460" cy="210" r="5" fill="#ffffff"/>
          <circle cx="550" cy="210" r="6" fill="#4FD1C5"/>
          <circle cx="620" cy="210" r="5" fill="#ffffff"/>
          <circle cx="690" cy="210" r="7" fill="#ffffff"/>
        </g>
        <text x="600" y="30" fill="#4FD1C5" font-family="monospace" font-size="11">▲ HIGH BACKSCATTER (STRUCTURES)</text>

        <!-- Radar Calibration Reticle -->
        <circle cx="400" cy="300" r="220" fill="none" stroke="#4FD1C5" stroke-opacity="0.15" stroke-width="1"/>
        <circle cx="400" cy="300" r="140" fill="none" stroke="#4FD1C5" stroke-opacity="0.2" stroke-width="1"/>
        <line x1="400" y1="50" x2="400" y2="550" stroke="#4FD1C5" stroke-opacity="0.2" stroke-width="1"/>
        <line x1="150" y1="300" x2="650" y2="300" stroke="#4FD1C5" stroke-opacity="0.2" stroke-width="1"/>

        <!-- Metadata -->
        <text x="25" y="580" fill="#4FD1C5" font-family="monospace" font-size="12">SENTINEL-1 C-SAR | POL: VV+VH | INCIDENCE: 38.4° | DES: ASC-142</text>
        <rect width="800" height="600" fill="url(#sarGlow)"/>
      </svg>
    `;
  } else if (type === 'grounding-target') {
    // Grounding with Bounding Box and Crosshairs on Water Body
    svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
        <!-- Base Landsat Scene -->
        <rect width="800" height="600" fill="#2d3b2d"/>
        
        <!-- Broad terrain parcels -->
        <rect x="50" y="40" width="220" height="240" fill="#3a4f38"/>
        <rect x="50" y="310" width="250" height="240" fill="#465e43"/>
        <rect x="520" y="40" width="240" height="240" fill="#3f543c"/>
        <rect x="520" y="310" width="240" height="240" fill="#334731"/>

        <!-- Large Lake / Reservoir Body in Central Region -->
        <path d="M 320,240 C 350,180 440,190 480,240 C 530,290 540,380 470,430 C 400,470 330,440 310,360 C 290,300 300,270 320,240 Z" fill="#1b4965" stroke="#2b6b94" stroke-width="3"/>
        
        <!-- TARGET GROUNDING BOUNDING BOX -->
        <g stroke="#39D98A" stroke-width="2.5" fill="none">
          <rect x="270" y="180" width="310" height="280" rx="4" stroke-dasharray="8 6"/>
          
          <!-- Corner reticles -->
          <path d="M 260,200 L 260,170 L 290,170" stroke-width="3"/>
          <path d="M 590,200 L 590,170 L 560,170" stroke-width="3"/>
          <path d="M 260,440 L 260,470 L 290,470" stroke-width="3"/>
          <path d="M 590,440 L 590,470 L 560,470" stroke-width="3"/>
        </g>

        <!-- Grounding Label Tag -->
        <rect x="270" y="145" width="220" height="28" rx="4" fill="#39D98A"/>
        <text x="282" y="164" fill="#080B10" font-family="monospace" font-size="12" font-weight="bold">TARGET: WATER BODY (94%)</text>

        <!-- Coordinates HUD -->
        <rect x="25" y="25" width="280" height="50" rx="6" fill="#080B10" fill-opacity="0.85" stroke="#39D98A" stroke-width="1.5"/>
        <text x="40" y="47" fill="#39D98A" font-family="monospace" font-size="12" font-weight="bold">BOUNDING ENVELOPE ISOLATED</text>
        <text x="40" y="65" fill="#ffffff" font-family="monospace" font-size="11">Lat: 12.971°N | Lon: 77.594°E</text>
      </svg>
    `;
  }

  return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent.trim())}`;
};
