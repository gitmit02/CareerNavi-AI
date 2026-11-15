import { useEffect, useState } from "react";
import { X, ExternalLink, CheckCircle2, AlertTriangle, XCircle, Info, Sparkles, RefreshCw, Clock } from "lucide-react";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import Card from "../ui/Card";
import { Skeleton } from "../ui/Skeleton";
import { ErrorState } from "../ui/EmptyState";
import { useToast } from "../../hooks/useToast";
import { getOpportunity, analyzeOpportunity } from "../../api/opportunity.service";
import { VERDICT, TYPE_LABEL, SOURCE_LABEL } from "./verdict";

const REASON_ICON = {
  pass: { Icon: CheckCircle2, cls: "text-success" },
  warn: { Icon: AlertTriangle, cls: "text-accent-2" },
  fail: { Icon: XCircle, cls: "text-danger" },
  info: { Icon: Info, cls: "text-muted" },
};

const Section = ({ title, children }) => (
  <section>
    <h3 className="font-display font-semibold text-ink mb-2.5">{title}</h3>
    {children}
  </section>
);

const AiPlan = ({ ai }) => (
  <div className="space-y-5">
    {ai.summary && <p className="text-sm text-ink leading-relaxed">{ai.summary}</p>}

    {ai.eligibilityExplanation && (
      <Section title="Eligibility explained">
        <p className="text-sm text-muted leading-relaxed">{ai.eligibilityExplanation}</p>
      </Section>
    )}

    {ai.missingSkills.length > 0 && (
      <Section title="Missing skills & requirements">
        <ul className="space-y-2">
          {ai.missingSkills.map((m) => (
            <li key={m.skill} className="text-sm">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-medium text-ink">{m.skill}</span>
                <Badge variant={m.importance === "required" ? "danger" : "default"}>{m.importance}</Badge>
                {m.basis === "typical-for-role" && <Badge variant="accent">typical for this role, not in the listing</Badge>}
              </div>
              {m.whyItMatters && <p className="text-muted mt-0.5">{m.whyItMatters}</p>}
            </li>
          ))}
        </ul>
      </Section>
    )}

    {ai.learnBeforeApplying.length > 0 && (
      <Section title="Learn / improve before applying">
        <ul className="space-y-3">
          {ai.learnBeforeApplying.map((l) => (
            <li key={l.topic} className="rounded-xl border border-border bg-surface2 p-3 text-sm">
              <p className="font-medium text-ink">{l.topic}</p>
              {l.action && <p className="text-muted mt-0.5">{l.action}</p>}
              <p className="coord-label text-muted mt-1.5">
                {[l.resourceType, l.timeEstimate].filter(Boolean).join(" · ")}
              </p>
            </li>
          ))}
        </ul>
      </Section>
    )}

    {ai.preparationRoadmap.steps.length > 0 && (
      <Section title={`Your preparation roadmap${ai.preparationRoadmap.totalWeeks ? ` (~${ai.preparationRoadmap.totalWeeks} weeks)` : ""}`}>
        <ol className="space-y-3">
          {ai.preparationRoadmap.steps.map((s, i) => (
            <li key={i} className="relative rounded-xl border border-border bg-surface p-3.5">
              <div className="flex items-center justify-between gap-3 mb-1">
                <span className="coord-label text-primary">Step {String(i + 1).padStart(2, "0")}</span>
                {s.duration && (
                  <span className="flex items-center gap-1 coord-label text-muted">
                    <Clock size={11} /> {s.duration}
                  </span>
                )}
              </div>
              <p className="font-display font-semibold text-ink text-sm">{s.title}</p>
              {s.description && <p className="text-sm text-muted mt-1 leading-relaxed">{s.description}</p>}
            </li>
          ))}
        </ol>
      </Section>
    )}

    {ai.applicationTips.length > 0 && (
      <Section title="Application tips">
        <ul className="list-disc pl-5 space-y-1 text-sm text-muted">
          {ai.applicationTips.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      </Section>
    )}

    {ai.caveats.length > 0 && (
      <div className="rounded-xl border border-accent/30 bg-accent/10 p-3.5 text-sm text-ink">
        <p className="font-medium mb-1">Verify on the official posting</p>
        <ul className="list-disc pl-5 space-y-1 text-muted">
          {ai.caveats.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      </div>
    )}
  </div>
);

const OpportunityDetail = ({ id, onClose, onAnalyzed }) => {
  const { toast } = useToast();
  const [state, setState] = useState({ loading: true, error: false, data: null });
  const [ai, setAi] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    let mounted = true;
    setState({ loading: true, error: false, data: null });
    setAi(null);
    getOpportunity(id)
      .then((res) => {
        if (!mounted) return;
        setState({ loading: false, error: false, data: res.data });
        setAi(res.data.ai);
      })
      .catch((err) => {
        if (!mounted) return;
        setState({ loading: false, error: true, data: null });
        toast.error(err.message || "Couldn't load this opportunity.");
      });
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const runAnalysis = async (refresh = false) => {
    setAnalyzing(true);
    try {
      const res = await analyzeOpportunity(id, refresh);
      setAi(res.data.ai);
      onAnalyzed?.();
      if (!res.data.cached) toast.success("AI plan ready.");
    } catch (err) {
      toast.error(err.message || "The AI couldn't analyse this right now. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const opp = state.data?.opportunity;
  const match = state.data?.match;
  const verdict = match ? VERDICT[match.verdict] || VERDICT.unclear : null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative h-full w-full max-w-2xl overflow-y-auto bg-bg border-l border-border p-5 sm:p-6 animate-fade-in">
        <button onClick={onClose} aria-label="Close" className="absolute right-4 top-4 rounded-lg p-2 text-muted hover:bg-surface2">
          <X size={18} />
        </button>

        {state.loading && (
          <div className="space-y-4 pt-8">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-40 w-full" />
          </div>
        )}
        {state.error && <ErrorState onAction={() => window.location.reload()} />}

        {opp && match && (
          <div className="space-y-6 pt-6">
            <div className="pr-10">
              <div className="flex flex-wrap gap-1.5 mb-2">
                <Badge variant="primary">{TYPE_LABEL[opp.type] || opp.type}</Badge>
                {opp.remote && <Badge>Remote</Badge>}
                <Badge variant={verdict.variant}>{verdict.label}</Badge>
              </div>
              <h2 className="font-display text-xl font-bold text-ink">{opp.title}</h2>
              <p className="text-sm text-muted mt-1">
                {[opp.company, opp.location].filter(Boolean).join(" · ")}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <a href={opp.url} target="_blank" rel="noopener noreferrer nofollow">
                  <Button size="sm" icon={ExternalLink} iconPosition="right">
                    View official posting
                  </Button>
                </a>
                <span className="coord-label text-muted">Source: {SOURCE_LABEL[opp.source] || opp.source}</span>
              </div>
            </div>

            <Card className="!p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-semibold text-ink">Your match</h3>
                <p className="font-display text-2xl font-bold text-primary">{match.matchScore}%</p>
              </div>
              <ul className="space-y-2.5">
                {match.reasons.map((r, i) => {
                  const { Icon, cls } = REASON_ICON[r.status] || REASON_ICON.info;
                  return (
                    <li key={i} className="flex gap-2.5 text-sm">
                      <Icon size={16} className={`mt-0.5 shrink-0 ${cls}`} />
                      <span className="text-ink leading-relaxed">{r.text}</span>
                    </li>
                  );
                })}
              </ul>
              <p className="coord-label text-muted mt-4">
                Based on the listing text and your saved profile. Always confirm on the official posting.
              </p>
            </Card>

            <Section title="Skills">
              <div className="space-y-3">
                {match.matchedSkills.length > 0 && (
                  <div>
                    <p className="coord-label text-muted mb-1.5">You have</p>
                    <div className="flex flex-wrap gap-1.5">
                      {match.matchedSkills.map((s) => (
                        <Badge key={s} variant="success">{s}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {match.missingSkills.length > 0 && (
                  <div>
                    <p className="coord-label text-muted mb-1.5">Required, missing</p>
                    <div className="flex flex-wrap gap-1.5">
                      {match.missingSkills.map((s) => (
                        <Badge key={s} variant="danger">{s}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {match.preferredMissing.length > 0 && (
                  <div>
                    <p className="coord-label text-muted mb-1.5">Nice to have, missing</p>
                    <div className="flex flex-wrap gap-1.5">
                      {match.preferredMissing.map((s) => (
                        <Badge key={s}>{s}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {!match.matchedSkills.length && !match.missingSkills.length && !match.preferredMissing.length && (
                  <p className="text-sm text-muted">No specific skills could be read from this listing.</p>
                )}
              </div>
            </Section>

            {opp.description && (
              <Section title="From the listing">
                <p className="text-sm text-muted leading-relaxed whitespace-pre-line">
                  {opp.description.slice(0, 900)}
                  {opp.description.length > 900 ? "…" : ""}
                </p>
                {opp.partialDescription && (
                  <p className="coord-label text-muted mt-2">Excerpt only — open the posting for the full requirements.</p>
                )}
              </Section>
            )}

            <Card className="!p-5">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h3 className="flex items-center gap-2 font-display font-semibold text-ink">
                  <Sparkles size={16} className="text-accent-2" /> AI preparation plan
                </h3>
                {ai && (
                  <Button variant="ghost" size="sm" icon={RefreshCw} loading={analyzing} onClick={() => runAnalysis(true)}>
                    Regenerate
                  </Button>
                )}
              </div>
              {ai ? (
                <AiPlan ai={ai} />
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted mb-4 max-w-sm mx-auto">
                    Get a plain-language eligibility explanation, what to learn first, and a week-by-week plan for this
                    specific opportunity.
                  </p>
                  <Button icon={Sparkles} loading={analyzing} onClick={() => runAnalysis(false)}>
                    {analyzing ? "Analysing…" : "Generate AI plan"}
                  </Button>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default OpportunityDetail;
