import { describe, expect, it } from "vitest";
import { getExerciseRepDefaults } from "./exercise-utils";

describe("getExerciseRepDefaults", () => {
  it("uses exercise reps when both are set", () => {
    expect(
      getExerciseRepDefaults({ repsMin: 6, repsMax: 8 }),
    ).toEqual({ repsMin: 6, repsMax: 8 });
  });

  it("falls back to routine defaults when reps are missing", () => {
    expect(
      getExerciseRepDefaults({ repsMin: null, repsMax: null }),
    ).toEqual({ repsMin: 8, repsMax: 12 });
  });
});
