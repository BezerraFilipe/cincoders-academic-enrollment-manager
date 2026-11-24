import { SubjectCategory } from '../curriculum/subject-category';

export interface CourseRequirements {
  mandatoryHours: number;
  profileElectiveHours: number;
  freeElectiveHours: number;
}

export interface CategorizedSubject {
  subjectId: number;
  workloadHours: number;
  category: SubjectCategory;
}

export interface GroupProgress {
  group: SubjectCategory;
  requiredHours: number;
  completedHours: number;
  inProgressHours: number;
  remainingHours: number;
  completionPercentage: number;
}

type HoursByCategory = Record<SubjectCategory, number>;

function sumByCategory(subjects: CategorizedSubject[]): HoursByCategory {
  const totals: HoursByCategory = {
    MANDATORY: 0,
    PROFILE_ELECTIVE: 0,
    FREE_ELECTIVE: 0,
  };
  const counted = new Set<number>();

  for (const subject of subjects) {
    if (counted.has(subject.subjectId)) continue;
    counted.add(subject.subjectId);
    totals[subject.category] += subject.workloadHours;
  }

  return totals;
}

function toGroupProgress(
  group: SubjectCategory,
  requiredHours: number,
  completedHours: number,
  inProgressHours: number,
): GroupProgress {
  const completionPercentage =
    requiredHours === 0
      ? 100
      : Math.min(100, Math.floor((completedHours / requiredHours) * 100));

  return {
    group,
    requiredHours,
    completedHours,
    inProgressHours,
    remainingHours: Math.max(0, requiredHours - completedHours),
    completionPercentage,
  };
}

export function calculateProgress(
  requirements: CourseRequirements,
  passed: CategorizedSubject[],
  inProgress: CategorizedSubject[],
): GroupProgress[] {
  const completed = sumByCategory(passed);
  const ongoing = sumByCategory(inProgress);
  const profileLimit = requirements.profileElectiveHours;

  const profileCompleted = Math.min(completed.PROFILE_ELECTIVE, profileLimit);
  const profileCompletedExcess = completed.PROFILE_ELECTIVE - profileCompleted;

  const profileRoomLeft = Math.max(
    0,
    profileLimit - completed.PROFILE_ELECTIVE,
  );
  const profileInProgress = Math.min(ongoing.PROFILE_ELECTIVE, profileRoomLeft);
  const profileInProgressExcess = ongoing.PROFILE_ELECTIVE - profileInProgress;

  return [
    toGroupProgress(
      SubjectCategory.MANDATORY,
      requirements.mandatoryHours,
      completed.MANDATORY,
      ongoing.MANDATORY,
    ),
    toGroupProgress(
      SubjectCategory.PROFILE_ELECTIVE,
      profileLimit,
      profileCompleted,
      profileInProgress,
    ),
    toGroupProgress(
      SubjectCategory.FREE_ELECTIVE,
      requirements.freeElectiveHours,
      completed.FREE_ELECTIVE + profileCompletedExcess,
      ongoing.FREE_ELECTIVE + profileInProgressExcess,
    ),
  ];
}
