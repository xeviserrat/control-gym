import Link from "next/link";
import { AppHeader } from "@/components/layout/app-header";
import { EmptyState } from "@/components/ui/empty-state";
import { getWorkouts } from "@/lib/actions/workouts";
import { formatDate, formatDuration } from "@/lib/utils";

export default async function HistoryPage() {
  const workouts = await getWorkouts();

  return (
    <>
      <AppHeader title="Historial" />
      <main className="px-4 py-6">
        {workouts.length === 0 ? (
          <EmptyState
            title="Sin entrenamientos"
            description="Completa tu primer entrenamiento para verlo aquí."
          />
        ) : (
          <ul className="space-y-3">
            {workouts.map((workout) => {
              const totalSets = workout.exercises.reduce(
                (acc, we) => acc + we.sets.length,
                0,
              );

              return (
                <li key={workout.id}>
                  <Link
                    href={`/history/${workout.id}`}
                    className="block rounded-2xl border border-border bg-surface px-4 py-4 hover:bg-surface-elevated"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold">{workout.routine.name}</p>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {formatDate(workout.date)}
                        </p>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        {workout.durationSeconds &&
                          formatDuration(workout.durationSeconds)}
                        <p className="text-xs">{totalSets} series</p>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </>
  );
}
