import { AppLink } from "@/components/ui/app-link";
import { AppHeader } from "@/components/layout/app-header";
import { EmptyState } from "@/components/ui/empty-state";
import { getWorkouts } from "@/lib/actions/workouts";
import { formatDuration, formatWeight } from "@/lib/utils";
import { calculateWorkoutVolume } from "@/lib/workout/progression";

const weekDate = new Intl.DateTimeFormat("es-ES", {
  dateStyle: "long",
  timeZone: "UTC",
});

const workoutDate = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "UTC",
});

interface Week {
  workouts: {
    workout: Awaited<ReturnType<typeof getWorkouts>>[number];
    totalSets: number;
    totalVolume: number;
  }[];
  totalSets: number;
  totalVolume: number;
}

export default async function HistoryPage() {
  const workouts = await getWorkouts();
  const weeks = new Map<number, Week>();

  for (const workout of workouts) {
    // Workout dates are stored as calendar dates and returned at midnight UTC.
    const monday = new Date(workout.date);
    monday.setUTCDate(monday.getUTCDate() - ((monday.getUTCDay() + 6) % 7));
    const weekStart = monday.getTime();

    const week = weeks.get(weekStart) ?? {
      workouts: [],
      totalSets: 0,
      totalVolume: 0,
    };

    const totalSets = workout.exercises.reduce(
      (sum, exercise) => sum + exercise.sets.length,
      0,
    );
    const totalVolume = calculateWorkoutVolume(workout.exercises);

    week.workouts.push({ workout, totalSets, totalVolume });
    week.totalSets += totalSets;
    week.totalVolume += totalVolume;
    weeks.set(weekStart, week);
  }

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
          <div className="space-y-8">
            {Array.from(weeks, ([weekStart, week]) => {
              const sunday = new Date(weekStart);
              sunday.setUTCDate(sunday.getUTCDate() + 6);

              return (
                <section key={weekStart} aria-labelledby={`week-${weekStart}`}>
                  <h2 id={`week-${weekStart}`} className="font-semibold">
                    Semana del {weekDate.formatRange(new Date(weekStart), sunday)}
                  </h2>
                  <p className="mb-3 mt-1 text-sm text-muted-foreground">
                    {week.workouts.length} {week.workouts.length === 1 ? "entrenamiento" : "entrenamientos"}
                    {" · "}{week.totalSets} series
                    {" · "}{formatWeight(week.totalVolume)} kg de volumen
                  </p>
                  <ul className="space-y-3">
                    {week.workouts.map(({ workout, totalSets, totalVolume }) => (
                      <li key={workout.id}>
                        <AppLink
                          href={`/history/${workout.id}`}
                          className="block rounded-2xl border border-border bg-surface px-4 py-4 hover:bg-surface-elevated"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold">{workout.routine.name}</p>
                              <p className="mt-0.5 text-sm text-muted-foreground">
                                {workoutDate.format(workout.date)}
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
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
