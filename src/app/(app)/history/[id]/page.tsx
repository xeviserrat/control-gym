import { notFound } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
import { ExerciseSessionSets } from "@/components/workout/exercise-session-sets";
import { getWorkoutById } from "@/lib/actions/workouts";
import { formatDate, formatDuration } from "@/lib/utils";

export default async function WorkoutDetailPage({
  params,
}: { params: Promise<{ id: string }> }) {
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
              <ExerciseSessionSets
                key={we.id}
                exerciseName={we.exercise.name}
                sets={we.sets.map((s) => ({
                  id: s.id,
                  weight: Number(s.weight),
                  reps: s.reps,
                  rir: s.rir,
                }))}
                repsMin={we.repsMin}
                repsMax={we.repsMax}
                loadProgression={we.loadProgression}
              />
            ))}
        </div>
      </main>
    </>
  );
}
