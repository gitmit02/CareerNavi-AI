import { useCallback, useEffect, useState } from "react";
import { ShieldCheck, Gauge } from "lucide-react";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import { getAiUsage } from "../../api/ai.service";

const Stat = ({ label, value }) => (
  <div>
    <p className="coord-label text-muted">{label}</p>
    <p className="font-display font-semibold text-ink">{value}</p>
  </div>
);

/** Small "AI gateway" monitor: which gateway is active, today's limit, tokens and cache hits. */
const AiUsageStrip = ({ refreshKey = 0 }) => {
  const [usage, setUsage] = useState(null);

  const load = useCallback(() => {
    getAiUsage().then((res) => setUsage(res.data)).catch(() => setUsage(null));
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  if (!usage) return null;
  const { gateway, today, last30Days: t } = usage;

  return (
    <Card className="!p-4 sm:!p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <h3 className="flex items-center gap-2 font-display font-semibold text-ink text-sm">
          <ShieldCheck size={16} className="text-primary" /> AI gateway
        </h3>
        <div className="flex flex-wrap gap-1.5">
          <Badge variant={gateway.gateway === "prune" ? "success" : "default"}>
            {gateway.gateway === "prune" ? "Prune AI active" : "Direct to Groq"}
          </Badge>
          <Badge>{gateway.model}</Badge>
          {t.fallbacks > 0 && <Badge variant="accent">{t.fallbacks} fallback{t.fallbacks > 1 ? "s" : ""}</Badge>}
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Stat label="Today" value={`${today.used} / ${today.limit}`} />
        <Stat label="30-day requests" value={t.requests} />
        <Stat label="30-day tokens" value={t.tokens.toLocaleString()} />
        <Stat label="Cache hits" value={t.cacheHits} />
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-xs text-muted">
        <Gauge size={12} /> Avg latency {t.avgLatencyMs} ms · AI results for opportunities are cached so repeat views cost nothing.
      </p>
    </Card>
  );
};

export default AiUsageStrip;
