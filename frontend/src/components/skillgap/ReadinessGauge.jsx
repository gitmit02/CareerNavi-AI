import ProgressRing from "../ui/ProgressRing";

const getColor = (score) => {
  if (score >= 70) return "var(--c-success)";
  if (score >= 40) return "var(--c-warning)";
  return "var(--c-danger)";
};

const ReadinessGauge = ({ score = 0, targetRole }) => (
  <div className="flex flex-col items-center text-center">
    <ProgressRing percent={score} size={140} strokeWidth={12} color={getColor(score)} />
    <p className="mt-4 coord-label text-muted">Readiness for</p>
    <p className="font-display font-semibold text-ink">{targetRole}</p>
  </div>
);

export default ReadinessGauge;
