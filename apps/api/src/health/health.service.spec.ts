import { ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HealthService } from './health.service';

function createService(queryRaw: () => Promise<unknown>): HealthService {
  const prisma = { $queryRaw: queryRaw } as unknown as PrismaService;
  return new HealthService(prisma);
}

describe('HealthService', () => {
  it('reports API and database as up when the database responds', async () => {
    const service = createService(() => Promise.resolve([{ result: 1 }]));

    await expect(service.check()).resolves.toEqual({
      status: 'ok',
      database: 'up',
    });
  });

  it('throws 503 when the database is unreachable', async () => {
    const service = createService(() =>
      Promise.reject(new Error('connection refused')),
    );

    await expect(service.check()).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});
