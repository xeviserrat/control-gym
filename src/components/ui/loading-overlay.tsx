import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function LoadingOverlay({
  message = "Cargando…",
  className,
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center bg-background/60 backdrop-blur-sm",
        className,
      )}
      role="alertdialog"
      aria-modal="true"
      aria-busy="true"
      aria-label={message}
    >
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface px-8 py-6 shadow-lg">
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden />
        <p className="text-sm font-medium text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
