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

const PREFIX = 'PRQ';

describe('Prerequisites (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let scenario: Scenario;
  let registrarToken: string;
  let studentToken: string;
  let advancedSubjectId: number;
  let advancedSectionId: number;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();

    prisma = app.get(PrismaService);
    scenario = await createScenario(prisma, PREFIX);

    const advanced = await prisma.subject.create({
      data: {
        code: `${PREFIX}03`,
        name: `${PREFIX} Tópicos Avançados`,
        workloadHours: 60,
        prerequisites: {
          create: [{ prerequisiteId: scenario.sharedSubjectId }],
        },
      },
    });
    const section = await prisma.section.create({
      data: {
        code: 'A',
        subjectId: advanced.id,
        professorId: scenario.professorId,
        capacity: 10,
      },
    });
    advancedSubjectId = advanced.id;
    advancedSectionId = section.id;

    registrarToken = await loginAs(app, scenario.registrarEmail);
    studentToken = await loginAs(app, scenario.studentAEmail);
  });

  afterAll(async () => {
    await destroyScenario(prisma, PREFIX);
    await app.close();
  });

  const http = () => request(app.getHttpServer());
  const updatePrerequisites = (subjectId: number, prerequisiteIds: number[]) =>
    http()
      .patch(`/subjects/${subjectId}`)
      .set('Authorization', `Bearer ${registrarToken}`)
      .send({ prerequisiteIds });
  const enroll = (sectionId: number) =>
    http()
      .post('/me/enrollments')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ sectionId });
  const advancedOffering = async () => {
    const { body } = await http()
      .get('/me/offerings')
      .query({ search: `${PREFIX}03` })
      .set('Authorization', `Bearer ${studentToken}`)
      .expect(200);
    return body.items[0] as { missingPrerequisites: string[] };
  };

  describe('registrar', () => {
    it('defines the prerequisites of a subject', async () => {
      const { body } = await updatePrerequisites(advancedSubjectId, [
        scenario.sharedSubjectId,
        scenario.freeSubjectId,
      ]).expect(200);

      expect(body.prerequisites.map((p: { code: string }) => p.code)).toEqual([
        `${PREFIX}01`,
        `${PREFIX}02`,
      ]);

      await updatePrerequisites(advancedSubjectId, [
        scenario.sharedSubjectId,
      ]).expect(200);
    });

    it('rejects a subject as its own prerequisite', async () => {
      const { body } = await updatePrerequisites(advancedSubjectId, [
        advancedSubjectId,
      ]).expect(422);

      expect(body).toMatchObject({ code: 'PREREQUISITE_CYCLE' });
    });

    it('rejects prerequisites that would create a cycle', async () => {
      const { body } = await updatePrerequisites(scenario.sharedSubjectId, [
        advancedSubjectId,
      ]).expect(422);

      expect(body).toMatchObject({ code: 'PREREQUISITE_CYCLE' });
    });

    it('rejects a prerequisite that does not exist', async () => {
      const { body } = await updatePrerequisites(
        advancedSubjectId,
        [999999],
      ).expect(422);

      expect(body).toMatchObject({ code: 'PREREQUISITE_NOT_FOUND' });
    });
  });

  describe('student', () => {
    it('sees the pending prerequisites and cannot enroll', async () => {
      expect((await advancedOffering()).missingPrerequisites).toEqual([
        `${PREFIX}01`,
      ]);

      const { body } = await enroll(advancedSectionId).expect(422);

      expect(body).toMatchObject({ code: 'PREREQUISITES_NOT_MET' });
      expect(body.message).toContain(`${PREFIX}01`);
    });

    it('cannot use an active enrollment in the prerequisite to satisfy it', async () => {
      await enroll(scenario.sharedSectionId).expect(201);

      const { body } = await enroll(advancedSectionId).expect(422);

      expect(body).toMatchObject({ code: 'PREREQUISITES_NOT_MET' });
    });

    it('can enroll after passing the prerequisite', async () => {
      await prisma.enrollment.deleteMany({
        where: { studentId: scenario.studentAId },
      });
      await prisma.academicRecord.create({
        data: {
          studentId: scenario.studentAId,
          subjectId: scenario.sharedSubjectId,
          term: '2025.1',
          status: 'PASSED',
        },
      });

      expect((await advancedOffering()).missingPrerequisites).toEqual([]);
      await enroll(advancedSectionId).expect(201);
    });
  });
});
