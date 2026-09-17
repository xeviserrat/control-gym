import { describe, expect, it } from "vitest";
import { getSupersetLabel } from "../superset-label";

const ex = (
  id: string,
  order: number,
  supersetGroupId: string | null,
  supersetOrder: number | null,
) => ({ id, order, supersetGroupId, supersetOrder });

describe("getSupersetLabel", () => {
  it("labels paired exercises as A1 and B1", () => {
    const exercises = [
      ex("1", 1, "g1", 1),
      ex("2", 2, "g1", 2),
    ];

    expect(getSupersetLabel(exercises[0], exercises)).toBe("A1");
    expect(getSupersetLabel(exercises[1], exercises)).toBe("B1");
  });

  it("labels multiple supersets as A1-B1 and A2-B2", () => {
    const exercises = [
      ex("1", 1, "g1", 1),
      ex("2", 2, "g1", 2),
      ex("3", 3, "g2", 1),
      ex("4", 4, "g2", 2),
    ];

    expect(getSupersetLabel(exercises[0], exercises)).toBe("A1");
    expect(getSupersetLabel(exercises[1], exercises)).toBe("B1");
    expect(getSupersetLabel(exercises[2], exercises)).toBe("A2");
    expect(getSupersetLabel(exercises[3], exercises)).toBe("B2");
  });

  it("supports triple supersets with the same group number", () => {
    const exercises = [
      ex("1", 1, "g1", 1),
      ex("2", 2, "g1", 2),
      ex("3", 3, "g1", 3),
    ];

    expect(getSupersetLabel(exercises[0], exercises)).toBe("A1");
    expect(getSupersetLabel(exercises[1], exercises)).toBe("B1");
    expect(getSupersetLabel(exercises[2], exercises)).toBe("C1");
  });

  it("returns null for exercises outside a superset", () => {
    const exercises = [ex("1", 1, null, null)];

    expect(getSupersetLabel(exercises[0], exercises)).toBeNull();
  });
});
