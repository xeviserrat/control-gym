import { describe, it, expect } from "vitest";
import {
  evaluateProgression,
  calculateVolume,
  getProgressionMessage,
} from "../progression";

describe("evaluateProgression", () => {
  it("suggests increase when all sets hit repsMax", () => {
    const sets = [{ reps: 8 }, { reps: 8 }, { reps: 8 }, { reps: 8 }];
    expect(evaluateProgression(sets, 6, 8)).toBe("increase");
  });

  it("suggests maintain when not all sets hit repsMax", () => {
    const sets = [{ reps: 8 }, { reps: 8 }, { reps: 7 }, { reps: 6 }];
    expect(evaluateProgression(sets, 6, 8)).toBe("maintain");
  });

  it("suggests increase for high rep range when all at max", () => {
    const sets = [{ reps: 15 }, { reps: 15 }, { reps: 15 }, { reps: 15 }];
    expect(evaluateProgression(sets, 12, 15)).toBe("increase");
  });

  it("returns maintain for empty sets", () => {
    expect(evaluateProgression([], 6, 8)).toBe("maintain");
  });
});

describe("getProgressionMessage", () => {
  it("returns success message for increase", () => {
    const msg = getProgressionMessage("increase");
    expect(msg.variant).toBe("success");
    expect(msg.title).toBe("Objetivo conseguido");
  });

  it("returns warning message for maintain", () => {
    const msg = getProgressionMessage("maintain");
    expect(msg.variant).toBe("warning");
    expect(msg.title).toBe("Mantén el peso");
  });
});

describe("calculateVolume", () => {
  it("calculates total volume correctly", () => {
    const sets = [
      { weight: 60, reps: 8 },
      { weight: 60, reps: 8 },
      { weight: 60, reps: 7 },
      { weight: 60, reps: 6 },
    ];
    expect(calculateVolume(sets)).toBe(1740);
  });
});
