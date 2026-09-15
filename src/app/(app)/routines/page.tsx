import Link from "next/link";
import { Plus } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { EmptyState } from "@/components/ui/empty-state";
import { getRoutines } from "@/lib/actions/routines";
import { RoutineListItem } from "@/components/routines/routine-list-item";
import { CreateRoutineForm } from "@/components/routines/create-routine-form";

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

        <Link
          href="/exercises"
          className="mt-8 flex items-center justify-center gap-2 text-sm text-primary"
        >
          <Plus className="h-4 w-4" />
          Biblioteca de ejercicios
        </Link>
      </main>
    </>
  );
}
