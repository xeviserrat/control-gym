import { formatWeight } from "@/lib/utils";
import { getCompletedSetFeedback } from "@/lib/workout/progression";

type SessionSet = {
  readonly id: string;
  readonly weight: number | string;
  readonly reps: number;
  readonly rir?: number | null;
};

type ExerciseSessionSetsProps = {
  readonly exerciseName: string;
  readonly sets: readonly SessionSet[];
  readonly repsMin: number;
  readonly repsMax: number;
  readonly loadProgression: boolean;
};

export function ExerciseSessionSets({
  exerciseName,
  sets,
  repsMin,
  repsMax,
  loadProgression,
}: ExerciseSessionSetsProps) {
  const weightedSets = sets.map((s) => ({
    weight: typeof s.weight === "number" ? s.weight : Number(s.weight),
    reps: s.reps,
  }));

  return (
    <section>
      <h2 className="font-semibold">{exerciseName}</h2>
      <div className="mt-2 space-y-2">
        {sets.map((set, index) => {
          const setNumber = index + 1;
          const hint = getCompletedSetFeedback(
            weightedSets[index],
            setNumber,
            weightedSets,
            repsMin,
            repsMax,
            loadProgression,
          );

          return (
            <div
              key={set.id}
              className="rounded-xl border border-border bg-surface px-3 py-2.5"
            >
              <p className="text-sm text-foreground">
                <span className="text-muted-foreground">Serie {setNumber}:</span>{" "}
                {formatWeight(set.weight)} kg × {set.reps}
                {set.rir != null && (
                  <span className="text-muted-foreground"> · RIR {set.rir}</span>
                )}
              </p>

              {hint && (
                <div
                  className={`mt-2 rounded-lg border px-2.5 py-2 text-xs ${
                    hint.variant === "success"
                      ? "border-success/30 bg-success/5"
                      : "border-warning/30 bg-warning/5"
                  }`}
                >
                  <p
                    className={`font-medium ${
                      hint.variant === "success" ? "text-success" : "text-warning"
                    }`}
                  >
                    {hint.title}
                  </p>
                  <p className="mt-0.5 text-muted-foreground">{hint.message}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
