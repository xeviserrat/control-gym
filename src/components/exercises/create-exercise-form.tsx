"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createExercise } from "@/lib/actions/exercises";

export function CreateExerciseForm() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
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
      <Input name="name" label="Nombre" required autoFocus />
      <Input name="muscleGroup" label="Grupo muscular" />
      <Input name="description" label="Descripción" />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" disabled={pending} className="flex-1">
          Crear
        </Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
