import React, { useState, useEffect } from 'react';
import {
  Satellite,
  ShieldCheck,
  Activity,
  Layers,
  Radio,
  Crosshair,
  Compass,
  Cpu,
  Eye,
  CheckCircle2
} from 'lucide-react';
import { getSatelliteSvgUrl } from '../../utils/satelliteGenerators';

export default function TelemetrySidebar() {
  const [telemetryTicks, setTelemetryTicks] = useState({
    lat: '28°36\'44.2"N',
    lon: '77°12\'18.6"E',
    alt: '786.4 km',
    velocity: '7.56 km/s',
    cloudCover: '1.2%',
    sunElevation: '54.8°',
    signalSnr: '41.2 dB',
  });

  // Simulated live telemetry jitter for ultra-authentic mission control vibe
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetryTicks(prev => {
        const jitter = (Math.random() - 0.5) * 0.04;
        const currentSec = (44.2 + jitter).toFixed(1);
        return {
          ...prev,
          lat: `28°36'${currentSec}"N`,
          velocity: `${(7.56 + (Math.random() - 0.5) * 0.01).toFixed(2)} km/s`,
          signalSnr: `${(41.2 + (Math.random() - 0.5) * 0.3).toFixed(1)} dB`,
        };
      });
    }, 2400);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative p-6 sm:p-8 lg:p-10 bg-[#06090F] text-slate-100 flex flex-col justify-between overflow-hidden border-b lg:border-b-0 lg:border-r border-cyan-500/20">
      {/* 1. Simulated Satellite Feed & Dark Map Tile Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Synthetic high-contrast remote-sensing imagery */}
        <div className="absolute inset-0 opacity-40 mix-blend-screen scale-110 transform transition-transform duration-1000">
          <img
            src={getSatelliteSvgUrl('optical-highlight')}
            alt="Simulated Multispectral Satellite Feed"
            className="w-full h-full object-cover filter contrast-125 saturate-150"
          />
        </div>

        {/* Vector Topographic & Cartesian Map Grid Overlay */}
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(6, 182, 212, 0.15) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(6, 182, 212, 0.15) 1px, transparent 1px)
            `,
            backgroundSize: '24px 24px',
          }}
        />

        {/* Animated Satellite Sweep / Radar Scan Beam */}
        <div className="absolute inset-x-0 h-28 bg-gradient-to-b from-transparent via-cyan-400/15 to-transparent pointer-events-none animate-radar-sweep opacity-75" />

        {/* Dynamic Vignette & Dark Tint for Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#06090F] via-[#06090F]/70 to-[#06090F]/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#06090F]/80 via-transparent to-[#06090F]/90" />
      </div>

      {/* 2. Top Header with "AGENT ONLINE" Pulsing Green LED */}
      <div className="relative z-10 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* System Status: Pulsing Green LED */}
          <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="font-bold tracking-widest text-[11px] uppercase text-emerald-400">
              AGENT ONLINE
            </span>
          </div>

          {/* Telemetry Lock Status */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cyan-950/40 border border-cyan-500/20 text-cyan-300 font-mono text-[10px]">
            <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span>GEO-LOCK: SOLID</span>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono mb-1.5">
            <Satellite className="w-3.5 h-3.5" />
            <span>MISSION SPECIFICATION • SENTINEL-2 &amp; LANDSAT-9</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-tight">
            Autonomous Earth Observation Intelligence
          </h2>
          <p className="text-xs text-slate-300/80 leading-relaxed mt-1.5 max-w-md">
            Query high-dimensional rasters, extract bi-temporal change detections, and synthesize multimodal remote sensing insights.
          </p>
        </div>
      </div>

      {/* 3. Center Simulated HUD Reticle (Interactive Targeting Area) */}
      <div className="relative z-10 my-6 p-3.5 rounded-xl bg-[#090E17]/80 backdrop-blur-md border border-cyan-500/25 space-y-3">
        {/* Reticle Coordinates Bar */}
        <div className="flex items-center justify-between text-[11px] font-mono border-b border-cyan-500/15 pb-2">
          <div className="flex items-center gap-1.5 text-cyan-300">
            <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
            <span>AOI TARGET LOCK</span>
          </div>
          <span className="text-slate-400 font-mono text-[10px]">
            {telemetryTicks.lat} {telemetryTicks.lon}
          </span>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px] font-mono">
          <div className="p-2 rounded-lg bg-black/40 border border-white/5">
            <div className="text-slate-500 text-[9px] uppercase">GSD Resolution</div>
            <div className="text-emerald-400 font-bold mt-0.5">0.5m / Pixel</div>
          </div>
          <div className="p-2 rounded-lg bg-black/40 border border-white/5">
            <div className="text-slate-500 text-[9px] uppercase">Orbital Alt</div>
            <div className="text-cyan-300 font-bold mt-0.5">{telemetryTicks.alt}</div>
          </div>
          <div className="p-2 rounded-lg bg-black/40 border border-white/5 col-span-2 sm:col-span-1">
            <div className="text-slate-500 text-[9px] uppercase">Cloud Cover</div>
            <div className="text-teal-300 font-bold mt-0.5">{telemetryTicks.cloudCover}</div>
          </div>
        </div>

        {/* Spectral Channels Telemetry Status */}
        <div className="pt-1 flex items-center justify-between text-[9px] font-mono text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block" />
            B02 (Blue 490nm)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
            B03 (Green 560nm)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 inline-block" />
            B04 (Red 665nm)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
            B08 (NIR 842nm)
          </span>
        </div>
      </div>

      {/* 4. Bottom System Telemetry Verification Badge */}
      <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-cyan-500/15">
        <div className="flex items-center gap-2">
          <Cpu className="w-3.5 h-3.5 text-emerald-400" />
          <span>PIPELINE: VQA &bull; GROUNDING &bull; SAR</span>
        </div>
        <div className="flex items-center gap-1 text-emerald-400 font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>HEALTHY</span>
        </div>
      </div>
    </div>
  );
}
