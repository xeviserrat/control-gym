import { cn } from "@/lib/utils";
import type { PersonalRecord } from "@/lib/workout/personal-records";

type PersonalRecordsListProps = {
  records: readonly PersonalRecord[];
  exercises: readonly { exerciseId: string; exercise: { name: string } }[];
  className?: string;
};

export function PersonalRecordsList({ records, exercises, className }: PersonalRecordsListProps) {
  if (records.length === 0) return null;

  const exerciseNames = new Map(exercises.map(({ exerciseId, exercise }) => [
    exerciseId,
    exercise.name,
  ]));

  return (
    <section aria-labelledby="personal-records-heading" className={cn("space-y-2", className)}>
      <h2 id="personal-records-heading" className="text-sm font-medium text-muted-foreground">
        Récords personales
      </h2>
      <ul className="divide-y divide-border rounded-xl border border-success/30 bg-success/5 px-4">
        {records.map(({ exerciseId, reps, weight }) => (
          <li key={`${exerciseId}:${reps}`} className="flex flex-wrap justify-between gap-x-3 py-3 text-sm">
            <span className="font-semibold">{exerciseNames.get(exerciseId)}</span>
            <span className="whitespace-nowrap font-medium tabular-nums">
              {weight.toLocaleString("es-ES", { maximumFractionDigits: 2 })} kg × {reps}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
