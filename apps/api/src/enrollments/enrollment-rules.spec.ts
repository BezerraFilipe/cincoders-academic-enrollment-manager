import { BusinessRuleException } from '../common/errors/business-rule.exception';
import { assertCanEnroll, EnrollmentEligibility } from './enrollment-rules';

const eligible: EnrollmentEligibility = {
  subjectCode: 'IF669',
  hasActiveEnrollmentInSubject: false,
  hasPassedSubject: false,
  missingPrerequisiteCodes: [],
  occupiedSeats: 0,
  capacity: 10,
};

function codeOf(
  eligibility: Partial<EnrollmentEligibility>,
): string | undefined {
  try {
    assertCanEnroll({ ...eligible, ...eligibility });
    return undefined;
  } catch (error) {
    if (!(error instanceof BusinessRuleException)) throw error;
    return (error.getResponse() as { code: string }).code;
  }
}

describe('assertCanEnroll', () => {
  it('allows enrollment when every rule is satisfied', () => {
    expect(codeOf({})).toBeUndefined();
  });

  it('allows taking the last available seat', () => {
    expect(codeOf({ occupiedSeats: 9, capacity: 10 })).toBeUndefined();
  });

  it('rejects a full section', () => {
    expect(codeOf({ occupiedSeats: 10, capacity: 10 })).toBe('SECTION_FULL');
  });

  it('rejects a subject the student has already passed', () => {
    expect(codeOf({ hasPassedSubject: true })).toBe('SUBJECT_ALREADY_PASSED');
  });

  it('rejects a second active enrollment in the same subject', () => {
    expect(codeOf({ hasActiveEnrollmentInSubject: true })).toBe(
      'DUPLICATE_ACTIVE_ENROLLMENT',
    );
  });

  it('reports the duplicate enrollment before a full section', () => {
    expect(
      codeOf({ hasActiveEnrollmentInSubject: true, occupiedSeats: 10 }),
    ).toBe('DUPLICATE_ACTIVE_ENROLLMENT');
  });

  it('rejects a subject with prerequisites the student has not passed', () => {
    expect(codeOf({ missingPrerequisiteCodes: ['IF669'] })).toBe(
      'PREREQUISITES_NOT_MET',
    );
  });

  it('reports missing prerequisites before a full section', () => {
    expect(
      codeOf({ missingPrerequisiteCodes: ['IF669'], occupiedSeats: 10 }),
    ).toBe('PREREQUISITES_NOT_MET');
  });
});
