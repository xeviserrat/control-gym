import { AppHeader } from "@/components/layout/app-header";
import { ThemeSelector } from "@/components/profile/theme-selector";
import { LogoutButton } from "@/components/profile/logout-button";
import { requireUser } from "@/lib/auth";

export default async function ProfilePage() {
  const user = await requireUser();

  return (
    <>
      <AppHeader title="Perfil" backHref="/dashboard" />
      <main className="space-y-6 px-4 py-6">
        <section className="rounded-2xl border border-border bg-surface p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Cuenta
          </p>
          <p className="mt-1 font-medium">{user.email}</p>
        </section>

        <section>
          <p className="mb-3 text-sm font-medium text-muted-foreground">
            Apariencia
          </p>
          <ThemeSelector />
        </section>

        <LogoutButton />
      </main>
    </>
  );
}
