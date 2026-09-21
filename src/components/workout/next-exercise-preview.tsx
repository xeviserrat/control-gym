import { formatRepRange, formatWeight } from "@/lib/utils";
import type { WorkoutStep } from "@/lib/workout/steps";

interface NextExercisePreviewProps {
  nextStep: WorkoutStep;
  currentStep: WorkoutStep;
  previousSet?: { weight: number; reps: number };
}

export function NextExercisePreview({
  nextStep,
  currentStep,
  previousSet,
}: NextExercisePreviewProps) {
  const isSameExercise =
    nextStep.workoutExerciseId === currentStep.workoutExerciseId;

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
      {previousSet && (
        <p className="mt-2 text-sm text-muted-foreground">
          Última vez: {formatWeight(previousSet.weight)} kg × {previousSet.reps}
        </p>
      )}
    </div>
  );
}
