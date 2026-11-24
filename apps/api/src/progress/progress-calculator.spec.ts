import { SubjectCategory } from '../curriculum/subject-category';
import {
  calculateProgress,
  CategorizedSubject,
  CourseRequirements,
  GroupProgress,
} from './progress-calculator';

const requirements: CourseRequirements = {
  mandatoryHours: 300,
  profileElectiveHours: 120,
  freeElectiveHours: 60,
};

let nextId = 1;
function subject(
  category: SubjectCategory,
  workloadHours = 60,
): CategorizedSubject {
  return { subjectId: nextId++, category, workloadHours };
}

function group(
  progress: GroupProgress[],
  category: SubjectCategory,
): GroupProgress {
  return progress.find((item) => item.group === category)!;
}

const { MANDATORY, PROFILE_ELECTIVE, FREE_ELECTIVE } = SubjectCategory;

describe('calculateProgress', () => {
  it('starts with nothing completed for a student without history', () => {
    const progress = calculateProgress(requirements, [], []);

    expect(group(progress, MANDATORY)).toEqual({
      group: MANDATORY,
      requiredHours: 300,
      completedHours: 0,
      inProgressHours: 0,
      remainingHours: 300,
      completionPercentage: 0,
    });
  });

  it('adds passed subjects to the completed hours of their group', () => {
    const progress = calculateProgress(
      requirements,
      [
        subject(MANDATORY),
        subject(MANDATORY),
        subject(PROFILE_ELECTIVE),
        subject(FREE_ELECTIVE, 30),
      ],
      [],
    );

    expect(group(progress, MANDATORY)).toMatchObject({
      completedHours: 120,
      remainingHours: 180,
      completionPercentage: 40,
    });
    expect(group(progress, PROFILE_ELECTIVE).completedHours).toBe(60);
    expect(group(progress, FREE_ELECTIVE).completedHours).toBe(30);
  });

  it('reports active enrollments separately, without reducing the remaining hours', () => {
    const progress = calculateProgress(
      requirements,
      [subject(MANDATORY)],
      [subject(MANDATORY)],
    );

    expect(group(progress, MANDATORY)).toMatchObject({
      completedHours: 60,
      inProgressHours: 60,
      remainingHours: 240,
    });
  });

  it('moves completed profile elective hours above the requirement to free electives', () => {
    const progress = calculateProgress(
      requirements,
      [
        subject(PROFILE_ELECTIVE),
        subject(PROFILE_ELECTIVE),
        subject(PROFILE_ELECTIVE),
      ],
      [],
    );

    expect(group(progress, PROFILE_ELECTIVE)).toMatchObject({
      completedHours: 120,
      remainingHours: 0,
      completionPercentage: 100,
    });
    expect(group(progress, FREE_ELECTIVE).completedHours).toBe(60);
  });

  it('moves in-progress profile elective hours above the remaining requirement to free electives', () => {
    const progress = calculateProgress(
      requirements,
      [subject(PROFILE_ELECTIVE)],
      [subject(PROFILE_ELECTIVE), subject(PROFILE_ELECTIVE)],
    );

    expect(group(progress, PROFILE_ELECTIVE).inProgressHours).toBe(60);
    expect(group(progress, FREE_ELECTIVE).inProgressHours).toBe(60);
  });

  it('never exceeds 100% nor reports negative remaining hours', () => {
    const progress = calculateProgress(
      requirements,
      [
        subject(FREE_ELECTIVE),
        subject(FREE_ELECTIVE),
        subject(FREE_ELECTIVE, 30),
      ],
      [],
    );

    expect(group(progress, FREE_ELECTIVE)).toMatchObject({
      completedHours: 150,
      remainingHours: 0,
      completionPercentage: 100,
    });
  });

  it('does not move mandatory hours above the requirement to other groups', () => {
    const smallCourse = { ...requirements, mandatoryHours: 60 };

    const progress = calculateProgress(
      smallCourse,
      [subject(MANDATORY), subject(MANDATORY)],
      [],
    );

    expect(group(progress, MANDATORY).completionPercentage).toBe(100);
    expect(group(progress, FREE_ELECTIVE).completedHours).toBe(0);
  });

  it('counts a subject passed more than once only once', () => {
    const passedTwice = subject(MANDATORY);

    const progress = calculateProgress(
      requirements,
      [passedTwice, { ...passedTwice }],
      [],
    );

    expect(group(progress, MANDATORY).completedHours).toBe(60);
  });

  it('treats a group without required hours as complete', () => {
    const progress = calculateProgress(
      { ...requirements, freeElectiveHours: 0 },
      [],
      [],
    );

    expect(group(progress, FREE_ELECTIVE).completionPercentage).toBe(100);
  });
});
