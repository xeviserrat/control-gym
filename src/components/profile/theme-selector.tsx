"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

const themes = [
  { value: "light", label: "Claro" },
  { value: "dark", label: "Oscuro" },
  { value: "system", label: "Sistema" },
] as const;

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  if (!mounted) {
    return (
      <div className="flex gap-2">
        {themes.map((t) => (
          <div
            key={t.value}
            className="h-11 flex-1 rounded-xl bg-surface"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-2" role="radiogroup" aria-label="Tema">
      {themes.map((t) => (
        <button
          key={t.value}
          type="button"
          role="radio"
          aria-checked={theme === t.value}
          onClick={() => setTheme(t.value)}
          className={cn(
            "flex h-11 flex-1 items-center justify-center rounded-xl text-sm font-medium transition-colors",
            theme === t.value
              ? "bg-primary text-primary-foreground"
              : "bg-surface border border-border hover:bg-surface-elevated",
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
