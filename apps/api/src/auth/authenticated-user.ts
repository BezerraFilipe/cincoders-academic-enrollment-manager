import type { UserRole } from '../generated/prisma/client.js';

export interface AuthenticatedUser {
  id: number;
  role: UserRole;
}

export interface JwtPayload {
  sub: number;
  role: UserRole;
}
