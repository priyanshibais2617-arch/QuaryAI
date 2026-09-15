import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import AntiGravityWrapper from './AntiGravityWrapper';
import AuthForm from './AuthForm';

/**
 * AuthModal:
 * High-tech floating popup modal for Sign In and Sign Up.
 * Blurs the underlying application background and presents
 * the minimal anti-gravity authentication card.
 */
export default function AuthModal({
  isOpen,
  initialMode = 'signin',
  onClose,
  onNavigate,
}) {
  // ESC key and body scroll lock
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          {/* Frosted Glass Backdrop with Blur and Dimming */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#04060A]/75 backdrop-blur-md sm:backdrop-blur-xl transition-all"
            aria-hidden="true"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: 'spring', damping: 28, stiffness: 340 }}
            className="relative z-10 w-full max-w-[460px] my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* High-Tech Close Button */}
            <button
              type="button"
              id="auth-modal-close-btn"
              onClick={onClose}
              className="absolute -top-3.5 -right-2 sm:-right-3.5 z-50 p-2 rounded-full bg-[#0B111D] border border-cyan-500/40 text-slate-300 hover:text-white hover:border-cyan-400 hover:bg-cyan-500/15 transition-all shadow-xl cursor-pointer group flex items-center justify-center"
              title="Close modal (Esc)"
              aria-label="Close modal"
            >
              <X className="w-4 h-4 group-hover:scale-110 transition-transform text-cyan-400 group-hover:text-cyan-300" />
            </button>

            {/* AntiGravity Floating Auth Card */}
            <AntiGravityWrapper>
              <AuthForm
                initialMode={initialMode}
                onNavigate={onNavigate}
                onSuccessfulAuth={onClose}
              />
            </AntiGravityWrapper>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
