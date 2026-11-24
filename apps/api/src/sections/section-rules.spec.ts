import { BusinessRuleException } from '../common/errors/business-rule.exception';
import { assertSectionChange, SectionChange } from './section-rules';

function codeOf(change: SectionChange): string | undefined {
  try {
    assertSectionChange(change);
    return undefined;
  } catch (error) {
    if (!(error instanceof BusinessRuleException)) throw error;
    return (error.getResponse() as { code: string }).code;
  }
}

describe('assertSectionChange', () => {
  it('allows reducing the capacity down to the number of enrolled students', () => {
    expect(
      codeOf({ activeEnrollments: 5, newCapacity: 5, subjectChanged: false }),
    ).toBeUndefined();
  });

  it('rejects a capacity below the number of enrolled students', () => {
    expect(
      codeOf({ activeEnrollments: 5, newCapacity: 4, subjectChanged: false }),
    ).toBe('CAPACITY_BELOW_ENROLLED');
  });

  it('allows any change when the capacity is not being updated', () => {
    expect(
      codeOf({ activeEnrollments: 5, subjectChanged: false }),
    ).toBeUndefined();
  });

  it('rejects changing the subject of a section with enrolled students', () => {
    expect(codeOf({ activeEnrollments: 1, subjectChanged: true })).toBe(
      'SECTION_HAS_ENROLLMENTS',
    );
  });

  it('allows changing the subject of an empty section', () => {
    expect(
      codeOf({ activeEnrollments: 0, subjectChanged: true }),
    ).toBeUndefined();
  });
});
