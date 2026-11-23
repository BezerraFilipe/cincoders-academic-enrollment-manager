import { COURSES, SECTIONS, STUDENTS, SUBJECTS } from './seed-data';

const subjectCodes = new Set(SUBJECTS.map((subject) => subject.code));

describe('seed data', () => {
  it('uses unique subject codes', () => {
    expect(subjectCodes.size).toBe(SUBJECTS.length);
  });

  it('respects the workload rule (multiple of 15, between 15h and 120h)', () => {
    for (const { workloadHours } of SUBJECTS) {
      expect(workloadHours % 15).toBe(0);
      expect(workloadHours).toBeGreaterThanOrEqual(15);
      expect(workloadHours).toBeLessThanOrEqual(120);
    }
  });

  it('only references existing subjects', () => {
    const referenced = [
      ...SUBJECTS.flatMap((subject) => subject.prerequisites ?? []),
      ...COURSES.flatMap((course) => Object.keys(course.curriculum)),
      ...SECTIONS.map((section) => section.subjectCode),
      ...STUDENTS.flatMap((student) => [
        ...student.history.map((record) => record.subjectCode),
        ...student.activeEnrollments.map(
          (enrollment) => enrollment.subjectCode,
        ),
      ]),
    ];

    expect(referenced.filter((code) => !subjectCodes.has(code))).toEqual([]);
  });

  it('has two courses sharing subjects with different classifications', () => {
    const [first, second] = COURSES;
    const differentlyClassified = Object.keys(first.curriculum).filter(
      (code) =>
        second.curriculum[code] &&
        second.curriculum[code] !== first.curriculum[code],
    );

    expect(COURSES).toHaveLength(2);
    expect(differentlyClassified.length).toBeGreaterThan(0);
  });

  it('has students from both courses with passed and failed records', () => {
    for (const course of COURSES) {
      expect(
        STUDENTS.some((student) => student.courseCode === course.code),
      ).toBe(true);
    }

    const statuses = STUDENTS.flatMap((student) =>
      student.history.map((record) => record.status),
    );
    expect(statuses).toContain('PASSED');
    expect(statuses).toContain('FAILED');
  });

  it('keeps every seeded section within capacity', () => {
    for (const section of SECTIONS) {
      const enrolled = STUDENTS.filter((student) =>
        student.activeEnrollments.some(
          (enrollment) =>
            enrollment.subjectCode === section.subjectCode &&
            enrollment.sectionCode === section.code,
        ),
      ).length;

      expect(enrolled).toBeLessThanOrEqual(section.capacity);
    }
  });
});
