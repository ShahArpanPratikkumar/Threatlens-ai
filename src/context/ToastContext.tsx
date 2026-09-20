import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertTriangle, AlertOctagon, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'warning' | 'error' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info', duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        dismissToast(id);
      }, duration);
    }
  }, [dismissToast]);

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => {
            const icons = {
              success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
              warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
              error: <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0" />,
              info: <Info className="w-5 h-5 text-cyan-400 shrink-0" />,
            };

            const styles = {
              success:
                'border-emerald-500/40 bg-white/95 dark:bg-[#071710]/95 text-slate-900 dark:text-emerald-100 shadow-emerald-500/10',
              warning:
                'border-amber-500/40 bg-white/95 dark:bg-[#1c160c]/95 text-slate-900 dark:text-amber-100 shadow-amber-500/10',
              error:
                'border-rose-500/40 bg-white/95 dark:bg-[#1f0b10]/95 text-slate-900 dark:text-rose-100 shadow-rose-500/10',
              info:
                'border-cyan-500/40 bg-white/95 dark:bg-[#09151f]/95 text-slate-900 dark:text-cyan-100 shadow-cyan-500/10',
            };

            return (
              <motion.div
                key={toast.id}
                id={`toast-${toast.id}`}
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-2xl border backdrop-blur-xl shadow-2xl text-sm ${styles[toast.type]}`}
              >
                <div className="flex items-center gap-2.5">
                  {icons[toast.type]}
                  <span className="font-medium text-xs leading-relaxed font-mono">{toast.message}</span>
                </div>
                <button
                  id={`toast-dismiss-${toast.id}`}
                  onClick={() => dismissToast(toast.id)}
                  className="p-1 hover:bg-slate-200/50 dark:hover:bg-white/10 rounded-md transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5 opacity-60 hover:opacity-100" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
