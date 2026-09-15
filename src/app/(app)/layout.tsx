import { BottomNav } from "@/components/layout/bottom-nav";
import { requireUser, ensureProfile } from "@/lib/auth";
import { createExampleRoutineForUser } from "@/lib/seed/create-example-routine";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const user = await requireUser();
  await ensureProfile(user.id, user.email ?? "");
  await createExampleRoutineForUser(user.id);

  return (
    <div className="mx-auto min-h-screen max-w-lg bg-background pb-20">
      {children}
      <BottomNav />
    </div>
  );
}
