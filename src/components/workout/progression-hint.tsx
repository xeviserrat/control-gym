import { AlertTriangle, TrendingUp } from "lucide-react";
import type { InSessionProgressionHint } from "@/lib/workout/progression";

interface ProgressionHintProps {
  hint: InSessionProgressionHint;
  exerciseName?: string;
  compact?: boolean;
}

export function ProgressionHint({
  hint,
  exerciseName,
  compact,
}: ProgressionHintProps) {
  const isSuccess = hint.variant === "success";
  const Icon = isSuccess ? TrendingUp : AlertTriangle;

  return (
    <div
      className={`rounded-2xl border ${
        isSuccess
          ? "border-success/30 bg-success/5"
          : "border-warning/30 bg-warning/5"
      } ${compact ? "px-3 py-2" : "p-4"}`}
    >
      <div className="flex items-start gap-2">
        <Icon
          className={`mt-0.5 h-4 w-4 shrink-0 ${
            isSuccess ? "text-success" : "text-warning"
          }`}
        />
        <div>
          {exerciseName && (
            <p
              className={`font-semibold text-foreground ${compact ? "text-xs" : "text-sm"}`}
            >
              {exerciseName}
            </p>
          )}
          <p
            className={`font-medium ${isSuccess ? "text-success" : "text-warning"} ${compact ? "text-xs" : "text-sm"}`}
          >
            {hint.title}
          </p>
          <p
            className={`mt-0.5 text-muted-foreground ${compact ? "text-xs" : "text-sm"}`}
          >
            {hint.message}
          </p>
        </div>
      </div>
    </div>
  );
}
