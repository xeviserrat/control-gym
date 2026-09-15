"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { formatDuration } from "@/lib/utils";
import { Minus, Plus } from "lucide-react";

interface RestTimerProps {
  seconds: number;
  onComplete: () => void;
  onSkip: () => void;
}

export function RestTimer({ seconds, onComplete, onSkip }: RestTimerProps) {
  return (
    <RestTimerInner
      key={seconds}
      seconds={seconds}
      onComplete={onComplete}
      onSkip={onSkip}
    />
  );
}

function RestTimerInner({ seconds, onComplete, onSkip }: RestTimerProps) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    if (remaining <= 0) {
      onComplete();
      return;
    }

    const timer = setInterval(() => {
      setRemaining((r) => r - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [remaining, onComplete]);

  const adjust = useCallback((delta: number) => {
    setRemaining((r) => Math.max(0, r + delta));
  }, []);

  return (
    <div className="flex flex-col items-center py-8">
      <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
        Descanso
      </p>
      <p className="mt-2 text-5xl font-semibold tabular-nums">
        {formatDuration(remaining)}
      </p>

      <div className="mt-6 flex items-center gap-4">
        <button
          type="button"
          onClick={() => adjust(-15)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-muted-foreground hover:text-foreground"
          aria-label="Restar 15 segundos"
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => adjust(15)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-muted-foreground hover:text-foreground"
          aria-label="Añadir 15 segundos"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <Button variant="ghost" className="mt-6" onClick={onSkip}>
        Saltar descanso
      </Button>
    </div>
  );
}
