import { Inbox, AlertTriangle } from "lucide-react";
import Button from "./Button";

export const EmptyState = ({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  className = "",
}) => (
  <div className={`flex flex-col items-center justify-center text-center py-12 px-6 ${className}`}>
    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface2 text-muted">
      <Icon size={26} />
    </div>
    <h3 className="font-display font-semibold text-ink text-base mb-1.5">{title}</h3>
    {description && <p className="text-sm text-muted max-w-sm mb-5">{description}</p>}
    {actionLabel && onAction && (
      <Button onClick={onAction} size="sm">
        {actionLabel}
      </Button>
    )}
  </div>
);

export const ErrorState = ({
  title = "Something didn't load",
  description = "We couldn't reach the server. Check your connection and try again.",
  actionLabel = "Try again",
  onAction,
  className = "",
}) => (
  <div className={`flex flex-col items-center justify-center text-center py-12 px-6 ${className}`}>
    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-danger/10 text-danger">
      <AlertTriangle size={26} />
    </div>
    <h3 className="font-display font-semibold text-ink text-base mb-1.5">{title}</h3>
    <p className="text-sm text-muted max-w-sm mb-5">{description}</p>
    {onAction && (
      <Button onClick={onAction} size="sm" variant="secondary">
        {actionLabel}
      </Button>
    )}
  </div>
);
