"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ExerciseFormFields,
  type ExerciseFormDefaults,
} from "@/components/exercises/exercise-form-fields";
import { useAppRouter } from "@/hooks/use-app-router";
import { usePendingAction } from "@/hooks/use-pending-action";
import { updateExercise } from "@/lib/actions/exercises";

type EditExerciseFormProps = {
  readonly exerciseId: string;
  readonly defaults: ExerciseFormDefaults;
  readonly onCancel: () => void;
};

export function EditExerciseForm({
  exerciseId,
  defaults,
  onCancel,
}: EditExerciseFormProps) {
  const [error, setError] = useState<string | null>(null);
  const { pending, run } = usePendingAction("Guardando cambios…");
  const router = useAppRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    run(async () => {
      const result = await updateExercise(exerciseId, formData);
      if (!result.success) {
        setError(result.error);
        return;
      }
      onCancel();
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-2xl border border-border bg-surface p-4"
    >
      <p className="text-sm font-medium">Editar ejercicio</p>
      <ExerciseFormFields defaults={defaults} />
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <Button
          type="submit"
          loading={pending}
          loadingText="Guardando…"
          className="flex-1"
        >
          Guardar
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={pending}
          onClick={onCancel}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
