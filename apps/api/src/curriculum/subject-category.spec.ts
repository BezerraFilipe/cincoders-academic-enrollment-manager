import { categorizeSubject, SubjectCategory } from './subject-category';

describe('categorizeSubject', () => {
  it('counts a subject marked as mandatory in the curriculum as mandatory', () => {
    expect(categorizeSubject('MANDATORY')).toBe(SubjectCategory.MANDATORY);
  });

  it('counts a subject marked as profile elective in the curriculum as profile elective', () => {
    expect(categorizeSubject('PROFILE_ELECTIVE')).toBe(
      SubjectCategory.PROFILE_ELECTIVE,
    );
  });

  it('counts a subject outside the curriculum as free elective', () => {
    expect(categorizeSubject(undefined)).toBe(SubjectCategory.FREE_ELECTIVE);
  });
});
