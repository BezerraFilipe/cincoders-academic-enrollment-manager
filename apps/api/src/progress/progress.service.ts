import { Injectable } from '@nestjs/common';
import { CurriculumService } from '../curriculum/curriculum.service';
import { PrismaService } from '../prisma/prisma.service';
import { StudentsService } from '../students/students.service';
import { ProgressDto } from './dto/progress.dto';
import { calculateProgress, CategorizedSubject } from './progress-calculator';

interface SubjectHours {
  id: number;
  workloadHours: number;
}

@Injectable()
export class ProgressService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly students: StudentsService,
    private readonly curriculum: CurriculumService,
  ) {}

  async getForStudent(userId: number): Promise<ProgressDto> {
    const student = await this.students.getByUserId(userId);
    const subjectHours = { select: { id: true, workloadHours: true } } as const;

    const [course, passedRecords, activeEnrollments] = await Promise.all([
      this.prisma.course.findUniqueOrThrow({
        where: { id: student.courseId },
        select: {
          code: true,
          name: true,
          mandatoryHours: true,
          profileElectiveHours: true,
          freeElectiveHours: true,
        },
      }),
      this.prisma.academicRecord.findMany({
        where: { studentId: student.id, status: 'PASSED' },
        select: { subject: subjectHours },
      }),
      this.prisma.enrollment.findMany({
        where: { studentId: student.id, status: 'ACTIVE' },
        select: { section: { select: { subject: subjectHours } } },
      }),
    ]);

    const passedSubjects = passedRecords.map((record) => record.subject);
    const ongoingSubjects = activeEnrollments.map((e) => e.section.subject);
    const categories = await this.curriculum.categorizeSubjects(
      student.courseId,
      [...passedSubjects, ...ongoingSubjects].map((subject) => subject.id),
    );

    const categorize = (subject: SubjectHours): CategorizedSubject => ({
      subjectId: subject.id,
      workloadHours: subject.workloadHours,
      category: categories.get(subject.id)!,
    });

    return {
      course: { code: course.code, name: course.name },
      groups: calculateProgress(
        course,
        passedSubjects.map(categorize),
        ongoingSubjects.map(categorize),
      ),
    };
  }
}
