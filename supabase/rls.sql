-- Row Level Security policies for Supabase
-- Run this in the Supabase SQL Editor after Prisma migrations
-- Note: Prisma uses direct postgres connection; RLS applies when using Supabase client with user JWT

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE routine_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE superset_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sets ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only access their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Exercises: global exercises readable by all; user exercises by owner
CREATE POLICY "Anyone can view global exercises" ON exercises
  FOR SELECT USING (is_global = true OR user_id = auth.uid());
CREATE POLICY "Users can manage own exercises" ON exercises
  FOR ALL USING (user_id = auth.uid());

-- Routines: owner only
CREATE POLICY "Users can manage own routines" ON routines
  FOR ALL USING (user_id = auth.uid());

-- Routine exercises: via routine ownership
CREATE POLICY "Users can manage own routine exercises" ON routine_exercises
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM routines WHERE routines.id = routine_exercises.routine_id
      AND routines.user_id = auth.uid()
    )
  );

-- Superset groups: via routine ownership
CREATE POLICY "Users can manage own superset groups" ON superset_groups
  FOR ALL USING (user_id = auth.uid());

-- Workouts: owner only
CREATE POLICY "Users can manage own workouts" ON workouts
  FOR ALL USING (user_id = auth.uid());

-- Workout exercises: via workout ownership
CREATE POLICY "Users can manage own workout exercises" ON workout_exercises
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM workouts WHERE workouts.id = workout_exercises.workout_id
      AND workouts.user_id = auth.uid()
    )
  );

-- Workout sets: via workout ownership
CREATE POLICY "Users can manage own workout sets" ON workout_sets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM workout_exercises we
      JOIN workouts w ON w.id = we.workout_id
      WHERE we.id = workout_sets.workout_exercise_id
      AND w.user_id = auth.uid()
    )
  );
