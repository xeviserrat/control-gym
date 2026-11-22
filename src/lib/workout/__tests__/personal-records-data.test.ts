import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Prisma } from "@prisma/client";
import { getExercisePersonalMarks, getWorkoutPersonalRecords } from "../personal-records-data";

const { findWorkout, findSets } = vi.hoisted(() => ({
  findWorkout: vi.fn(),
  findSets: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: { workout: { findFirst: findWorkout }, workoutSet: { findMany: findSets } },
}));

const date = new Date("2026-11-22T00:00:00Z");
const startedAt = new Date("2026-11-22T07:00:00Z");
const workoutId = "00000000-0000-0000-0000-000000000002";
const exerciseId = "press";
const scope = { userId: "owner", status: "COMPLETED" } as const;

function storedSet(weight: string, reps = 8) {
  return { weight, reps, workoutExercise: { exerciseId } };
}

beforeEach(() => vi.resetAllMocks());

describe("getWorkoutPersonalRecords", () => {
  it("scopes both reads and stops history at the target, breaking timestamp ties by id", async () => {
    findWorkout.mockResolvedValue({
      id: workoutId,
      date,
      startedAt,
      exercises: [
        { exerciseId, sets: [storedSet("68.00")] },
        { exerciseId, sets: [storedSet("70.00")] },
      ],
    });

    const earlierDay = new Date("2026-11-21T00:00:00Z");
    const earlierStart = new Date("2026-11-22T06:00:00Z");
    const candidates = [
      { suffix: "1", date, startedAt, ...scope, weight: "67.50" },
      { suffix: "2", date, startedAt, ...scope, weight: "70.00" },
      { suffix: "3", date, startedAt, ...scope, weight: "80.00" },
      { suffix: "4", date: earlierDay, startedAt, ...scope, weight: "66.00" },
      { suffix: "5", date, startedAt: earlierStart, ...scope, weight: "67.00" },
      { suffix: "6", date, startedAt: earlierStart, ...scope, userId: "other", weight: "90.00" },
      { suffix: "7", date, startedAt: earlierStart, ...scope, status: "CANCELLED", weight: "91.00" },
      { suffix: "8", date, startedAt: earlierStart, ...scope, status: "IN_PROGRESS", weight: "92.00" },
    ];

    findSets.mockImplementation(async (query: Prisma.WorkoutSetFindManyArgs) => {
      const filter = query?.where?.workoutExercise?.workout;
      expect(filter).toEqual({
        ...scope,
        OR: [
          { date: { lt: date } },
          { date, startedAt: { lt: startedAt } },
          { date, startedAt, id: { lt: workoutId } },
        ],
      });
      const targetKey = [date.toISOString(), startedAt.toISOString(), workoutId].join("/");
      return candidates
        .filter((candidate) =>
          candidate.userId === filter?.userId && candidate.status === filter?.status,
        )
        .filter((candidate) => {
          const id = workoutId.slice(0, -1) + candidate.suffix;
          const key = [candidate.date.toISOString(), candidate.startedAt.toISOString(), id].join("/");
          return key < targetKey;
        })
        .map(({ weight }) => storedSet(weight));
    });

    await expect(getWorkoutPersonalRecords(scope.userId, workoutId)).resolves.toEqual([
      { exerciseId, weight: 70, reps: 8 },
    ]);
    expect(findWorkout).toHaveBeenCalledWith(expect.objectContaining({
      where: { ...scope, id: workoutId },
      select: expect.objectContaining({
        exercises: { select: {
          exerciseId: true,
          sets: { where: { weight: { gt: 0 } }, select: { weight: true, reps: true } },
        } },
      }),
    }));
    expect(findSets).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({
      where: {
        weight: { gt: 0 },
        workoutExercise: {
          exerciseId: { in: [exerciseId] },
          workout: expect.objectContaining(scope),
        },
      },
    }));
  });

  it.each(["CANCELLED", "IN_PROGRESS", "another user"])(
    "uses no sets when Prisma rejects a target belonging to %s",
    async () => {
      findWorkout.mockResolvedValue(null);
      await expect(getWorkoutPersonalRecords(scope.userId, workoutId)).resolves.toEqual([]);
      expect(findWorkout).toHaveBeenCalledWith(expect.objectContaining({
        where: { ...scope, id: workoutId },
      }));
      expect(findSets).not.toHaveBeenCalled();
    },
  );
});

describe("getExercisePersonalMarks", () => {
  it("includes the best set even when it predates the 50 visible sets", async () => {
    const recentSets = Array.from({ length: 50 }, () => storedSet("67.50"));
    const history = [...recentSets, storedSet("80.00"), storedSet("85.00", 5)];
    findSets.mockImplementation(async (query: Prisma.WorkoutSetFindManyArgs) => {
      expect(query?.where).toEqual({
        weight: { gt: 0 },
        workoutExercise: { exerciseId, workout: scope },
      });
      return history.slice(0, query?.take ?? history.length);
    });

    await expect(getExercisePersonalMarks(scope.userId, exerciseId)).resolves.toEqual([
      { exerciseId, weight: 85, reps: 5 },
      { exerciseId, weight: 80, reps: 8 },
    ]);
  });
});
