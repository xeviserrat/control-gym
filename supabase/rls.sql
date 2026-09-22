-- Row Level Security for Supabase (PostgREST / anon + authenticated roles)
-- Run in Supabase Dashboard → SQL Editor after `npx prisma migrate deploy`
--
-- Prisma uses the database connection string (postgres / service role) and bypasses RLS.
-- RLS blocks direct API access with the anon key unless a policy allows the row.

-- ---------------------------------------------------------------------------
-- Enable RLS on all public tables exposed to PostgREST
-- ---------------------------------------------------------------------------

ALTER TABLE IF EXISTS public._prisma_migrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routine_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.superset_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sets ENABLE ROW LEVEL SECURITY;

-- Prisma internal table: no policies → no access via Supabase Data API
-- (satisfies Supabase linter; migrations still work via Prisma/direct connection)

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- Exercises (global catalog + per-user custom exercises)
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Anyone can view global exercises" ON public.exercises;
CREATE POLICY "Anyone can view global exercises" ON public.exercises
  FOR SELECT USING (is_global = true OR user_id = auth.uid());

DROP POLICY IF EXISTS "Users can manage own exercises" ON public.exercises;
CREATE POLICY "Users can manage own exercises" ON public.exercises
  FOR ALL USING (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Routines
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can manage own routines" ON public.routines;
CREATE POLICY "Users can manage own routines" ON public.routines
  FOR ALL USING (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Routine exercises (via routine ownership)
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can manage own routine exercises" ON public.routine_exercises;
CREATE POLICY "Users can manage own routine exercises" ON public.routine_exercises
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.routines r
      WHERE r.id = routine_exercises.routine_id
        AND r.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- Superset groups
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can manage own superset groups" ON public.superset_groups;
CREATE POLICY "Users can manage own superset groups" ON public.superset_groups
  FOR ALL USING (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Workouts
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can manage own workouts" ON public.workouts;
CREATE POLICY "Users can manage own workouts" ON public.workouts
  FOR ALL USING (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Workout exercises (via workout ownership)
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can manage own workout exercises" ON public.workout_exercises;
CREATE POLICY "Users can manage own workout exercises" ON public.workout_exercises
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.workouts w
      WHERE w.id = workout_exercises.workout_id
        AND w.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- Workout sets (via workout ownership)
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can manage own workout sets" ON public.workout_sets;
CREATE POLICY "Users can manage own workout sets" ON public.workout_sets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.workout_exercises we
      JOIN public.workouts w ON w.id = we.workout_id
      WHERE we.id = workout_sets.workout_exercise_id
        AND w.user_id = auth.uid()
    )
  );
