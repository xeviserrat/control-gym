"use client";

import { useCallback, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { RestTimer } from "@/components/workout/rest-timer";
import {
  SetInputPanel,
  type SetInputValues,
} from "@/components/workout/set-input-panel";
import { useWorkoutGuard } from "@/hooks/use-workout-guard";
import { WorkoutSummary } from "@/components/workout/workout-summary";
import {
  completeSet,
  finishWorkout,
  skipExercise,
  cancelWorkout,
} from "@/lib/actions/workouts";
import type { WorkoutSessionData } from "@/lib/workout/types";
import type { WorkoutStep } from "@/lib/workout/steps";

const STORAGE_KEY = "workout-session-state";

interface PersistedState {
  workoutId: string;
  stepIndex: number;
  phase: "set" | "rest";
  draft?: SetInputValues;
}

function getCompletedSetKey(step: WorkoutStep) {
  return `${step.workoutExerciseId}-${step.setNumber}`;
}

function findStepIndex(steps: WorkoutStep[], completedKeys: Set<string>): number {
  const idx = steps.findIndex(
    (s) => !completedKeys.has(getCompletedSetKey(s)),
  );
  return idx === -1 ? Math.max(0, steps.length - 1) : idx;
}

function loadPersistedState(
  workoutId: string,
  steps: WorkoutStep[],
  completedKeys: Set<string>,
): { stepIndex: number; phase: "set" | "rest"; draft?: SetInputValues } {
  if (typeof window === "undefined") {
    return { stepIndex: findStepIndex(steps, completedKeys), phase: "set" };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed: PersistedState = JSON.parse(stored);
      if (parsed.workoutId === workoutId) {
        return {
          stepIndex: parsed.stepIndex,
          phase: parsed.phase === "rest" ? "rest" : "set",
          draft: parsed.draft,
        };
      }
    }
  } catch {
    // ignore
  }

  return { stepIndex: findStepIndex(steps, completedKeys), phase: "set" };
}

export function WorkoutSession({ session }: { session: WorkoutSessionData }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const completedKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const we of session.workout.exercises) {
      for (const s of we.sets) {
        keys.add(`${we.id}-${s.setNumber}`);
      }
    }
    return keys;
  }, [session.workout.exercises]);

  const steps = session.steps;

  const [initialState] = useState(() =>
    loadPersistedState(session.workout.id, steps, completedKeys),
  );

  const [phase, setPhase] = useState<"set" | "rest" | "summary">(
    initialState.phase,
  );
  const [stepIndex, setStepIndex] = useState(initialState.stepIndex);
  const [savedDraft] = useState(initialState.draft);

  useWorkoutGuard(phase !== "summary");
  const [justCompleted, setJustCompleted] = useState(false);
  const [finishData, setFinishData] = useState<{
    durationSeconds: number;
    totalSets: number;
    totalVolume: number;
    progressionResults: Array<{
      exerciseName: string;
      title: string;
      message: string;
      variant: "success" | "warning";
    } | null>;
  } | null>(null);

  const inputValuesRef = useRef<SetInputValues>({ weight: "", reps: "" });
  const [canSubmit, setCanSubmit] = useState(false);

  const persistState = useCallback(
    (
      index: number,
      currentPhase: "set" | "rest",
      draft?: SetInputValues,
    ) => {
      const state: PersistedState = {
        workoutId: session.workout.id,
        stepIndex: index,
        phase: currentPhase,
      };
      if (draft?.weight || draft?.reps) {
        state.draft = draft;
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    },
    [session.workout.id],
  );

  const handleValuesChange = useCallback(
    (values: SetInputValues) => {
      inputValuesRef.current = values;
      setCanSubmit(Boolean(values.weight && values.reps));
      if (phase === "set") {
        persistState(stepIndex, "set", values);
      }
    },
    [phase, persistState, stepIndex],
  );

  const currentStep = steps[stepIndex];
  const isLastStep = stepIndex >= steps.length - 1;

  const completedCount = session.workout.exercises.reduce(
    (acc, we) => acc + we.sets.length,
    0,
  );

  function goToStep(index: number) {
    const clamped = Math.max(0, Math.min(index, steps.length - 1));
    setStepIndex(clamped);
    setPhase("set");
    setJustCompleted(false);
    persistState(clamped, "set");
  }

  function handleCompleteSet() {
    if (!currentStep) return;

    const { weight, reps, rir } = inputValuesRef.current;
    const weightNum = parseFloat(weight);
    const repsNum = parseInt(reps, 10);

    if (isNaN(weightNum) || isNaN(repsNum)) return;

    startTransition(async () => {
      const result = await completeSet({
        workoutId: session.workout.id,
        workoutExerciseId: currentStep.workoutExerciseId,
        setNumber: currentStep.setNumber,
        weight: weightNum,
        reps: repsNum,
        rir,
      });

      if (!result.success) return;

      router.refresh();
      setJustCompleted(true);

      if (currentStep.isLastInSupersetRound && currentStep.restSeconds > 0) {
        setPhase("rest");
        persistState(stepIndex, "rest");
      } else {
        advanceStep();
      }
    });
  }

  function advanceStep() {
    if (isLastStep) {
      handleFinish();
    } else {
      const next = stepIndex + 1;
      setStepIndex(next);
      setPhase("set");
      setJustCompleted(false);
      persistState(next, "set");
    }
  }

  function handleRestComplete() {
    advanceStep();
  }

  function handleFinish() {
    startTransition(async () => {
      const result = await finishWorkout(session.workout.id);
      if (result.success) {
        localStorage.removeItem(STORAGE_KEY);
        setFinishData(result.data);
        setPhase("summary");
        router.refresh();
      }
    });
  }

  if (phase === "summary" && finishData) {
    return (
      <WorkoutSummary
        workout={{
          ...session.workout,
          durationSeconds: finishData.durationSeconds,
        }}
        progressionResults={finishData.progressionResults}
        totalSets={finishData.totalSets}
        totalVolume={finishData.totalVolume}
      />
    );
  }

  if (!currentStep) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Button onClick={handleFinish} size="lg" disabled={pending}>
          Finalizar entrenamiento
        </Button>
      </div>
    );
  }

  const prev = session.previousPerformance[currentStep.exerciseId];
  const existingSet = session.workout.exercises
    .find((we) => we.id === currentStep.workoutExerciseId)
    ?.sets.find((s) => s.setNumber === currentStep.setNumber);

  const stepKey = `${currentStep.workoutExerciseId}-${currentStep.setNumber}-${existingSet?.id ?? "new"}`;

  const initialDraft =
    phase === "set" && stepIndex === initialState.stepIndex
      ? savedDraft
      : undefined;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">
            {session.workout.routine.name}
          </p>
          <button
            type="button"
            onClick={() => {
              if (confirm("¿Cancelar entrenamiento?")) {
                startTransition(async () => {
                  await cancelWorkout(session.workout.id);
                  localStorage.removeItem(STORAGE_KEY);
                  router.push("/train");
                });
              }
            }}
            className="text-xs text-destructive"
          >
            Cancelar
          </button>
        </div>
        <ProgressBar
          value={completedCount}
          max={session.totalSteps}
          className="mt-3"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          {completedCount} / {session.totalSteps} series
        </p>
      </div>

      {phase === "rest" ? (
        <RestTimer
          seconds={currentStep.restSeconds}
          onComplete={handleRestComplete}
          onSkip={handleRestComplete}
        />
      ) : (
        <>
          <div className="flex-1 px-4 py-6">
            {justCompleted && (
              <p className="mb-4 text-center text-sm font-medium text-success">
                Serie completada
              </p>
            )}

            <div className="text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                {currentStep.exerciseName}
              </h1>
              <p className="mt-2 text-lg text-muted-foreground">
                Serie {currentStep.setNumber} / {currentStep.totalSets}
              </p>
            </div>

            <div className="mt-8">
              <SetInputPanel
                key={stepKey}
                step={currentStep}
                previousSets={prev?.sets}
                existingSet={existingSet}
                initialDraft={initialDraft}
                onValuesChange={handleValuesChange}
              />
            </div>
          </div>

          <div className="sticky bottom-0 border-t border-border bg-background/95 px-4 py-4 backdrop-blur-md safe-bottom">
            <div className="mb-3 flex items-center justify-between">
              <button
                type="button"
                disabled={stepIndex === 0}
                onClick={() => goToStep(stepIndex - 1)}
                className="flex items-center gap-1 text-sm text-primary disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </button>
              <button
                type="button"
                disabled={stepIndex >= steps.length - 1}
                onClick={() => goToStep(stepIndex + 1)}
                className="flex items-center gap-1 text-sm text-primary disabled:opacity-30"
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <Button
              size="xl"
              fullWidth
              disabled={pending || !canSubmit}
              onClick={handleCompleteSet}
            >
              {pending ? "Guardando..." : "Completar serie"}
            </Button>

            {currentStep.isOptional && (
              <Button
                variant="ghost"
                fullWidth
                className="mt-2"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    await skipExercise(currentStep.workoutExerciseId);
                    advanceStep();
                  })
                }
              >
                Saltar ejercicio
              </Button>
            )}

            {isLastStep && (
              <Button
                variant="secondary"
                fullWidth
                className="mt-2"
                disabled={pending}
                onClick={handleFinish}
              >
                Finalizar entrenamiento
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
