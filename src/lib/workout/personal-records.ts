export type PersonalRecord = {
  exerciseId: string;
  reps: number;
  weight: number;
};

function recordKey({ exerciseId, reps }: PersonalRecord) {
  return `${exerciseId}:${reps}`;
}

export function bestPersonalMarks(sets: readonly PersonalRecord[]) {
  const bestMarks = new Map<string, PersonalRecord>();

  for (const set of sets) {
    if (set.weight <= 0) continue;
    const key = recordKey(set);
    const best = bestMarks.get(key);
    if (!best || set.weight > best.weight) {
      bestMarks.set(key, set);
    }
  }

  return bestMarks;
}

export function findPersonalRecords(
  sessionSets: readonly PersonalRecord[],
  previousSets: readonly PersonalRecord[],
) {
  const previousMarks = bestPersonalMarks(previousSets);

  return Array.from(bestPersonalMarks(sessionSets)).flatMap(([key, mark]) => {
    const previousMark = previousMarks.get(key);
    return previousMark && mark.weight > previousMark.weight ? [mark] : [];
  });
}
