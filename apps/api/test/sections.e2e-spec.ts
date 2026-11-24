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

const PREFIX = 'SEC';

describe('Sections (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let scenario: Scenario;
  let token: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();

    prisma = app.get(PrismaService);
    scenario = await createScenario(prisma, PREFIX);
    token = await loginAs(app, scenario.registrarEmail);
  });

  beforeEach(async () => {
    await prisma.enrollment.deleteMany({
      where: { section: { subject: { code: { startsWith: PREFIX } } } },
    });
  });

  afterAll(async () => {
    await destroyScenario(prisma, PREFIX);
    await app.close();
  });

  const http = () => request(app.getHttpServer());
  const authorized = <T extends { set: (header: string, value: string) => T }>(
    req: T,
  ) => req.set('Authorization', `Bearer ${token}`);
  const enrollStudents = (
    sectionId: number,
    studentIds: number[],
    status: 'ACTIVE' | 'CANCELLED' = 'ACTIVE',
  ) =>
    prisma.enrollment.createMany({
      data: studentIds.map((studentId) => ({ studentId, sectionId, status })),
    });

  it('opens a section', async () => {
    const { body } = await authorized(http().post('/sections'))
      .send({
        subjectId: scenario.freeSubjectId,
        professorId: scenario.professorId,
        code: 'c',
        capacity: 20,
      })
      .expect(201);

    expect(body).toMatchObject({ code: 'C', capacity: 20, occupiedSeats: 0 });
  });

  it('rejects a duplicated section code for the same subject', async () => {
    const { body } = await authorized(http().post('/sections'))
      .send({
        subjectId: scenario.sharedSubjectId,
        professorId: scenario.professorId,
        code: 'A',
        capacity: 10,
      })
      .expect(409);

    expect(body).toMatchObject({ code: 'SECTION_CODE_TAKEN' });
  });

  it('requires at least one seat', async () => {
    await authorized(http().post('/sections'))
      .send({
        subjectId: scenario.sharedSubjectId,
        professorId: scenario.professorId,
        code: 'Z',
        capacity: 0,
      })
      .expect(400);
  });

  it('rejects a professor that does not exist', async () => {
    const { body } = await authorized(http().post('/sections'))
      .send({
        subjectId: scenario.sharedSubjectId,
        professorId: 999999,
        code: 'Y',
        capacity: 5,
      })
      .expect(404);

    expect(body).toMatchObject({ code: 'PROFESSOR_NOT_FOUND' });
  });

  it('lists sections with occupied and total seats', async () => {
    await enrollStudents(scenario.sharedSectionId, [scenario.studentAId]);
    await enrollStudents(
      scenario.sharedSectionId,
      [scenario.studentBId],
      'CANCELLED',
    );

    const { body } = await authorized(http().get('/sections'))
      .query({ search: `${PREFIX}01` })
      .expect(200);

    expect(body.items[0]).toMatchObject({ capacity: 2, occupiedSeats: 1 });
  });

  it('refuses a capacity below the number of enrolled students', async () => {
    await enrollStudents(scenario.freeSectionId, [
      scenario.studentAId,
      scenario.studentBId,
    ]);

    const { body } = await authorized(
      http().patch(`/sections/${scenario.freeSectionId}`),
    )
      .send({ capacity: 1 })
      .expect(422);

    expect(body).toMatchObject({ code: 'CAPACITY_BELOW_ENROLLED' });
  });

  it('allows reducing the capacity to exactly the number of enrolled students', async () => {
    await enrollStudents(scenario.freeSectionId, [
      scenario.studentAId,
      scenario.studentBId,
    ]);

    const { body } = await authorized(
      http().patch(`/sections/${scenario.freeSectionId}`),
    )
      .send({ capacity: 2 })
      .expect(200);

    expect(body).toMatchObject({ capacity: 2, occupiedSeats: 2 });
  });

  it('refuses to change the subject of a section with enrolled students', async () => {
    await enrollStudents(scenario.freeSectionId, [scenario.studentAId]);

    const { body } = await authorized(
      http().patch(`/sections/${scenario.freeSectionId}`),
    )
      .send({ subjectId: scenario.sharedSubjectId, code: 'X' })
      .expect(422);

    expect(body).toMatchObject({ code: 'SECTION_HAS_ENROLLMENTS' });
  });

  it('refuses to delete a section with active enrollments', async () => {
    await enrollStudents(scenario.sharedSectionId, [scenario.studentAId]);

    const { body } = await authorized(
      http().delete(`/sections/${scenario.sharedSectionId}`),
    ).expect(409);

    expect(body).toMatchObject({ code: 'RESOURCE_IN_USE' });
  });

  it('deletes a section that only has cancelled enrollments', async () => {
    const { body: section } = await authorized(http().post('/sections'))
      .send({
        subjectId: scenario.freeSubjectId,
        professorId: scenario.professorId,
        code: 'T',
        capacity: 5,
      })
      .expect(201);
    await enrollStudents(section.id, [scenario.studentAId], 'CANCELLED');

    await authorized(http().delete(`/sections/${section.id}`)).expect(204);
    await authorized(http().get(`/sections/${section.id}`)).expect(404);
  });

  it('is not available to students', async () => {
    const studentToken = await loginAs(app, scenario.studentAEmail);

    await http()
      .get('/sections')
      .set('Authorization', `Bearer ${studentToken}`)
      .expect(403);
  });
});
