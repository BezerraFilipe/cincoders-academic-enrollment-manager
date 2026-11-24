import type { CurriculumType } from '../generated/prisma/client.js';

export const SubjectCategory = {
  MANDATORY: 'MANDATORY',
  PROFILE_ELECTIVE: 'PROFILE_ELECTIVE',
  FREE_ELECTIVE: 'FREE_ELECTIVE',
} as const;

export type SubjectCategory =
  (typeof SubjectCategory)[keyof typeof SubjectCategory];

export function categorizeSubject(
  curriculumType: CurriculumType | undefined,
): SubjectCategory {
  if (curriculumType === 'MANDATORY') return SubjectCategory.MANDATORY;
  if (curriculumType === 'PROFILE_ELECTIVE')
    return SubjectCategory.PROFILE_ELECTIVE;
  return SubjectCategory.FREE_ELECTIVE;
}
