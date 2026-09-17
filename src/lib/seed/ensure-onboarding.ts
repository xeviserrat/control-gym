import { prisma } from "@/lib/prisma";
import { createExampleRoutineForUser } from "@/lib/seed/create-example-routine";

export async function ensureOnboarding(userId: string) {
  const profile = await prisma.profile.findUnique({
    where: { id: userId },
    select: { onboardingComplete: true },
  });

  if (profile?.onboardingComplete) return;

  const routineCount = await prisma.routine.count({
    where: { userId },
  });

  if (routineCount === 0) {
    await createExampleRoutineForUser(userId);
  }

  await prisma.profile.update({
    where: { id: userId },
    data: { onboardingComplete: true },
  });
}
