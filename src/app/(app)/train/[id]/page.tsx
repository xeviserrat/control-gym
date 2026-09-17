import { notFound } from "next/navigation";
import { getWorkoutSession } from "@/lib/actions/workouts";
import { getExercises } from "@/lib/actions/exercises";
import { WorkoutSession } from "@/components/workout/workout-session";

export default async function ActiveWorkoutPage({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [session, exercises] = await Promise.all([
    getWorkoutSession(id),
    getExercises(),
  ]);
  if (!session) notFound();

  return <WorkoutSession session={session} exercises={exercises} />;
}
