import { BusinessRuleException } from '../common/errors/business-rule.exception';

export interface SectionChange {
  activeEnrollments: number;
  newCapacity?: number;
  subjectChanged: boolean;
}

export function assertSectionChange({
  activeEnrollments,
  newCapacity,
  subjectChanged,
}: SectionChange): void {
  if (newCapacity !== undefined && newCapacity < activeEnrollments) {
    throw new BusinessRuleException(
      'CAPACITY_BELOW_ENROLLED',
      `A turma tem ${activeEnrollments} ${
        activeEnrollments === 1 ? 'aluno matriculado' : 'alunos matriculados'
      }; o número de vagas não pode ser menor que isso.`,
    );
  }

  if (subjectChanged && activeEnrollments > 0) {
    throw new BusinessRuleException(
      'SECTION_HAS_ENROLLMENTS',
      'Não é possível trocar a disciplina de uma turma com alunos matriculados.',
    );
  }
}
