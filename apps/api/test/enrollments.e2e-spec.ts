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

const PREFIX = 'ENR';

describe('Enrollments (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let scenario: Scenario;
  let tokenA: string;
  let tokenB: string;
  let singleSeatSectionId: number;
  let otherSharedSectionId: number;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();

    prisma = app.get(PrismaService);
    scenario = await createScenario(prisma, PREFIX);

    const singleSeat = await prisma.section.create({
      data: {
        code: 'B',
        subjectId: scenario.freeSubjectId,
        professorId: scenario.professorId,
        capacity: 1,
      },
    });
    const otherShared = await prisma.section.create({
      data: {
        code: 'B',
        subjectId: scenario.sharedSubjectId,
        professorId: scenario.professorId,
        capacity: 10,
      },
    });
    singleSeatSectionId = singleSeat.id;
    otherSharedSectionId = otherShared.id;

    tokenA = await loginAs(app, scenario.studentAEmail);
    tokenB = await loginAs(app, scenario.studentBEmail);
  });

  beforeEach(async () => {
    await prisma.enrollment.deleteMany({
      where: { section: { subject: { code: { startsWith: PREFIX } } } },
    });
    await prisma.academicRecord.deleteMany({
      where: { subject: { code: { startsWith: PREFIX } } },
    });
  });

  afterAll(async () => {
    await destroyScenario(prisma, PREFIX);
    await app.close();
  });

  const enroll = (token: string, sectionId: number) =>
    request(app.getHttpServer())
      .post('/me/enrollments')
      .set('Authorization', `Bearer ${token}`)
      .send({ sectionId });

  const activeEnrollments = (sectionId: number) =>
    prisma.enrollment.count({ where: { sectionId, status: 'ACTIVE' } });

  it('enrolls the student and occupies a seat', async () => {
    const { body } = await enroll(tokenA, scenario.sharedSectionId).expect(201);

    expect(body).toMatchObject({
      sectionId: scenario.sharedSectionId,
      subject: { code: `${PREFIX}01` },
    });
    expect(await activeEnrollments(scenario.sharedSectionId)).toBe(1);
  });

  it('rejects a full section', async () => {
    await enroll(tokenA, singleSeatSectionId).expect(201);

    const { body } = await enroll(tokenB, singleSeatSectionId).expect(422);

    expect(body).toMatchObject({ code: 'SECTION_FULL' });
  });

  it('rejects a subject the student has already passed', async () => {
    await prisma.academicRecord.create({
      data: {
        studentId: scenario.studentAId,
        subjectId: scenario.sharedSubjectId,
        term: '2025.1',
        status: 'PASSED',
      },
    });

    const { body } = await enroll(tokenA, scenario.sharedSectionId).expect(422);

    expect(body).toMatchObject({ code: 'SUBJECT_ALREADY_PASSED' });
  });

  it('allows retaking a subject the student has failed', async () => {
    await prisma.academicRecord.create({
      data: {
        studentId: scenario.studentAId,
        subjectId: scenario.sharedSubjectId,
        term: '2025.1',
        status: 'FAILED',
      },
    });

    await enroll(tokenA, scenario.sharedSectionId).expect(201);
  });

  it('rejects a second active enrollment in the same subject, even in another section', async () => {
    await enroll(tokenA, scenario.sharedSectionId).expect(201);

    const sameSection = await enroll(tokenA, scenario.sharedSectionId).expect(
      422,
    );
    const otherSection = await enroll(tokenA, otherSharedSectionId).expect(422);

    expect(sameSection.body).toMatchObject({
      code: 'DUPLICATE_ACTIVE_ENROLLMENT',
    });
    expect(otherSection.body).toMatchObject({
      code: 'DUPLICATE_ACTIVE_ENROLLMENT',
    });
  });

  it('allows enrolling again after a cancellation', async () => {
    await prisma.enrollment.create({
      data: {
        studentId: scenario.studentAId,
        sectionId: scenario.sharedSectionId,
        status: 'CANCELLED',
        cancelledAt: new Date(),
      },
    });

    await enroll(tokenA, scenario.sharedSectionId).expect(201);
  });

  it('never exceeds the capacity when two students compete for the last seat', async () => {
    const results = await Promise.all([
      enroll(tokenA, singleSeatSectionId),
      enroll(tokenB, singleSeatSectionId),
    ]);

    expect(
      results.map((result) => result.status).sort((a, b) => a - b),
    ).toEqual([201, 422]);
    expect(await activeEnrollments(singleSeatSectionId)).toBe(1);
  });

  it('returns 404 for a section that does not exist', async () => {
    const { body } = await enroll(tokenA, 999_999).expect(404);

    expect(body).toMatchObject({ code: 'SECTION_NOT_FOUND' });
  });

  it('validates the request body', async () => {
    const { body } = await enroll(tokenA, -1).expect(400);

    expect(body).toMatchObject({ code: 'VALIDATION_ERROR' });
  });

  it('is not available to the registrar', async () => {
    const token = await loginAs(app, scenario.registrarEmail);

    await enroll(token, scenario.sharedSectionId).expect(403);
  });

  describe('my enrollments and cancellation', () => {
    const listMine = (token: string) =>
      request(app.getHttpServer())
        .get('/me/enrollments')
        .set('Authorization', `Bearer ${token}`);

    const cancel = (token: string, enrollmentId: number | string) =>
      request(app.getHttpServer())
        .delete(`/me/enrollments/${enrollmentId}`)
        .set('Authorization', `Bearer ${token}`);

    it('lists only the active enrollments of the logged student', async () => {
      const { body: own } = await enroll(
        tokenA,
        scenario.sharedSectionId,
      ).expect(201);
      await enroll(tokenB, scenario.freeSectionId).expect(201);
      await prisma.enrollment.create({
        data: {
          studentId: scenario.studentAId,
          sectionId: scenario.freeSectionId,
          status: 'CANCELLED',
          cancelledAt: new Date(),
        },
      });

      const { body } = await listMine(tokenA).expect(200);

      expect(
        (body as { id: number }[]).map((enrollment) => enrollment.id),
      ).toEqual([own.id]);
    });

    it('cancels an enrollment and returns the seat to the section', async () => {
      const { body } = await enroll(tokenA, singleSeatSectionId).expect(201);

      await cancel(tokenA, body.id).expect(204);

      expect(await activeEnrollments(singleSeatSectionId)).toBe(0);
      await enroll(tokenB, singleSeatSectionId).expect(201);
    });

    it('does not let a student cancel the enrollment of another student', async () => {
      const { body } = await enroll(tokenB, scenario.freeSectionId).expect(201);

      const response = await cancel(tokenA, body.id).expect(404);

      expect(response.body).toMatchObject({ code: 'ENROLLMENT_NOT_FOUND' });
      expect(await activeEnrollments(scenario.freeSectionId)).toBe(1);
    });

    it('rejects cancelling an enrollment twice', async () => {
      const { body } = await enroll(tokenA, scenario.freeSectionId).expect(201);
      await cancel(tokenA, body.id).expect(204);

      const response = await cancel(tokenA, body.id).expect(422);

      expect(response.body).toMatchObject({ code: 'ENROLLMENT_NOT_ACTIVE' });
    });

    it('rejects an invalid enrollment id', async () => {
      await cancel(tokenA, 'abc').expect(400);
    });
  });
});
