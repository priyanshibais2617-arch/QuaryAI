import React, { useState } from 'react';
import {
  User,
  Sun,
  Moon,
  Laptop,
  Check,
  Bell,
  Sliders,
  ShieldAlert,
  LogOut,
  Save,
  KeyRound,
  Eye,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../hooks/useToast';
import Modal from '../components/ui/Modal';

export default function Settings({ onNavigate }) {
  const { user, updateUser, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const [name, setName] = useState(user?.fullName || 'Abhimanyu Patel');
  const [email, setEmail] = useState(user?.email || 'abhi@remote-sensing.org');
  const [organization, setOrganization] = useState(user?.organization || 'National Remote Sensing Centre');
  const [role, setRole] = useState(user?.role || 'Lead Remote Sensing Analyst');

  // Analysis Preferences
  const [showConfidence, setShowConfidence] = useState(true);
  const [showExecutionSummary, setShowExecutionSummary] = useState(true);
  const [showVisualEvidence, setShowVisualEvidence] = useState(true);

  // Notification Toggles
  const [notifAnalysis, setNotifAnalysis] = useState(true);
  const [notifReport, setNotifReport] = useState(true);
  const [notifUpdates, setNotifUpdates] = useState(false);

  // Dialogs
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const isRealBackend = typeof import.meta !== 'undefined' && import.meta.env?.VITE_USE_REAL_BACKEND === 'true';

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateUser({
      fullName: name,
      name: name.split(' ')[0],
      email,
      organization,
      role,
    });
    toast.success('Analyst profile preferences updated.', 'Changes Saved');
  };

  const handleConfirmLogout = async () => {
    await logout();
    setIsLogoutModalOpen(false);
    toast.info('Signed out of SatQuery AI.', 'Session Ended');
    onNavigate('signin');
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="pb-4 border-b border-gray-200 dark:border-white/10">
        <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-[#F5F7FA]">
          Workstation Settings
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          Configure profile details, global appearance, analysis telemetry, and account security.
        </p>
      </div>

      {/* 1. Profile Section */}
      <div className="p-6 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111820] shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-[#4FD1C5]">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
              Analyst Profile
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Personal identity and organization credentials
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="flex items-center gap-4">
            <img
              src={user?.avatar}
              alt={user?.name}
              className="w-14 h-14 rounded-2xl object-cover ring-2 ring-teal-500/30"
            />
            <div>
              <button
                type="button"
                onClick={() => toast.info('Client-side avatar upload simulated.', 'Avatar')}
                className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-white/10 text-xs font-semibold hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
              >
                Change Avatar
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-gray-700 dark:text-gray-300">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#080B10] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-gray-700 dark:text-gray-300">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#080B10] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-gray-700 dark:text-gray-300">Organization</label>
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#080B10] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-gray-700 dark:text-gray-300">Mission Role</label>
                {isRealBackend && (
                  <span className="text-[10px] font-mono text-teal-600 dark:text-[#4FD1C5]">
                    Managed via Supabase
                  </span>
                )}
              </div>
              <input
                type="text"
                value={role}
                disabled={isRealBackend}
                onChange={(e) => setRole(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#080B10] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-teal-500 ${
                  isRealBackend ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white dark:bg-[#4FD1C5] dark:text-[#080B10] text-xs font-bold transition-all shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>

      {/* 2. Global Appearance Theme */}
      <div className="p-6 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111820] shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
            Global Theme &amp; Aesthetics
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Switch between dark satellite telemetry, clean light mode, or system sync.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { key: 'dark', label: 'Dark Mission', icon: Moon, desc: 'Optimized for high-contrast satellite raster visualization' },
            { key: 'light', label: 'Light Analytical', icon: Sun, desc: 'High-contrast report reading and daytime operations' },
            { key: 'system', label: 'System Automatic', icon: Laptop, desc: 'Matches your OS dark/light mode preference' },
          ].map(({ key, label, icon: Icon, desc }) => {
            const isSelected = theme === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setTheme(key)}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'border-teal-500 dark:border-[#4FD1C5] bg-teal-500/5 dark:bg-[#4FD1C5]/10 ring-1 ring-teal-500/40'
                    : 'border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-[#151C25] hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-teal-600 dark:text-[#4FD1C5]' : 'text-gray-400'}`} />
                  {isSelected && <Check className="w-4 h-4 text-teal-600 dark:text-[#4FD1C5]" />}
                </div>
                <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100">{label}</h4>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Analysis Preferences */}
      <div className="p-6 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111820] shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-[#4FD1C5]">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
              Analysis View Preferences
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Control which analytical panels are displayed on mission results.
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-1 text-xs">
          <label className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-[#151C25] cursor-pointer">
            <div>
              <span className="font-semibold text-gray-800 dark:text-gray-200 block">Show Calibrated Confidence Meter</span>
              <span className="text-[11px] text-gray-400">Display model certainty percentage and threshold gauges</span>
            </div>
            <input
              type="checkbox"
              checked={showConfidence}
              onChange={(e) => setShowConfidence(e.target.checked)}
              className="rounded text-teal-600 focus:ring-teal-500/30 w-4 h-4"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-[#151C25] cursor-pointer">
            <div>
              <span className="font-semibold text-gray-800 dark:text-gray-200 block">Show Auditable Execution Summary</span>
              <span className="text-[11px] text-gray-400">Display specialist tool pipeline, sensors, and parameters</span>
            </div>
            <input
              type="checkbox"
              checked={showExecutionSummary}
              onChange={(e) => setShowExecutionSummary(e.target.checked)}
              className="rounded text-teal-600 focus:ring-teal-500/30 w-4 h-4"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-[#151C25] cursor-pointer">
            <div>
              <span className="font-semibold text-gray-800 dark:text-gray-200 block">Show Interactive Visual Evidence</span>
              <span className="text-[11px] text-gray-400">Render high-resolution raster zoom, before/after slider, and grounding masks</span>
            </div>
            <input
              type="checkbox"
              checked={showVisualEvidence}
              onChange={(e) => setShowVisualEvidence(e.target.checked)}
              className="rounded text-teal-600 focus:ring-teal-500/30 w-4 h-4"
            />
          </label>
        </div>
      </div>

      {/* 4. Notification Preferences */}
      <div className="p-6 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111820] shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-[#4FD1C5]">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
              Notification Preferences
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Configure telemetry alerts and report readiness messages.
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-1 text-xs">
          <label className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-[#151C25] cursor-pointer">
            <div>
              <span className="font-semibold text-gray-800 dark:text-gray-200 block">Analysis Completed Alerts</span>
              <span className="text-[11px] text-gray-400">Notify when the agentic controller finishes processing</span>
            </div>
            <input
              type="checkbox"
              checked={notifAnalysis}
              onChange={(e) => setNotifAnalysis(e.target.checked)}
              className="rounded text-teal-600 focus:ring-teal-500/30 w-4 h-4"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-[#151C25] cursor-pointer">
            <div>
              <span className="font-semibold text-gray-800 dark:text-gray-200 block">Executive Report Ready</span>
              <span className="text-[11px] text-gray-400">Alert when signed PDF summaries are available to download</span>
            </div>
            <input
              type="checkbox"
              checked={notifReport}
              onChange={(e) => setNotifReport(e.target.checked)}
              className="rounded text-teal-600 focus:ring-teal-500/30 w-4 h-4"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-[#151C25] cursor-pointer">
            <div>
              <span className="font-semibold text-gray-800 dark:text-gray-200 block">Constellation Updates &amp; Calibration</span>
              <span className="text-[11px] text-gray-400">Notices on new sensor calibration ephemeris</span>
            </div>
            <input
              type="checkbox"
              checked={notifUpdates}
              onChange={(e) => setNotifUpdates(e.target.checked)}
              className="rounded text-teal-600 focus:ring-teal-500/30 w-4 h-4"
            />
          </label>
        </div>
      </div>

      {/* 5. Account & Security Section */}
      <div className="p-6 rounded-2xl border border-rose-500/20 bg-rose-500/5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              Account &amp; Security Controls
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Workstation credentials and session termination
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={() => setIsPasswordModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111820] text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
          >
            <KeyRound className="w-3.5 h-3.5 text-gray-400" />
            <span>Change Passphrase</span>
          </button>

          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shadow-sm"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Workstation</span>
          </button>
        </div>
      </div>

      {/* Change Password Dialog */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title="Update Access Passphrase"
        subtitle="Security credential update"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-gray-700 dark:text-gray-300">Current Password</label>
            <input
              type="password"
              placeholder="••••••••••••"
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#080B10]"
            />
          </div>
          <div className="space-y-1">
            <label className="font-semibold text-gray-700 dark:text-gray-300">New Password</label>
            <input
              type="password"
              placeholder="At least 8 characters"
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#080B10]"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setIsPasswordModalOpen(false)}
              className="px-3.5 py-1.5 rounded-xl border border-gray-200 dark:border-white/10"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setIsPasswordModalOpen(false);
                toast.success('Passphrase updated in local session.', 'Updated');
              }}
              className="px-4 py-1.5 rounded-xl bg-teal-600 text-white dark:bg-[#4FD1C5] dark:text-[#080B10] font-bold"
            >
              Update Password
            </button>
          </div>
        </div>
      </Modal>

      {/* Logout Confirmation Dialog */}
      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        title="Confirm Session Sign Out"
        subtitle="Terminate active workstation session"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-xs text-gray-600 dark:text-gray-300">
          <p>
            Are you sure you want to sign out? Your staged imagery and analysis history will remain saved in local storage.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setIsLogoutModalOpen(false)}
              className="px-3.5 py-1.5 rounded-xl border border-gray-200 dark:border-white/10 font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmLogout}
              className="px-4 py-1.5 rounded-xl bg-rose-600 text-white font-bold"
            >
              Sign Out
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
