import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Satellite,
  ArrowRight,
  Layers,
  Radio,
  Eye,
  Sparkles,
} from 'lucide-react';
import TerrainCanvas from '../components/landing/TerrainCanvas';
import Footer from '../components/layout/Footer';
import AuthModal from '../components/auth/AuthModal';

export default function Landing({ onNavigate, initialAuthModal = null }) {
  const [utcTime, setUtcTime] = useState('');
  const [authModal, setAuthModal] = useState({
    isOpen: Boolean(initialAuthModal),
    mode: initialAuthModal === 'signup' ? 'signup' : 'signin',
  });

  // Sync if initialAuthModal prop updates from routing
  useEffect(() => {
    if (initialAuthModal) {
      setAuthModal({
        isOpen: true,
        mode: initialAuthModal === 'signup' ? 'signup' : 'signin',
      });
    }
  }, [initialAuthModal]);

  const openAuthModal = (mode = 'signin') => {
    setAuthModal({ isOpen: true, mode });
    if (window.location.pathname === '/') {
      window.history.pushState({}, '', mode === 'signin' ? '/signin' : '/signup');
    }
  };

  const closeAuthModal = () => {
    setAuthModal((prev) => ({ ...prev, isOpen: false }));
    if (window.location.pathname === '/signin' || window.location.pathname === '/signup') {
      window.history.pushState({}, '', '/');
    }
  };

  // Live UTC mission clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatted = now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
      setUtcTime(formatted);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const capabilities = [
    {
      id: 'single',
      title: 'Single-Image VQA & Grounding',
      subtitle: 'Scene Understanding & Feature Localization',
      desc: 'Ask questions in natural English to identify land cover categories, estimate vegetative canopy, or localize specific terrain targets with bounding boxes.',
      icon: Eye,
      tag: '1 Scene',
      color: 'from-cyan-500/20 to-cyan-500/5',
      accent: 'text-cyan-400',
    },
    {
      id: 'bitemporal',
      title: 'Bi-Temporal Change Analysis',
      subtitle: 'Differential Temporal Tracking',
      desc: 'Compare two temporal acquisitions (T1 Baseline vs. T2 Target) to automatically detect urban expansion, infrastructure spurs, and canopy shifts.',
      icon: Layers,
      tag: '2 Scenes (T1/T2)',
      color: 'from-indigo-500/20 to-indigo-500/5',
      accent: 'text-indigo-400',
    },
    {
      id: 'optical_sar',
      title: 'Optical + SAR Sensor Fusion',
      subtitle: 'All-Weather Cross-Modal Intelligence',
      desc: 'Combine optical spectral reflectance with synthetic aperture radar (SAR) microwave backscatter to pierce cloud occlusions and analyze surface roughness.',
      icon: Radio,
      tag: 'Optical + SAR',
      color: 'from-emerald-500/20 to-emerald-500/5',
      accent: 'text-emerald-400',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#070b12] to-[#030508] text-slate-100 relative overflow-x-hidden font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Underlying Landing Page Content (Blurred & Softened when Auth Modal is open) */}
      <div
        className={`transition-all duration-300 min-h-screen flex flex-col justify-between ${
          authModal.isOpen
            ? 'filter blur-md scale-[0.99] pointer-events-none select-none brightness-90'
            : ''
        }`}
      >
        {/* ========================================================================= */}
        {/* 1. FAINT CSS COORDINATE GRID OVERLAY (Radar Screen at 10% Opacity)        */}
        {/* ========================================================================= */}
        <div
          className="fixed inset-0 pointer-events-none z-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(6, 182, 212, 0.4) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(6, 182, 212, 0.4) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Ambient Radar Screen Range Rings (Concentric circles in the background) */}
      <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center opacity-10 overflow-hidden">
        <div className="w-[850px] h-[850px] rounded-full border border-cyan-400/40" />
        <div className="absolute w-[600px] h-[600px] rounded-full border border-cyan-400/30" />
        <div className="absolute w-[350px] h-[350px] rounded-full border border-cyan-400/20" />
        {/* Radar Crosshairs */}
        <div className="absolute w-full h-[1px] bg-cyan-400/20" />
        <div className="absolute h-full w-[1px] bg-cyan-400/20" />
      </div>

      {/* Atmospheric Ambient Gradient Glows */}
      <div className="fixed top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[400px] bg-cyan-900/10 blur-[150px] rounded-full pointer-events-none z-0" />
      <div className="fixed bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[700px] h-[450px] bg-emerald-950/15 blur-[160px] rounded-full pointer-events-none z-0" />

      {/* ========================================================================= */}
      {/* 2. TOP MISSION NAVIGATION BAR                                             */}
      {/* ========================================================================= */}
      <header className="fixed top-0 inset-x-0 z-50 px-6 sm:px-12 py-4 flex items-center justify-between border-b border-white/5 bg-[#070b12]/80 backdrop-blur-xl">
        {/* Logo */}
        <button
          type="button"
          onClick={() => onNavigate && onNavigate('landing')}
          className="flex items-center gap-2.5 group cursor-pointer text-left"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-emerald-500 flex items-center justify-center text-slate-950 shadow-md shadow-cyan-500/25 group-hover:scale-105 transition-transform">
            <Satellite className="w-5 h-5" />
          </div>
          <div>
            <span className="font-black text-sm tracking-tight text-white flex items-center gap-1">
              SATQUERY<span className="text-cyan-400">.AI</span>
            </span>
            <span className="block text-[9px] font-mono text-slate-400 tracking-wider">
              MISSION CONTROL v2.6
            </span>
          </div>
        </button>

        {/* Live Mission Clock Readout */}
        <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/70 border border-slate-800 text-xs font-mono text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-400">MISSION TIME:</span>
          <span className="text-emerald-300">{utcTime || '2026-09-14 09:00:00 UTC'}</span>
        </div>

        {/* Action CTAs */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            id="header-sign-in-btn"
            onClick={() => openAuthModal('signin')}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            Sign In
          </button>
          <button
            type="button"
            id="header-create-account-btn"
            onClick={() => openAuthModal('signup')}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
          >
            Create Account
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 3. HERO: FULL-SCREEN CSS GRID SPLIT LAYOUT (45% Text, 55% 3D Canvas)     */}
      {/* ========================================================================= */}
      <section className="relative z-10 w-full min-h-[calc(100vh-4.5rem)] lg:h-[calc(100vh-4.5rem)] grid grid-cols-1 lg:grid-cols-[45%_55%] items-center px-6 sm:px-10 lg:px-14 pt-20 lg:pt-0 pb-6 overflow-hidden">
        {/* LEFT COLUMN: 45% Text / Copy Wrapped in Anti-Gravity Motion Wrapper */}
        <motion.div
          animate={{ y: [-4, 4, -4] }}
          transition={{
            duration: 7,
            ease: 'easeInOut',
            repeat: Infinity,
            delay: 0.5,
          }}
          className="flex flex-col justify-center space-y-6 lg:pr-6 xl:pr-10 select-none z-20"
        >
          {/* Headline: High-Contrast Editorial Serif (Playfair Display) + Bold Sans */}
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-5xl lg:text-[3.35rem] xl:text-[3.65rem] tracking-tight leading-[1.08] text-white">
              <span className="font-serif italic font-normal text-slate-100 block tracking-normal">
                Autonomous, evidence-based
              </span>
              <span className="font-sans font-black tracking-tight block mt-2 bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                remote-sensing intelligence<span className="text-cyan-400">.</span>
              </span>
            </h1>
          </div>

          {/* Paragraph: Clean, editorial sans-serif in slate-300 */}
          <p className="font-sans text-sm sm:text-base lg:text-[17px] text-slate-300/85 leading-relaxed max-w-xl font-normal">
            Transform high-dimensional optical, multispectral, and SAR satellite imagery into actionable, visually grounded insights using autonomous agentic intelligence.
          </p>

          {/* Direct Authentication Action CTAs */}
          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              type="button"
              id="get-started-hero-btn"
              onClick={() => openAuthModal('signup')}
              className="group inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono tracking-wider uppercase transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 text-slate-950 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              type="button"
              id="sign-in-hero-btn"
              onClick={() => openAuthModal('signin')}
              className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-slate-700/80 hover:border-cyan-500/50 bg-slate-900/60 hover:bg-slate-900/90 text-slate-300 hover:text-white font-mono text-xs tracking-wider uppercase transition-all cursor-pointer"
            >
              <span>Sign In</span>
            </button>
          </div>
        </motion.div>

        {/* RIGHT COLUMN: 55% 3D Canvas Wrapped in Anti-Gravity Motion Wrapper */}
        <motion.div
          animate={{ y: [-6, 6, -6] }}
          transition={{
            duration: 8,
            ease: 'easeInOut',
            repeat: Infinity,
          }}
          className="relative w-full h-full flex items-center justify-center mt-6 lg:mt-0"
        >
          {/* Atmospheric Ambient Glow behind the 3D Canvas */}
          <div className="absolute -inset-4 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

          {/* Seamless 3D Holographic Environment */}
          <div className="relative w-full h-full flex items-center justify-center">
            <TerrainCanvas />
          </div>
        </motion.div>
      </section>

      {/* ========================================================================= */}
      {/* 4. CAPABILITIES SECTION                                                   */}
      {/* ========================================================================= */}
      <section id="capabilities" className="relative z-10 py-20 px-6 sm:px-12 lg:px-16 border-t border-white/5 bg-[#070B12]/80">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 font-mono text-xs uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              <span>MULTIMODAL PIPELINES</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Three Specialized Earth Observation Modes
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Engineered to replace fragmented GIS workflows with an autonomous, agentic pipeline for planetary observation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {capabilities.map((cap) => {
              const Icon = cap.icon;
              return (
                <div
                  key={cap.id}
                  className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 hover:border-cyan-500/40 transition-all space-y-4 relative group backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center ${cap.accent} border border-white/5`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono px-2.5 py-1 rounded-md bg-white/5 text-slate-400 border border-white/5">
                      {cap.tag}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {cap.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">{cap.subtitle}</p>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {cap.desc}
                  </p>

                  <button
                    type="button"
                    onClick={() => openAuthModal('signin')}
                    className="pt-2 flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                  >
                    <span>Launch Mode</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Quick Evaluator CTA Banner */}
          <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="text-xl font-black text-white tracking-tight">
                Ready to analyze live satellite rasters?
              </h4>
              <p className="text-xs text-slate-300 max-w-xl">
                Create an account or sign in to access optical, SAR, and multimodal Earth observation pipelines.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                id="banner-create-account-btn"
                onClick={() => openAuthModal('signup')}
                className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all cursor-pointer flex-shrink-0"
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. FOOTER                                                                 */}
      {/* ========================================================================= */}
      <Footer onNavigate={onNavigate} />
    </div>

    {/* Floating Auth Modal with background blur and anti-gravity card */}
    <AuthModal
      isOpen={authModal.isOpen}
      initialMode={authModal.mode}
      onClose={closeAuthModal}
      onNavigate={onNavigate}
    />
  </div>
);
}
