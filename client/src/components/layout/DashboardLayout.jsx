import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import Topbar from "./Topbar";
import MentorFab from "../mentor/MentorFab";

const DashboardLayout = ({ children, title, subtitle }) => {
  return (
    <div className="relative flex min-h-screen bg-bg lg:h-screen lg:min-h-0 lg:overflow-hidden">
      {/* Ambient crimson & champagne-gold glow orbs */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        <div className="absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-primary/15 blur-[130px]" />
        <div className="absolute top-1/3 -right-24 h-80 w-80 rounded-full bg-accent/10 blur-[120px]" />
        <div className="absolute -bottom-32 left-1/2 h-96 w-96 rounded-full bg-primary-dark/20 blur-[140px]" />
      </div>

      <Sidebar />
      <div className="relative z-10 flex-1 min-w-0 flex flex-col lg:h-screen lg:overflow-y-auto">
        <MobileNav />
        <Topbar title={title} subtitle={subtitle} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8 pb-24 lg:pb-10 max-w-7xl w-full mx-auto animate-fade-in">
          {/* Mobile page title (Topbar is desktop-only) */}
          <div className="lg:hidden mb-6">
            <h1 className="font-display text-2xl font-bold text-ink tracking-tight">{title}</h1>
            {subtitle && <p className="text-sm text-muted mt-1">{subtitle}</p>}
          </div>
          {children}
        </main>
      </div>
      <MentorFab />
    </div>
  );
};

export default DashboardLayout;
