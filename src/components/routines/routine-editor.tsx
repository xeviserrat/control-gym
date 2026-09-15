"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronUp,
  Link2,
  Pencil,
  Trash2,
  Unlink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatRepRange } from "@/lib/utils";
import {
  addExerciseToRoutine,
  combineExercises,
  moveRoutineExercise,
  removeExerciseFromRoutine,
  removeFromSuperset,
  updateRoutine,
  updateRoutineExercise,
} from "@/lib/actions/routines";
import { AddExercisePicker } from "@/components/routines/add-exercise-picker";

type RoutineExercise = {
  id: string;
  order: number;
  sets: number;
  repsMin: number;
  repsMax: number;
  restSeconds: number;
  notes: string | null;
  isOptional: boolean;
  loadProgression: boolean;
  supersetGroupId: string | null;
  supersetOrder: number | null;
  exercise: { id: string; name: string };
};

type Exercise = { id: string; name: string; muscleGroup: string | null };

interface RoutineEditorProps {
  routine: {
    id: string;
    name: string;
    description: string | null;
    exercises: RoutineExercise[];
  };
  allExercises: Exercise[];
}

export function RoutineEditor({ routine, allExercises }: RoutineEditorProps) {
  const [pending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [combiningId, setCombiningId] = useState<string | null>(null);
  const router = useRouter();

  const existingExerciseIds = new Set(
    routine.exercises.map((e) => e.exercise.id),
  );

  function getSupersetLabel(ex: RoutineExercise): string | null {
    if (!ex.supersetGroupId) return null;
    const groupMembers = routine.exercises
      .filter((e) => e.supersetGroupId === ex.supersetGroupId)
      .sort((a, b) => (a.supersetOrder ?? 0) - (b.supersetOrder ?? 0));
    const idx = groupMembers.findIndex((e) => e.id === ex.id);
    const letter = String.fromCharCode(65 + (idx % 26));
    return `${letter}${idx + 1}`;
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          startTransition(async () => {
            await updateRoutine(routine.id, formData);
            router.refresh();
          });
        }}
        className="space-y-3"
      >
        <Input
          name="name"
          label="Nombre"
          defaultValue={routine.name}
          required
        />
        <Input
          name="description"
          label="Descripción"
          defaultValue={routine.description ?? ""}
        />
        <Button type="submit" size="sm" disabled={pending}>
          Guardar
        </Button>
      </form>

      <div className="space-y-3">
        {routine.exercises.map((ex, index) => {
          const label = getSupersetLabel(ex);
          const isEditing = editingId === ex.id;
          const isCombining = combiningId === ex.id;

          return (
            <div
              key={ex.id}
              className="rounded-2xl border border-border bg-surface p-4"
            >
              <div className="flex items-start gap-3">
                <div className="flex flex-col gap-1 pt-1">
                  <button
                    type="button"
                    disabled={index === 0 || pending}
                    onClick={() =>
                      startTransition(async () => {
                        await moveRoutineExercise(ex.id, "up");
                        router.refresh();
                      })
                    }
                    className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                    aria-label="Subir"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    disabled={
                      index === routine.exercises.length - 1 || pending
                    }
                    onClick={() =>
                      startTransition(async () => {
                        await moveRoutineExercise(ex.id, "down");
                        router.refresh();
                      })
                    }
                    className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                    aria-label="Bajar"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {label && (
                      <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-xs font-semibold text-primary">
                        {label}
                      </span>
                    )}
                    <h3 className="font-semibold">{ex.exercise.name}</h3>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {ex.sets} × {formatRepRange(ex.repsMin, ex.repsMax)} ·{" "}
                    {ex.restSeconds}s
                  </p>
                  {ex.notes && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {ex.notes}
                    </p>
                  )}
                </div>
              </div>

              {isEditing && (
                <form
                  className="mt-4 space-y-3 border-t border-border pt-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    startTransition(async () => {
                      await updateRoutineExercise(ex.id, {
                        sets: Number(fd.get("sets")),
                        repsMin: Number(fd.get("repsMin")),
                        repsMax: Number(fd.get("repsMax")),
                        restSeconds: Number(fd.get("restSeconds")),
                        notes: (fd.get("notes") as string) || undefined,
                        isOptional: fd.get("isOptional") === "on",
                        loadProgression: fd.get("loadProgression") === "on",
                      });
                      setEditingId(null);
                      router.refresh();
                    });
                  }}
                >
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      name="sets"
                      label="Series"
                      type="number"
                      defaultValue={ex.sets}
                      min={1}
                      required
                    />
                    <Input
                      name="restSeconds"
                      label="Descanso (s)"
                      type="number"
                      defaultValue={ex.restSeconds}
                      min={0}
                      required
                    />
                    <Input
                      name="repsMin"
                      label="Reps mín"
                      type="number"
                      defaultValue={ex.repsMin}
                      min={1}
                      required
                    />
                    <Input
                      name="repsMax"
                      label="Reps máx"
                      type="number"
                      defaultValue={ex.repsMax}
                      min={1}
                      required
                    />
                  </div>
                  <Input
                    name="notes"
                    label="Notas"
                    defaultValue={ex.notes ?? ""}
                  />
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="isOptional"
                      defaultChecked={ex.isOptional}
                    />
                    Opcional
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="loadProgression"
                      defaultChecked={ex.loadProgression}
                    />
                    Progresión de carga
                  </label>
                  <Button type="submit" size="sm" disabled={pending}>
                    Guardar ejercicio
                  </Button>
                </form>
              )}

              {isCombining && (
                <div className="mt-4 space-y-2 border-t border-border pt-4">
                  <p className="text-sm text-muted-foreground">
                    Combinar con:
                  </p>
                  {routine.exercises
                    .filter(
                      (other) =>
                        other.id !== ex.id &&
                        other.supersetGroupId !== ex.supersetGroupId,
                    )
                    .map((other) => (
                      <Button
                        key={other.id}
                        size="sm"
                        variant="secondary"
                        fullWidth
                        disabled={pending}
                        onClick={() =>
                          startTransition(async () => {
                            await combineExercises(ex.id, other.id);
                            setCombiningId(null);
                            router.refresh();
                          })
                        }
                      >
                        {other.exercise.name}
                      </Button>
                    ))}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setCombiningId(null)}
                  >
                    Cancelar
                  </Button>
                </div>
              )}

              {!isEditing && !isCombining && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingId(ex.id)}
                    aria-label="Editar"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  {!ex.supersetGroupId ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setCombiningId(ex.id)}
                      aria-label="Combinar"
                    >
                      <Link2 className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={pending}
                      onClick={() =>
                        startTransition(async () => {
                          await removeFromSuperset(ex.id);
                          router.refresh();
                        })
                      }
                      aria-label="Separar superset"
                    >
                      <Unlink className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={pending}
                    onClick={() => {
                      if (confirm("¿Eliminar ejercicio de la rutina?")) {
                        startTransition(async () => {
                          await removeExerciseFromRoutine(ex.id);
                          router.refresh();
                        });
                      }
                    }}
                    aria-label="Eliminar"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <AddExercisePicker
        exercises={allExercises.filter((e) => !existingExerciseIds.has(e.id))}
        onAdd={(exerciseId) =>
          startTransition(async () => {
            await addExerciseToRoutine(routine.id, { exerciseId });
            router.refresh();
          })
        }
        pending={pending}
      />
    </div>
  );
}
