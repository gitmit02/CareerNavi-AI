import { MapPin, ExternalLink, Check, Plus, Layers } from "lucide-react";
import Card from "../ui/Card";
import Badge from "../ui/Badge";

const PORTAL_STYLES = {
  "Naukri.com": "border-primary/40 bg-primary/15 text-primary-light hover:bg-primary hover:text-white",
  "LinkedIn India": "border-accent-2/40 bg-accent-2/15 text-accent-2 hover:bg-accent-2 hover:text-white",
  Internshala: "border-accent/40 bg-accent/15 text-accent hover:bg-accent hover:text-white",
  Unstop: "border-success/40 bg-success/15 text-success hover:bg-success hover:text-white",
  "Indeed India": "border-border bg-surface2 text-ink hover:border-primary/50 hover:text-primary-light",
};

const OpportunityCard = ({ item }) => {
  const isHighMatch = item.matchScore >= 65;

  return (
    <Card className="flex flex-col justify-between gap-4 !p-5 sm:!p-6 hover:border-primary/45 transition-all">
      <div>
        {/* Top Row: Category + Match Score */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="min-w-0">
            <span className="coord-label text-primary-light flex items-center gap-1.5 mb-1">
              <Layers size={12} /> {item.category || "Tech Role"}
            </span>
            <h3 className="font-display text-lg sm:text-xl font-bold text-ink leading-snug">
              {item.title}
            </h3>
          </div>

          <div className="shrink-0 text-right">
            <span
              className={`inline-flex items-center rounded-xl border px-2.5 py-1 font-mono text-sm font-bold ${
                isHighMatch
                  ? "border-success/40 bg-success/15 text-success"
                  : "border-primary/35 bg-primary/15 text-primary-light"
              }`}
            >
              {item.matchScore}% Match
            </span>
          </div>
        </div>

        {/* Common Industry Role Aliases (Decodes confusing role titles) */}
        {item.alsoKnownAs?.length > 0 && (
          <p className="text-xs text-muted mb-2.5">
            <span className="font-mono uppercase tracking-wider text-[10px] text-ink/80 mr-1.5">
              Also called:
            </span>
            {item.alsoKnownAs.join(" · ")}
          </p>
        )}

        {/* Short 1-liner */}
        {item.oneLiner && (
          <p className="text-xs sm:text-sm text-muted leading-relaxed mb-3">{item.oneLiner}</p>
        )}

        {/* India Location Badge */}
        <div className="flex items-center gap-1.5 text-xs text-ink/90 font-medium mb-4 bg-surface2/70 border border-border rounded-xl px-3 py-2">
          <MapPin size={13} className="text-primary-light shrink-0" />
          <span className="truncate">
            {item.locationSummary || "India (Bengaluru, Hyderabad, Pune, Delhi NCR, Mumbai & Remote)"}
          </span>
        </div>

        {/* Matched Skills vs Missing Skills to Build */}
        <div className="space-y-3">
          <div>
            <p className="coord-label text-success mb-1.5">
              Skills you already have ({item.matchedSkills?.length || 0}/{item.totalRequired || 0})
            </p>
            {item.matchedSkills?.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {item.matchedSkills.map((s) => (
                  <Badge key={`m-${s}`} variant="success">
                    <Check size={11} /> {s}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted italic">Add matching skills above or in your profile</p>
            )}
          </div>

          <div>
            <p className="coord-label text-accent mb-1.5">
              Skills to build for 100% role match
            </p>
            {item.missingSkills?.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {item.missingSkills.map((s) => (
                  <Badge key={`x-${s}`} variant="danger">
                    <Plus size={11} /> {s}
                  </Badge>
                ))}
              </div>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-display font-semibold text-success">
                <Check size={13} /> You have all core skills for this role!
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Direct Apply Portal Links (Naukri.com, LinkedIn India, Internshala, Unstop, Indeed India) */}
      <div className="pt-4 border-t border-border">
        <p className="coord-label text-muted mb-2.5">
          Apply directly on active India portals (Jobs & Internships)
        </p>
        <div className="flex flex-wrap gap-2">
          {(item.applyLinks || []).map((link) => (
            <a
              key={link.platform}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              title={`${link.platform} — ${link.type}`}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-display font-semibold transition-all active:scale-95 ${
                PORTAL_STYLES[link.platform] || PORTAL_STYLES["Indeed India"]
              }`}
            >
              <span>{link.platform}</span>
              <ExternalLink size={12} />
            </a>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default OpportunityCard;
