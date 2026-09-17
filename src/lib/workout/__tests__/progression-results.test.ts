import { describe, expect, it } from "vitest";
import {
  computeStartTrainingHints,
  computeWorkoutProgressionResults,
  getExerciseTrainingHint,
} from "../progression-results";

describe("computeWorkoutProgressionResults", () => {
  it("includes exercise name in each result", () => {
    const results = computeWorkoutProgressionResults([
      {
        skipped: false,
        exercise: { name: "Press banca" },
        sets: [
          { weight: 60, reps: 10 },
          { weight: 60, reps: 10 },
        ],
        repsMin: 8,
        repsMax: 10,
        loadProgression: true,
      },
    ]);

    expect(results[0]?.exerciseName).toBe("Press banca");
    expect(results[0]?.variant).toBe("success");
  });
});

describe("computeStartTrainingHints", () => {
  it("suggests weight increase from last session", () => {
    const hints = computeStartTrainingHints([
      {
        exerciseName: "Remo",
        repsMin: 8,
        repsMax: 10,
        loadProgression: true,
        previousSets: [
          { weight: 50, reps: 10 },
          { weight: 50, reps: 10 },
        ],
      },
    ]);

    expect(hints[0]?.exerciseName).toBe("Remo");
    expect(hints[0]?.title).toBe("Listo para subir peso");
  });

  it("returns maintain hint when not ready to increase", () => {
    const hint = getExerciseTrainingHint(
      "Press banca",
      [
        { weight: 60, reps: 8 },
        { weight: 60, reps: 7 },
      ],
      8,
      10,
      true,
    );

    expect(hint?.title).toBe("Mantén el peso");
  });
});
