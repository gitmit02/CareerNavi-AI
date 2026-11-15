import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Map,
  BarChart3,
  MessageCircle,
  TrendingUp,
  UserRound,
  LogOut,
  Briefcase,
  Compass,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import Logo from "../ui/Logo";
import { useAuth } from "../../hooks/useAuth";
import { getInitials } from "../../utils/formatters";

const STORAGE_KEY = "careernavi-sidebar-collapsed";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/roadmap", label: "Career Road", icon: Map, badge: "MAIN" },
  { to: "/skill-gap", label: "Skill Gap", icon: BarChart3 },
  { to: "/opportunities", label: "Opportunities", icon: Briefcase },
  { to: "/mentor", label: "AI Mentor", icon: MessageCircle },
  { to: "/progress", label: "Analytics", icon: TrendingUp },
  { to: "/profile", label: "Settings", icon: UserRound },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(STORAGE_KEY) === "true";
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, String(collapsed));
  }, [collapsed]);

  return (
    <aside
      className={`relative z-20 hidden lg:flex lg:flex-col lg:shrink-0 border-r border-border bg-surface h-screen sticky top-0 transition-[width] duration-300 ease-in-out ${
        collapsed ? "lg:w-20" : "lg:w-64"
      }`}
    >
      {/* Brand + Collapse Toggle Header */}
      <div
        className={`flex items-center border-b border-border py-4 ${
          collapsed ? "justify-center px-2" : "justify-between px-5"
        }`}
      >
        {!collapsed && <Logo size={26} />}
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? "Expand sidebar" : "Minimize sidebar"}
          title={collapsed ? "Expand sidebar" : "Minimize sidebar"}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface2/70 text-muted hover:text-ink hover:border-primary/40 transition-colors"
        >
          {collapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
        </button>
      </div>

      {/* Target Goal Quick Pill (Expanded only) */}
      {!collapsed ? (
        <div className="px-3.5 pt-4">
          <div className="rounded-xl border border-border bg-surface2/60 p-3">
            <div className="flex items-center gap-2 text-xs font-mono text-primary-light mb-1">
              <Compass size={13} />
              <span className="uppercase tracking-wider">Target Role</span>
            </div>
            <p className="font-display text-sm font-bold text-ink truncate">
              {user?.careerGoal || "Path Not Set Yet"}
            </p>
            <p className="text-[11px] text-muted truncate mt-0.5">
              {user?.degree ? `${user.degree}${user.year ? ` · ${user.year}` : ""}` : "Complete profile for best fit"}
            </p>
          </div>
        </div>
      ) : (
        <div className="px-3 pt-4 flex justify-center">
          <div
            title={`Target Role: ${user?.careerGoal || "Not set"}`}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface2/60 text-primary-light"
          >
            <Compass size={17} />
          </div>
        </div>
      )}

      {!collapsed && (
        <div className="px-5 pt-5 pb-1.5">
          <span className="coord-label text-muted">Workspace</span>
        </div>
      )}

      <nav className={`flex-1 overflow-y-auto py-3 space-y-1 ${collapsed ? "px-2.5" : "px-3"}`}>
        {NAV_ITEMS.map(({ to, label, icon: Icon, badge }) => (
          <NavLink
            key={to}
            to={to}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              `group relative flex items-center rounded-xl py-2.5 text-sm font-display font-medium transition-all ${
                collapsed ? "justify-center px-0" : "justify-between px-3"
              } ${
                isActive
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted hover:bg-surface2 hover:text-ink"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`flex items-center ${collapsed ? "justify-center" : "gap-3"}`}>
                  <Icon
                    size={18}
                    className={isActive ? "text-white" : "text-muted group-hover:text-ink transition-colors"}
                  />
                  {!collapsed && <span>{label}</span>}
                </span>
                {!collapsed && badge && (
                  <span
                    className={`rounded-md px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-wider ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-primary/15 text-primary-light border border-primary/30"
                    }`}
                  >
                    {badge}
                  </span>
                )}
                {collapsed && badge && (
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent ring-2 ring-surface" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer User Strip */}
      <div className="border-t border-border p-3">
        {collapsed ? (
          <div className="flex flex-col items-center gap-2">
            <div
              title={user?.name || "User"}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white text-xs font-display font-bold"
            >
              {getInitials(user?.name)}
            </div>
            <button
              onClick={logout}
              aria-label="Log out"
              title="Log out"
              className="text-muted hover:text-danger transition-colors p-1.5 rounded-lg hover:bg-danger/10"
            >
              <LogOut size={15} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-xl bg-surface2/60 border border-border px-2.5 py-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-white text-xs font-display font-bold">
              {getInitials(user?.name)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-display font-bold text-ink">{user?.name}</p>
              <p className="truncate text-[11px] text-muted">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              aria-label="Log out"
              title="Log out"
              className="shrink-0 text-muted hover:text-danger transition-colors p-1.5 rounded-lg hover:bg-danger/10"
            >
              <LogOut size={15} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
export { NAV_ITEMS };
