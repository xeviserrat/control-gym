"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { RirSelector } from "@/components/workout/rir-selector";
import { formatRepRange, formatWeight } from "@/lib/utils";
import type { WorkoutStep } from "@/lib/workout/steps";

interface SetInputPanelProps {
  step: WorkoutStep;
  previousSets?: { weight: number; reps: number }[];
  existingSet?: { weight: number; reps: number; rir: number | null };
  onValuesChange?: (values: {
    weight: string;
    reps: string;
    rir?: number;
  }) => void;
}

function getInitialValues(
  step: WorkoutStep,
  previousSets?: { weight: number; reps: number }[],
  existingSet?: { weight: number; reps: number; rir: number | null },
) {
  if (existingSet) {
    return {
      weight: String(existingSet.weight),
      reps: String(existingSet.reps),
      rir: existingSet.rir ?? undefined,
    };
  }

  const prevSet = previousSets?.[step.setNumber - 1];
  return {
    weight: prevSet ? String(prevSet.weight) : "",
    reps: prevSet ? String(prevSet.reps) : "",
    rir: undefined as number | undefined,
  };
}

export function SetInputPanel({
  step,
  previousSets,
  existingSet,
  onValuesChange,
}: SetInputPanelProps) {
  const stepKey = `${step.workoutExerciseId}-${step.setNumber}`;
  const [values, setValues] = useState(() =>
    getInitialValues(step, previousSets, existingSet),
  );

  useEffect(() => {
    onValuesChange?.(values);
  }, [values, onValuesChange]);

  function update(partial: Partial<typeof values>) {
    const next = { ...values, ...partial };
    setValues(next);
    onValuesChange?.(next);
  }

  return (
    <div key={stepKey} className="space-y-6">
      <div className="text-center">
        <p className="text-sm text-muted-foreground">Objetivo</p>
        <p className="text-xl font-semibold">
          {formatRepRange(step.repsMin, step.repsMax)} reps
        </p>
      </div>

      {previousSets && previousSets.length > 0 && (
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Última vez
          </p>
          <div className="mt-2 space-y-1">
            {previousSets.map((s, i) => (
              <p key={i} className="text-sm">
                {formatWeight(s.weight)} kg × {s.reps}
              </p>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Peso (kg)"
          type="number"
          inputMode="decimal"
          inputSize="xl"
          value={values.weight}
          onChange={(e) => update({ weight: e.target.value })}
          step="0.5"
          min="0"
        />
        <Input
          label="Reps"
          type="number"
          inputMode="numeric"
          inputSize="xl"
          value={values.reps}
          onChange={(e) => update({ reps: e.target.value })}
          min="0"
        />
      </div>

      <RirSelector
        value={values.rir}
        onChange={(rir) => update({ rir })}
      />
    </div>
  );
}

export type SetInputValues = {
  weight: string;
  reps: string;
  rir?: number;
};
