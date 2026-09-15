import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import EarthGlobe from './EarthGlobe';
import {
  Globe2,
  Eye,
  Radio,
  Layers,
} from 'lucide-react';

export default function TerrainCanvas() {
  const [activeLayer, setActiveLayer] = useState('optical'); // 'optical' | 'sar' | 'ndvi'

  const layers = [
    {
      id: 'optical',
      label: 'OPTICAL RGB',
      spec: 'TRUE COLOR (B04, B03, B02)',
      icon: Eye,
      tagColor: 'text-cyan-300',
    },
    {
      id: 'sar',
      label: 'SAR RADAR',
      spec: 'C-BAND BACKSCATTER (VV/VH)',
      icon: Radio,
      tagColor: 'text-emerald-300',
    },
    {
      id: 'ndvi',
      label: 'MULTISPECTRAL',
      spec: 'FALSE-COLOR NIR (B08, B04)',
      icon: Layers,
      tagColor: 'text-rose-300',
    },
  ];

  return (
    <div className="relative w-full h-[460px] sm:h-[520px] lg:h-[calc(100vh-8rem)] max-h-[600px] select-none">
      {/* Top Floating Control Deck */}
      <div className="absolute top-4 inset-x-4 z-20 flex flex-col items-center pointer-events-none">
        {/* Global Orbit Badge + Spectral Layer Switcher */}
        <div className="flex flex-wrap items-center justify-between w-full gap-2 pointer-events-auto">
          {/* Left: Global Orbit Status Indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-950/90 backdrop-blur-xl border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)] font-mono text-[10px] tracking-wider text-slate-300">
            <Globe2 className="w-3.5 h-3.5 text-cyan-300" />
            <span className="font-bold text-white tracking-wider">GLOBAL ORBIT</span>
          </div>

          {/* Right: Spectral Layer Selector */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-950/90 backdrop-blur-xl border border-cyan-500/25 shadow-[0_0_20px_rgba(6,182,212,0.12)]">
            {layers.map((layer) => {
              const Icon = layer.icon;
              const isActive = activeLayer === layer.id;
              return (
                <button
                  key={layer.id}
                  type="button"
                  id={`spectral-layer-${layer.id}-btn`}
                  onClick={() => setActiveLayer(layer.id)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-mono text-[9.5px] tracking-wider transition-all cursor-pointer ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-200 font-bold border border-cyan-400/50 shadow-[0_0_10px_rgba(6,182,212,0.25)]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-3 h-3 ${isActive ? 'text-cyan-300' : 'text-slate-400'}`} />
                  <span className="hidden sm:inline">{layer.label}</span>
                  <span className="sm:hidden">{layer.id.toUpperCase()}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3D R3F Canvas */}
      <Canvas
        camera={{ position: [0, 0, 7.6], fov: 38 }}
        gl={{ antialias: true, alpha: true }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        {/* Balanced Multi-Point Space Lighting */}
        <ambientLight intensity={0.65} />
        {/* Main Sun Key Light */}
        <directionalLight position={[10, 6, 8]} intensity={2.2} color="#ffffff" />
        {/* Earth Fill Light (Soft cool blue fill to illuminate night side continents) */}
        <directionalLight position={[-10, -2, 6]} intensity={0.9} color="#38bdf8" />
        {/* Atmospheric Rim Light */}
        <directionalLight position={[0, -8, -10]} intensity={0.6} color="#0ea5e9" />

        <Suspense fallback={null}>
          <EarthGlobe activeLayer={activeLayer} />
        </Suspense>

        {/* Orbit Controls centered on the model */}
        <OrbitControls
          target={[0, -0.38, 0]}
          enableZoom={false}
          autoRotate={true}
          autoRotateSpeed={0.5}
          enableDamping={true}
          dampingFactor={0.05}
          maxPolarAngle={Math.PI / 1.7}
          minPolarAngle={Math.PI / 3.2}
        />
      </Canvas>

      {/* Bottom Right Interaction Hint Overlay */}
      <div className="absolute bottom-4 right-4 pointer-events-none z-10 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-cyan-500/25 text-[10px] font-mono text-cyan-300/90 shadow-[0_0_15px_rgba(6,182,212,0.12)]">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
        <span>DRAG TO ROTATE 360&deg; &bull; GLOBAL ORBITAL ENGINE</span>
      </div>
    </div>
  );
}
