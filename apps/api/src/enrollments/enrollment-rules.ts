import { BusinessRuleException } from '../common/errors/business-rule.exception';

export interface EnrollmentEligibility {
  subjectCode: string;
  hasActiveEnrollmentInSubject: boolean;
  hasPassedSubject: boolean;
  occupiedSeats: number;
  capacity: number;
}

export function assertCanEnroll({
  subjectCode,
  hasActiveEnrollmentInSubject,
  hasPassedSubject,
  occupiedSeats,
  capacity,
}: EnrollmentEligibility): void {
  if (hasActiveEnrollmentInSubject) {
    throw new BusinessRuleException(
      'DUPLICATE_ACTIVE_ENROLLMENT',
      `Você já está matriculado em uma turma de ${subjectCode}.`,
    );
  }

  if (hasPassedSubject) {
    throw new BusinessRuleException(
      'SUBJECT_ALREADY_PASSED',
      `Você já foi aprovado em ${subjectCode}.`,
    );
  }

  if (occupiedSeats >= capacity) {
    throw new BusinessRuleException(
      'SECTION_FULL',
      'Turma lotada. Não há vagas disponíveis.',
    );
  }
}
