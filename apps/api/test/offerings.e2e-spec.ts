import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';
import { PrismaService } from '../src/prisma/prisma.service';
import {
  createScenario,
  destroyScenario,
  loginAs,
  Scenario,
} from './support/scenario';

const PREFIX = 'OFR';

interface OfferingBody {
  sectionId: number;
  subject: { code: string };
  category: string;
  occupiedSeats: number;
  availableSeats: number;
  enrolled: boolean;
  enrolledInSubject: boolean;
  alreadyPassed: boolean;
}

describe('Offerings (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let scenario: Scenario;
  let tokenA: string;
  let tokenB: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();

    prisma = app.get(PrismaService);
    scenario = await createScenario(prisma, PREFIX);

    await prisma.enrollment.createMany({
      data: [
        { studentId: scenario.studentBId, sectionId: scenario.sharedSectionId },
        {
          studentId: scenario.studentAId,
          sectionId: scenario.sharedSectionId,
          status: 'CANCELLED',
          cancelledAt: new Date(),
        },
      ],
    });
    await prisma.academicRecord.create({
      data: {
        studentId: scenario.studentAId,
        subjectId: scenario.freeSubjectId,
        term: '2025.1',
        status: 'PASSED',
      },
    });

    tokenA = await loginAs(app, scenario.studentAEmail);
    tokenB = await loginAs(app, scenario.studentBEmail);
  });

  afterAll(async () => {
    await destroyScenario(prisma, PREFIX);
    await app.close();
  });

  const list = (token: string, query: Record<string, string | number> = {}) =>
    request(app.getHttpServer())
      .get('/me/offerings')
      .query({ search: PREFIX, ...query })
      .set('Authorization', `Bearer ${token}`);

  const findOffering = (items: OfferingBody[], code: string) =>
    items.find((item) => item.subject.code === code)!;

  it('classifies each subject according to the course of the logged student', async () => {
    const [responseA, responseB] = await Promise.all([
      list(tokenA),
      list(tokenB),
    ]);

    const itemsA = responseA.body.items as OfferingBody[];
    const itemsB = responseB.body.items as OfferingBody[];
    expect(findOffering(itemsA, `${PREFIX}01`).category).toBe('MANDATORY');
    expect(findOffering(itemsB, `${PREFIX}01`).category).toBe(
      'PROFILE_ELECTIVE',
    );
    expect(findOffering(itemsA, `${PREFIX}02`).category).toBe('FREE_ELECTIVE');
  });

  it('counts only active enrollments as occupied seats', async () => {
    const { body } = await list(tokenA).expect(200);

    const shared = findOffering(body.items as OfferingBody[], `${PREFIX}01`);
    expect(shared).toMatchObject({ occupiedSeats: 1, availableSeats: 1 });
  });

  it('flags sections the student is enrolled in and subjects already passed', async () => {
    const [responseA, responseB] = await Promise.all([
      list(tokenA),
      list(tokenB),
    ]);

    expect(
      findOffering(responseB.body.items as OfferingBody[], `${PREFIX}01`)
        .enrolled,
    ).toBe(true);
    expect(
      findOffering(responseA.body.items as OfferingBody[], `${PREFIX}01`)
        .enrolled,
    ).toBe(false);
    expect(
      findOffering(responseA.body.items as OfferingBody[], `${PREFIX}02`)
        .alreadyPassed,
    ).toBe(true);
  });

  it('paginates the results', async () => {
    const { body } = await list(tokenA, { pageSize: 1, page: 2 }).expect(200);

    expect(body).toMatchObject({
      total: 2,
      page: 2,
      pageSize: 1,
      totalPages: 2,
    });
    expect(body.items).toHaveLength(1);
  });

  it('searches by subject name ignoring case', async () => {
    const { body } = await list(tokenA, {
      search: `${PREFIX.toLowerCase()} empreendedorismo`,
    }).expect(200);

    expect(
      (body.items as OfferingBody[]).map((item) => item.subject.code),
    ).toEqual([`${PREFIX}02`]);
  });

  it('rejects an invalid page size', async () => {
    const { body } = await list(tokenA, { pageSize: 100 }).expect(400);

    expect(body).toMatchObject({ code: 'VALIDATION_ERROR' });
  });

  it('is not available to the registrar', async () => {
    const token = await loginAs(app, scenario.registrarEmail);

    await list(token).expect(403);
  });

  it('flags every section of a subject in which the student is already enrolled', async () => {
    const otherSection = await prisma.section.create({
      data: {
        code: 'B',
        subjectId: scenario.sharedSubjectId,
        professorId: scenario.professorId,
        capacity: 10,
      },
    });

    const { body } = await list(tokenB).expect(200);
    const sharedSections = (body.items as OfferingBody[]).filter(
      (item) => item.subject.code === `${PREFIX}01`,
    );

    expect(sharedSections).toHaveLength(2);
    expect(sharedSections.every((item) => item.enrolledInSubject)).toBe(true);
    expect(
      sharedSections.find((item) => item.sectionId === otherSection.id)
        ?.enrolled,
    ).toBe(false);
  });

  it('returns the student profile with registration number and course on /auth/me', async () => {
    const { body } = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200);

    expect(body).toMatchObject({
      email: scenario.studentAEmail,
      role: 'STUDENT',
      student: {
        registrationNumber: `${PREFIX}-A`,
        course: { code: `${PREFIX}-A`, name: `${PREFIX} Curso A` },
      },
    });
  });
});
