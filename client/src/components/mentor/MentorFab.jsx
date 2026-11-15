import { useState } from "react";
import { Sparkles, X } from "lucide-react";
import { useLocation } from "react-router-dom";
import MentorChatWindow from "./MentorChatWindow";

const MentorFab = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Don't show the floating button on the dedicated mentor page (avoid duplicate chat UIs)
  if (location.pathname === "/mentor") return null;

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close AI mentor chat" : "Open AI mentor chat"}
        className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary via-[#f43f5e] to-primary-dark text-white border border-primary-light/40 shadow-crimson hover:scale-105 transition-all active:scale-95"
      >
        {open ? <X size={22} /> : <Sparkles size={22} />}
      </button>

      {open && (
        <div className="fixed bottom-36 right-4 lg:bottom-24 lg:right-6 z-40 w-[calc(100%-2rem)] max-w-sm h-[65vh] max-h-[520px] rounded-2xl border border-primary/40 bg-surface/95 backdrop-blur-xl shadow-crimson p-4 animate-fade-in flex flex-col">
          <div className="flex items-center justify-between mb-1.5 shrink-0 pb-2 border-b border-border/80">
            <p className="font-display font-bold text-sm text-ink flex items-center gap-1.5">
              <Sparkles size={14} className="text-primary-light" /> AI Career Mentor
            </p>
            <span className="coord-label text-success">● online</span>
          </div>
          <MentorChatWindow compact />
        </div>
      )}
    </>
  );
};

export default MentorFab;
