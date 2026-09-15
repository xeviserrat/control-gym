import { notFound } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
import { RoutineEditor } from "@/components/routines/routine-editor";
import { getRoutineById } from "@/lib/actions/routines";
import { getExercises } from "@/lib/actions/exercises";

export default async function RoutineDetailPage({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [routine, exercises] = await Promise.all([
    getRoutineById(id),
    getExercises(),
  ]);

  if (!routine) notFound();

  return (
    <>
      <AppHeader title={routine.name} backHref="/routines" />
      <main className="px-4 py-6">
        <RoutineEditor routine={routine} allExercises={exercises} />
      </main>
    </>
  );
}
