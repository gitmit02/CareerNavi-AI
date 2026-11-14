import { createContext, useCallback, useState } from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

export const ToastContext = createContext(null);

let idCounter = 0;

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = "info", duration = 4000) => {
      const id = ++idCounter;
      setToasts((prev) => [...prev, { id, message, type }]);
      if (duration) {
        setTimeout(() => removeToast(id), duration);
      }
      return id;
    },
    [removeToast]
  );

  const toast = {
    success: (msg, d) => showToast(msg, "success", d),
    error: (msg, d) => showToast(msg, "error", d),
    info: (msg, d) => showToast(msg, "info", d),
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm sm:w-full">
        {toasts.map(({ id, message, type }) => {
          const Icon = ICONS[type] || Info;
          const colorClass =
            type === "success"
              ? "text-success"
              : type === "error"
              ? "text-danger"
              : "text-primary";
          return (
            <div
              key={id}
              role="status"
              className="animate-fade-in flex items-start gap-3 rounded-xl border border-border bg-surface px-4 py-3 shadow-soft"
            >
              <Icon size={18} className={`mt-0.5 shrink-0 ${colorClass}`} />
              <p className="flex-1 text-sm text-ink leading-snug">{message}</p>
              <button
                onClick={() => removeToast(id)}
                className="shrink-0 text-muted hover:text-ink transition-colors"
                aria-label="Dismiss notification"
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
