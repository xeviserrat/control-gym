"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Trash2 } from "lucide-react";
import { AppLink } from "@/components/ui/app-link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { usePendingAction } from "@/hooks/use-pending-action";
import {
  duplicateRoutine,
  deleteRoutine,
  toggleRoutineActive,
} from "@/lib/actions/routines";

type RoutineAction = "toggle" | "duplicate" | "delete";

interface RoutineListItemProps {
  routine: {
    id: string;
    name: string;
    description: string | null;
    isActive: boolean;
    exercises: { id: string }[];
    _count: { workouts: number };
  };
}

export function RoutineListItem({ routine }: RoutineListItemProps) {
  const router = useRouter();
  const { pending, run } = usePendingAction();
  const [activeAction, setActiveAction] = useState<RoutineAction | null>(null);
  const [error, setError] = useState<string | null>(null);

  function runAction(
    action: RoutineAction,
    task: () => Promise<boolean | void>,
    message: string,
  ) {
    setError(null);
    setActiveAction(action);
    run(
      async () => {
        try {
          const shouldRefresh = await task();
          if (shouldRefresh !== false) {
            router.refresh();
          }
        } finally {
          setActiveAction(null);
        }
      },
      { message },
    );
  }

  const canDelete = routine._count.workouts === 0;

  return (
    <Card className={!routine.isActive ? "opacity-60" : ""}>
      <AppLink href={`/routines/${routine.id}`}>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold">{routine.name}</h3>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {routine.exercises.length} ejercicios
              {routine._count.workouts > 0 &&
                ` · ${routine._count.workouts} entrenamientos`}
            </p>
          </div>
          {!routine.isActive && (
            <span className="rounded-full bg-border px-2 py-0.5 text-xs text-muted-foreground">
              Inactiva
            </span>
          )}
        </div>
      </AppLink>

      {error && (
        <p className="mt-3 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <div className="mt-3 flex gap-2">
        <Button
          size="sm"
          variant="ghost"
          loading={pending && activeAction === "toggle"}
          loadingText={
            routine.isActive ? "Desactivando…" : "Activando…"
          }
          disabled={pending}
          onClick={() =>
            runAction(
              "toggle",
              async () => {
                await toggleRoutineActive(routine.id);
              },
              routine.isActive ? "Desactivando rutina…" : "Activando rutina…",
            )
          }
        >
          {routine.isActive ? "Desactivar" : "Activar"}
        </Button>
        <Tooltip content="Crear una copia de esta rutina">
          <Button
            size="sm"
            variant="ghost"
            loading={pending && activeAction === "duplicate"}
            disabled={pending}
            onClick={() =>
              runAction(
                "duplicate",
                async () => {
                  await duplicateRoutine(routine.id);
                },
                "Duplicando rutina…",
              )
            }
            aria-label="Duplicar rutina"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </Tooltip>
        {canDelete && (
          <Tooltip content="Eliminar rutina permanentemente">
            <Button
              size="sm"
              variant="ghost"
              loading={pending && activeAction === "delete"}
              disabled={pending}
              onClick={() => {
                if (!confirm("¿Eliminar esta rutina?")) return;
                runAction(
                  "delete",
                  async () => {
                    const result = await deleteRoutine(routine.id);
                    if (!result.success) {
                      setError(result.error);
                      return false;
                    }
                  },
                  "Eliminando rutina…",
                );
              }}
              aria-label="Eliminar rutina"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </Tooltip>
        )}
      </div>
    </Card>
  );
}
