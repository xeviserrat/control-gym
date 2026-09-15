import { notFound } from "next/navigation";
import { getWorkoutSession } from "@/lib/actions/workouts";
import { WorkoutSession } from "@/components/workout/workout-session";

export default async function ActiveWorkoutPage({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getWorkoutSession(id);
  if (!session) notFound();

  return <WorkoutSession session={session} />;
}
