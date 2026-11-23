import { describe, expect, it } from "vitest";
import { findPersonalRecords } from "../personal-records";

const press = (weight: number, reps = 8) => ({ exerciseId: "press", reps, weight });

describe("findPersonalRecords", () => {
  it("uses the first comparable mark as the baseline", () => {
    expect(findPersonalRecords([press(67.5)], [])).toEqual([]);
  });

  it("detects 67.5 kg × 8 → 70 kg × 8, but excludes ties", () => {
    expect(findPersonalRecords([press(70)], [press(67.5)])).toEqual([press(70)]);
    expect(findPersonalRecords([press(70)], [press(67.5), press(70)])).toEqual([]);
  });

  it("compares only the same exercise and exact rep count", () => {
    const otherExercise = { exerciseId: "row", reps: 7, weight: 100 };
    expect(findPersonalRecords([press(70, 7)], [press(67.5), otherExercise])).toEqual([]);
    expect(findPersonalRecords([press(70, 7)], [press(75), press(67.5, 7), otherExercise]))
      .toEqual([press(70, 7)]);
  });

  it("returns only the best new set per exercise and rep count across blocks", () => {
    expect(
      findPersonalRecords(
        [press(68), press(72), press(70), press(72), press(73, 7)],
        [press(67.5), press(72, 7)],
      ),
    ).toEqual([press(72), press(73, 7)]);
    expect(findPersonalRecords([press(68), press(72)], [])).toEqual([]);
  });

  it("ignores unloaded sets on both sides of the comparison", () => {
    expect(findPersonalRecords([press(70)], [press(0)])).toEqual([]);
    expect(findPersonalRecords([press(0)], [press(67.5)])).toEqual([]);
  });
});
