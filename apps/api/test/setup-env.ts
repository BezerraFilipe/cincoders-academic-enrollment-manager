process.env.NODE_ENV = 'test';
process.env.CORS_ORIGIN ??= 'http://localhost:5173';
process.env.DATABASE_URL ??=
  'postgresql://enrollment:enrollment@localhost:5432/enrollment?schema=public';
process.env.JWT_SECRET ??= 'test-secret-with-at-least-thirty-two-characters';
process.env.JWT_EXPIRES_IN_SECONDS ??= '3600';
