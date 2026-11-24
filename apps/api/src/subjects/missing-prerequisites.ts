export interface PrerequisiteRef {
  id: number;
  code: string;
}

export function missingPrerequisites(
  prerequisites: PrerequisiteRef[],
  passedSubjectIds: Set<number>,
): string[] {
  return prerequisites
    .filter((prerequisite) => !passedSubjectIds.has(prerequisite.id))
    .map((prerequisite) => prerequisite.code)
    .sort();
}
