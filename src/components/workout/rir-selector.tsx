"use client";

import { cn } from "@/lib/utils";

interface RirSelectorProps {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
}

const RIR_OPTIONS = [0, 1, 2, 3, 4];

export function RirSelector({ value, onChange }: RirSelectorProps) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-muted-foreground">RIR</p>
      <div className="flex gap-2">
        {RIR_OPTIONS.map((rir) => (
          <button
            key={rir}
            type="button"
            onClick={() => onChange(value === rir ? undefined : rir)}
            className={cn(
              "flex h-11 flex-1 items-center justify-center rounded-xl text-base font-medium transition-colors",
              value === rir
                ? "bg-primary text-primary-foreground"
                : "bg-surface border border-border text-foreground hover:bg-surface-elevated",
            )}
            aria-pressed={value === rir}
          >
            {rir}
          </button>
        ))}
      </div>
    </div>
  );
}
