export interface PrerequisiteEdge {
  subjectId: number;
  prerequisiteId: number;
}

export function createsCycle(
  edges: PrerequisiteEdge[],
  subjectId: number,
  newPrerequisiteIds: number[],
): boolean {
  const graph = new Map<number, number[]>();
  for (const edge of edges) {
    if (edge.subjectId === subjectId) continue;
    graph.set(edge.subjectId, [
      ...(graph.get(edge.subjectId) ?? []),
      edge.prerequisiteId,
    ]);
  }

  const pending = [...newPrerequisiteIds];
  const visited = new Set<number>();

  while (pending.length > 0) {
    const current = pending.pop()!;
    if (current === subjectId) return true;
    if (visited.has(current)) continue;
    visited.add(current);
    pending.push(...(graph.get(current) ?? []));
  }

  return false;
}
