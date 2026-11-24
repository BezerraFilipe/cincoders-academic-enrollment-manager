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

const PREFIX = 'PRG';

interface GroupBody {
  group: string;
  requiredHours: number;
  completedHours: number;
  inProgressHours: number;
  remainingHours: number;
  completionPercentage: number;
}

describe('Progress (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let scenario: Scenario;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();

    prisma = app.get(PrismaService);
    scenario = await createScenario(prisma, PREFIX);

    await prisma.academicRecord.createMany({
      data: [
        {
          studentId: scenario.studentAId,
          subjectId: scenario.sharedSubjectId,
          term: '2024.2',
          status: 'PASSED',
        },
        {
          studentId: scenario.studentAId,
          subjectId: scenario.freeSubjectId,
          term: '2024.2',
          status: 'FAILED',
        },
        {
          studentId: scenario.studentBId,
          subjectId: scenario.sharedSubjectId,
          term: '2024.2',
          status: 'PASSED',
        },
      ],
    });
    await prisma.enrollment.create({
      data: {
        studentId: scenario.studentAId,
        sectionId: scenario.freeSectionId,
      },
    });
  });

  afterAll(async () => {
    await destroyScenario(prisma, PREFIX);
    await app.close();
  });

  const getProgress = async (email: string) => {
    const token = await loginAs(app, email);
    const { body } = await request(app.getHttpServer())
      .get('/me/progress')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    return body as { course: { code: string }; groups: GroupBody[] };
  };

  const group = (groups: GroupBody[], name: string) =>
    groups.find((item) => item.group === name)!;

  it('computes the progress of each group from passed subjects and active enrollments', async () => {
    const { course, groups } = await getProgress(scenario.studentAEmail);

    expect(course.code).toBe(`${PREFIX}-A`);
    expect(group(groups, 'MANDATORY')).toMatchObject({
      requiredHours: 60,
      completedHours: 60,
      remainingHours: 0,
      completionPercentage: 100,
    });
    expect(group(groups, 'FREE_ELECTIVE')).toMatchObject({
      completedHours: 0,
      inProgressHours: 30,
      remainingHours: 30,
    });
  });

  it('classifies the same passed subject according to the course of the student', async () => {
    const { groups } = await getProgress(scenario.studentBEmail);

    expect(group(groups, 'MANDATORY').completedHours).toBe(0);
    expect(group(groups, 'PROFILE_ELECTIVE').completedHours).toBe(60);
  });

  it('is not available to the registrar', async () => {
    const token = await loginAs(app, scenario.registrarEmail);

    await request(app.getHttpServer())
      .get('/me/progress')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });
});
