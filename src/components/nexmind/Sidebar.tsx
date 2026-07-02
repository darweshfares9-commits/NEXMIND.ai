import { Link, useNavigate } from "@tanstack/react-router";
import { Home, History, Settings, LogOut, Sparkles, Phone, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import logo from "@/assets/nexmind-logo.png";


interface Props {
  email?: string;
}

export function NexSidebar({ email }: Props) {
  const navigate = useNavigate();
  const qc = useQueryClient();

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth", replace: true });
  }

  return (
    <aside
      className="w-14 sm:w-16 hover:w-56 transition-[width] duration-300 shrink-0 h-screen border-r flex flex-col group/sidebar overflow-hidden"
      style={{
        borderColor: "oklch(0.82 0.19 200 / 0.1)",
        background: "color-mix(in oklab, var(--surface) 40%, transparent)",
        backdropFilter: "blur(14px)",
      }}
    >
      {/* Logo */}
      <Link to="/hub" className="h-16 flex items-center gap-3 px-3 sm:px-4 border-b shrink-0"
        style={{ borderColor: "oklch(0.82 0.19 200 / 0.1)" }}>
        <img
          src={logo}
          alt="NexMind"
          width={32}
          height={32}
          className="w-8 h-8 rounded-lg shrink-0"
          style={{ filter: "drop-shadow(0 0 14px oklch(0.6 0.2 240 / 0.5))" }}
        />
        <span className="text-sm font-semibold opacity-0 group-hover/sidebar:opacity-100 transition whitespace-nowrap">
          NexMind
        </span>
      </Link>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        <NavItem to="/hub" icon={<Home size={16} />} label="Galaxy" />
        <NavItem to="/tools/$slug" params={{ slug: "chat" }} icon={<Sparkles size={16} />} label="New Chat" />
        <NavItem to="/live" icon={<Phone size={16} />} label="Live Call" />
        <NavItem to="/history" icon={<History size={16} />} label="History" />
        <NavItem to="/pricing" icon={<CreditCard size={16} />} label="Pricing" />
        <NavItem to="/settings" icon={<Settings size={16} />} label="Settings" />
      </nav>

      {/* User */}
      <div className="p-2 border-t shrink-0" style={{ borderColor: "oklch(0.82 0.19 200 / 0.1)" }}>
        <div className="flex items-center gap-3 px-3 py-2 rounded-md">
          <div className="relative w-8 h-8 rounded-full shrink-0 flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, var(--cyan), oklch(0.55 0.18 220))",
              color: "oklch(0.1 0.02 240)",
            }}>
            <span className="text-xs font-semibold">{(email ?? "U").slice(0, 1).toUpperCase()}</span>
            <span className="absolute -bottom-0 -right-0 w-2.5 h-2.5 rounded-full"
              style={{ background: "oklch(0.78 0.2 145)", boxShadow: "0 0 6px oklch(0.78 0.2 145)" }} />
          </div>
          <div className="min-w-0 opacity-0 group-hover/sidebar:opacity-100 transition">
            <div className="text-[11px] truncate">{email ?? "—"}</div>
            <div className="text-[9px] tracking-[0.25em] text-muted-foreground">ONLINE</div>
          </div>
        </div>
        <button
          onClick={signOut}
          className="mt-1 w-full flex items-center gap-3 px-3 py-2 rounded-md text-[11px] hover:bg-white/5 transition"
        >
          <LogOut size={16} />
          <span className="opacity-0 group-hover/sidebar:opacity-100 transition">Sign out</span>
        </button>
      </div>
    </aside>
  );
}

function NavItem({
  to, icon, label, params,
}: { to: string; icon: React.ReactNode; label: string; params?: Record<string, string> }) {
  return (
    <Link
      to={to as never}
      params={params as never}
      className="flex items-center gap-3 px-3 py-2 rounded-md text-[11px] tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground hover:bg-white/5 transition"
      activeProps={{ style: { color: "var(--cyan)", background: "oklch(0.82 0.19 200 / 0.08)" } }}
    >
      {icon}
      <span className="opacity-0 group-hover/sidebar:opacity-100 transition whitespace-nowrap">{label}</span>
    </Link>
  );
}
