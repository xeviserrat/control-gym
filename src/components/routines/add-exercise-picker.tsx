"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AddExercisePickerProps {
  exercises: { id: string; name: string; muscleGroup: string | null }[];
  onAdd: (exerciseId: string) => void;
  pending?: boolean;
}

export function AddExercisePicker({
  exercises,
  onAdd,
  pending,
}: AddExercisePickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = exercises.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase()),
  );

  if (!open) {
    return (
      <Button
        fullWidth
        variant="secondary"
        onClick={() => setOpen(true)}
        className="gap-2"
        disabled={pending}
      >
        <Plus className="h-5 w-5" />
        Añadir ejercicio
      </Button>
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
        {filtered.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No hay ejercicios disponibles
          </p>
        ) : (
          filtered.map((ex) => (
            <button
              key={ex.id}
              type="button"
              disabled={pending}
              onClick={() => {
                onAdd(ex.id);
                setOpen(false);
                setSearch("");
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
      <Button
        variant="ghost"
        size="sm"
        fullWidth
        className="mt-3"
        onClick={() => setOpen(false)}
      >
        Cancelar
      </Button>
    </div>
  );
}
