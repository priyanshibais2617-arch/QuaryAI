import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Satellite, Globe2, ShieldCheck, Radio, ArrowLeft } from 'lucide-react';
import AntiGravityWrapper from './AntiGravityWrapper';
import AuthForm from './AuthForm';

export default function AuthLayout({
  initialMode = 'signin',
  onNavigate,
  children,
}) {
  const [utcTime, setUtcTime] = useState('');

  // Live UTC mission control clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatted = now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
      setUtcTime(formatted);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col justify-between relative overflow-hidden select-none font-sans">
      {/* ========================================================================= */}
      {/* 1. BACKGROUND: Animated Cartesian Coordinate Grid & Orbital Rings         */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Subtle dark ambient atmosphere */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-cyan-950/10 blur-[120px] rounded-full" />

        {/* Animated Cartesian Coordinate Grid */}
        <motion.div
          animate={{
            backgroundPosition: ['0px 0px', '40px 40px'],
          }}
          transition={{
            duration: 25,
            ease: 'linear',
            repeat: Infinity,
          }}
          className="absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(6, 182, 212, 0.35) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(6, 182, 212, 0.35) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Cartesian Coordinate Major Axis Lines & Crosshair Intersections */}
        <svg
          className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="cartesian-subgrid" width="160" height="160" patternUnits="userSpaceOnUse">
              <path
                d="M 160 0 L 0 0 0 160"
                fill="none"
                stroke="rgba(52, 211, 153, 0.25)"
                strokeWidth="1"
              />
              <circle cx="0" cy="0" r="2" fill="#34D399" />
              <circle cx="160" cy="0" r="2" fill="#34D399" />
              <circle cx="0" cy="160" r="2" fill="#34D399" />
              <circle cx="160" cy="160" r="2" fill="#34D399" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#cartesian-subgrid)" />
        </svg>

        {/* Cartesian Coordinate Labels (Subtle Scientific Ticks) */}
        <div className="absolute top-16 left-6 font-mono text-[9px] text-cyan-500/30 flex flex-col gap-8 select-none">
          <span>+60°00'N</span>
          <span>+30°00'N</span>
          <span>00°00'EQ</span>
          <span>-30°00'S</span>
        </div>
        <div className="absolute bottom-16 right-8 font-mono text-[9px] text-emerald-500/30 flex gap-12 select-none">
          <span>060°00'E</span>
          <span>090°00'E</span>
          <span>120°00'E</span>
        </div>

        {/* Faint, Slow-Moving Orbital Rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[920px] h-[920px] pointer-events-none">
          {/* Outer Orbital Ellipse */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 80, ease: 'linear', repeat: Infinity }}
            className="absolute inset-0 rounded-full border border-dashed border-cyan-500/15"
          >
            {/* Orbiting Satellite Node Alpha */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
              <span className="text-[9px] font-mono text-cyan-400/60 tracking-wider">SAT-2A</span>
            </div>
          </motion.div>

          {/* Middle Tilted Orbital Ring */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 110, ease: 'linear', repeat: Infinity }}
            className="absolute inset-16 rounded-[48%] border border-emerald-500/10"
            style={{ transform: 'rotate(-25deg)' }}
          >
            {/* Orbiting Satellite Node Beta */}
            <div className="absolute bottom-0 right-1/4 translate-x-1/2 translate-y-1/2 flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              <span className="text-[9px] font-mono text-emerald-400/60 tracking-wider">LANDSAT-9</span>
            </div>
          </motion.div>

          {/* Inner Geostationary Ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 140, ease: 'linear', repeat: Infinity }}
            className="absolute inset-36 rounded-full border border-teal-500/15"
          >
            <div className="absolute top-1/4 left-0 -translate-x-1/2 -translate-y-1/2">
              <div className="w-1.5 h-1.5 rounded-full bg-teal-300 shadow-[0_0_6px_#2dd4bf]" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Frosted Backdrop Blur Overlay to blur background coordinate grid and rings */}
      <div className="absolute inset-0 backdrop-blur-xl bg-[#070b12]/60 z-[1] pointer-events-none" />

      {/* ========================================================================= */}
      {/* 2. TOP MISSION BAR                                                        */}
      {/* ========================================================================= */}
      <header className="relative z-20 px-4 sm:px-8 py-4 flex items-center justify-between border-b border-white/5 bg-[#070b12]/80 backdrop-blur-md">
        {/* Brand Logo */}
        <button
          type="button"
          id="auth-brand-logo-btn"
          onClick={() => onNavigate && onNavigate('landing')}
          className="flex items-center gap-2.5 group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-cyan-500 flex items-center justify-center text-slate-950 shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <Satellite className="w-4 h-4" />
          </div>
          <div className="text-left">
            <span className="font-black text-sm tracking-tight text-white flex items-center gap-1">
              SATQUERY<span className="text-cyan-400">.AI</span>
            </span>
            <span className="block text-[9px] font-mono text-slate-400 tracking-wider">
              MISSION CONTROL v2.6
            </span>
          </div>
        </button>

        {/* Center Live Mission Clock & Telemetry Readout */}
        <div className="hidden md:flex items-center gap-3 px-3 py-1 rounded-full bg-slate-900/60 border border-slate-800 text-[11px] font-mono text-slate-300">
          <div className="flex items-center gap-1.5 text-cyan-400">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>DOWNLINK STABLE</span>
          </div>
          <span className="text-slate-600">|</span>
          <span className="text-emerald-300">{utcTime || '2026-09-14 09:00:00 UTC'}</span>
        </div>

        {/* Back to Home Action */}
        <button
          type="button"
          id="auth-back-to-home-btn"
          onClick={() => onNavigate && onNavigate('landing')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700/60 hover:border-cyan-500/40 bg-slate-900/40 hover:bg-slate-900/80 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Back to Home</span>
        </button>
      </header>

      {/* ========================================================================= */}
      {/* 3. CENTER MINIMAL AUTH CARD WITH THE ANTI-GRAVITY FLOATING EFFECT        */}
      {/* ========================================================================= */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-3 sm:p-6 lg:p-8">
        <AntiGravityWrapper>
          {children || (
            <AuthForm initialMode={initialMode} onNavigate={onNavigate} />
          )}
        </AntiGravityWrapper>
      </main>

      {/* ========================================================================= */}
      {/* 4. BOTTOM FOOTER                                                          */}
      {/* ========================================================================= */}
      <footer className="relative z-20 px-4 py-3 border-t border-white/5 bg-[#070b12]/80 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500 font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>SATQUERY EO CORE &bull; CLASSIFICATION: UNCLASSIFIED / RESEARCH</span>
        </div>
        <div>
          &copy; 2026 SatQuery AI &bull; Smart India Hackathon EO Demonstrator
        </div>
      </footer>
    </div>
  );
}
