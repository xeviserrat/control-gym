import Link from "next/link";
import { User } from "lucide-react";

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
            <Link
              href={backHref}
              className="text-sm text-primary"
              aria-label="Volver"
            >
              ←
            </Link>
          )}
          {title && (
            <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
          )}
        </div>
        <Link
          href="/profile"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-surface text-muted-foreground hover:text-foreground"
          aria-label="Perfil"
        >
          <User className="h-5 w-5" />
        </Link>
      </div>
    </header>
  );
}
