import { LastTimeCollapsible } from "@/components/workout/last-time-collapsible";
import { formatRepRange } from "@/lib/utils";
import { getExerciseTrainingHint } from "@/lib/workout/progression-results";
import type { WorkoutStep } from "@/lib/workout/steps";

interface NextExercisePreviewProps {
  nextStep: WorkoutStep;
  currentStep: WorkoutStep;
  previousSets?: { weight: number; reps: number }[];
}

export function NextExercisePreview({
  nextStep,
  currentStep,
  previousSets,
}: NextExercisePreviewProps) {
  const isSameExercise =
    nextStep.workoutExerciseId === currentStep.workoutExerciseId;
  const hasPrevious = Boolean(previousSets && previousSets.length > 0);

  return (
    <div className="rounded-2xl border border-border bg-surface px-4 py-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {isSameExercise ? "Siguiente serie" : "Siguiente ejercicio"}
      </p>
      <p className="mt-1 text-lg font-semibold tracking-tight">
        {nextStep.exerciseName}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        Serie {nextStep.setNumber} / {nextStep.totalSets} ·{" "}
        {formatRepRange(nextStep.repsMin, nextStep.repsMax)} reps
      </p>
      {hasPrevious && previousSets && (
        <div className="mt-4">
          <LastTimeCollapsible
            embedded
            setNumber={nextStep.setNumber}
            previousSets={previousSets}
            trainingHint={getExerciseTrainingHint(
              nextStep.exerciseName,
              previousSets,
              nextStep.repsMin,
              nextStep.repsMax,
              nextStep.loadProgression,
              nextStep.setNumber,
            )}
          />
        </div>
      )}
    </div>
  );
}
