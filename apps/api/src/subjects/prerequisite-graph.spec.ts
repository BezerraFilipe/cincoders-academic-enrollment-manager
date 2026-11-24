import { createsCycle, PrerequisiteEdge } from './prerequisite-graph';

const A = 1;
const B = 2;
const C = 3;
const D = 4;

describe('createsCycle', () => {
  it('accepts prerequisites that form a chain', () => {
    const edges: PrerequisiteEdge[] = [{ subjectId: B, prerequisiteId: A }];

    expect(createsCycle(edges, C, [B])).toBe(false);
  });

  it('rejects a subject as its own prerequisite', () => {
    expect(createsCycle([], A, [A])).toBe(true);
  });

  it('rejects a direct cycle (A requires B, B requires A)', () => {
    const edges: PrerequisiteEdge[] = [{ subjectId: B, prerequisiteId: A }];

    expect(createsCycle(edges, A, [B])).toBe(true);
  });

  it('rejects an indirect cycle (A requires C, C requires B, B requires A)', () => {
    const edges: PrerequisiteEdge[] = [
      { subjectId: B, prerequisiteId: A },
      { subjectId: C, prerequisiteId: B },
    ];

    expect(createsCycle(edges, A, [C])).toBe(true);
  });

  it('accepts a subject required by two paths without a cycle', () => {
    const edges: PrerequisiteEdge[] = [
      { subjectId: B, prerequisiteId: A },
      { subjectId: C, prerequisiteId: A },
    ];

    expect(createsCycle(edges, D, [B, C])).toBe(false);
  });

  it('ignores the current prerequisites of the subject being edited', () => {
    const edges: PrerequisiteEdge[] = [
      { subjectId: A, prerequisiteId: B },
      { subjectId: C, prerequisiteId: A },
    ];

    expect(createsCycle(edges, A, [D])).toBe(false);
  });
});
