import React from 'react';
import { motion } from 'framer-motion';

/**
 * AntiGravityWrapper:
 * A refined, professional floating wrapper for the central split-screen card.
 *
 * Physics:
 * - Imperceptibly slow float: 8-10 seconds per cycle (9s default).
 * - Smooth easeInOut animation moving max 10px up and down.
 * - Dynamic apex shadow expansion:
 *   As the card reaches the apex of its float, its drop shadow (shadow-cyan-500/10)
 *   expands and blurs smoothly to simulate distance, and tightens as it lowers.
 * - Crisp 1px cyan/emerald glowing border.
 */
export default function AntiGravityWrapper({ children, className = '' }) {
  return (
    <div className="relative w-full max-w-[460px] mx-auto flex items-center justify-center p-2 sm:p-4">
      {/* Outer subtle glow aura that pulses synchronously with the float */}
      <motion.div
        animate={{
          opacity: [0.35, 0.65, 0.35],
          scale: [0.98, 1.01, 0.98],
        }}
        transition={{
          duration: 9,
          ease: 'easeInOut',
          repeat: Infinity,
        }}
        className="absolute -inset-1 sm:-inset-2 rounded-3xl bg-cyan-950/10 blur-xl pointer-events-none"
      />

      {/* Main floating card wrapper */}
      <motion.div
        animate={{
          y: [0, -10, 0],
          boxShadow: [
            // Lower position (y = 0): Tight, sharp shadow closer to surface
            '0 20px 40px -15px rgba(0, 0, 0, 0.8), 0 0 1px 1px rgba(6, 182, 212, 0.15)',
            // Apex position (y = -10): Expanded shadow simulating elevation
            '0 35px 60px -15px rgba(0, 0, 0, 0.9), 0 0 20px 2px rgba(6, 182, 212, 0.12)',
            // Return to lower position
            '0 20px 40px -15px rgba(0, 0, 0, 0.8), 0 0 1px 1px rgba(6, 182, 212, 0.15)',
          ],
        }}
        transition={{
          duration: 9,
          ease: 'easeInOut',
          repeat: Infinity,
        }}
        className={`relative w-full rounded-2xl sm:rounded-3xl border border-slate-800/80 bg-[#0B111D]/95 backdrop-blur-2xl overflow-hidden transition-colors ${className}`}
        style={{
          willChange: 'transform, box-shadow',
        }}
      >
        {/* Crisp 1px glowing cyan border highlight overlay */}
        <div className="absolute inset-0 pointer-events-none rounded-2xl sm:rounded-3xl ring-1 ring-inset ring-cyan-400/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]" />

        {/* High-tech corner crosshairs for clean geospatial instrumentation feel */}
        <div className="absolute top-2.5 left-2.5 w-3 h-3 border-t border-l border-cyan-400/60 pointer-events-none z-30" />
        <div className="absolute top-2.5 right-2.5 w-3 h-3 border-t border-r border-cyan-400/60 pointer-events-none z-30" />
        <div className="absolute bottom-2.5 left-2.5 w-3 h-3 border-b border-l border-cyan-400/60 pointer-events-none z-30" />
        <div className="absolute bottom-2.5 right-2.5 w-3 h-3 border-b border-r border-cyan-400/60 pointer-events-none z-30" />

        {children}
      </motion.div>
    </div>
  );
}
