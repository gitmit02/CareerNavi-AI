import { useState } from "react";
import { Check, Flag, Navigation, Trophy, Sparkles, Lock } from "lucide-react";
import StepCard from "./StepCard";

/**
 * Interactive Centerpiece Career Highway
 * Enforces strict sequential increasing order:
 * - Only the first incomplete step (`firstIncompleteIndex`) is unlocked to be ticked off next.
 * - Future steps (`i > firstIncompleteIndex`) are locked until all prior steps are completed.
 * - Only the latest completed step (`lastCompletedIndex`) can be unchecked so sequence is never broken.
 */
const RoadmapTimeline = ({
  steps = [],
  allSteps,
  onToggleStep,
  updatingStepId,
  careerPath = "Target Role",
}) => {
  const masterSteps = allSteps || steps;
  const firstIncompleteIndex = masterSteps.findIndex((s) => !s.completed);
  const lastCompletedIndex =
    firstIncompleteIndex === -1 ? masterSteps.length - 1 : firstIncompleteIndex - 1;

  const activeIndex = firstIncompleteIndex === -1 ? masterSteps.length - 1 : firstIncompleteIndex;
  const [selectedId, setSelectedId] = useState(
    masterSteps[activeIndex]?._id || masterSteps[0]?._id || null
  );

  const completedCount = masterSteps.filter((s) => s.completed).length;
  const totalCount = masterSteps.length;
  const progressPercent = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="relative mx-auto max-w-5xl py-4 select-none sm:select-auto">
      {/* ============================================================
          START OF THE ROAD — ORIGIN PLAZA (CENTERED)
          ============================================================ */}
      <div className="relative z-20 flex flex-col items-center text-center mb-10">
        <div className="inline-flex items-center gap-2.5 rounded-2xl border border-border bg-surface px-4 py-2.5 shadow-soft">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
            <Navigation size={15} className="rotate-45" />
          </span>
          <div className="text-left">
            <p className="coord-label text-primary-light">Highway Origin · Sequential Progression</p>
            <p className="font-display text-sm font-bold text-ink">
              {completedCount === 0
                ? "Start at Stop 01 — Milestones unlock in sequential order"
                : completedCount === totalCount
                ? "All Highway Stops Cleared!"
                : `${completedCount} of ${totalCount} Stops Cleared · Next Up: Stop ${String(
                    firstIncompleteIndex + 1
                  ).padStart(2, "0")}`}
            </p>
          </div>
        </div>
      </div>

      {/* ============================================================
          THE MAIN HIGHWAY SPINE + MILESTONE STOPS
          ============================================================ */}
      <div className="relative">
        {/* Desktop Central Road Ribbon */}
        <div
          aria-hidden="true"
          className="hidden lg:block absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-14 rounded-full border-x-2 border-[var(--road-border)] bg-[var(--road-asphalt)] shadow-[inset_0_0_20px_rgba(0,0,0,0.65),0_0_30px_-8px_rgba(var(--c-primary-rgb),0.25)] overflow-hidden"
        >
          <div className="absolute inset-y-0 left-1.5 w-px bg-white/10" />
          <div className="absolute inset-y-0 right-1.5 w-px bg-white/10" />

          <div
            className="w-full bg-gradient-to-b from-success/25 via-primary/25 to-transparent transition-all duration-700"
            style={{ height: `${Math.max(8, progressPercent)}%` }}
          />

          <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
            <line
              x1="50%"
              y1="0"
              x2="50%"
              y2="100%"
              stroke="rgba(255,255,255,0.22)"
              strokeWidth="2.5"
              strokeDasharray="14 14"
            />
            <line
              x1="50%"
              y1="0"
              x2="50%"
              y2={`${Math.max(6, progressPercent)}%`}
              stroke="var(--c-primary-light)"
              strokeWidth="3"
              className="road-lane-dash"
            />
          </svg>
        </div>

        {/* Mobile Left-Aligned Highway Road Ribbon */}
        <div
          aria-hidden="true"
          className="lg:hidden absolute left-6 top-0 bottom-0 -translate-x-1/2 w-9 rounded-full border-x-2 border-[var(--road-border)] bg-[var(--road-asphalt)] shadow-inner overflow-hidden"
        >
          <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
            <line
              x1="50%"
              y1="0"
              x2="50%"
              y2="100%"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="2"
              strokeDasharray="10 12"
            />
            <line
              x1="50%"
              y1="0"
              x2="50%"
              y2={`${Math.max(6, progressPercent)}%`}
              stroke="var(--c-primary-light)"
              strokeWidth="2.5"
              className="road-lane-dash"
            />
          </svg>
        </div>

        {/* Steps along the road */}
        <div className="space-y-8 lg:space-y-12 relative z-10 py-4">
          {steps.map((step, idx) => {
            const masterIdx = masterSteps.findIndex((ms) => ms._id === step._id);
            const i = masterIdx !== -1 ? masterIdx : idx;
            const isLeft = i % 2 === 0;
            const isCurrent = i === firstIncompleteIndex;
            const isLocked = !step.completed && firstIncompleteIndex !== -1 && i > firstIncompleteIndex;
            const canUncheck = step.completed && i === lastCompletedIndex;
            const isUpdating = updatingStepId === step._id;
            const stepNum = String(i + 1).padStart(2, "0");
            const prevStepNum = String(i).padStart(2, "0");

            return (
              <div
                key={step._id || i}
                className="relative grid grid-cols-1 lg:grid-cols-[1fr_7rem_1fr] items-center gap-4 lg:gap-0 pl-14 lg:pl-0"
              >
                {/* LEFT COLUMN */}
                <div className={`${isLeft ? "lg:pr-6" : "hidden lg:flex lg:justify-end lg:pr-8"}`}>
                  {isLeft ? (
                    <StepCard
                      step={step}
                      index={i}
                      total={totalCount}
                      isCurrent={isCurrent}
                      isLocked={isLocked}
                      canUncheck={canUncheck}
                      isSelected={selectedId === step._id}
                      onSelect={setSelectedId}
                      onToggle={onToggleStep}
                      updating={isUpdating}
                    />
                  ) : (
                    <div className="text-right">
                      <span className="coord-label text-muted block">
                        {isLocked ? "Locked Milestone" : "Highway Marker"}
                      </span>
                      <span className="font-serif italic text-3xl font-bold text-ink/80">
                        Milestone {stepNum}
                      </span>
                      {step.duration && (
                        <span className="block text-xs font-mono text-primary-light mt-0.5">
                          {step.duration}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* CENTER COLUMN — THE ROAD CHECKPOINT NODE */}
                <div className="absolute left-6 lg:static lg:left-auto -translate-x-1/2 lg:translate-x-0 flex items-center justify-center">
                  {/* Horizontal paved ramp connector (Desktop) */}
                  <div
                    aria-hidden="true"
                    className={`hidden lg:block absolute top-1/2 -translate-y-1/2 h-2.5 w-10 border-y border-[var(--road-border)] bg-[var(--road-asphalt)] ${
                      isLeft ? "left-0 -translate-x-4" : "right-0 translate-x-4"
                    }`}
                  >
                    <div
                      className={`h-0.5 w-full mt-[3px] ${
                        step.completed ? "bg-success" : isCurrent ? "bg-primary-light" : "bg-white/15"
                      }`}
                    />
                  </div>

                  {/* Interactive Checkpoint Button on the Road */}
                  <div className="relative flex flex-col items-center">
                    {isCurrent && !step.completed && (
                      <span className="hidden lg:inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-white shadow-crimson mb-2 animate-bounce">
                        <Sparkles size={10} /> Current Stop
                      </span>
                    )}

                    <button
                      type="button"
                      disabled={isUpdating || isLocked || (step.completed && !canUncheck)}
                      onClick={() => onToggleStep(step._id, !step.completed, i)}
                      title={
                        isLocked
                          ? `Locked: Complete Stop ${prevStepNum} first`
                          : step.completed && !canUncheck
                          ? "Uncheck later milestones first"
                          : step.completed
                          ? "Click to mark incomplete"
                          : "Click to tick off this road stop"
                      }
                      aria-label={`Road checkpoint ${stepNum}: ${step.title}. ${
                        isLocked ? "Locked" : step.completed ? "Completed" : "Click to mark complete"
                      }`}
                      className={`relative z-10 flex h-11 w-11 lg:h-14 lg:w-14 items-center justify-center rounded-2xl border-2 font-mono text-xs lg:text-sm font-bold transition-all duration-300 ${
                        step.completed
                          ? canUncheck
                            ? "bg-success border-white/80 text-white shadow-[0_0_24px_rgba(16,185,129,0.75)] scale-105 active:scale-90"
                            : "bg-success/85 border-white/60 text-white shadow-[0_0_16px_rgba(16,185,129,0.5)] cursor-not-allowed"
                          : isCurrent
                          ? "bg-primary border-accent text-white shadow-[0_0_28px_rgba(var(--c-primary-rgb),0.85)] scale-110 ring-4 ring-primary/25 active:scale-95"
                          : "bg-surface border-border text-muted cursor-not-allowed opacity-75"
                      }`}
                    >
                      {step.completed ? (
                        <Check size={20} strokeWidth={3} />
                      ) : isLocked ? (
                        <Lock size={15} />
                      ) : (
                        stepNum
                      )}
                    </button>
                  </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className={`${!isLeft ? "lg:pl-6" : "hidden lg:flex lg:justify-start lg:pl-8"}`}>
                  {!isLeft ? (
                    <StepCard
                      step={step}
                      index={i}
                      total={totalCount}
                      isCurrent={isCurrent}
                      isLocked={isLocked}
                      canUncheck={canUncheck}
                      isSelected={selectedId === step._id}
                      onSelect={setSelectedId}
                      onToggle={onToggleStep}
                      updating={isUpdating}
                    />
                  ) : (
                    <div className="text-left">
                      <span className="coord-label text-muted block">
                        {isLocked ? "Locked Milestone" : "Highway Marker"}
                      </span>
                      <span className="font-serif italic text-3xl font-bold text-ink/80">
                        Milestone {stepNum}
                      </span>
                      {step.duration && (
                        <span className="block text-xs font-mono text-primary-light mt-0.5">
                          {step.duration}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================================================
          END OF THE ROAD — DESTINATION SUMMIT (CENTERED)
          ============================================================ */}
      <div className="relative z-20 flex flex-col items-center text-center mt-10">
        <div
          className={`inline-flex flex-col sm:flex-row items-center gap-4 rounded-2xl border px-6 py-4 transition-all ${
            progressPercent === 100
              ? "border-success bg-success/15 shadow-[0_0_35px_-5px_rgba(16,185,129,0.5)]"
              : "border-primary/40 bg-surface shadow-crimson"
          }`}
        >
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
              progressPercent === 100
                ? "bg-success text-white"
                : "bg-primary/15 text-primary-light border border-primary/30"
            }`}
          >
            {progressPercent === 100 ? <Trophy size={22} /> : <Flag size={22} />}
          </div>
          <div className="text-center sm:text-left">
            <p className="coord-label text-accent">Destination Summit</p>
            <p className="font-display text-lg font-bold text-ink">{careerPath}</p>
            <p className="text-xs text-muted">
              {progressPercent === 100
                ? "Congratulations! You've completed every milestone on this road."
                : `${totalCount - completedCount} milestone${
                    totalCount - completedCount === 1 ? "" : "s"
                  } remaining to reach your destination.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoadmapTimeline;
