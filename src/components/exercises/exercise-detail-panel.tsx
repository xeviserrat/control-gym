"use client";

import { useState } from "react";
import { Globe, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EditExerciseForm } from "@/components/exercises/edit-exercise-form";
import { getMuscleGroupStyle } from "@/lib/exercise-utils";
import { cn, formatRepRange } from "@/lib/utils";
import { useAppRouter } from "@/hooks/use-app-router";
import { usePendingAction } from "@/hooks/use-pending-action";
import { deleteExercise } from "@/lib/actions/exercises";
import type { ExerciseFormDefaults } from "@/components/exercises/exercise-form-fields";

type ExerciseDetailPanelProps = {
  readonly exercise: {
    id: string;
    name: string;
    description: string | null;
    muscleGroup: string | null;
    repsMin: number | null;
    repsMax: number | null;
    isGlobal: boolean;
  };
  readonly canEdit: boolean;
};

export function ExerciseDetailPanel({ exercise, canEdit }: ExerciseDetailPanelProps) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { pending, run } = usePendingAction();
  const router = useAppRouter();

  const defaults: ExerciseFormDefaults = {
    name: exercise.name,
    description: exercise.description ?? undefined,
    muscleGroup: exercise.muscleGroup ?? undefined,
    repsMin: exercise.repsMin ?? undefined,
    repsMax: exercise.repsMax ?? undefined,
  };

  function handleDelete() {
    if (
      !confirm(
        `¿Eliminar "${exercise.name}"? Esta acción no se puede deshacer.`,
      )
    ) {
      return;
    }

    setError(null);
    run(
      async () => {
        const result = await deleteExercise(exercise.id);
        if (!result.success) {
          setError(result.error);
          return;
        }
        router.push("/exercises");
        router.refresh();
      },
      { message: "Eliminando ejercicio…" },
    );
  }

  if (editing) {
    return (
      <EditExerciseForm
        exerciseId={exercise.id}
        defaults={defaults}
        onCancel={() => setEditing(false)}
      />
    );
  }

  return (
    <Card
      className={cn(
        "border-l-4",
        getMuscleGroupStyle(exercise.muscleGroup),
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {exercise.muscleGroup && (
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {exercise.muscleGroup}
            </p>
          )}
          {exercise.isGlobal && (
            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-surface px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              <Globe className="h-3 w-3" />
              Ejercicio global
            </span>
          )}
          {exercise.repsMin != null && exercise.repsMax != null && (
            <p className="mt-2 text-sm text-muted-foreground">
              Rango de reps:{" "}
              <span className="font-medium text-foreground">
                {formatRepRange(exercise.repsMin, exercise.repsMax)}
              </span>
            </p>
          )}
          {exercise.description && (
            <p className="mt-2 text-sm text-muted-foreground">
              {exercise.description}
            </p>
          )}
        </div>
      </div>

      {error && (
        <p className="mt-3 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {canEdit && (
        <div className="mt-4 flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            className="gap-2"
            onClick={() => setEditing(true)}
          >
            <Pencil className="h-4 w-4" />
            Editar
          </Button>
          <Button
            size="sm"
            variant="ghost"
            loading={pending}
            loadingText="Eliminando…"
            disabled={pending}
            onClick={handleDelete}
            className="gap-2 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            Eliminar
          </Button>
        </div>
      )}
    </Card>
  );
}
