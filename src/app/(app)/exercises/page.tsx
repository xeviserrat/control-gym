import { AppHeader } from "@/components/layout/app-header";
import { ExerciseLibrary } from "@/components/exercises/exercise-library";
import { requireUser } from "@/lib/auth";
import { getExercises } from "@/lib/actions/exercises";

export default async function ExercisesPage() {
  const user = await requireUser();
  const exercises = await getExercises();

  return (
    <>
      <AppHeader title="Ejercicios" />
      <main className="px-4 py-6">
        <ExerciseLibrary exercises={exercises} currentUserId={user.id} />
      </main>
    </>
  );
}
