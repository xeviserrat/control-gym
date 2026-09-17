# Features

## Modules

| Module | Path | Description |
|--------|------|-------------|
| Auth | `/login`, `/register`, `/forgot-password` | Supabase email/password auth |
| Dashboard | `/dashboard` | Weekly stats, quick actions |
| Routines | `/routines`, `/routines/[id]` | CRUD, editor, supersets |
| Exercises | `/exercises`, `/exercises/[id]` | Library (search, filters), CRUD for user exercises, history, chart |
| Train | `/train`, `/train/[id]` | Start workout, session UI |
| History | `/history`, `/history/[id]` | Past workouts |
| Profile | `/profile` | Theme, logout |

## Workout flow

1. Select routine and date on `/train`
2. `startWorkout` creates Workout + WorkoutExercises, copying sets/reps/rest from each **routine slot** (not the exercise library defaults)
3. `/train/[id]` renders serie-by-serie UI
4. Each set saved immediately on "Completar serie"
5. Rest timer after each completed set (when rest > 0)
6. `finishWorkout` marks complete, shows summary + progression hints

### Mid-session exercise swap

During an active workout, tap **Cambiar ejercicio** under the current exercise name to substitute another exercise from the library (e.g. when equipment is taken). The swap:

- Updates only the current session (`WorkoutExercise.exerciseId`), not the routine template
- Keeps sets, rep range, and rest from the original routine exercise
- Clears any logged sets for that exercise slot (they belonged to the previous exercise)
- Prefills weight/reps from the new exercise's previous performance on refresh

## Supersets

Routine editor supports "Combinar con..." to group exercises. Paired exercises are labeled **A1 / B1** (same number = same superset round); a second superset elsewhere in the routine is **A2 / B2**, and so on. During workout, sets interleave within each round. Rest runs after every completed set when `restSeconds > 0`; set rest to **0** on grouped exercises for a classic no-rest superset.

## Exercises

- **Navigation**: `/exercises` is in the bottom nav (Ejercicios tab).
- **Library** (`/exercises`): stats summary, search, filters (all / mine / global, by muscle group), grouped list with color-coded muscle groups, create form with name, muscle group selector (Pecho, Espalda, Piernas, Hombros, Bíceps, Tríceps, Core, Cardio, General), optional reps min/max, and description.
- **Default reps**: optional `repsMin` / `repsMax` on an exercise are applied when adding it to a routine (otherwise **8–12**).
- **Detail** (`/exercises/[id]`): metadata card, weight history chart, session log.
- **Edit / delete**: user-owned exercises only; global seed exercises are read-only. Edit inline on the detail page; delete blocked if the exercise is referenced in a routine.
- **Create**: available from the library page; new exercises appear immediately after save.
- **Create from routine editor**: when adding or swapping an exercise in `/routines/[id]`, use **Crear ejercicio personalizado** to add a custom exercise without leaving the page; it is saved to the library and added to the routine in one step.

## Routines

- **Swap exercise**: in the routine editor (`/routines/[id]`), use the swap icon on any slot to replace its exercise from the library without deleting the slot. Preserves order, sets/reps/rest, notes, superset membership, and progression settings. The `RoutineExercise` row id stays the same (workout history links remain valid).
- **Delete**: allowed when the routine has no completed workouts in history. Cancelled or abandoned sessions no longer block deletion. Routines with completed history cannot be deleted (data integrity).
- **Example routine**: `Torso A` is created once on first onboarding only (`profiles.onboarding_complete`). It is not recreated after the user deletes it.
- **List actions** show inline loading spinners and refresh the list after success.

## Progression

Double progression: when all sets reach `repsMax` at the same weight, suggest a weight increase (+2.5 kg by default).

- **Before workout** (`/train`): selecting a routine loads hints from the last completed session of that routine (per exercise slot), suggesting weight increase or rep targets.
- **During workout** (`SetInputPanel`): compares the current slot with the last completed session of the same routine (matched by `routineExerciseId`). Hints include the exercise name. If the previous session hit `repsMax` on every set at a consistent weight, shows “Listo para subir peso” on set 1 (with suggested weight).
- **After workout** (`WorkoutSummary`): per-exercise advice for the next session, including exercise name and suggested weight when applicable.
- **History** (`/history/[id]`): shows the same per-exercise session outcome advice under “Cómo terminó esta sesión”.
- Per-exercise toggle: **Progresión de carga** in the routine editor (`loadProgression`).

## PWA & workout protection

- Install as home-screen app (manifest + service worker in production)
- Mid-workout: step/phase + draft weight/reps saved to `localStorage`
- Reload returns to `/train/[id]` via active workout in DB
- `beforeunload` confirmation and reduced pull-to-refresh while training
