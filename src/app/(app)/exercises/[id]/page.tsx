import { notFound } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
import { ExerciseDetailPanel } from "@/components/exercises/exercise-detail-panel";
import { ExerciseHistoryChart } from "@/components/exercises/exercise-history-chart";
import { requireUser } from "@/lib/auth";
import { getExerciseById } from "@/lib/actions/exercises";
import { formatDate, formatWeight } from "@/lib/utils";

const repRanges = [
  { label: "0 repeticiones", min: 0, max: 0 },
  { label: "1–5 repeticiones", min: 1, max: 5 },
  { label: "6–10 repeticiones", min: 6, max: 10 },
  { label: "11–15 repeticiones", min: 11, max: 15 },
  { label: "16+ repeticiones", min: 16, max: Infinity },
];

export default async function ExerciseDetailPage({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const data = await getExerciseById(id);
  if (!data) notFound();

  const { exercise, history, personalMarks } = data;
  const canEdit = exercise.userId === user.id && !exercise.isGlobal;

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
        <ExerciseDetailPanel exercise={exercise} canEdit={canEdit} />

        {chartData.length > 1 && <ExerciseHistoryChart data={chartData} />}

        {personalMarks.length > 0 && (
          <section aria-labelledby="personal-marks-heading">
            <h2 id="personal-marks-heading" className="mb-3 text-sm font-medium text-muted-foreground">
              Mejores marcas
            </h2>
            <div className="space-y-4 rounded-xl border border-border bg-surface px-4 py-3">
              {repRanges.map(({ label, min, max }) => {
                const marks = personalMarks.filter(({ reps }) => reps >= min && reps <= max);
                if (marks.length === 0) return null;

                return (
                  <div key={label}>
                    <h3 className="text-sm font-medium">{label}</h3>
                    <ul className="mt-1 space-y-1 text-sm text-muted-foreground">
                      {marks.map(({ reps, weight }) => (
                        <li key={reps} className="tabular-nums">
                          {weight.toLocaleString("es-ES", { maximumFractionDigits: 2 })} kg × {reps}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </section>
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
