# Features

## Modules

| Module | Path | Description |
|--------|------|-------------|
| Auth | `/login`, `/register`, `/forgot-password` | Supabase email/password auth |
| Dashboard | `/dashboard` | Weekly stats, quick actions |
| Routines | `/routines`, `/routines/[id]` | CRUD, editor, supersets |
| Exercises | `/exercises`, `/exercises/[id]` | Library, history, chart |
| Train | `/train`, `/train/[id]` | Start workout, session UI |
| History | `/history`, `/history/[id]` | Past workouts |
| Profile | `/profile` | Theme, logout |

## Workout flow

1. Select routine and date on `/train`
2. `startWorkout` creates Workout + WorkoutExercises
3. `/train/[id]` renders serie-by-serie UI
4. Each set saved immediately on "Completar serie"
5. Rest timer after superset round completion
6. `finishWorkout` marks complete, shows summary + progression hints

## Supersets

Routine editor supports "Combinar con..." to group exercises. During workout, sets interleave within each round; rest starts only after the last exercise in the group.

## Progression

Double progression: when all sets reach `repsMax`, suggest weight increase. Otherwise suggest maintaining weight and pushing reps.
