import { Check, Circle, Clock } from "lucide-react";

const StepCard = ({ step, index, onToggle, updating }) => (
  <div className="relative pl-10">
    {/* Waypoint node on the path line */}
    <button
      onClick={() => onToggle(step._id, !step.completed)}
      disabled={updating}
      aria-label={step.completed ? "Mark step incomplete" : "Mark step complete"}
      className={`absolute left-0 top-0.5 flex h-7 w-7 items-center justify-center rounded-full border-2 transition-colors disabled:opacity-60 ${
        step.completed
          ? "bg-success border-success text-white"
          : "bg-surface border-border text-muted hover:border-primary hover:text-primary"
      }`}
    >
      {step.completed ? <Check size={14} /> : <Circle size={8} fill="currentColor" />}
    </button>

    <div className={`rounded-2xl border border-border bg-surface p-4 sm:p-5 transition-opacity ${step.completed ? "opacity-70" : ""}`}>
      <div className="flex items-center justify-between gap-3 mb-1.5 flex-wrap">
        <span className="coord-label text-primary">Step {String(index + 1).padStart(2, "0")}</span>
        {step.duration && (
          <span className="flex items-center gap-1 coord-label text-muted">
            <Clock size={11} /> {step.duration}
          </span>
        )}
      </div>
      <h3 className={`font-display font-semibold text-ink mb-1 ${step.completed ? "line-through decoration-muted" : ""}`}>
        {step.title}
      </h3>
      {step.description && <p className="text-sm text-muted leading-relaxed">{step.description}</p>}
    </div>
  </div>
);

export default StepCard;
