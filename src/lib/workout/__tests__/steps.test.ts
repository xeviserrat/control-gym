import { describe, it, expect } from "vitest";
import { buildWorkoutSteps } from "../steps";

const makeExercise = (
  overrides: Partial<Parameters<typeof buildWorkoutSteps>[0][0]> &
    Pick<Parameters<typeof buildWorkoutSteps>[0][0], "id" | "exerciseName" | "order" | "sets">,
) => ({
  routineExerciseId: overrides.id,
  exerciseId: overrides.id,
  repsMin: 6,
  repsMax: 8,
  restSeconds: 90,
  notes: null,
  isOptional: false,
  loadProgression: true,
  supersetGroupId: null,
  supersetOrder: null,
  ...overrides,
});

describe("buildWorkoutSteps", () => {
  it("creates sequential steps for standalone exercises", () => {
    const steps = buildWorkoutSteps([
      makeExercise({ id: "a", exerciseName: "Press banca", order: 1, sets: 2 }),
    ]);

    expect(steps).toHaveLength(2);
    expect(steps[0].setNumber).toBe(1);
    expect(steps[1].setNumber).toBe(2);
    expect(steps[0].isLastInSupersetRound).toBe(true);
  });

  it("interleaves superset exercises before rest", () => {
    const steps = buildWorkoutSteps([
      makeExercise({
        id: "a",
        exerciseName: "Press banca",
        order: 1,
        sets: 2,
        supersetGroupId: "g1",
        supersetOrder: 1,
      }),
      makeExercise({
        id: "b",
        exerciseName: "Jalón",
        order: 2,
        sets: 2,
        supersetGroupId: "g1",
        supersetOrder: 2,
      }),
    ]);

    expect(steps).toHaveLength(4);
    expect(steps[0].exerciseName).toBe("Press banca");
    expect(steps[0].setNumber).toBe(1);
    expect(steps[0].isLastInSupersetRound).toBe(false);
    expect(steps[1].exerciseName).toBe("Jalón");
    expect(steps[1].setNumber).toBe(1);
    expect(steps[1].isLastInSupersetRound).toBe(true);
    expect(steps[2].exerciseName).toBe("Press banca");
    expect(steps[2].setNumber).toBe(2);
  });

  it("handles three-exercise superset", () => {
    const steps = buildWorkoutSteps([
      makeExercise({
        id: "a",
        exerciseName: "A",
        order: 1,
        sets: 1,
        supersetGroupId: "g1",
        supersetOrder: 1,
      }),
      makeExercise({
        id: "b",
        exerciseName: "B",
        order: 2,
        sets: 1,
        supersetGroupId: "g1",
        supersetOrder: 2,
      }),
      makeExercise({
        id: "c",
        exerciseName: "C",
        order: 3,
        sets: 1,
        supersetGroupId: "g1",
        supersetOrder: 3,
      }),
    ]);

    expect(steps).toHaveLength(3);
    expect(steps[2].isLastInSupersetRound).toBe(true);
  });
});
