import { INestApplication } from '@nestjs/common';
import { hash } from 'bcryptjs';
import request from 'supertest';
import { PrismaService } from '../../src/prisma/prisma.service';

export const PASSWORD = 'Senha@123';

export interface Scenario {
  prefix: string;
  courseAId: number;
  courseBId: number;
  sharedSubjectId: number;
  freeSubjectId: number;
  professorId: number;
  sharedSectionId: number;
  freeSectionId: number;
  studentAId: number;
  studentBId: number;
  studentAEmail: string;
  studentBEmail: string;
  registrarEmail: string;
}

export async function createScenario(
  prisma: PrismaService,
  prefix: string,
): Promise<Scenario> {
  await destroyScenario(prisma, prefix);
  const domain = `${prefix.toLowerCase()}.test`;
  const passwordHash = await hash(PASSWORD, 4);

  const sharedSubject = await prisma.subject.create({
    data: {
      code: `${prefix}01`,
      name: `${prefix} Algoritmos`,
      workloadHours: 60,
    },
  });
  const freeSubject = await prisma.subject.create({
    data: {
      code: `${prefix}02`,
      name: `${prefix} Empreendedorismo`,
      workloadHours: 30,
    },
  });

  const courseA = await prisma.course.create({
    data: {
      code: `${prefix}-A`,
      name: `${prefix} Curso A`,
      mandatoryHours: 60,
      profileElectiveHours: 60,
      freeElectiveHours: 30,
      curriculum: {
        create: [{ subjectId: sharedSubject.id, type: 'MANDATORY' }],
      },
    },
  });
  const courseB = await prisma.course.create({
    data: {
      code: `${prefix}-B`,
      name: `${prefix} Curso B`,
      mandatoryHours: 60,
      profileElectiveHours: 60,
      freeElectiveHours: 30,
      curriculum: {
        create: [{ subjectId: sharedSubject.id, type: 'PROFILE_ELECTIVE' }],
      },
    },
  });

  const professor = await prisma.professor.create({
    data: { name: `${prefix} Professor`, email: `professor@${domain}` },
  });
  const sharedSection = await prisma.section.create({
    data: {
      code: 'A',
      subjectId: sharedSubject.id,
      professorId: professor.id,
      capacity: 2,
    },
  });
  const freeSection = await prisma.section.create({
    data: {
      code: 'A',
      subjectId: freeSubject.id,
      professorId: professor.id,
      capacity: 5,
    },
  });

  const createStudent = (label: string, courseId: number) =>
    prisma.user.create({
      data: {
        name: `${prefix} Aluno ${label}`,
        email: `aluno.${label.toLowerCase()}@${domain}`,
        passwordHash,
        role: 'STUDENT',
        student: {
          create: { courseId, registrationNumber: `${prefix}-${label}` },
        },
      },
      include: { student: true },
    });

  const studentA = await createStudent('A', courseA.id);
  const studentB = await createStudent('B', courseB.id);
  const registrar = await prisma.user.create({
    data: {
      name: `${prefix} Secretaria`,
      email: `secretaria@${domain}`,
      passwordHash,
      role: 'REGISTRAR',
    },
  });

  return {
    prefix,
    courseAId: courseA.id,
    courseBId: courseB.id,
    sharedSubjectId: sharedSubject.id,
    freeSubjectId: freeSubject.id,
    professorId: professor.id,
    sharedSectionId: sharedSection.id,
    freeSectionId: freeSection.id,
    studentAId: studentA.student!.id,
    studentBId: studentB.student!.id,
    studentAEmail: studentA.email,
    studentBEmail: studentB.email,
    registrarEmail: registrar.email,
  };
}

export async function destroyScenario(
  prisma: PrismaService,
  prefix: string,
): Promise<void> {
  const domain = `@${prefix.toLowerCase()}.test`;
  const bySubject = { subject: { code: { startsWith: prefix } } };
  const byStudent = { student: { user: { email: { endsWith: domain } } } };

  await prisma.enrollment.deleteMany({
    where: { OR: [{ section: bySubject }, byStudent] },
  });
  await prisma.academicRecord.deleteMany({
    where: { OR: [bySubject, byStudent] },
  });
  await prisma.student.deleteMany({
    where: { user: { email: { endsWith: domain } } },
  });
  await prisma.user.deleteMany({ where: { email: { endsWith: domain } } });
  await prisma.section.deleteMany({ where: bySubject });
  await prisma.curriculumSubject.deleteMany({ where: bySubject });
  await prisma.prerequisite.deleteMany({
    where: {
      OR: [bySubject, { prerequisite: { code: { startsWith: prefix } } }],
    },
  });
  await prisma.subject.deleteMany({ where: { code: { startsWith: prefix } } });
  await prisma.professor.deleteMany({ where: { email: { endsWith: domain } } });
  await prisma.course.deleteMany({
    where: { code: { startsWith: `${prefix}-` } },
  });
}

export async function loginAs(
  app: INestApplication,
  email: string,
): Promise<string> {
  const response = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email, password: PASSWORD })
    .expect(200);
  return (response.body as { accessToken: string }).accessToken;
}
