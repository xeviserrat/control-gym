import { describe, it, expect } from "vitest";
import {
  evaluateProgression,
  calculateVolume,
  getProgressionMessage,
  getInSessionProgressionHint,
  hasConsistentWeight,
  isReadyToIncreaseWeight,
  isRepeatingQualifyingPerformance,
  suggestNextWeight,
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

describe("isReadyToIncreaseWeight", () => {
  it("returns true when all sets hit repsMax at same weight", () => {
    const sets = [
      { weight: 60, reps: 10 },
      { weight: 60, reps: 10 },
      { weight: 60, reps: 11 },
    ];
    expect(isReadyToIncreaseWeight(sets, 8, 10)).toBe(true);
  });

  it("returns false when reps below max", () => {
    const sets = [
      { weight: 60, reps: 10 },
      { weight: 60, reps: 9 },
    ];
    expect(isReadyToIncreaseWeight(sets, 8, 10)).toBe(false);
  });

  it("returns false when weights differ", () => {
    const sets = [
      { weight: 60, reps: 10 },
      { weight: 57.5, reps: 10 },
    ];
    expect(isReadyToIncreaseWeight(sets, 8, 10)).toBe(false);
  });
});

describe("hasConsistentWeight", () => {
  it("detects consistent weights", () => {
    expect(hasConsistentWeight([{ weight: 50, reps: 8 }])).toBe(true);
    expect(
      hasConsistentWeight([
        { weight: 50, reps: 8 },
        { weight: 50, reps: 9 },
      ]),
    ).toBe(true);
  });

  it("detects inconsistent weights", () => {
    expect(
      hasConsistentWeight([
        { weight: 50, reps: 8 },
        { weight: 52.5, reps: 8 },
      ]),
    ).toBe(false);
  });
});

describe("getInSessionProgressionHint", () => {
  it("returns hint when previous session qualifies", () => {
    const hint = getInSessionProgressionHint(
      [
        { weight: 60, reps: 10 },
        { weight: 60, reps: 10 },
      ],
      8,
      10,
      true,
    );
    expect(hint?.title).toBe("Listo para subir peso");
    expect(hint?.suggestedWeight).toBe(62.5);
  });

  it("returns null when load progression is disabled", () => {
    const hint = getInSessionProgressionHint(
      [{ weight: 60, reps: 10 }],
      8,
      10,
      false,
    );
    expect(hint).toBeNull();
  });
});

describe("isRepeatingQualifyingPerformance", () => {
  it("returns true when repeating max reps at same weight", () => {
    const previous = [
      { weight: 60, reps: 10 },
      { weight: 60, reps: 10 },
    ];
    expect(
      isRepeatingQualifyingPerformance(60, 10, previous, 8, 10),
    ).toBe(true);
  });

  it("returns false when using higher weight", () => {
    const previous = [
      { weight: 60, reps: 10 },
      { weight: 60, reps: 10 },
    ];
    expect(
      isRepeatingQualifyingPerformance(62.5, 10, previous, 8, 10),
    ).toBe(false);
  });
});

describe("suggestNextWeight", () => {
  it("adds default increment", () => {
    expect(suggestNextWeight(60)).toBe(62.5);
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
