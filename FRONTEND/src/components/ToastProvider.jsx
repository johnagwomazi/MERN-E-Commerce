import { createContext, useContext, useMemo, useState } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const toastStyles = {
  success: {
    border: 'border-emerald-500/20',
    icon: CheckCircle2,
    tone: 'text-emerald-700',
    bg: 'bg-emerald-50'
  },
  error: {
    border: 'border-rose-500/20',
    icon: AlertTriangle,
    tone: 'text-rose-700',
    bg: 'bg-rose-50'
  },
  info: {
    border: 'border-sky-500/20',
    icon: Info,
    tone: 'text-sky-700',
    bg: 'bg-sky-50'
  }
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = (id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  };

  const value = useMemo(
    () => ({
      toast: (message, type = 'info') => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        setToasts((current) => [...current, { id, message, type }]);
        window.setTimeout(() => removeToast(id), 4200);
      },
      success: (message) => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        setToasts((current) => [...current, { id, message, type: 'success' }]);
        window.setTimeout(() => removeToast(id), 4200);
      },
      error: (message) => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        setToasts((current) => [...current, { id, message, type: 'error' }]);
        window.setTimeout(() => removeToast(id), 5200);
      }
    }),
    []
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[60] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3 sm:right-6 sm:top-6">
        {toasts.map((toast) => {
          const style = toastStyles[toast.type] || toastStyles.info;
          const Icon = style.icon;

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 rounded-3xl border ${style.border} ${style.bg} px-4 py-3 shadow-[0_18px_50px_rgba(15,23,42,0.1)] backdrop-blur-xl`}
              role="status"
              aria-live="polite"
            >
              <Icon size={18} className={`mt-0.5 shrink-0 ${style.tone}`} />
              <p className="flex-1 text-sm font-medium text-ink">{toast.message}</p>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="rounded-full p-1 text-ink/45 transition hover:bg-ink/5 hover:text-ink"
                aria-label="Dismiss toast"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      toast: () => {},
      success: () => {},
      error: () => {}
    };
  }

  return context;
};

