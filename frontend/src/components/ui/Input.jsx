const baseClasses =
  "w-full rounded-xl border bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30";

export const Input = ({ label, error, hint, className = "", id, ...rest }) => {
  const inputId = id || rest.name;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`${baseClasses} ${
          error ? "border-danger focus:ring-danger/30" : "border-border focus:border-primary"
        } ${className}`}
        {...rest}
      />
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
      {!error && hint && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
    </div>
  );
};

export const Textarea = ({ label, error, hint, className = "", id, rows = 4, ...rest }) => {
  const inputId = id || rest.name;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        rows={rows}
        className={`${baseClasses} resize-none ${
          error ? "border-danger focus:ring-danger/30" : "border-border focus:border-primary"
        } ${className}`}
        {...rest}
      />
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
      {!error && hint && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
    </div>
  );
};

export default Input;
