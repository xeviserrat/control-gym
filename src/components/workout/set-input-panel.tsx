"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { LastTimeCollapsible } from "@/components/workout/last-time-collapsible";
import { ProgressionHint } from "@/components/workout/progression-hint";
import { RirSelector } from "@/components/workout/rir-selector";
import { formatRepRange } from "@/lib/utils";
import {
  getInSessionProgressionHint,
  isRepeatingQualifyingPerformance,
} from "@/lib/workout/progression";
import { getExerciseTrainingHint } from "@/lib/workout/progression-results";
import type { WorkoutStep } from "@/lib/workout/steps";

export interface SetInputValues {
  weight: string;
  reps: string;
  rir?: number;
}

interface SetInputPanelProps {
  step: WorkoutStep;
  previousSets?: { weight: number; reps: number }[];
  existingSet?: { weight: number; reps: number; rir: number | null };
  initialDraft?: SetInputValues;
  onValuesChange?: (values: SetInputValues) => void;
}

function getInitialValues(
  step: WorkoutStep,
  previousSets?: { weight: number; reps: number }[],
  existingSet?: { weight: number; reps: number; rir: number | null },
  initialDraft?: SetInputValues,
) {
  if (initialDraft?.weight || initialDraft?.reps) {
    return {
      weight: initialDraft.weight,
      reps: initialDraft.reps,
      rir: initialDraft.rir,
    };
  }

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
  initialDraft,
  onValuesChange,
}: SetInputPanelProps) {
  const stepKey = `${step.workoutExerciseId}-${step.setNumber}`;
  const [values, setValues] = useState(() =>
    getInitialValues(step, previousSets, existingSet, initialDraft),
  );

  useEffect(() => {
    onValuesChange?.(values);
  }, [values, onValuesChange]);

  function update(partial: Partial<typeof values>) {
    const next = { ...values, ...partial };
    setValues(next);
    onValuesChange?.(next);
  }

  const progressionHint = useMemo(
    () =>
      getInSessionProgressionHint(
        previousSets,
        step.repsMin,
        step.repsMax,
        step.loadProgression,
      ),
    [previousSets, step.repsMin, step.repsMax, step.loadProgression],
  );

  const trainingHint = useMemo(
    () =>
      getExerciseTrainingHint(
        step.exerciseName,
        previousSets,
        step.repsMin,
        step.repsMax,
        step.loadProgression,
      ),
    [
      step.exerciseName,
      previousSets,
      step.repsMin,
      step.repsMax,
      step.loadProgression,
    ],
  );

  const weightNum = parseFloat(values.weight);
  const repsNum = parseInt(values.reps, 10);
  const showLiveProgressionHint =
    progressionHint &&
    previousSets &&
    !isNaN(weightNum) &&
    !isNaN(repsNum) &&
    isRepeatingQualifyingPerformance(
      weightNum,
      repsNum,
      previousSets,
      step.repsMin,
      step.repsMax,
    );

  return (
    <div key={stepKey} className="space-y-6">
      <div className="text-center">
        <p className="text-sm text-muted-foreground">Objetivo</p>
        <p className="text-xl font-semibold">
          {formatRepRange(step.repsMin, step.repsMax)} reps
        </p>
      </div>

      {previousSets && previousSets.length > 0 && (
        <LastTimeCollapsible
          setNumber={step.setNumber}
          previousSets={previousSets}
          trainingHint={trainingHint}
        />
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

      {showLiveProgressionHint && step.setNumber > 1 && (
        <ProgressionHint
          hint={progressionHint}
          repsMax={step.repsMax}
          exerciseName={step.exerciseName}
          compact
        />
      )}
    </div>
  );
}
