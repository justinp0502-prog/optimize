import Link from "next/link";
import { ReactNode } from "react";
import { Home, Salad, Sparkles, UserRound, Waypoints, Settings } from "lucide-react";
import { logoutUser } from "@/lib/auth-actions";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/", label: "Today", icon: Home },
  { href: "/meals", label: "Meals", icon: Salad },
  { href: "/reflection", label: "Reflect", icon: Sparkles },
  { href: "/progress", label: "Progress", icon: Waypoints },
  { href: "/profile", label: "Profile", icon: UserRound },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppShell({
  children,
  currentPath,
  userName,
}: {
  children: ReactNode;
  currentPath: string;
  userName: string;
}) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-28 pt-5 sm:px-6 lg:px-8">
      <header className="mb-6 flex items-start justify-between rounded-3xl border border-white/50 bg-white/60 px-5 py-4 shadow-calm backdrop-blur-sm">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Optimize</p>
          <h1 className="mt-1 font-serif text-2xl text-foreground">A quieter way to stay aligned.</h1>
          <p className="mt-2 text-sm text-muted-foreground">{userName}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/onboarding"
            className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-float"
          >
            Revisit setup
          </Link>
          <form action={logoutUser}>
            <button className="rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-foreground">
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <nav className="fixed inset-x-0 bottom-4 z-20 mx-auto flex w-[calc(100%-2rem)] max-w-3xl items-center justify-between rounded-[28px] border border-white/70 bg-white/85 px-3 py-2 shadow-float backdrop-blur-lg">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = currentPath === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-medium text-muted-foreground transition",
                active && "bg-secondary text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
