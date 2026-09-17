import { TrendingUp } from "lucide-react";
import { formatWeight } from "@/lib/utils";
import type { InSessionProgressionHint } from "@/lib/workout/progression";

interface ProgressionHintProps {
  hint: InSessionProgressionHint;
  repsMax: number;
  exerciseName?: string;
  compact?: boolean;
}

export function ProgressionHint({
  hint,
  repsMax,
  exerciseName,
  compact,
}: ProgressionHintProps) {
  const detail = `La última vez: ${formatWeight(hint.previousWeight)} kg × ${repsMax}+ reps en todas las series. Prueba ~${formatWeight(hint.suggestedWeight)} kg.`;

  return (
    <div
      className={`rounded-2xl border border-success/30 bg-success/5 ${
        compact ? "px-3 py-2" : "p-4"
      }`}
    >
      <div className="flex items-start gap-2">
        <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-success" />
        <div>
          {exerciseName && (
            <p className={`font-semibold text-foreground ${compact ? "text-xs" : "text-sm"}`}>
              {exerciseName}
            </p>
          )}
          <p className={`font-medium text-success ${compact ? "text-xs" : "text-sm"}`}>
            {hint.title}
          </p>
          <p className={`mt-0.5 text-muted-foreground ${compact ? "text-xs" : "text-sm"}`}>
            {detail}
          </p>
        </div>
      </div>
    </div>
  );
}
