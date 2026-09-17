type ExerciseWithSuperset = {
  readonly id: string;
  readonly order: number;
  readonly supersetGroupId: string | null;
  readonly supersetOrder: number | null;
};

function getSupersetGroupNumber(
  groupId: string,
  allExercises: readonly ExerciseWithSuperset[],
): number {
  const groupIds = [
    ...new Set(
      allExercises
        .filter((e) => e.supersetGroupId != null)
        .map((e) => e.supersetGroupId as string),
    ),
  ].sort((a, b) => {
    const minOrder = (id: string) =>
      Math.min(
        ...allExercises
          .filter((e) => e.supersetGroupId === id)
          .map((e) => e.order),
      );
    return minOrder(a) - minOrder(b);
  });

  return groupIds.indexOf(groupId) + 1;
}

export function getSupersetLabel(
  exercise: ExerciseWithSuperset,
  allExercises: readonly ExerciseWithSuperset[],
): string | null {
  if (!exercise.supersetGroupId) return null;

  const groupMembers = allExercises
    .filter((e) => e.supersetGroupId === exercise.supersetGroupId)
    .sort((a, b) => (a.supersetOrder ?? 0) - (b.supersetOrder ?? 0));

  const memberIndex = groupMembers.findIndex((e) => e.id === exercise.id);
  const letter = String.fromCodePoint(65 + (memberIndex % 26));
  const groupNumber = getSupersetGroupNumber(
    exercise.supersetGroupId,
    allExercises,
  );

  return `${letter}${groupNumber}`;
}
