import { describe, it, expect } from "vitest";
import {
  evaluateProgression,
  calculateVolume,
  getProgressionMessage,
  getInSessionProgressionHint,
  getSessionProgressionFeedback,
  getCompletedSetFeedback,
  getUnderWorkingWeightHint,
  hasConsistentWeight,
  isExceedingRepRange,
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

describe("isExceedingRepRange", () => {
  it("returns true when all sets are strictly above repsMax", () => {
    expect(isExceedingRepRange([{ reps: 12 }, { reps: 13 }], 10)).toBe(true);
  });

  it("returns false when any set is at repsMax", () => {
    expect(isExceedingRepRange([{ reps: 10 }, { reps: 12 }], 10)).toBe(false);
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

  it("returns false when all sets exceed repsMax", () => {
    const sets = [
      { weight: 50, reps: 12 },
      { weight: 50, reps: 13 },
    ];
    expect(isReadyToIncreaseWeight(sets, 8, 10)).toBe(false);
  });
});

describe("getSessionProgressionFeedback", () => {
  it("detects weight too light when all sets exceed the range", () => {
    const feedback = getSessionProgressionFeedback(
      [
        { weight: 50, reps: 12 },
        { weight: 50, reps: 13 },
      ],
      8,
      10,
    );

    expect(feedback.kind).toBe("weight_too_light");
    expect(feedback.title).toBe("Peso demasiado bajo");
    expect(feedback.message).not.toMatch(/kg/);
  });

  it("includes per-set detail for maintain feedback", () => {
    const feedback = getSessionProgressionFeedback(
      [
        { weight: 60, reps: 8 },
        { weight: 60, reps: 7 },
      ],
      8,
      10,
      { setNumber: 2 },
    );

    expect(feedback.kind).toBe("maintain");
    expect(feedback.message).toContain("serie 2");
    expect(feedback.message).toContain("7 reps");
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
    expect(hint?.message).toContain("8–10");
  });

  it("returns weight too light hint when all sets exceed the range", () => {
    const hint = getInSessionProgressionHint(
      [
        { weight: 50, reps: 12 },
        { weight: 50, reps: 12 },
      ],
      8,
      10,
      true,
    );
    expect(hint?.title).toBe("Peso demasiado bajo");
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

  it("returns false when using lower weight", () => {
    const previous = [
      { weight: 60, reps: 10 },
      { weight: 60, reps: 10 },
    ];
    expect(
      isRepeatingQualifyingPerformance(50, 12, previous, 8, 10),
    ).toBe(false);
  });
});

describe("getCompletedSetFeedback", () => {
  it("returns per-set warning when reps are below target", () => {
    const allSets = [
      { weight: 60, reps: 10 },
      { weight: 60, reps: 9 },
    ];

    const hint = getCompletedSetFeedback(
      allSets[1],
      2,
      allSets,
      8,
      10,
      true,
    );

    expect(hint?.title).toBe("Por debajo del objetivo");
  });

  it("returns exercise summary on the last set when ready to increase", () => {
    const allSets = [
      { weight: 60, reps: 10 },
      { weight: 60, reps: 10 },
    ];

    const hint = getCompletedSetFeedback(
      allSets[1],
      2,
      allSets,
      8,
      10,
      true,
    );

    expect(hint?.title).toBe("En el tope del rango");
    expect(hint?.message).toContain("Siguiente sesión");
  });

  it("returns null when load progression is disabled", () => {
    const hint = getCompletedSetFeedback(
      { weight: 60, reps: 7 },
      1,
      [{ weight: 60, reps: 7 }],
      8,
      10,
      false,
    );

    expect(hint).toBeNull();
  });
});

describe("getUnderWorkingWeightHint", () => {
  it("returns hint when using less weight with reps above the range", () => {
    const hint = getUnderWorkingWeightHint(
      50,
      12,
      [
        { weight: 60, reps: 8 },
        { weight: 60, reps: 7 },
      ],
      1,
      8,
      10,
    );

    expect(hint?.title).toBe("Peso por debajo del de trabajo");
    expect(hint?.message).not.toMatch(/kg/);
  });

  it("returns null when weight matches the previous set", () => {
    const hint = getUnderWorkingWeightHint(
      60,
      12,
      [{ weight: 60, reps: 8 }],
      1,
      8,
      10,
    );
    expect(hint).toBeNull();
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
