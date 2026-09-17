import { BottomNav } from "@/components/layout/bottom-nav";
import { requireUser, ensureProfile } from "@/lib/auth";
import { ensureOnboarding } from "@/lib/seed/ensure-onboarding";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await requireUser();
  await ensureProfile(user.id, user.email ?? "");
  await ensureOnboarding(user.id);

  return (
    <div className="mx-auto min-h-screen max-w-lg bg-background pb-20">
      {children}
      <BottomNav />
    </div>
  );
}
