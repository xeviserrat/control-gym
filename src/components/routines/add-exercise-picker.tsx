"use client";

import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExerciseFormFields } from "@/components/exercises/exercise-form-fields";
import { usePendingAction } from "@/hooks/use-pending-action";
import { createExercise } from "@/lib/actions/exercises";

interface AddExercisePickerProps {
  exercises: { id: string; name: string; muscleGroup: string | null }[];
  onAdd: (exerciseId: string) => void;
  pending?: boolean;
  label?: string;
  excludeExerciseId?: string;
  defaultOpen?: boolean;
  onCancel?: () => void;
  pendingLabel?: string;
  allowCreate?: boolean;
  createSubmitLabel?: string;
}

export function AddExercisePicker({
  exercises,
  onAdd,
  pending,
  label = "Añadir ejercicio",
  excludeExerciseId,
  defaultOpen = false,
  onCancel,
  pendingLabel = "Añadiendo ejercicio…",
  allowCreate = false,
  createSubmitLabel = "Crear y añadir",
}: AddExercisePickerProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [mode, setMode] = useState<"pick" | "create">("pick");
  const [search, setSearch] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const { pending: creating, run: runCreate } =
    usePendingAction("Creando ejercicio…");

  const isBusy = pending || creating;

  const filtered = exercises.filter(
    (e) =>
      e.id !== excludeExerciseId &&
      e.name.toLowerCase().includes(search.toLowerCase()),
  );

  function handleClose() {
    setOpen(false);
    setMode("pick");
    setSearch("");
    setCreateError(null);
    onCancel?.();
  }

  function handleCreateSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreateError(null);
    const formData = new FormData(e.currentTarget);

    runCreate(async () => {
      const result = await createExercise(formData);
      if (!result.success) {
        setCreateError(result.error);
        return;
      }
      onAdd(result.data.id);
      handleClose();
    });
  }

  if (!open) {
    return (
      <Button
        fullWidth
        variant="secondary"
        onClick={() => setOpen(true)}
        className="gap-2"
        disabled={isBusy}
      >
        <Plus className="h-5 w-5" />
        {label}
      </Button>
    );
  }

  if (mode === "create") {
    return (
      <form
        onSubmit={handleCreateSubmit}
        className="rounded-2xl border border-border bg-surface p-4"
      >
        <p className="mb-3 text-sm font-medium">Crear ejercicio personalizado</p>
        <div className="space-y-3">
          <ExerciseFormFields defaults={{ name: search.trim() || undefined }} />
        </div>
        {createError && (
          <p className="mt-3 text-sm text-destructive" role="alert">
            {createError}
          </p>
        )}
        <div className="mt-3 flex gap-2">
          <Button
            type="submit"
            size="sm"
            loading={creating}
            loadingText="Creando…"
            className="flex-1"
            disabled={isBusy}
          >
            {createSubmitLabel}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={isBusy}
            onClick={() => {
              setMode("pick");
              setCreateError(null);
            }}
          >
            Volver
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <input
        type="search"
        placeholder="Buscar ejercicio..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-3 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
        autoFocus
      />
      <div className="max-h-60 space-y-1 overflow-y-auto">
        {pending ? (
          <p className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            {pendingLabel}
          </p>
        ) : filtered.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            {allowCreate
              ? "No hay coincidencias. Puedes crear uno nuevo."
              : "No hay ejercicios disponibles"}
          </p>
        ) : (
          filtered.map((ex) => (
            <button
              key={ex.id}
              type="button"
              disabled={isBusy}
              onClick={() => {
                onAdd(ex.id);
                handleClose();
              }}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm hover:bg-surface-elevated"
            >
              <span className="font-medium">{ex.name}</span>
              {ex.muscleGroup && (
                <span className="text-xs text-muted-foreground">
                  {ex.muscleGroup}
                </span>
              )}
            </button>
          ))
        )}
      </div>
      {allowCreate && (
        <Button
          variant="outline"
          size="sm"
          fullWidth
          className="mt-3 gap-2"
          disabled={isBusy}
          onClick={() => {
            setMode("create");
            setCreateError(null);
          }}
        >
          <Plus className="h-4 w-4" />
          Crear ejercicio personalizado
        </Button>
      )}
      <Button
        variant="ghost"
        size="sm"
        fullWidth
        className="mt-3"
        disabled={isBusy}
        onClick={handleClose}
      >
        Cancelar
      </Button>
    </div>
  );
}
