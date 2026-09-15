"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createRoutine } from "@/lib/actions/routines";

export function CreateRoutineForm() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await createRoutine(formData);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setOpen(false);
      router.push(`/routines/${result.data.id}`);
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
        Nueva rutina
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl border border-border bg-surface p-4">
      <Input name="name" label="Nombre" placeholder="Torso A" required autoFocus />
      <Input name="description" label="Descripción (opcional)" />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" disabled={pending} className="flex-1">
          {pending ? "Creando..." : "Crear"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => setOpen(false)}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
