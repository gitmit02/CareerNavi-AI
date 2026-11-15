import { useEffect, useRef, useState } from "react";
import { Send, Sparkles, User as UserIcon, CheckCircle2 } from "lucide-react";
import { askMentor } from "../../api/chat.service";
import { useToast } from "../../hooks/useToast";

const SUGGESTIONS = [
  "How do I prepare for internship interviews?",
  "What skills should I learn for a data analyst role?",
  "How do I build a portfolio with no experience?",
];

/**
 * Formats inline **bold** segments with a distinct bold font style.
 */
const renderInlineText = (text = "") => {
  const cleaned = String(text).trim();
  const parts = cleaned.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      const inner = part.slice(2, -2).trim();
      return (
        <strong key={idx} className="font-display font-bold text-ink tracking-tight">
          {inner}
        </strong>
      );
    }
    return <span key={idx}>{part}</span>;
  });
};

/**
 * Ensures proper ending punctuation on a point if missing.
 */
const ensurePunctuation = (str = "") => {
  const s = String(str).trim();
  if (!s) return "";
  if (/[.!?):]$/.test(s)) return s;
  return `${s}.`;
};

/**
 * Parses a mentor text response into structured headings, intro summary, and bullet points.
 * If the response is a single long paragraph without bullets, automatically breaks sentences into points.
 */
const parseStructuredReply = (rawText = "") => {
  const lines = String(rawText || "")
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const blocks = [];
  let currentList = [];

  const flushList = () => {
    if (currentList.length) {
      blocks.push({ type: "list", items: currentList });
      currentList = [];
    }
  };

  for (const line of lines) {
    // 1. Markdown Heading (e.g. ### Heading or ## Heading)
    if (/^#{1,4}\s+/.test(line)) {
      flushList();
      const title = line.replace(/^#{1,4}\s+/, "").replace(/\*\*/g, "").replace(/:$/, "").trim();
      blocks.push({ type: "heading", text: title });
      continue;
    }

    // 2. Standalone Bold Heading line (e.g. **Key Skills to Learn:** or **1. Preparation Strategy**)
    if (/^\*\*[^*]+\*\*:?$/.test(line)) {
      flushList();
      const title = line.replace(/\*\*/g, "").replace(/:$/, "").trim();
      blocks.push({ type: "heading", text: title });
      continue;
    }

    // 3. Bullet point (-, *, •) or Numbered point (1., 2.)
    const bulletMatch = line.match(/^(?:[-*•]|\d+[.)])\s+(.*)$/);
    if (bulletMatch) {
      currentList.push(ensurePunctuation(bulletMatch[1]));
      continue;
    }

    // 4. Plain line: if it's short and ends with a colon, treat as heading
    if (line.endsWith(":") && line.length < 65) {
      flushList();
      blocks.push({ type: "heading", text: line.slice(0, -1).replace(/\*\*/g, "").trim() });
      continue;
    }

    // 5. Otherwise, if it's a long paragraph (> 160 chars) and there are no bullets yet, split sentences into points
    const sentences = line
      .split(/(?<=[.!?])\s+(?=[A-Z0-9*])/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (sentences.length > 2) {
      // First sentence as summary if it's the very beginning, rest as bullet points
      if (blocks.length === 0 && currentList.length === 0) {
        blocks.push({ type: "intro", text: ensurePunctuation(sentences[0]) });
        sentences.slice(1).forEach((s) => currentList.push(ensurePunctuation(s)));
      } else {
        sentences.forEach((s) => currentList.push(ensurePunctuation(s)));
      }
    } else if (blocks.length === 0 && currentList.length === 0) {
      blocks.push({ type: "intro", text: ensurePunctuation(line) });
    } else {
      currentList.push(ensurePunctuation(line));
    }
  }

  flushList();
  return blocks;
};

const MentorReplyContent = ({ text, isError }) => {
  if (isError) {
    return <p className="text-sm text-danger font-medium">{text}</p>;
  }

  const blocks = parseStructuredReply(text);

  return (
    <div className="space-y-3.5 text-sm leading-relaxed">
      {blocks.map((block, i) => {
        if (block.type === "intro") {
          return (
            <p key={i} className="text-ink/95 font-body leading-relaxed pb-1 border-b border-border/70">
              {renderInlineText(block.text)}
            </p>
          );
        }

        if (block.type === "heading") {
          return (
            <div key={i} className="pt-1.5 first:pt-0">
              <h4 className="font-serif italic font-bold text-base sm:text-lg text-primary-light tracking-wide flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <span className="font-display not-italic font-extrabold text-ink text-[15px] tracking-tight">
                  {block.text}
                </span>
              </h4>
            </div>
          );
        }

        if (block.type === "list") {
          return (
            <ul key={i} className="space-y-2.5 pl-1">
              {block.items.map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 rounded-xl bg-surface/65 border border-border/60 px-3 py-2 text-ink/90"
                >
                  <CheckCircle2 size={14} className="mt-1 shrink-0 text-primary-light" />
                  <span className="flex-1 leading-relaxed">{renderInlineText(item)}</span>
                </li>
              ))}
            </ul>
          );
        }

        return null;
      })}
    </div>
  );
};

/**
 * Stateless chat: each question is sent independently to /api/chat/ask.
 * We keep messages in local component state only for display — nothing
 * is persisted or sent back to the backend as history (per Phase 1 scope).
 */
const MentorChatWindow = ({ compact = false }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);
  const { toast } = useToast();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  const send = async (question) => {
    const q = (question ?? input).trim();
    if (!q || sending) return;

    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setInput("");
    setSending(true);

    try {
      const res = await askMentor(q);
      setMessages((prev) => [...prev, { role: "mentor", text: res.data.answer }]);
    } catch (err) {
      toast.error(err.message || "The mentor couldn't respond. Please try again.");
      setMessages((prev) => [
        ...prev,
        { role: "mentor", text: "I couldn't process that just now — please try asking again.", isError: true },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    send();
  };

  return (
    <div className="flex h-full flex-col">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-1 py-2 space-y-5">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 py-8">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Sparkles size={22} />
            </div>
            <p className="font-display font-bold text-ink text-base mb-1">Ask your AI Career Mentor</p>
            <p className="text-xs text-muted mb-5 max-w-xs">
              Get structured, point-by-point guidance on skills, internships, interviews, and career paths.
            </p>
            <div className="flex flex-col gap-2 w-full max-w-sm">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-left text-xs rounded-xl border border-border bg-surface2 px-3.5 py-2.5 text-muted hover:text-ink hover:border-primary/40 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                m.role === "user"
                  ? "bg-primary text-white shadow-sm"
                  : "bg-primary/15 text-primary-light border border-primary/30"
              }`}
            >
              {m.role === "user" ? <UserIcon size={14} /> : <Sparkles size={14} />}
            </div>

            <div
              className={`${
                m.role === "user"
                  ? "max-w-[80%] bg-primary text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm leading-relaxed shadow-sm"
                  : `${
                      compact ? "max-w-[88%]" : "max-w-[85%] sm:max-w-[78%]"
                    } bg-surface2/90 border border-border rounded-2xl rounded-tl-sm px-4 py-3.5 sm:px-5 sm:py-4 text-ink shadow-card`
              }`}
            >
              {m.role === "user" ? m.text : <MentorReplyContent text={m.text} isError={m.isError} />}
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary-light border border-primary/30">
              <Sparkles size={14} />
            </div>
            <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-border bg-surface2 px-4 py-3">
              <span className="h-1.5 w-1.5 rounded-full bg-primary-light animate-typing" style={{ animationDelay: "0ms" }} />
              <span className="h-1.5 w-1.5 rounded-full bg-primary-light animate-typing" style={{ animationDelay: "150ms" }} />
              <span className="h-1.5 w-1.5 rounded-full bg-primary-light animate-typing" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-3 border-t border-border mt-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about careers, skills, internships…"
          className="flex-1 rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          aria-label="Send message"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white disabled:opacity-40 hover:bg-primary-dark transition-colors"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};

export default MentorChatWindow;
