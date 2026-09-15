import Link from "next/link";
import { AppHeader } from "@/components/layout/app-header";
import { getExercises } from "@/lib/actions/exercises";
import { CreateExerciseForm } from "@/components/exercises/create-exercise-form";

export default async function ExercisesPage() {
  const exercises = await getExercises();

  return (
    <>
      <AppHeader title="Ejercicios" backHref="/routines" />
      <main className="px-4 py-6">
        <CreateExerciseForm />

        <ul className="mt-6 space-y-2">
          {exercises.map((ex) => (
            <li key={ex.id}>
              <Link
                href={`/exercises/${ex.id}`}
                className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 hover:bg-surface-elevated"
              >
                <div>
                  <p className="font-medium">{ex.name}</p>
                  {ex.muscleGroup && (
                    <p className="text-xs text-muted-foreground">
                      {ex.muscleGroup}
                    </p>
                  )}
                </div>
                {ex.isGlobal && (
                  <span className="text-xs text-muted-foreground">Global</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
