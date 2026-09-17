"use client";

import { useMemo, useState } from "react";
import { ChevronRight, Globe, Pencil, Search, User } from "lucide-react";
import { AppLink } from "@/components/ui/app-link";
import { Card } from "@/components/ui/card";
import { CreateExerciseForm } from "@/components/exercises/create-exercise-form";
import {
  getMuscleGroupStyle,
  groupExercisesByMuscle,
  MUSCLE_GROUPS,
} from "@/lib/exercise-utils";
import { cn, formatRepRange } from "@/lib/utils";

type ExerciseItem = {
  id: string;
  name: string;
  description: string | null;
  muscleGroup: string | null;
  repsMin: number | null;
  repsMax: number | null;
  isGlobal: boolean;
  userId: string | null;
};

type ExerciseLibraryProps = {
  readonly exercises: ExerciseItem[];
  readonly currentUserId: string;
};

type FilterMode = "all" | "mine" | "global";

export function ExerciseLibrary({ exercises, currentUserId }: ExerciseLibraryProps) {
  const [search, setSearch] = useState("");
  const [muscleFilter, setMuscleFilter] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<FilterMode>("all");

  const muscleGroups = useMemo(() => {
    const groups = new Set<string>(MUSCLE_GROUPS);
    for (const ex of exercises) {
      if (ex.muscleGroup) groups.add(ex.muscleGroup);
    }
    return Array.from(groups).sort((a, b) => a.localeCompare(b, "es"));
  }, [exercises]);

  const myCount = exercises.filter((ex) => ex.userId === currentUserId).length;
  const globalCount = exercises.filter((ex) => ex.isGlobal).length;

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return exercises.filter((ex) => {
      if (filterMode === "mine" && ex.userId !== currentUserId) return false;
      if (filterMode === "global" && !ex.isGlobal) return false;
      if (muscleFilter && ex.muscleGroup !== muscleFilter) return false;
      if (!query) return true;

      return (
        ex.name.toLowerCase().includes(query) ||
        ex.muscleGroup?.toLowerCase().includes(query) ||
        ex.description?.toLowerCase().includes(query)
      );
    });
  }, [exercises, filterMode, muscleFilter, search, currentUserId]);

  const grouped = groupExercisesByMuscle(filtered);

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-3 gap-2">
        <Card className="p-3 text-center">
          <p className="text-2xl font-semibold">{exercises.length}</p>
          <p className="text-xs text-muted-foreground">Total</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-semibold">{myCount}</p>
          <p className="text-xs text-muted-foreground">Propios</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-semibold">{globalCount}</p>
          <p className="text-xs text-muted-foreground">Globales</p>
        </Card>
      </section>

      <CreateExerciseForm />

      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder="Buscar por nombre, grupo o descripción…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-border bg-surface py-3 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            { id: "all", label: "Todos" },
            { id: "mine", label: "Mis ejercicios" },
            { id: "global", label: "Globales" },
          ] as const
        ).map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilterMode(id)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              filterMode === id
                ? "bg-primary text-primary-foreground"
                : "bg-surface text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {muscleGroups.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setMuscleFilter(null)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              muscleFilter === null
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            Todos los grupos
          </button>
          {muscleGroups.map((group) => (
            <button
              key={group}
              type="button"
              onClick={() =>
                setMuscleFilter((current) => (current === group ? null : group))
              }
              className={cn(
                "shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                muscleFilter === group
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {group}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <Card className="py-10 text-center">
          <p className="font-medium">No hay ejercicios</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Prueba con otro filtro o crea uno nuevo.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {grouped.map(([group, items]) => (
            <section key={group}>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {group}
                <span className="ml-2 font-normal normal-case tracking-normal">
                  ({items.length})
                </span>
              </h2>
              <ul className="space-y-2">
                {items.map((ex) => {
                  const isOwn = ex.userId === currentUserId;

                  return (
                    <li key={ex.id}>
                      <AppLink
                        href={`/exercises/${ex.id}`}
                        className={cn(
                          "group flex items-center gap-3 rounded-xl border border-l-4 border-border px-4 py-3 transition-colors hover:bg-surface-elevated",
                          getMuscleGroupStyle(ex.muscleGroup),
                        )}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate font-medium">{ex.name}</p>
                            {ex.isGlobal ? (
                              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-surface px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                                <Globe className="h-3 w-3" />
                                Global
                              </span>
                            ) : isOwn ? (
                              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
                                <User className="h-3 w-3" />
                                Propio
                              </span>
                            ) : null}
                          </div>
                          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                            {ex.repsMin != null && ex.repsMax != null && (
                              <span>
                                {formatRepRange(ex.repsMin, ex.repsMax)} reps
                              </span>
                            )}
                            {ex.description && (
                              <span className="truncate">{ex.description}</span>
                            )}
                          </div>
                        </div>
                        {isOwn && (
                          <Pencil
                            className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                            aria-hidden="true"
                          />
                        )}
                        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                      </AppLink>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
