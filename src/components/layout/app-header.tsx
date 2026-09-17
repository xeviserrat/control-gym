"use client";

import { User } from "lucide-react";
import { AppLink } from "@/components/ui/app-link";

export function AppHeader({
  title,
  backHref,
}: {
  title?: string;
  backHref?: string;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
        <div className="flex items-center gap-3">
          {backHref && (
            <AppLink
              href={backHref}
              className="text-sm text-primary"
              aria-label="Volver"
            >
              ←
            </AppLink>
          )}
          {title && (
            <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
          )}
        </div>
        <AppLink
          href="/profile"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-surface text-muted-foreground hover:text-foreground"
          aria-label="Perfil"
        >
          <User className="h-5 w-5" />
        </AppLink>
      </div>
    </header>
  );
}
