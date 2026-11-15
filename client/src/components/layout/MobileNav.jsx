import { useState } from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Map, MessageCircle, TrendingUp, Menu, X, BarChart3, UserRound, LogOut, Briefcase } from "lucide-react";
import Logo from "../ui/Logo";
import ThemeToggle from "../ui/ThemeToggle";
import { useAuth } from "../../hooks/useAuth";

// Primary 4 items shown directly in the bottom bar; the rest live in the drawer
const BOTTOM_ITEMS = [
  { to: "/dashboard", label: "Home", icon: LayoutDashboard },
  { to: "/roadmap", label: "Roadmap", icon: Map },
  { to: "/mentor", label: "Mentor", icon: MessageCircle },
  { to: "/progress", label: "Progress", icon: TrendingUp },
];

const DRAWER_EXTRA = [
  { to: "/skill-gap", label: "Skill Gap", icon: BarChart3 },
  { to: "/opportunities", label: "Opportunities", icon: Briefcase },
  { to: "/profile", label: "Profile", icon: UserRound },
];

const MobileNav = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { logout } = useAuth();

  return (
    <>
      {/* Top mini bar with menu trigger */}
      <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between border-b border-border/80 bg-surface/90 backdrop-blur-xl px-4 py-3">
        <Logo size={24} />
        <div className="flex items-center gap-2">
          <ThemeToggle compact />
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            className="p-2 rounded-lg text-muted hover:text-ink hover:bg-surface2"
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      {/* Bottom tab bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 flex items-stretch border-t border-border/80 bg-surface/95 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]">
        {BOTTOM_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] font-display font-medium transition-colors ${
                isActive ? "text-primary-light" : "text-muted"
              }`
            }
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Drawer for secondary items */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/65 backdrop-blur-sm animate-fade-in"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-72 max-w-[85%] bg-surface border-l border-border p-5 animate-fade-in flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <Logo size={24} />
              <button
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
                className="p-2 rounded-lg text-muted hover:bg-surface2"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-1.5 flex-1">
              {[...BOTTOM_ITEMS, ...DRAWER_EXTRA].map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setDrawerOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-display font-medium transition-colors ${
                      isActive
                        ? "bg-primary/20 text-primary-light border border-primary/35"
                        : "text-muted hover:bg-surface2 hover:text-ink"
                    }`
                  }
                >
                  <Icon size={18} />
                  {label}
                </NavLink>
              ))}
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-display font-medium text-danger hover:bg-danger/15 transition-colors"
            >
              <LogOut size={18} />
              Log out
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileNav;
