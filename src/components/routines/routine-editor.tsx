"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePendingAction } from "@/hooks/use-pending-action";
import {
  ArrowLeftRight,
  ChevronDown,
  ChevronUp,
  Link2,
  Pencil,
  Trash2,
  Unlink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip } from "@/components/ui/tooltip";
import { formatRepRange } from "@/lib/utils";
import {
  addExerciseToRoutine,
  combineExercises,
  moveRoutineExercise,
  removeExerciseFromRoutine,
  removeFromSuperset,
  swapRoutineExercise,
  updateRoutine,
  updateRoutineExercise,
} from "@/lib/actions/routines";
import { AddExercisePicker } from "@/components/routines/add-exercise-picker";
import { getSupersetLabel } from "@/lib/routines/superset-label";

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
  const { pending, run } = usePendingAction("Guardando…");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [combiningId, setCombiningId] = useState<string | null>(null);
  const [swappingId, setSwappingId] = useState<string | null>(null);
  const router = useRouter();

  const existingExerciseIds = new Set(
    routine.exercises.map((e) => e.exercise.id),
  );

  return (
    <div className="space-y-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          run(async () => {
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
        <Button
          type="submit"
          size="sm"
          loading={pending}
          loadingText="Guardando…"
        >
          Guardar
        </Button>
      </form>

      <div className="space-y-3">
        {routine.exercises.map((ex, index) => {
          const label = getSupersetLabel(ex, routine.exercises);
          const isEditing = editingId === ex.id;
          const isCombining = combiningId === ex.id;
          const isSwapping = swappingId === ex.id;

          return (
            <div
              key={ex.id}
              className="rounded-2xl border border-border bg-surface p-4"
            >
              <div className="flex items-start gap-3">
                <div className="flex flex-col gap-1 pt-1">
                  <Tooltip content="Subir en el orden de la rutina">
                    <button
                      type="button"
                      disabled={index === 0 || pending}
                      onClick={() =>
                        run(async () => {
                          await moveRoutineExercise(ex.id, "up");
                          router.refresh();
                        })
                      }
                      className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                      aria-label="Subir"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                  </Tooltip>
                  <Tooltip content="Bajar en el orden de la rutina">
                    <button
                      type="button"
                      disabled={
                        index === routine.exercises.length - 1 || pending
                      }
                      onClick={() =>
                        run(async () => {
                          await moveRoutineExercise(ex.id, "down");
                          router.refresh();
                        })
                      }
                      className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                      aria-label="Bajar"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </Tooltip>
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
                    run(async () => {
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
                  <Button
                    type="submit"
                    size="sm"
                    loading={pending}
                    loadingText="Guardando…"
                  >
                    Guardar ejercicio
                  </Button>
                </form>
              )}

              {isSwapping && (
                <div className="mt-4 border-t border-border pt-4">
                  <AddExercisePicker
                    exercises={allExercises}
                    onAdd={(exerciseId) =>
                      run(async () => {
                        await swapRoutineExercise(ex.id, exerciseId);
                        setSwappingId(null);
                        router.refresh();
                      })
                    }
                    pending={pending}
                    pendingLabel="Cambiando ejercicio…"
                    label="Cambiar ejercicio"
                    excludeExerciseId={ex.exercise.id}
                    defaultOpen
                    onCancel={() => setSwappingId(null)}
                    allowCreate
                    createSubmitLabel="Crear y sustituir"
                  />
                </div>
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
                        !(
                          ex.supersetGroupId != null &&
                          other.supersetGroupId === ex.supersetGroupId
                        ),
                    )
                    .map((other) => (
                      <Button
                        key={other.id}
                        size="sm"
                        variant="secondary"
                        fullWidth
                        disabled={pending}
                        onClick={() =>
                          run(async () => {
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

              {!isEditing && !isCombining && !isSwapping && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <Tooltip content="Editar series, reps, descanso y notas">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingId(ex.id)}
                      aria-label="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Tooltip>
                  <Tooltip content="Sustituir por otro ejercicio sin perder la configuración">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSwappingId(ex.id)}
                      aria-label="Cambiar ejercicio"
                    >
                      <ArrowLeftRight className="h-4 w-4" />
                    </Button>
                  </Tooltip>
                  {!ex.supersetGroupId ? (
                    <Tooltip content="Agrupar en superset con otro ejercicio">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setCombiningId(ex.id)}
                        aria-label="Combinar"
                      >
                        <Link2 className="h-4 w-4" />
                      </Button>
                    </Tooltip>
                  ) : (
                    <Tooltip content="Quitar del superset y entrenar por separado">
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={pending}
                        onClick={() =>
                          run(async () => {
                            await removeFromSuperset(ex.id);
                            router.refresh();
                          })
                        }
                        aria-label="Separar superset"
                      >
                        <Unlink className="h-4 w-4" />
                      </Button>
                    </Tooltip>
                  )}
                  <Tooltip content="Quitar este ejercicio de la rutina">
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={pending}
                      onClick={() => {
                        if (confirm("¿Eliminar ejercicio de la rutina?")) {
                          run(async () => {
                            await removeExerciseFromRoutine(ex.id);
                            router.refresh();
                          });
                        }
                      }}
                      aria-label="Eliminar"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </Tooltip>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <AddExercisePicker
        exercises={allExercises.filter((e) => !existingExerciseIds.has(e.id))}
        onAdd={(exerciseId) =>
          run(async () => {
            await addExerciseToRoutine(routine.id, { exerciseId });
            router.refresh();
          })
        }
        pending={pending}
        allowCreate
      />
    </div>
  );
}
