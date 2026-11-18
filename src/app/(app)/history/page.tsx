import { AppLink } from "@/components/ui/app-link";
import { AppHeader } from "@/components/layout/app-header";
import { EmptyState } from "@/components/ui/empty-state";
import { getWorkouts } from "@/lib/actions/workouts";
import { formatDate, formatDuration, formatWeight } from "@/lib/utils";
import { calculateWorkoutVolume } from "@/lib/workout/progression";

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

              const totalVolume = calculateWorkoutVolume(workout.exercises);

              return (
                <li key={workout.id}>
                  <AppLink
                    href={`/history/${workout.id}`}
                    className="block rounded-2xl border border-border bg-surface px-4 py-4 hover:bg-surface-elevated"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{workout.routine.name}</p>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {formatDate(workout.date)}
                        </p>
                      </div>
                      <div className="shrink-0 text-right text-sm text-muted-foreground">
                        {workout.durationSeconds &&
                          formatDuration(workout.durationSeconds)}
                        <p className="text-xs">{totalSets} series</p>
                        <p className="mt-1 font-medium text-foreground">
                          Volumen total · {formatWeight(totalVolume)} kg
                        </p>
                      </div>
                    </div>
                  </AppLink>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </>
  );
}
