import StepCard from "./StepCard";

const RoadmapTimeline = ({ steps, onToggleStep, updatingStepId }) => (
  <div className="relative">
    {/* The connecting waypoint path line */}
    <svg className="absolute left-[13px] top-2 bottom-2 w-0.5" style={{ height: "calc(100% - 1rem)" }}>
      <line
        x1="0.5"
        y1="0"
        x2="0.5"
        y2="100%"
        stroke="var(--c-border)"
        strokeWidth="2"
        className="waypoint-dash"
      />
    </svg>

    <div className="space-y-5">
      {steps.map((step, i) => (
        <StepCard
          key={step._id || i}
          step={step}
          index={i}
          onToggle={onToggleStep}
          updating={updatingStepId === step._id}
        />
      ))}
    </div>
  </div>
);

export default RoadmapTimeline;
