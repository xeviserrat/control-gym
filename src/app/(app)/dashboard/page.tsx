import Link from "next/link";
import { AppHeader } from "@/components/layout/app-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getDashboardStats } from "@/lib/actions/workouts";
import { formatDate, formatDuration } from "@/lib/utils";

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <>
      <AppHeader title="Dashboard" />
      <main className="space-y-6 px-4 py-6">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-medium text-muted-foreground">
              Esta semana
            </h2>
            <span className="text-2xl font-semibold">{stats.weekCount}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            entrenamientos completados
          </p>
        </section>

        <div className="grid gap-3">
          <Link href="/train">
            <Button fullWidth size="lg">
              Let&apos;s Train
            </Button>
          </Link>

          {stats.lastUsedRoutine && (
            <Link href={`/train?routine=${stats.lastUsedRoutine.id}`}>
              <Button fullWidth size="md" variant="secondary">
                Última rutina: {stats.lastUsedRoutine.name}
              </Button>
            </Link>
          )}
        </div>

        {stats.lastWorkout && (
          <Card>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Último entrenamiento
            </p>
            <p className="mt-1 text-lg font-semibold">
              {stats.lastWorkout.routine.name}
            </p>
            <p className="text-sm text-muted-foreground">
              {formatDate(stats.lastWorkout.date)}
              {stats.lastWorkout.durationSeconds &&
                ` · ${formatDuration(stats.lastWorkout.durationSeconds)}`}
            </p>
            <Link
              href={`/history/${stats.lastWorkout.id}`}
              className="mt-3 inline-block text-sm text-primary"
            >
              Ver detalle
            </Link>
          </Card>
        )}

        {stats.latestRoutine && (
          <Card>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Rutina reciente
            </p>
            <p className="mt-1 text-lg font-semibold">
              {stats.latestRoutine.name}
            </p>
            <Link
              href={`/routines/${stats.latestRoutine.id}`}
              className="mt-3 inline-block text-sm text-primary"
            >
              Editar rutina
            </Link>
          </Card>
        )}

        {stats.recentExercises.length > 0 && (
          <section>
            <h2 className="mb-3 text-sm font-medium text-muted-foreground">
              Ejercicios recientes
            </h2>
            <div className="space-y-2">
              {stats.recentExercises.slice(0, 5).map((ex) => (
                <Link
                  key={ex.id}
                  href={`/exercises/${ex.id}`}
                  className="block rounded-xl border border-border bg-surface px-4 py-3 text-sm font-medium hover:bg-surface-elevated"
                >
                  {ex.name}
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
