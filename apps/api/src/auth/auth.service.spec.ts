import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hash } from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';

const SECRET = 'unit-test-secret-with-at-least-32-chars';

async function createService() {
  const storedUser = {
    id: 7,
    name: 'Ana Souza',
    email: 'ana.souza@cin.ufpe.br',
    role: 'STUDENT' as const,
    passwordHash: await hash('Senha@123', 4),
  };
  const prisma = {
    user: {
      findUnique: ({
        where,
        select,
      }: {
        where: { email?: string; id?: number };
        select?: Record<string, boolean>;
      }) => {
        const found =
          where.email === storedUser.email || where.id === storedUser.id;
        if (!found) return Promise.resolve(null);
        if (!select) return Promise.resolve(storedUser);
        return Promise.resolve(
          Object.fromEntries(
            Object.entries(storedUser).filter(([key]) => select[key]),
          ),
        );
      },
    },
  } as unknown as PrismaService;
  const jwtService = new JwtService({
    secret: SECRET,
    signOptions: { expiresIn: 60 },
  });

  return {
    service: new AuthService(prisma, jwtService),
    jwtService,
    storedUser,
  };
}

describe('AuthService', () => {
  it('returns a signed token with the user id and role for valid credentials', async () => {
    const { service, jwtService, storedUser } = await createService();

    const result = await service.login(storedUser.email, 'Senha@123');
    const payload = await jwtService.verifyAsync<{ sub: number; role: string }>(
      result.accessToken,
    );

    expect(payload).toMatchObject({ sub: storedUser.id, role: 'STUDENT' });
    expect(result.user).toEqual({
      id: storedUser.id,
      name: storedUser.name,
      email: storedUser.email,
      role: 'STUDENT',
    });
  });

  it('rejects a wrong password', async () => {
    const { service, storedUser } = await createService();

    await expect(
      service.login(storedUser.email, 'wrong-password'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects an unknown e-mail with the same response as a wrong password', async () => {
    const { service, storedUser } = await createService();

    const unknownEmail = service
      .login('nobody@cin.ufpe.br', 'Senha@123')
      .catch((e: unknown) => e);
    const wrongPassword = service
      .login(storedUser.email, 'wrong')
      .catch((e: unknown) => e);
    const [unknownError, wrongError] = (await Promise.all([
      unknownEmail,
      wrongPassword,
    ])) as [UnauthorizedException, UnauthorizedException];

    expect(unknownError.getResponse()).toEqual(wrongError.getResponse());
  });

  it('returns the profile without the password hash', async () => {
    const { service, storedUser } = await createService();

    const profile = await service.getProfile(storedUser.id);

    expect(profile).not.toHaveProperty('passwordHash');
  });
});
