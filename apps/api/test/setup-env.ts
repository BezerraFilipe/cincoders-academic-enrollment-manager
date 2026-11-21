process.env.NODE_ENV = 'test';
process.env.CORS_ORIGIN ??= 'http://localhost:5173';
process.env.DATABASE_URL ??=
  'postgresql://enrollment:enrollment@localhost:5432/enrollment?schema=public';
