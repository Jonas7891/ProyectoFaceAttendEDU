import type { Config } from 'drizzle-kit';
export default {
  schema: './src/infrastructure/persistence/schema.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: { connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/faceattend_db' }
} satisfies Config;
