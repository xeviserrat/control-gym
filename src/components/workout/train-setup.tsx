"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AppLink } from "@/components/ui/app-link";
import { EmptyState } from "@/components/ui/empty-state";
import { RoutineStartHints } from "@/components/workout/routine-start-hints";
import { useAppRouter } from "@/hooks/use-app-router";
import { usePendingAction } from "@/hooks/use-pending-action";
import { getRoutineStartHints, startWorkout } from "@/lib/actions/workouts";
import type { StartTrainingHint } from "@/lib/workout/progression-results";

interface TrainSetupProps {
  routines: { id: string; name: string; exercises: { id: string }[] }[];
  preselectedRoutineId?: string;
}

export function TrainSetup({ routines, preselectedRoutineId }: TrainSetupProps) {
  const [selectedId, setSelectedId] = useState(
    preselectedRoutineId ?? routines[0]?.id ?? "",
  );
  const [date, setDate] = useState(() =>
    new Date().toISOString().split("T")[0],
  );
  const [error, setError] = useState<string | null>(null);
  const [hints, setHints] = useState<StartTrainingHint[]>([]);
  const [hintsLoading, setHintsLoading] = useState(false);
  const { pending, run } = usePendingAction("Iniciando entrenamiento…");
  const router = useAppRouter();

  useEffect(() => {
    if (!selectedId) {
      setHints([]);
      return;
    }

    let cancelled = false;
    setHintsLoading(true);

    getRoutineStartHints(selectedId)
      .then((nextHints) => {
        if (!cancelled) setHints(nextHints);
      })
      .finally(() => {
        if (!cancelled) setHintsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  if (routines.length === 0) {
    return (
      <EmptyState
        title="Sin rutinas activas"
        description="Crea y activa una rutina antes de entrenar."
        action={
          <AppLink href="/routines">
            <Button>Ir a Rutinas</Button>
          </AppLink>
        }
      />
    );
  }

  function handleStart() {
    setError(null);
    run(async () => {
      const result = await startWorkout(selectedId, date);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.push(`/train/${result.data.id}`);
    });
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-4 text-sm font-medium text-muted-foreground">
          ¿Qué rutina quieres hacer?
        </h2>
        <div className="space-y-2">
          {routines.map((routine) => (
            <button
              key={routine.id}
              type="button"
              onClick={() => setSelectedId(routine.id)}
              className={`w-full rounded-2xl border px-4 py-4 text-left transition-colors ${
                selectedId === routine.id
                  ? "border-primary bg-primary/5"
                  : "border-border bg-surface hover:bg-surface-elevated"
              }`}
            >
              <p className="font-semibold">{routine.name}</p>
              <p className="text-sm text-muted-foreground">
                {routine.exercises.length} ejercicios
              </p>
            </button>
          ))}
        </div>
      </section>

      {hintsLoading ? (
        <p className="text-sm text-muted-foreground">
          Cargando consejos de la última sesión…
        </p>
      ) : (
        <RoutineStartHints hints={hints} />
      )}

      <section>
        <h2 className="mb-4 text-sm font-medium text-muted-foreground">
          ¿Qué fecha?
        </h2>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
        />
      </section>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <Button
        size="xl"
        fullWidth
        disabled={!selectedId}
        loading={pending}
        loadingText="Iniciando…"
        onClick={handleStart}
      >
        Empezar entrenamiento
      </Button>
    </div>
  );
}
