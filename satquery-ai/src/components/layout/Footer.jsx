import React from 'react';
import { Satellite, Mail, Globe, Code2 } from 'lucide-react';

export default function Footer({ onNavigate }) {
  return (
    <footer className="border-t border-gray-200 dark:border-white/10 bg-white dark:bg-[#080B10] text-gray-600 dark:text-gray-400 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
                <Satellite className="w-4 h-4" />
              </div>
              <span className="text-base font-black tracking-tight text-gray-900 dark:text-[#F5F7FA]">
                SATQUERY<span className="text-teal-500 dark:text-[#4FD1C5]">.AI</span>
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed max-w-sm">
              An intelligent agentic platform for understanding optical, multispectral, SAR, and multi-temporal satellite imagery. Turn high-dimensional earth observation rasters into evidence-grounded insights.
            </p>
            <div className="pt-2 flex items-center gap-3">
              {/* GitHub SVG */}
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl border border-gray-200 dark:border-white/10 hover:text-teal-600 dark:hover:text-[#4FD1C5] hover:border-teal-500/30 transition-colors"
                aria-label="GitHub"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </a>
              {/* LinkedIn SVG */}
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl border border-gray-200 dark:border-white/10 hover:text-teal-600 dark:hover:text-[#4FD1C5] hover:border-teal-500/30 transition-colors"
                aria-label="LinkedIn"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                </svg>
              </a>
              {/* Email */}
              <a
                href="mailto:contact@satquery.ai"
                className="p-2 rounded-xl border border-gray-200 dark:border-white/10 hover:text-teal-600 dark:hover:text-[#4FD1C5] hover:border-teal-500/30 transition-colors"
                aria-label="Email"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-gray-100 mb-4 font-mono">
              Product
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button onClick={() => onNavigate && onNavigate('dashboard')} className="hover:text-teal-600 dark:hover:text-[#4FD1C5] transition-colors">
                  Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate && onNavigate('analysis')} className="hover:text-teal-600 dark:hover:text-[#4FD1C5] transition-colors">
                  New Analysis
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate && onNavigate('results')} className="hover:text-teal-600 dark:hover:text-[#4FD1C5] transition-colors">
                  Visual Evidence
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate && onNavigate('history')} className="hover:text-teal-600 dark:hover:text-[#4FD1C5] transition-colors">
                  Analysis Archive
                </button>
              </li>
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-gray-100 mb-4 font-mono">
              Resources
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button onClick={() => onNavigate && onNavigate('reports')} className="hover:text-teal-600 dark:hover:text-[#4FD1C5] transition-colors">
                  Executive Reports
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate && onNavigate('images')} className="hover:text-teal-600 dark:hover:text-[#4FD1C5] transition-colors">
                  Satellite Catalog
                </button>
              </li>
              <li>
                <span className="text-gray-400 dark:text-gray-500 cursor-not-allowed">SIH 2026 Research Whitepaper</span>
              </li>
              <li>
                <span className="text-gray-400 dark:text-gray-500 cursor-not-allowed">Sensor Specs & Calibration</span>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-gray-100 mb-4 font-mono">
              Initiative
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button onClick={() => onNavigate && onNavigate('landing')} className="hover:text-teal-600 dark:hover:text-[#4FD1C5] transition-colors">
                  About Platform
                </button>
              </li>
              <li>
                <span className="text-gray-400 dark:text-gray-500 cursor-not-allowed">Earth Observation Ethics</span>
              </li>
              <li>
                <span className="text-gray-400 dark:text-gray-500 cursor-not-allowed">Privacy & Geosecurity</span>
              </li>
              <li>
                <span className="text-gray-400 dark:text-gray-500 cursor-not-allowed">Terms of Service</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-12 pt-6 border-t border-gray-100 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 dark:text-gray-400">
          <p>© 2026 SatQuery AI. All rights reserved. Built for Smart India Hackathon & Earth Observation Labs.</p>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span className="text-teal-600 dark:text-[#4FD1C5]">● FRONTEND PROTOTYPE READY</span>
            <span>V1.0.4-BETA</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
