import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import Topbar from "./Topbar";
import MentorFab from "../mentor/MentorFab";

const DashboardLayout = ({ children, title, subtitle }) => {
  return (
    <div className="flex min-h-screen bg-bg lg:h-screen lg:min-h-0 lg:overflow-hidden">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col lg:h-screen lg:overflow-y-auto">
        <MobileNav />
        <Topbar title={title} subtitle={subtitle} />
        <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-8 pb-24 lg:pb-8 max-w-7xl w-full mx-auto">
          {/* Mobile page title (Topbar is desktop-only) */}
          <div className="lg:hidden mb-5">
            <h1 className="font-display text-xl font-bold text-ink">{title}</h1>
            {subtitle && <p className="text-sm text-muted mt-0.5">{subtitle}</p>}
          </div>
          {children}
        </main>
      </div>
      <MentorFab />
    </div>
  );
};

export default DashboardLayout;
