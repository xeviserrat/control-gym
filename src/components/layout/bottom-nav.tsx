"use client";

import { usePathname } from "next/navigation";
import { LayoutDashboard, List, Dumbbell, History, Library } from "lucide-react";
import { AppLink } from "@/components/ui/app-link";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
  { href: "/routines", label: "Rutinas", icon: List },
  { href: "/exercises", label: "Ejercicios", icon: Library },
  { href: "/train", label: "Train", icon: Dumbbell },
  { href: "/history", label: "Historial", icon: History },
];

export function BottomNav() {
  const pathname = usePathname();

  if (/^\/train\/[^/]+$/.test(pathname)) {
    return null;
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-surface/95 backdrop-blur-md safe-bottom"
      aria-label="Navegación principal"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-1 pb-1 pt-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href || pathname.startsWith(`${href}/`);
          const isTrain = href === "/train";

          return (
            <AppLink
              key={href}
              href={href}
              className={cn(
                "flex min-w-[56px] flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[10px] font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon
                className={cn(
                  "h-5 w-5",
                  isTrain && isActive && "text-primary",
                )}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className="max-w-[56px] truncate">{label}</span>
            </AppLink>
          );
        })}
      </div>
    </nav>
  );
}
