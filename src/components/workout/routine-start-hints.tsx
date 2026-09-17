import type { StartTrainingHint } from "@/lib/workout/progression-results";

type RoutineStartHintsProps = {
  readonly hints: StartTrainingHint[];
};

export function RoutineStartHints({ hints }: RoutineStartHintsProps) {
  if (hints.length === 0) return null;

  return (
    <section className="space-y-2">
      <h2 className="text-sm font-medium text-muted-foreground">
        Basado en tu última sesión
      </h2>
      {hints.map((hint) => (
        <div
          key={hint.exerciseName}
          className={`rounded-xl border px-4 py-3 text-sm ${
            hint.variant === "success"
              ? "border-success/30 bg-success/5"
              : "border-warning/30 bg-warning/5"
          }`}
        >
          <p className="font-semibold text-foreground">{hint.exerciseName}</p>
          <p className="mt-1 font-medium">{hint.title}</p>
          <p className="mt-0.5 text-muted-foreground">{hint.message}</p>
        </div>
      ))}
    </section>
  );
}
