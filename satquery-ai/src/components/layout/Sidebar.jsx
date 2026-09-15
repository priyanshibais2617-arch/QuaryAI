import {
  LayoutDashboard,
  Sparkles,
  AlignLeft,
  Crosshair,
  Layers,
  Radio,
  Image as ImageIcon,
  CheckSquare,
  History as HistoryIcon,
  FileText,
  Settings as SettingsIcon,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Satellite,
  X
} from 'lucide-react';
import Tooltip from '../ui/Tooltip';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({
  currentPage,
  onNavigate,
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
  onOpenHelp,
  onOpenLogout,
}) {
  const { user } = useAuth();

  const workflowNavItems = [
    {
      id: 'workflow-single-vqa',
      workflowKey: 'single_vqa',
      label: 'Single-Image VQA',
      icon: Sparkles,
      badge: '1 Image',
    },
    {
      id: 'workflow-captioning',
      workflowKey: 'captioning',
      label: 'Scene Captioning',
      icon: AlignLeft,
      badge: '1 Image',
    },
    {
      id: 'workflow-grounding',
      workflowKey: 'grounding',
      label: 'Visual Grounding',
      icon: Crosshair,
      badge: '1 Image',
    },
    {
      id: 'workflow-bitemporal',
      workflowKey: 'bitemporal_change',
      label: 'Bi-Temporal Change',
      icon: Layers,
      badge: '2 Images',
    },
    {
      id: 'workflow-optical-sar',
      workflowKey: 'optical_sar',
      label: 'Optical + SAR Fusion',
      icon: Radio,
      badge: '2 Images',
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-[#0E131A] border-r border-gray-200 dark:border-white/10 select-none">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-4 py-4 h-16 border-b border-gray-100 dark:border-white/10">
        <button
          onClick={() => onNavigate('workflow-single-vqa')}
          className="flex items-center gap-3 group text-left"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform flex-shrink-0">
            <Satellite className="w-5 h-5 animate-pulse-slow" />
          </div>
          {(!isCollapsed || isMobileOpen) && (
            <div className="overflow-hidden">
              <span className="text-sm font-black tracking-tight text-gray-900 dark:text-[#F5F7FA] block leading-none">
                SATQUERY<span className="text-teal-500 dark:text-[#4FD1C5]">.AI</span>
              </span>
              <span className="text-[10px] tracking-wider uppercase font-semibold text-gray-400 dark:text-[#A7B0BA] block mt-0.5 font-mono">
                Remote Sensing
              </span>
            </div>
          )}
        </button>

        {/* Mobile close or desktop collapse */}
        {isMobileOpen ? (
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-2 space-y-3 overflow-y-auto">
        {/* Evaluation Workflows & Tasks Section */}
        <div className="space-y-1">
          {(!isCollapsed || isMobileOpen) && (
            <div className="px-3 pt-1 pb-1 text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Evaluation Workflows
            </div>
          )}
          {workflowNavItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              currentPage === item.id || (currentPage === 'dashboard' && item.id === 'workflow-single-vqa');

            const buttonNode = (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => {
                  onNavigate(item.id);
                  if (isMobileOpen) setIsMobileOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-teal-500/10 dark:bg-[#4FD1C5]/10 text-teal-600 dark:text-[#4FD1C5] border border-teal-500/20 dark:border-[#4FD1C5]/30'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-[#151C25]'
                } ${isCollapsed && !isMobileOpen ? 'justify-center px-0' : ''}`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-teal-600 dark:text-[#4FD1C5]' : ''}`} />
                {(!isCollapsed || isMobileOpen) && (
                  <div className="flex-1 flex items-center justify-between truncate text-left">
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );

            if (isCollapsed && !isMobileOpen) {
              return (
                <Tooltip key={item.id} text={item.label} position="right">
                  {buttonNode}
                </Tooltip>
              );
            }

            return buttonNode;
          })}
        </div>
      </div>

      {/* Bottom Footer Section */}
      <div className="p-3 border-t border-gray-100 dark:border-white/10 space-y-1 bg-gray-50/50 dark:bg-[#080B10]/40">
        {/* Help Button */}
        <button
          onClick={onOpenHelp}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors ${
            isCollapsed && !isMobileOpen ? 'justify-center px-0' : ''
          }`}
        >
          <HelpCircle className="w-4 h-4 flex-shrink-0" />
          {(!isCollapsed || isMobileOpen) && <span>Guide & Docs</span>}
        </button>

        {/* User Card */}
        {user && (!isCollapsed || isMobileOpen) && (
          <div className="mt-2 p-2.5 rounded-xl border border-gray-200/80 dark:border-white/5 bg-white dark:bg-[#111820] flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-7 h-7 rounded-lg object-cover ring-1 ring-teal-500/30 flex-shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">{user.name}</p>
                <p className="text-[10px] text-gray-400 truncate">{user.role}</p>
              </div>
            </div>
            <button
              onClick={onOpenLogout}
              className="p-1 text-gray-400 hover:text-rose-500 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Collapsed logout icon */}
        {user && isCollapsed && !isMobileOpen && (
          <Tooltip text="Sign Out" position="right">
            <button
              onClick={onOpenLogout}
              className="w-full flex items-center justify-center p-2 rounded-xl text-gray-400 hover:text-rose-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </Tooltip>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:block fixed top-0 bottom-0 left-0 z-30 transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] h-full z-10 shadow-2xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
