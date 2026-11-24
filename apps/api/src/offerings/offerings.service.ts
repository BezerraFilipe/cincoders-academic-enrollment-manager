import { Injectable } from '@nestjs/common';
import { toPage, toSkip } from '../common/pagination/page';
import { PaginationQueryDto } from '../common/pagination/pagination-query.dto';
import { CurriculumService } from '../curriculum/curriculum.service';
import type { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service';
import { StudentsService } from '../students/students.service';
import { missingPrerequisites } from '../subjects/missing-prerequisites';
import { OfferingDto, OfferingsPageDto } from './dto/offering.dto';

@Injectable()
export class OfferingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly students: StudentsService,
    private readonly curriculum: CurriculumService,
  ) {}

  async listForStudent(
    userId: number,
    { page, pageSize, search }: PaginationQueryDto,
  ): Promise<OfferingsPageDto> {
    const student = await this.students.getByUserId(userId);
    const where: Prisma.SectionWhereInput = search
      ? {
          subject: {
            OR: [
              { code: { contains: search, mode: 'insensitive' } },
              { name: { contains: search, mode: 'insensitive' } },
            ],
          },
        }
      : {};

    const [total, sections] = await this.prisma.$transaction([
      this.prisma.section.count({ where }),
      this.prisma.section.findMany({
        where,
        orderBy: [{ subject: { code: 'asc' } }, { code: 'asc' }],
        skip: toSkip(page, pageSize),
        take: pageSize,
        include: {
          subject: {
            select: {
              id: true,
              code: true,
              name: true,
              workloadHours: true,
              prerequisites: {
                select: { prerequisite: { select: { id: true, code: true } } },
              },
            },
          },
          professor: { select: { name: true } },
          _count: {
            select: { enrollments: { where: { status: 'ACTIVE' } } },
          },
        },
      }),
    ]);

    const subjectIds = [...new Set(sections.map((s) => s.subject.id))];
    const prerequisiteIds = sections.flatMap((s) =>
      s.subject.prerequisites.map((item) => item.prerequisite.id),
    );

    const [categories, passedRecords, activeEnrollments] = await Promise.all([
      this.curriculum.categorizeSubjects(student.courseId, subjectIds),
      this.prisma.academicRecord.findMany({
        where: {
          studentId: student.id,
          status: 'PASSED',
          subjectId: { in: [...subjectIds, ...prerequisiteIds] },
        },
        select: { subjectId: true },
      }),
      this.prisma.enrollment.findMany({
        where: {
          studentId: student.id,
          status: 'ACTIVE',
          section: { subjectId: { in: subjectIds } },
        },
        select: { sectionId: true, section: { select: { subjectId: true } } },
      }),
    ]);

    const passedSubjectIds = new Set(passedRecords.map((r) => r.subjectId));
    const enrolledSectionIds = new Set(
      activeEnrollments.map((e) => e.sectionId),
    );
    const enrolledSubjectIds = new Set(
      activeEnrollments.map((e) => e.section.subjectId),
    );

    const items: OfferingDto[] = sections.map((section) => ({
      sectionId: section.id,
      sectionCode: section.code,
      subject: {
        id: section.subject.id,
        code: section.subject.code,
        name: section.subject.name,
        workloadHours: section.subject.workloadHours,
      },
      professorName: section.professor.name,
      capacity: section.capacity,
      occupiedSeats: section._count.enrollments,
      availableSeats: Math.max(
        0,
        section.capacity - section._count.enrollments,
      ),
      category: categories.get(section.subject.id)!,
      enrolled: enrolledSectionIds.has(section.id),
      enrolledInSubject: enrolledSubjectIds.has(section.subject.id),
      alreadyPassed: passedSubjectIds.has(section.subject.id),
      missingPrerequisites: missingPrerequisites(
        section.subject.prerequisites.map((item) => item.prerequisite),
        passedSubjectIds,
      ),
    }));

    return toPage(items, total, page, pageSize);
  }
}
