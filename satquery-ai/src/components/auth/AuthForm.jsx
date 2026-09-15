import React, { useState } from 'react';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';

export default function AuthForm({ initialMode = 'signin', onNavigate, onSuccessfulAuth }) {
  const [mode, setMode] = useState(initialMode); // 'signin' | 'signup'

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Password Visibility State
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & Validation State
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { login, signup } = useAuth();
  const { toast } = useToast();

  // Mode switch within modal smoothly updates state without forcing route remount
  const handleModeSwitch = (targetMode) => {
    setMode(targetMode);
    setErrors({});
    if (window.location.pathname === '/signin' || window.location.pathname === '/signup') {
      window.history.replaceState({}, '', targetMode === 'signin' ? '/signin' : '/signup');
    }
  };

  // Validation
  const validate = () => {
    const errs = {};

    if (!email.trim()) {
      errs.email = 'Please enter your email address.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errs.password = 'Please enter your password.';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }

    if (mode === 'signup') {
      if (!fullName.trim()) {
        errs.fullName = 'Please enter your full name.';
      }
      if (password !== confirmPassword) {
        errs.confirmPassword = 'Passwords do not match.';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Main Form Submission Handler with simulated 1.5s network delay and console payload logging
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    // 1. Log payload to the console as requested
    const payload = {
      mode,
      email: email.trim(),
      passwordMasked: '*'.repeat(password.length),
      rememberMe,
      ...(mode === 'signup' ? { fullName: fullName.trim(), confirmPasswordMasked: '*'.repeat(confirmPassword.length) } : {}),
      timestamp: new Date().toISOString(),
    };
    console.log('[SatQuery AI Auth] Form Submission Payload:', payload);

    // 2. Trigger visual loading spinner on the submit button
    setIsLoading(true);

    try {
      // 3. Simulate 1.5-second network request delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (mode === 'signin') {
        await login(email, password);
        toast.success('Authenticated successfully. Welcome back to SatQuery AI!', 'Access Granted');
      } else {
        await signup({ fullName, email, password });
        toast.success(`Account registered for ${fullName || 'Analyst'}. Welcome aboard!`, 'Account Created');
      }

      // 4. Trigger modal close & navigate to dashboard
      if (onSuccessfulAuth) {
        onSuccessfulAuth();
      }
      if (onNavigate) {
        onNavigate('dashboard');
      }
    } catch (err) {
      console.error('[SatQuery AI Auth] Authentication error:', err);
      toast.error(err.message || 'Authentication failed. Please verify credentials.', 'Authentication Error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 lg:p-10 flex flex-col justify-center space-y-5 bg-[#0B111D]/95 text-slate-100">
      {/* Top Segmented Mode Selector */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {mode === 'signin' ? 'Sign In to SatQuery AI' : 'Register Analyst Station'}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {mode === 'signin'
              ? 'Enter credentials to access satellite telemetry and pipelines.'
              : 'Create an analyst account to run autonomous remote sensing agent workflows.'}
          </p>
        </div>

        {/* Quick Segmented Toggle */}
        <div className="inline-flex p-1 rounded-xl bg-slate-900/90 border border-slate-700/50 text-[11px] font-mono">
          <button
            type="button"
            id="auth-mode-signin-btn"
            onClick={() => handleModeSwitch('signin')}
            className={`px-3 py-1 rounded-lg transition-all ${
              mode === 'signin'
                ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            id="auth-mode-signup-btn"
            onClick={() => handleModeSwitch('signup')}
            className={`px-3 py-1 rounded-lg transition-all ${
              mode === 'signup'
                ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign Up
          </button>
        </div>
      </div>

      {/* Authentication Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Full Name Field (Sign Up Only) */}
        {mode === 'signup' && (
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Full Name</span>
              <span className="text-[10px] text-slate-500 font-mono">EO ANALYST</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={fullName}
                disabled={isLoading}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: null }));
                }}
                placeholder="Dr. Eleanor Vance"
                className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-xs bg-[#070B12] text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 transition-colors ${
                  errors.fullName
                    ? 'border-rose-500/80 focus:ring-rose-500/50'
                    : 'border-slate-700/60 focus:border-cyan-400/80 focus:ring-cyan-400/40'
                }`}
              />
            </div>
            {errors.fullName && (
              <p className="text-[11px] text-rose-400 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                <span>{errors.fullName}</span>
              </p>
            )}
          </div>
        )}

        {/* Email Address Field */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span>Work Email Address</span>
            <span className="text-[10px] text-slate-500 font-mono">SATELLITE NET</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              value={email}
              disabled={isLoading}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
              }}
              placeholder="analyst.vance@satquery.ai"
              className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-xs bg-[#070B12] text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 transition-colors ${
                errors.email
                  ? 'border-rose-500/80 focus:ring-rose-500/50'
                  : 'border-slate-700/60 focus:border-cyan-400/80 focus:ring-cyan-400/40'
              }`}
            />
          </div>
          {errors.email && (
            <p className="text-[11px] text-rose-400 flex items-center gap-1 mt-1">
              <AlertCircle className="w-3 h-3 flex-shrink-0" />
              <span>{errors.email}</span>
            </p>
          )}
        </div>

        {/* Password Field with Eye Toggle */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300">Password</label>
            {mode === 'signin' && (
              <a
                href="#forgot"
                onClick={(e) => {
                  e.preventDefault();
                  toast.info(
                    'Simulated reset instructions dispatched to workstation terminal.',
                    'Password Recovery'
                  );
                }}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 hover:underline transition-colors"
              >
                Forgot key?
              </a>
            )}
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              disabled={isLoading}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
              }}
              placeholder="••••••••••••"
              className={`w-full pl-9 pr-10 py-2.5 rounded-xl border text-xs bg-[#070B12] text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 transition-colors ${
                errors.password
                  ? 'border-rose-500/80 focus:ring-rose-500/50'
                  : 'border-slate-700/60 focus:border-cyan-400/80 focus:ring-cyan-400/40'
              }`}
            />
            {/* Working Eye Icon Toggle */}
            <button
              type="button"
              id="toggle-password-visibility"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-cyan-300 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-[11px] text-rose-400 flex items-center gap-1 mt-1">
              <AlertCircle className="w-3 h-3 flex-shrink-0" />
              <span>{errors.password}</span>
            </p>
          )}
        </div>

        {/* Confirm Password Field (Sign Up Only) */}
        {mode === 'signup' && (
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Confirm Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                disabled={isLoading}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) {
                    setErrors((prev) => ({ ...prev, confirmPassword: null }));
                  }
                }}
                placeholder="Repeat password"
                className={`w-full pl-9 pr-10 py-2.5 rounded-xl border text-xs bg-[#070B12] text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 transition-colors ${
                  errors.confirmPassword
                    ? 'border-rose-500/80 focus:ring-rose-500/50'
                    : 'border-slate-700/60 focus:border-cyan-400/80 focus:ring-cyan-400/40'
                }`}
              />
              <button
                type="button"
                id="toggle-confirm-password-visibility"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-cyan-300 transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-[11px] text-rose-400 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                <span>{errors.confirmPassword}</span>
              </p>
            )}
          </div>
        )}

        {/* Remember Me Checkbox & Security Notice */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-400/30 w-3.5 h-3.5 cursor-pointer"
            />
            <span className="text-xs text-slate-300">
              Remember workstation session
            </span>
          </label>
          <span className="text-[10px] text-slate-500 font-mono hidden sm:inline-block">
            TLS 1.3 &bull; AES-256
          </span>
        </div>

        {/* Main Submit Button with Visual Loading Spinner */}
        <button
          type="submit"
          disabled={isLoading}
          id="auth-submit-button"
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition-all duration-200 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
              <span>Verifying Mission Telemetry...</span>
            </>
          ) : (
            <>
              <span>{mode === 'signin' ? 'Sign In to Platform' : 'Create Analyst Account'}</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </>
          )}
        </button>
      </form>

      {/* Working View Toggle at the Bottom */}
      <div className="pt-2 border-t border-slate-800 text-center">
        <p className="text-xs text-slate-400">
          {mode === 'signin' ? (
            <>
              Don&rsquo;t have an account?{' '}
              <button
                type="button"
                id="toggle-to-signup"
                onClick={() => handleModeSwitch('signup')}
                className="font-bold text-cyan-400 hover:text-cyan-300 hover:underline transition-colors ml-1 cursor-pointer"
              >
                Create Account
              </button>
            </>
          ) : (
            <>
              Already have an analyst account?{' '}
              <button
                type="button"
                id="toggle-to-signin"
                onClick={() => handleModeSwitch('signin')}
                className="font-bold text-cyan-400 hover:text-cyan-300 hover:underline transition-colors ml-1 cursor-pointer"
              >
                Sign In
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
