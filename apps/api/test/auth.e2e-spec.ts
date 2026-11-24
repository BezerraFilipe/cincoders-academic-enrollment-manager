import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { hash } from 'bcryptjs';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';
import { PrismaService } from '../src/prisma/prisma.service';

const EMAIL = 'e2e.auth@test.local';
const PASSWORD = 'Senha@123';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let userId: number;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();

    prisma = app.get(PrismaService);
    const user = await prisma.user.upsert({
      where: { email: EMAIL },
      update: {},
      create: {
        name: 'E2E Auth',
        email: EMAIL,
        passwordHash: await hash(PASSWORD, 4),
        role: 'REGISTRAR',
      },
    });
    userId = user.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: EMAIL } });
    await app.close();
  });

  const login = (email: string, password: string) =>
    request(app.getHttpServer()).post('/auth/login').send({ email, password });

  it('logs in with valid credentials, ignoring e-mail case', async () => {
    const response = await login('E2E.Auth@Test.Local', PASSWORD).expect(200);

    expect(response.body.accessToken).toEqual(expect.any(String));
    expect(response.body.user).toEqual({
      id: userId,
      name: 'E2E Auth',
      email: EMAIL,
      role: 'REGISTRAR',
    });
  });

  it('rejects a wrong password', async () => {
    const response = await login(EMAIL, 'wrong-password').expect(401);

    expect(response.body).toMatchObject({ code: 'INVALID_CREDENTIALS' });
  });

  it('rejects an invalid e-mail with a validation error', async () => {
    const response = await login('not-an-email', PASSWORD).expect(400);

    expect(response.body).toMatchObject({ code: 'VALIDATION_ERROR' });
  });

  it('requires a token on protected routes', async () => {
    const response = await request(app.getHttpServer())
      .get('/auth/me')
      .expect(401);

    expect(response.body).toMatchObject({ code: 'UNAUTHENTICATED' });
  });

  it('returns the current user for a valid token', async () => {
    const { body } = await login(EMAIL, PASSWORD);

    const response = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${body.accessToken}`)
      .expect(200);

    expect(response.body).toMatchObject({ id: userId, role: 'REGISTRAR' });
    expect(response.body).not.toHaveProperty('student');
  });

  it('rejects an expired token', async () => {
    const signer = new JwtService({ secret: process.env.JWT_SECRET });
    const expiredToken = await signer.signAsync({
      sub: userId,
      role: 'REGISTRAR',
      exp: Math.floor(Date.now() / 1000) - 60,
    });

    const response = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${expiredToken}`)
      .expect(401);

    expect(response.body).toMatchObject({ code: 'SESSION_EXPIRED' });
  });

  it('rejects a tampered token', async () => {
    const { body } = await login(EMAIL, PASSWORD);

    const response = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${body.accessToken}x`)
      .expect(401);

    expect(response.body).toMatchObject({ code: 'INVALID_TOKEN' });
  });
});
