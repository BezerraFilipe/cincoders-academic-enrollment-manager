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

const PREFIX = 'SUB';

describe('Subjects (e2e)', () => {
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

  afterAll(async () => {
    await destroyScenario(prisma, PREFIX);
    await app.close();
  });

  const http = () => request(app.getHttpServer());
  const withAuth = <T extends { set: (header: string, value: string) => T }>(
    req: T,
  ) => req.set('Authorization', `Bearer ${token}`);

  const create = (body: Record<string, unknown>) =>
    withAuth(http().post('/subjects')).send(body);

  it('creates a subject normalizing the code', async () => {
    const { body } = await create({
      code: ` ${PREFIX.toLowerCase()}10 `,
      name: `${PREFIX} Compiladores`,
      workloadHours: 60,
    }).expect(201);

    expect(body).toMatchObject({ code: `${PREFIX}10`, workloadHours: 60 });
  });

  it('rejects a duplicated code', async () => {
    const { body } = await create({
      code: `${PREFIX}01`,
      name: 'Duplicada',
      workloadHours: 60,
    }).expect(409);

    expect(body).toMatchObject({ code: 'SUBJECT_CODE_TAKEN' });
  });

  it.each([15, 120])('accepts %ih as workload', async (workloadHours) => {
    await create({
      code: `${PREFIX}${workloadHours}`,
      name: 'Limite',
      workloadHours,
    }).expect(201);
  });

  it.each([0, 20, 135])('rejects %ih as workload', async (workloadHours) => {
    const { body } = await create({
      code: `${PREFIX}99`,
      name: 'Inválida',
      workloadHours,
    }).expect(400);

    expect(body).toMatchObject({ code: 'VALIDATION_ERROR' });
  });

  it('lists subjects with search and pagination', async () => {
    const { body } = await withAuth(http().get('/subjects'))
      .query({ search: PREFIX, pageSize: 2 })
      .expect(200);

    expect(body.items).toHaveLength(2);
    expect(body.total).toBeGreaterThanOrEqual(4);
  });

  it('updates a subject', async () => {
    const { body } = await withAuth(
      http().patch(`/subjects/${scenario.freeSubjectId}`),
    )
      .send({ name: `${PREFIX} Empreendedorismo II`, workloadHours: 45 })
      .expect(200);

    expect(body).toMatchObject({
      name: `${PREFIX} Empreendedorismo II`,
      workloadHours: 45,
    });
  });

  it('returns 404 for a subject that does not exist', async () => {
    await withAuth(http().get('/subjects/999999')).expect(404);
  });

  it('refuses to delete a subject that is in use', async () => {
    const { body } = await withAuth(
      http().delete(`/subjects/${scenario.sharedSubjectId}`),
    ).expect(409);

    expect(body).toMatchObject({ code: 'RESOURCE_IN_USE' });
    expect(body.message).toContain('possui turmas');
  });

  it('deletes a subject that is not in use', async () => {
    const { body: created } = await create({
      code: `${PREFIX}50`,
      name: 'Temporária',
      workloadHours: 30,
    }).expect(201);

    await withAuth(http().delete(`/subjects/${created.id}`)).expect(204);
    await withAuth(http().get(`/subjects/${created.id}`)).expect(404);
  });

  it('is not available to students', async () => {
    const studentToken = await loginAs(app, scenario.studentAEmail);

    await http()
      .get('/subjects')
      .set('Authorization', `Bearer ${studentToken}`)
      .expect(403);
  });
});
