import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StudentsService } from '../students/students.service';
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

      const [subject, activeInSubject, passedRecord, occupiedSeats] =
        await Promise.all([
          tx.subject.findUniqueOrThrow({
            where: { id: section.subject_id },
            select: { code: true },
          }),
          tx.enrollment.count({
            where: {
              studentId: student.id,
              status: 'ACTIVE',
              section: { subjectId: section.subject_id },
            },
          }),
          tx.academicRecord.count({
            where: {
              studentId: student.id,
              subjectId: section.subject_id,
              status: 'PASSED',
            },
          }),
          tx.enrollment.count({ where: { sectionId, status: 'ACTIVE' } }),
        ]);

      assertCanEnroll({
        subjectCode: subject.code,
        hasActiveEnrollmentInSubject: activeInSubject > 0,
        hasPassedSubject: passedRecord > 0,
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
