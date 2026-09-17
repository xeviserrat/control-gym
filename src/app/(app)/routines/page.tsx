import { AppLink } from "@/components/ui/app-link";
import { AppHeader } from "@/components/layout/app-header";
import { EmptyState } from "@/components/ui/empty-state";
import { getRoutines } from "@/lib/actions/routines";
import { RoutineListItem } from "@/components/routines/routine-list-item";
import { CreateRoutineForm } from "@/components/routines/create-routine-form";

export const dynamic = "force-dynamic";

export default async function RoutinesPage() {
  const routines = await getRoutines();

  return (
    <>
      <AppHeader title="Rutinas" />
      <main className="px-4 py-6">
        <CreateRoutineForm />

        {routines.length === 0 ? (
          <EmptyState
            title="Sin rutinas"
            description="Crea tu primera rutina para empezar a entrenar."
          />
        ) : (
          <ul className="mt-6 space-y-3">
            {routines.map((routine) => (
              <RoutineListItem key={routine.id} routine={routine} />
            ))}
          </ul>
        )}

        <AppLink
          href="/exercises"
          className="mt-8 block text-center text-sm text-primary"
        >
          Ver biblioteca de ejercicios
        </AppLink>
      </main>
    </>
  );
}
