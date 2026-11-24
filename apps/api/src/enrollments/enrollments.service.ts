import { Injectable, NotFoundException } from '@nestjs/common';
import { BusinessRuleException } from '../common/errors/business-rule.exception';
import { PrismaService } from '../prisma/prisma.service';
import { StudentsService } from '../students/students.service';
import { missingPrerequisites } from '../subjects/missing-prerequisites';
import { EnrollmentDto } from './dto/enrollment.dto';
import { assertCanEnroll } from './enrollment-rules';

const ENROLLMENT_INCLUDE = {
  section: {
    select: {
      code: true,
      subject: { select: { code: true, name: true, workloadHours: true } },
      professor: { select: { name: true } },
    },
  },
} as const;

type EnrollmentWithSection = {
  id: number;
  sectionId: number;
  createdAt: Date;
  section: {
    code: string;
    subject: { code: string; name: string; workloadHours: number };
    professor: { name: string };
  };
};

@Injectable()
export class EnrollmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly students: StudentsService,
  ) {}

  async listActive(userId: number): Promise<EnrollmentDto[]> {
    const student = await this.students.getByUserId(userId);
    const enrollments = await this.prisma.enrollment.findMany({
      where: { studentId: student.id, status: 'ACTIVE' },
      include: ENROLLMENT_INCLUDE,
      orderBy: [{ section: { subject: { code: 'asc' } } }],
    });

    return enrollments.map(toEnrollmentDto);
  }

  async cancel(userId: number, enrollmentId: number): Promise<void> {
    const student = await this.students.getByUserId(userId);
    const ownEnrollment = { id: enrollmentId, studentId: student.id };

    const { count } = await this.prisma.enrollment.updateMany({
      where: { ...ownEnrollment, status: 'ACTIVE' },
      data: { status: 'CANCELLED', cancelledAt: new Date() },
    });
    if (count === 1) return;

    const exists = await this.prisma.enrollment.count({ where: ownEnrollment });
    if (!exists) {
      throw new NotFoundException({
        code: 'ENROLLMENT_NOT_FOUND',
        message: 'Matrícula não encontrada.',
      });
    }

    throw new BusinessRuleException(
      'ENROLLMENT_NOT_ACTIVE',
      'Esta matrícula já foi cancelada.',
    );
  }

  async enroll(userId: number, sectionId: number): Promise<EnrollmentDto> {
    const student = await this.students.getByUserId(userId);

    const enrollment = await this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "student" WHERE id = ${student.id} FOR UPDATE`;
      const [section] = await tx.$queryRaw<
        { id: number; subject_id: number; capacity: number }[]
      >`SELECT id, subject_id, capacity FROM "section" WHERE id = ${sectionId} FOR UPDATE`;

      if (!section) {
        throw new NotFoundException({
          code: 'SECTION_NOT_FOUND',
          message: 'Turma não encontrada.',
        });
      }

      const subject = await tx.subject.findUniqueOrThrow({
        where: { id: section.subject_id },
        select: {
          code: true,
          prerequisites: {
            select: { prerequisite: { select: { id: true, code: true } } },
          },
        },
      });
      const prerequisites = subject.prerequisites.map(
        (item) => item.prerequisite,
      );

      const [activeInSubject, passedRecords, occupiedSeats] = await Promise.all(
        [
          tx.enrollment.count({
            where: {
              studentId: student.id,
              status: 'ACTIVE',
              section: { subjectId: section.subject_id },
            },
          }),
          tx.academicRecord.findMany({
            where: {
              studentId: student.id,
              status: 'PASSED',
              subjectId: {
                in: [section.subject_id, ...prerequisites.map((p) => p.id)],
              },
            },
            select: { subjectId: true },
          }),
          tx.enrollment.count({ where: { sectionId, status: 'ACTIVE' } }),
        ],
      );
      const passedSubjectIds = new Set(passedRecords.map((r) => r.subjectId));

      assertCanEnroll({
        subjectCode: subject.code,
        hasActiveEnrollmentInSubject: activeInSubject > 0,
        hasPassedSubject: passedSubjectIds.has(section.subject_id),
        missingPrerequisiteCodes: missingPrerequisites(
          prerequisites,
          passedSubjectIds,
        ),
        occupiedSeats,
        capacity: section.capacity,
      });

      return tx.enrollment.create({
        data: { studentId: student.id, sectionId },
        include: ENROLLMENT_INCLUDE,
      });
    });

    return toEnrollmentDto(enrollment);
  }
}

export function toEnrollmentDto(
  enrollment: EnrollmentWithSection,
): EnrollmentDto {
  return {
    id: enrollment.id,
    sectionId: enrollment.sectionId,
    sectionCode: enrollment.section.code,
    subject: enrollment.section.subject,
    professorName: enrollment.section.professor.name,
    createdAt: enrollment.createdAt,
  };
}
