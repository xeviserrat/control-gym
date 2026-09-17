import type { ProgressionResultItem } from "@/lib/workout/progression-results";

type ProgressionResultsListProps = {
  readonly results: ProgressionResultItem[];
  readonly heading?: string;
};

export function ProgressionResultsList({
  results,
  heading = "Consejos para la próxima sesión",
}: ProgressionResultsListProps) {
  if (results.length === 0) return null;

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-medium text-muted-foreground">{heading}</h2>
      {results.map((result) => (
        <div
          key={result.exerciseName}
          className={`rounded-xl border px-4 py-3 text-sm ${
            result.variant === "success"
              ? "border-success/30 bg-success/5"
              : "border-warning/30 bg-warning/5"
          }`}
        >
          <p className="font-semibold text-foreground">{result.exerciseName}</p>
          <p className="mt-1 font-medium">{result.title}</p>
          <p className="mt-0.5 text-muted-foreground">{result.message}</p>
        </div>
      ))}
    </div>
  );
}
