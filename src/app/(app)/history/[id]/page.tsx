import { notFound } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
import { getWorkoutById } from "@/lib/actions/workouts";
import { formatDate, formatDuration, formatWeight } from "@/lib/utils";

export default async function WorkoutDetailPage({
  params,
}: PageProps<"/history/[id]">) {
  const { id } = await params;
  const workout = await getWorkoutById(id);
  if (!workout || workout.status !== "COMPLETED") notFound();

  const totalSets = workout.exercises.reduce(
    (acc, we) => acc + we.sets.length,
    0,
  );

  return (
    <>
      <AppHeader title="Detalle" backHref="/history" />
      <main className="space-y-6 px-4 py-6">
        <div>
          <h1 className="text-xl font-semibold">{workout.routine.name}</h1>
          <p className="text-sm text-muted-foreground">
            {formatDate(workout.date)}
            {workout.durationSeconds &&
              ` · ${formatDuration(workout.durationSeconds)}`}
            {` · ${totalSets} series`}
          </p>
        </div>

        <div className="space-y-6">
          {workout.exercises
            .filter((we) => !we.skipped && we.sets.length > 0)
            .map((we) => (
              <section key={we.id}>
                <h2 className="font-semibold">{we.exercise.name}</h2>
                <div className="mt-2 space-y-1">
                  {we.sets.map((s) => (
                    <p key={s.id} className="text-sm text-muted-foreground">
                      {formatWeight(Number(s.weight))} kg × {s.reps}
                      {s.rir != null && ` · RIR ${s.rir}`}
                    </p>
                  ))}
                </div>
              </section>
            ))}
        </div>
      </main>
    </>
  );
}
