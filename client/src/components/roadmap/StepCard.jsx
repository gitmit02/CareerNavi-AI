import { Check, Clock, Sparkles, Lock, CheckSquare, Square } from "lucide-react";

const getPhaseLabel = (index, total) => {
  const ratio = (index + 1) / Math.max(total, 1);
  if (ratio <= 0.25) return "Foundation";
  if (ratio <= 0.55) return "Core Build";
  if (ratio <= 0.8) return "Acceleration";
  return "Launch Readiness";
};

const StepCard = ({
  step,
  index,
  total = 6,
  isCurrent = false,
  isLocked = false,
  canUncheck = true,
  isSelected = false,
  onSelect,
  onToggle,
  updating = false,
}) => {
  const stepNumber = String(index + 1).padStart(2, "0");
  const phase = getPhaseLabel(index, total);
  const prevStepNumber = String(index).padStart(2, "0");

  return (
    <div
      onClick={() => onSelect?.(step._id)}
      className={`group relative rounded-2xl border transition-all duration-300 ${
        step.completed
          ? "bg-surface/90 border-success/40 shadow-card"
          : isCurrent
          ? "bg-surface border-primary shadow-crimson ring-1 ring-primary/30 -translate-y-0.5"
          : isLocked
          ? "bg-surface/60 border-border/70 opacity-75"
          : isSelected
          ? "bg-surface border-accent/60 shadow-soft"
          : "bg-surface border-border hover:border-primary/45 shadow-card"
      }`}
    >
      {/* Top accent bar */}
      <div
        className={`h-1 w-full rounded-t-2xl transition-colors ${
          step.completed
            ? "bg-gradient-to-r from-success via-success/80 to-accent-2"
            : isCurrent
            ? "bg-gradient-to-r from-primary via-primary-light to-accent"
            : "bg-transparent"
        }`}
      />

      <div className="p-5 sm:p-6">
        {/* Header row: Step badge + Phase + Sequential Tick-Off Checkbox */}
        <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center justify-center rounded-lg px-2.5 py-1 font-mono text-xs font-bold tracking-wider ${
                step.completed
                  ? "bg-success/15 text-success border border-success/30"
                  : isCurrent
                  ? "bg-primary text-white shadow-sm"
                  : "bg-surface2 text-muted border border-border"
              }`}
            >
              STOP {stepNumber}
            </span>
            <span className="coord-label text-muted">{phase}</span>
            {isCurrent && !step.completed && (
              <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 border border-accent/35 px-2.5 py-0.5 text-[11px] font-display font-semibold text-accent">
                <Sparkles size={11} /> Unlocked Next
              </span>
            )}
          </div>

          {/* Sequential Tick-off checkbox button */}
          <button
            type="button"
            role="checkbox"
            aria-checked={!!step.completed}
            disabled={updating || isLocked || (step.completed && !canUncheck)}
            onClick={(e) => {
              e.stopPropagation();
              onToggle(step._id, !step.completed, index);
            }}
            title={
              isLocked
                ? `Complete Stop ${prevStepNumber} first to unlock this step`
                : step.completed && !canUncheck
                ? "Uncheck later steps first to maintain sequential order"
                : step.completed
                ? "Mark step incomplete"
                : "Tick off step as complete"
            }
            aria-label={
              isLocked
                ? `Locked. Complete Stop ${prevStepNumber} first`
                : step.completed
                ? "Mark step incomplete"
                : "Tick off step as complete"
            }
            className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-display font-semibold transition-all ${
              step.completed
                ? canUncheck
                  ? "border-success/40 bg-success/15 text-success hover:bg-success/25 active:scale-95"
                  : "border-success/30 bg-success/10 text-success/80 cursor-not-allowed"
                : isLocked
                ? "border-border bg-surface2/60 text-muted cursor-not-allowed"
                : "border-primary/50 bg-primary/10 text-primary-light hover:bg-primary hover:text-white active:scale-95 shadow-sm"
            }`}
          >
            {isLocked ? (
              <>
                <Lock size={12} className="text-muted" />
                <span>Locked</span>
              </>
            ) : (
              <>
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
                    step.completed
                      ? "border-success bg-success text-white"
                      : "border-primary-light bg-surface"
                  }`}
                >
                  {step.completed && <Check size={11} strokeWidth={3} />}
                </span>
                <span>{updating ? "Saving…" : step.completed ? "Completed" : "Tick off step"}</span>
              </>
            )}
          </button>
        </div>

        {/* Title */}
        <h3
          className={`font-display text-lg font-bold leading-snug mb-2 transition-colors ${
            step.completed ? "line-through decoration-muted/60 text-muted" : "text-ink"
          }`}
        >
          {step.title}
        </h3>

        {/* Description */}
        {step.description && (
          <p className={`text-sm leading-relaxed ${step.completed ? "text-muted/75" : "text-muted"}`}>
            {step.description}
          </p>
        )}

        {/* Footer metadata */}
        <div className="mt-4 pt-3.5 border-t border-border/70 flex items-center justify-between gap-2 text-xs">
          {step.duration ? (
            <span className="inline-flex items-center gap-1.5 font-mono text-muted">
              <Clock size={13} className="text-primary-light" /> Est. {step.duration}
            </span>
          ) : (
            <span className="font-mono text-muted">Milestone #{index + 1}</span>
          )}

          <span className="inline-flex items-center gap-1 font-display font-medium text-muted">
            {step.completed ? (
              <>
                <CheckSquare size={13} className="text-success" /> Milestone cleared
              </>
            ) : isLocked ? (
              <>
                <Lock size={12} className="text-muted" /> Complete Stop {prevStepNumber} first
              </>
            ) : (
              <>
                <Square size={13} className="text-primary-light" /> Ready to tick off
              </>
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

export default StepCard;
