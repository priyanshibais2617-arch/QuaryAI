import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Breadcrumbs from '../ui/Breadcrumbs';
import SearchModal from '../ui/SearchModal';
import Modal from '../ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';
import { HelpCircle, LogOut, BookOpen, Layers, Terminal } from 'lucide-react';

export default function DashboardLayout({
  currentPage,
  onNavigate,
  breadcrumbItems = [],
  children,
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  const { logout } = useAuth();
  const { toast } = useToast();

  const handleConfirmLogout = () => {
    logout();
    setIsLogoutModalOpen(false);
    toast.info('Signed out successfully. Session state preserved in local demo storage.', 'Signed Out');
    onNavigate('signin');
  };

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text transition-colors duration-200 flex">
      {/* Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={onNavigate}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        onOpenHelp={() => setIsHelpModalOpen(true)}
        onOpenLogout={() => setIsLogoutModalOpen(true)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        <Navbar
          onOpenMobileMenu={() => setIsMobileOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          onNavigate={onNavigate}
          onOpenLogout={() => setIsLogoutModalOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {breadcrumbItems.length > 0 && (
            <div className="mb-4">
              <Breadcrumbs items={breadcrumbItems} onNavigate={onNavigate} />
            </div>
          )}
          {children}
        </main>
      </div>

      {/* Global Search Palette */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={onNavigate}
      />

      {/* Logout Confirmation Dialog */}
      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        title="Confirm Sign Out"
        subtitle="End current session on SatQuery AI"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
            Are you sure you want to sign out? Your staged imagery cache and simulated analysis results will remain preserved in your browser storage.
          </p>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => setIsLogoutModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 border border-gray-200 dark:border-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmLogout}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white transition-colors shadow-sm"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </Modal>

      {/* Documentation / Guide Modal */}
      <Modal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        title="SatQuery AI — Platform Guide & Workflows"
        subtitle="Autonomous Agentic Remote Sensing Architecture"
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4 text-xs text-gray-600 dark:text-gray-300 leading-relaxed max-h-[65vh] overflow-y-auto pr-1">
          <div className="p-3.5 rounded-xl bg-teal-500/10 dark:bg-[#4FD1C5]/10 border border-teal-500/20 text-teal-700 dark:text-[#4FD1C5]">
            <p className="font-bold mb-1 flex items-center gap-1.5">
              <Layers className="w-4 h-4" />
              Agentic Orchestration Concept
            </p>
            <p className="text-[11px] leading-relaxed">
              Users do not manually choose computer vision models. The Agentic Controller analyzes your natural language question, detects sensor modalities (Optical, Multispectral, or SAR), checks spatial co-registration, and routes to specialized deep vision models.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider text-[11px] font-mono">
              Supported Workflows
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#151C25]">
                <p className="font-semibold text-gray-800 dark:text-gray-200">1. Bi-Temporal Change</p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                  Evaluates two co-registered scenes to detect urban sprawl, deforestation, and infrastructure deltas.
                </p>
              </div>
              <div className="p-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#151C25]">
                <p className="font-semibold text-gray-800 dark:text-gray-200">2. Optical + SAR Fusion</p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                  Fuses Sentinel-2 optical spectral data with Sentinel-1 microwave radar backscatter for cloud-penetrating analysis.
                </p>
              </div>
              <div className="p-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#151C25]">
                <p className="font-semibold text-gray-800 dark:text-gray-200">3. Spatial Grounding</p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                  Identifies and draws exact geographic bounding envelopes around features mentioned in the prompt (e.g. water bodies).
                </p>
              </div>
              <div className="p-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#151C25]">
                <p className="font-semibold text-gray-800 dark:text-gray-200">4. Single Scene VQA</p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                  Answers free-form questions, describes land cover, estimates vegetation canopy, and quantifies impervious surfaces.
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#151C25] font-mono text-[11px] text-gray-500 dark:text-gray-400">
            <span className="text-teal-600 dark:text-[#4FD1C5] font-semibold">Tip: </span>
            Press <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-black/30 border border-gray-300 dark:border-white/20">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-black/30 border border-gray-300 dark:border-white/20">K</kbd> anywhere to search previous analyses and satellite scenes.
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setIsHelpModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white dark:bg-[#4FD1C5] dark:text-[#080B10] dark:hover:bg-[#4FD1C5]/90 font-semibold text-xs transition-colors"
            >
              Got it, Close Guide
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
