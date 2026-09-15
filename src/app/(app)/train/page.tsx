import { redirect } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
import { getActiveWorkout } from "@/lib/actions/workouts";
import { getRoutines } from "@/lib/actions/routines";
import { TrainSetup } from "@/components/workout/train-setup";

export default async function TrainPage({
  searchParams,
}: {
  searchParams: Promise<{ routine?: string }>;
}) {
  const activeWorkout = await getActiveWorkout();

  if (activeWorkout) {
    redirect(`/train/${activeWorkout.id}`);
  }

  const routines = await getRoutines();
  const params = await searchParams;
  const preselectedRoutineId =
    typeof params.routine === "string" ? params.routine : undefined;

  return (
    <>
      <AppHeader title="Let's Train" />
      <main className="px-4 py-6">
        <TrainSetup
          routines={routines.filter((r) => r.isActive)}
          preselectedRoutineId={preselectedRoutineId}
        />
      </main>
    </>
  );
}
