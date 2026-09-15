import { notFound } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
import { getExerciseById } from "@/lib/actions/exercises";
import { formatDate, formatWeight } from "@/lib/utils";
import { ExerciseHistoryChart } from "@/components/exercises/exercise-history-chart";

export default async function ExerciseDetailPage({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getExerciseById(id);
  if (!data) notFound();

  const { exercise, history } = data;

  const sessionsMap = new Map<
    string,
    { date: Date; sets: { weight: number; reps: number }[] }
  >();

  for (const set of history) {
    const workoutId = set.workoutExercise.workout.id;
    const date = set.workoutExercise.workout.date;
    if (!sessionsMap.has(workoutId)) {
      sessionsMap.set(workoutId, { date, sets: [] });
    }
    sessionsMap.get(workoutId)!.sets.push({
      weight: Number(set.weight),
      reps: set.reps,
    });
  }

  const sessions = Array.from(sessionsMap.values()).sort(
    (a, b) => b.date.getTime() - a.date.getTime(),
  );

  const chartData = sessions
    .slice()
    .reverse()
    .map((s) => ({
      date: formatDate(s.date),
      maxWeight: Math.max(...s.sets.map((set) => set.weight)),
      volume: s.sets.reduce((acc, set) => acc + set.weight * set.reps, 0),
    }));

  return (
    <>
      <AppHeader title={exercise.name} backHref="/exercises" />
      <main className="space-y-6 px-4 py-6">
        {exercise.muscleGroup && (
          <p className="text-sm text-muted-foreground">{exercise.muscleGroup}</p>
        )}

        {chartData.length > 1 && (
          <ExerciseHistoryChart data={chartData} />
        )}

        <section>
          <h2 className="mb-3 text-sm font-medium text-muted-foreground">
            Historial
          </h2>
          {sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Sin entrenamientos registrados
            </p>
          ) : (
            <ul className="space-y-4">
              {sessions.map((session, i) => (
                <li
                  key={i}
                  className="rounded-xl border border-border bg-surface px-4 py-3"
                >
                  <p className="text-sm font-medium">{formatDate(session.date)}</p>
                  <div className="mt-2 space-y-1">
                    {session.sets.map((set, j) => (
                      <p key={j} className="text-sm text-muted-foreground">
                        {formatWeight(set.weight)} kg × {set.reps}
                      </p>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </>
  );
}
