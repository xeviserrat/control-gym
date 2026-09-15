"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, List, Dumbbell, History } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/routines", label: "Rutinas", icon: List },
  { href: "/train", label: "Train", icon: Dumbbell },
  { href: "/history", label: "Historial", icon: History },
];

export function BottomNav() {
  const pathname = usePathname();

  // Hide during active workout session
  if (/^\/train\/[^/]+$/.test(pathname)) {
    return null;
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-surface/95 backdrop-blur-md safe-bottom"
      aria-label="Navegación principal"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-2 pb-1 pt-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href || pathname.startsWith(`${href}/`);
          const isTrain = href === "/train";

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex min-w-[64px] flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon
                className={cn(
                  "h-6 w-6",
                  isTrain && isActive && "text-primary",
                )}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
