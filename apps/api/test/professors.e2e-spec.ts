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

const PREFIX = 'PRF';
const DOMAIN = `${PREFIX.toLowerCase()}.test`;

describe('Professors (e2e)', () => {
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
  const authorized = <T extends { set: (header: string, value: string) => T }>(
    req: T,
  ) => req.set('Authorization', `Bearer ${token}`);
  const create = (body: Record<string, unknown>) =>
    authorized(http().post('/professors')).send(body);

  it('creates a professor normalizing the e-mail', async () => {
    const { body } = await create({
      name: 'Ana Lima',
      email: ` Ana.Lima@${DOMAIN.toUpperCase()} `,
    }).expect(201);

    expect(body).toMatchObject({
      name: 'Ana Lima',
      email: `ana.lima@${DOMAIN}`,
    });
  });

  it('rejects a duplicated e-mail', async () => {
    const { body } = await create({
      name: 'Outro',
      email: `professor@${DOMAIN}`,
    }).expect(409);

    expect(body).toMatchObject({ code: 'PROFESSOR_EMAIL_TAKEN' });
  });

  it('rejects an invalid e-mail', async () => {
    const { body } = await create({
      name: 'Sem e-mail',
      email: 'invalido',
    }).expect(400);

    expect(body).toMatchObject({ code: 'VALIDATION_ERROR' });
  });

  it('lists professors with search', async () => {
    const { body } = await authorized(http().get('/professors'))
      .query({ search: DOMAIN })
      .expect(200);

    expect(body.total).toBe(2);
  });

  it('updates a professor', async () => {
    const { body } = await authorized(
      http().patch(`/professors/${scenario.professorId}`),
    )
      .send({ name: `${PREFIX} Professor Titular` })
      .expect(200);

    expect(body.name).toBe(`${PREFIX} Professor Titular`);
  });

  it('refuses to delete a professor responsible for sections', async () => {
    const { body } = await authorized(
      http().delete(`/professors/${scenario.professorId}`),
    ).expect(409);

    expect(body).toMatchObject({ code: 'RESOURCE_IN_USE' });
  });

  it('deletes a professor without sections', async () => {
    const { body: created } = await create({
      name: 'Temporário',
      email: `temporario@${DOMAIN}`,
    }).expect(201);

    await authorized(http().delete(`/professors/${created.id}`)).expect(204);
    await authorized(http().get(`/professors/${created.id}`)).expect(404);
  });

  it('is not available to students', async () => {
    const studentToken = await loginAs(app, scenario.studentAEmail);

    await http()
      .get('/professors')
      .set('Authorization', `Bearer ${studentToken}`)
      .expect(403);
  });
});
