"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Copy, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  duplicateRoutine,
  deleteRoutine,
  toggleRoutineActive,
} from "@/lib/actions/routines";

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
  const [pending, startTransition] = useTransition();

  return (
    <Card className={!routine.isActive ? "opacity-60" : ""}>
      <Link href={`/routines/${routine.id}`}>
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
      </Link>

      <div className="mt-3 flex gap-2">
        <Button
          size="sm"
          variant="ghost"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await toggleRoutineActive(routine.id);
            })
          }
        >
          {routine.isActive ? "Desactivar" : "Activar"}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await duplicateRoutine(routine.id);
            })
          }
          aria-label="Duplicar rutina"
        >
          <Copy className="h-4 w-4" />
        </Button>
        {routine._count.workouts === 0 && (
          <Button
            size="sm"
            variant="ghost"
            disabled={pending}
            onClick={() => {
              if (confirm("¿Eliminar esta rutina?")) {
                startTransition(async () => {
                  await deleteRoutine(routine.id);
                });
              }
            }}
            aria-label="Eliminar rutina"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        )}
      </div>
    </Card>
  );
}
