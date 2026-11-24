import { Injectable } from '@nestjs/common';
import type { CurriculumType } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service';
import { categorizeSubject, SubjectCategory } from './subject-category';

@Injectable()
export class CurriculumService {
  constructor(private readonly prisma: PrismaService) {}

  async categorizeSubjects(
    courseId: number,
    subjectIds: number[],
  ): Promise<Map<number, SubjectCategory>> {
    const entries = await this.prisma.curriculumSubject.findMany({
      where: { courseId, subjectId: { in: subjectIds } },
      select: { subjectId: true, type: true },
    });
    const typeBySubject = new Map<number, CurriculumType>(
      entries.map((entry) => [entry.subjectId, entry.type]),
    );

    return new Map(
      subjectIds.map((subjectId) => [
        subjectId,
        categorizeSubject(typeBySubject.get(subjectId)),
      ]),
    );
  }
}
