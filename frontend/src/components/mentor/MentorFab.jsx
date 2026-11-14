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
        className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-soft hover:bg-primary-dark transition-all active:scale-95"
      >
        {open ? <X size={22} /> : <Sparkles size={22} />}
      </button>

      {open && (
        <div className="fixed bottom-36 right-4 lg:bottom-24 lg:right-6 z-40 w-[calc(100%-2rem)] max-w-sm h-[65vh] max-h-[520px] rounded-2xl border border-border bg-surface shadow-soft p-4 animate-fade-in flex flex-col">
          <div className="flex items-center justify-between mb-1 shrink-0">
            <p className="font-display font-semibold text-sm text-ink">AI Career Mentor</p>
            <span className="coord-label text-accent-2">● online</span>
          </div>
          <MentorChatWindow compact />
        </div>
      )}
    </>
  );
};

export default MentorFab;
