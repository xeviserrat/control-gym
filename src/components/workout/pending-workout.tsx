"use client";

import { useState } from "react";
import { AppLink } from "@/components/ui/app-link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { usePendingAction } from "@/hooks/use-pending-action";
import { cancelWorkout } from "@/lib/actions/workouts";

export function PendingWorkout({
  workoutId,
  routineName,
}: {
  workoutId: string;
  routineName: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const { pending, run } = usePendingAction();

  function handleCancel() {
    if (!window.confirm("¿Quieres cancelar este entrenamiento?")) return;

    setError(null);
    run(async () => {
      try {
        const result = await cancelWorkout(workoutId);
        if (!result.success) setError(result.error);
      } catch {
        setError("No se pudo cancelar el entrenamiento. Inténtalo de nuevo.");
      }
    }, { overlay: false });
  }

  return (
    <Card className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Entrenamiento en curso</h2>
        <p className="text-sm text-muted-foreground">{routineName}</p>
      </div>
      <div className="flex flex-col gap-2">
        {!pending && (
          <AppLink
            href={`/train/${workoutId}`}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-4 font-medium text-primary-foreground hover:bg-primary-hover"
          >
            Continuar entrenamiento
          </AppLink>
        )}
        <Button
          variant="outline"
          onClick={handleCancel}
          loading={pending}
          loadingText="Cancelando…"
        >
          Cancelar entrenamiento
        </Button>
      </div>
      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
    </Card>
  );
}
