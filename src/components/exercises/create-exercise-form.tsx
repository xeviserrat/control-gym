"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExerciseFormFields } from "@/components/exercises/exercise-form-fields";
import { useAppRouter } from "@/hooks/use-app-router";
import { usePendingAction } from "@/hooks/use-pending-action";
import { createExercise } from "@/lib/actions/exercises";

export function CreateExerciseForm() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { pending, run } = usePendingAction("Creando ejercicio…");
  const router = useAppRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    run(async () => {
      const result = await createExercise(formData);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  if (!open) {
    return (
      <Button
        fullWidth
        variant="secondary"
        onClick={() => setOpen(true)}
        className="gap-2"
      >
        <Plus className="h-5 w-5" />
        Nuevo ejercicio
      </Button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-2xl border border-border bg-surface p-4"
    >
      <p className="text-sm font-medium">Crear ejercicio</p>
      <ExerciseFormFields />
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <Button
          type="submit"
          loading={pending}
          loadingText="Creando…"
          className="flex-1"
        >
          Crear
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={pending}
          onClick={() => setOpen(false)}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
