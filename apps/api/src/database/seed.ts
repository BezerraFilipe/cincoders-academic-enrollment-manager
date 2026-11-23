import { PrismaPg } from '@prisma/adapter-pg';
import { hash } from 'bcryptjs';
import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client.js';
import {
  COURSES,
  PROFESSORS,
  REGISTRAR_USER,
  SECTIONS,
  SEED_PASSWORD,
  STUDENTS,
  SUBJECTS,
} from './seed-data';

async function seed(prisma: PrismaClient): Promise<void> {
  if ((await prisma.user.count()) > 0) {
    console.log('Banco já possui dados. Seed ignorado.');
    return;
  }

  const passwordHash = await hash(SEED_PASSWORD, 10);

  await prisma.$transaction(async (tx) => {
    const subjectIds = new Map<string, number>();
    for (const { code, name, workloadHours } of SUBJECTS) {
      const subject = await tx.subject.create({
        data: { code, name, workloadHours },
      });
      subjectIds.set(code, subject.id);
    }
    const subjectId = (code: string): number => {
      const id = subjectIds.get(code);
      if (id === undefined)
        throw new Error(`Disciplina ${code} não encontrada no seed.`);
      return id;
    };

    await tx.prerequisite.createMany({
      data: SUBJECTS.flatMap((subject) =>
        (subject.prerequisites ?? []).map((prerequisiteCode) => ({
          subjectId: subjectId(subject.code),
          prerequisiteId: subjectId(prerequisiteCode),
        })),
      ),
    });

    const courseIds = new Map<string, number>();
    for (const { curriculum, ...course } of COURSES) {
      const created = await tx.course.create({
        data: {
          ...course,
          curriculum: {
            create: Object.entries(curriculum).map(([code, type]) => ({
              subjectId: subjectId(code),
              type,
            })),
          },
        },
      });
      courseIds.set(course.code, created.id);
    }

    const professorIds = new Map<string, number>();
    for (const professor of PROFESSORS) {
      const created = await tx.professor.create({ data: professor });
      professorIds.set(professor.email, created.id);
    }

    const sectionIds = new Map<string, number>();
    for (const section of SECTIONS) {
      const created = await tx.section.create({
        data: {
          code: section.code,
          capacity: section.capacity,
          subjectId: subjectId(section.subjectCode),
          professorId: professorIds.get(section.professorEmail)!,
        },
      });
      sectionIds.set(`${section.subjectCode}-${section.code}`, created.id);
    }

    await tx.user.create({
      data: { ...REGISTRAR_USER, passwordHash, role: 'REGISTRAR' },
    });

    for (const student of STUDENTS) {
      await tx.user.create({
        data: {
          name: student.name,
          email: student.email,
          passwordHash,
          role: 'STUDENT',
          student: {
            create: {
              registrationNumber: student.registrationNumber,
              courseId: courseIds.get(student.courseCode)!,
              academicRecords: {
                create: student.history.map((record) => ({
                  subjectId: subjectId(record.subjectCode),
                  term: record.term,
                  status: record.status,
                })),
              },
              enrollments: {
                create: student.activeEnrollments.map((enrollment) => ({
                  sectionId: sectionIds.get(
                    `${enrollment.subjectCode}-${enrollment.sectionCode}`,
                  )!,
                })),
              },
            },
          },
        },
      });
    }
  });

  console.log('Seed concluído.');
}

async function main(): Promise<void> {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL ?? '' }),
  });

  try {
    await seed(prisma);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
