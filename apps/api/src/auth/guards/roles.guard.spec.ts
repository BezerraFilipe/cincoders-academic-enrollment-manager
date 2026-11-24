import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';

function createContext(role?: 'REGISTRAR' | 'STUDENT'): ExecutionContext {
  return {
    getHandler: () => undefined,
    getClass: () => undefined,
    switchToHttp: () => ({
      getRequest: () => ({ user: role ? { id: 1, role } : undefined }),
    }),
  } as unknown as ExecutionContext;
}

function createGuard(requiredRoles?: string[]): RolesGuard {
  const reflector = {
    getAllAndOverride: () => requiredRoles,
  } as unknown as Reflector;
  return new RolesGuard(reflector);
}

describe('RolesGuard', () => {
  it('allows any authenticated user when the route declares no roles', () => {
    expect(createGuard().canActivate(createContext('STUDENT'))).toBe(true);
  });

  it('allows a user whose role is required by the route', () => {
    expect(
      createGuard(['REGISTRAR']).canActivate(createContext('REGISTRAR')),
    ).toBe(true);
  });

  it('forbids a user whose role is not required by the route', () => {
    expect(() =>
      createGuard(['REGISTRAR']).canActivate(createContext('STUDENT')),
    ).toThrow(ForbiddenException);
  });
});
