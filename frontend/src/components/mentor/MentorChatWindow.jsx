import { useEffect, useRef, useState } from "react";
import { Send, Sparkles, User as UserIcon } from "lucide-react";
import { askMentor } from "../../api/chat.service";
import { useToast } from "../../hooks/useToast";

const SUGGESTIONS = [
  "How do I prepare for internship interviews?",
  "What skills should I learn for a data analyst role?",
  "How do I build a portfolio with no experience?",
];

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
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-1 py-2 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 py-8">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Sparkles size={22} />
            </div>
            <p className="font-display font-semibold text-ink text-sm mb-1">Ask your AI career mentor</p>
            <p className="text-xs text-muted mb-4 max-w-xs">
              Get quick, practical guidance on skills, internships, interviews, and more.
            </p>
            <div className="flex flex-col gap-2 w-full max-w-xs">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-left text-xs rounded-xl border border-border bg-surface2 px-3 py-2 text-muted hover:text-ink hover:border-primary/40 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex gap-2.5 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                m.role === "user" ? "bg-primary text-white" : "bg-accent/20 text-accent-2"
              }`}
            >
              {m.role === "user" ? <UserIcon size={13} /> : <Sparkles size={13} />}
            </div>
            <div
              className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-primary text-white rounded-tr-sm"
                  : `bg-surface2 text-ink rounded-tl-sm ${m.isError ? "text-danger" : ""}`
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent-2">
              <Sparkles size={13} />
            </div>
            <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-surface2 px-4 py-3">
              <span className="h-1.5 w-1.5 rounded-full bg-muted animate-typing" style={{ animationDelay: "0ms" }} />
              <span className="h-1.5 w-1.5 rounded-full bg-muted animate-typing" style={{ animationDelay: "150ms" }} />
              <span className="h-1.5 w-1.5 rounded-full bg-muted animate-typing" style={{ animationDelay: "300ms" }} />
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
