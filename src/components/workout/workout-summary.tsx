"use client";

import { AppLink } from "@/components/ui/app-link";
import { Button } from "@/components/ui/button";
import { ProgressionResultsList } from "@/components/workout/progression-results-list";
import { formatDate, formatDuration, formatWeight } from "@/lib/utils";
import type { ProgressionResultItem } from "@/lib/workout/progression-results";

interface WorkoutSummaryProps {
  workout: {
    id: string;
    date: Date | string;
    durationSeconds: number;
    routine: { name: string };
    exercises: {
      skipped: boolean;
      exercise: { name: string };
      sets: { weight: number; reps: number; setNumber: number }[];
    }[];
  };
  progressionResults: ProgressionResultItem[];
  totalSets: number;
  totalVolume: number;
}

export function WorkoutSummary({
  workout,
  progressionResults,
  totalSets,
  totalVolume,
}: WorkoutSummaryProps) {
  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <div className="text-center">
        <p className="text-sm font-medium text-success">Entrenamiento completado</p>
        <h1 className="mt-2 text-2xl font-semibold">{workout.routine.name}</h1>
        <p className="mt-1 text-muted-foreground">
          {formatDate(workout.date)} · {formatDuration(workout.durationSeconds)}
        </p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-border bg-surface p-4 text-center">
          <p className="text-2xl font-semibold">{totalSets}</p>
          <p className="text-xs text-muted-foreground">Series</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-4 text-center">
          <p className="text-2xl font-semibold">{formatWeight(totalVolume)}</p>
          <p className="text-xs text-muted-foreground">Volumen (kg)</p>
        </div>
      </div>

      <div className="mt-6">
        <ProgressionResultsList results={progressionResults} />
      </div>

      <div className="mt-6 space-y-4">
        {workout.exercises
          .filter((we) => !we.skipped && we.sets.length > 0)
          .map((we) => (
            <div key={we.exercise.name}>
              <p className="font-semibold">{we.exercise.name}</p>
              <p className="text-xs text-muted-foreground">
                {we.sets.length} series
              </p>
              <div className="mt-1 space-y-0.5">
                {we.sets
                  .sort((a, b) => a.setNumber - b.setNumber)
                  .map((s) => (
                    <p key={s.setNumber} className="text-sm text-muted-foreground">
                      {formatWeight(s.weight)} kg × {s.reps}
                    </p>
                  ))}
              </div>
            </div>
          ))}
      </div>

      <div className="mt-8 space-y-3">
        <AppLink href={`/history/${workout.id}`}>
          <Button fullWidth variant="secondary">
            Ver en historial
          </Button>
        </AppLink>
        <AppLink href="/dashboard">
          <Button fullWidth>Volver al dashboard</Button>
        </AppLink>
      </div>
    </div>
  );
}
