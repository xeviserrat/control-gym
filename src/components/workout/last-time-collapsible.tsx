import { ChevronDown } from "lucide-react";
import { formatWeight } from "@/lib/utils";
import type { StartTrainingHint } from "@/lib/workout/progression-results";

type LastTimeCollapsibleProps = {
  readonly setNumber: number;
  readonly previousSets: { weight: number; reps: number }[];
  readonly trainingHint: StartTrainingHint | null;
};

export function LastTimeCollapsible({
  setNumber,
  previousSets,
  trainingHint,
}: LastTimeCollapsibleProps) {
  const currentSet = previousSets[setNumber - 1];
  const preview = currentSet
    ? `Serie ${setNumber}: ${formatWeight(currentSet.weight)} kg × ${currentSet.reps}`
    : `${previousSets.length} series`;

  return (
    <details className="group rounded-2xl border border-border bg-surface">
      <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Última vez
          </p>
          <p className="mt-0.5 truncate text-sm text-foreground">{preview}</p>
        </div>
        <ChevronDown
          className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>

      <div className="space-y-3 border-t border-border px-4 pb-4 pt-3">
        <div className="space-y-1">
          {previousSets.map((s, i) => {
            const isCurrent = i === setNumber - 1;
            return (
              <p
                key={i}
                className={`text-sm ${
                  isCurrent
                    ? "font-semibold text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                Serie {i + 1}: {formatWeight(s.weight)} kg × {s.reps}
              </p>
            );
          })}
        </div>

        {trainingHint && (
          <div
            className={`rounded-xl border px-3 py-2.5 text-sm ${
              trainingHint.variant === "success"
                ? "border-success/30 bg-success/5"
                : "border-warning/30 bg-warning/5"
            }`}
          >
            <p
              className={`font-medium ${
                trainingHint.variant === "success"
                  ? "text-success"
                  : "text-warning"
              }`}
            >
              {trainingHint.title}
            </p>
            <p className="mt-0.5 text-muted-foreground">{trainingHint.message}</p>
          </div>
        )}
      </div>
    </details>
  );
}
