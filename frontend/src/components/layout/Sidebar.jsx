import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Map,
  BarChart3,
  MessageCircle,
  TrendingUp,
  UserRound,
  LogOut,
} from "lucide-react";
import Logo from "../ui/Logo";
import { useAuth } from "../../hooks/useAuth";
import { getInitials } from "../../utils/formatters";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/roadmap", label: "Career Roadmap", icon: Map },
  { to: "/skill-gap", label: "Skill Gap", icon: BarChart3 },
  { to: "/mentor", label: "AI Mentor", icon: MessageCircle },
  { to: "/progress", label: "Progress", icon: TrendingUp },
  { to: "/profile", label: "Profile", icon: UserRound },
];

const Sidebar = () => {
  const { user, logout } = useAuth();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 border-r border-border bg-surface h-screen sticky top-0">
      <div className="px-5 py-5 border-b border-border">
        <Logo />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted hover:bg-surface2 hover:text-ink"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3 rounded-xl px-2 py-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-white text-xs font-semibold">
            {getInitials(user?.name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink">{user?.name}</p>
            <p className="truncate text-xs text-muted">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            aria-label="Log out"
            className="shrink-0 text-muted hover:text-danger transition-colors p-1.5 rounded-lg hover:bg-danger/10"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
export { NAV_ITEMS };
