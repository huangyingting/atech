import 'dotenv/config';
import { defineConfig } from 'prisma/config';

const rawUrl = (process.env.DATABASE_URL || 'file:./prisma/dev.db').trim();
const isPostgres = rawUrl.startsWith('postgresql://') || rawUrl.startsWith('postgres://');

export default defineConfig({
  schema: isPostgres ? 'prisma/schema.postgres.prisma' : 'prisma/schema.prisma',
  migrations: {
    path: isPostgres ? 'prisma/migrations-postgres' : 'prisma/migrations',
  },
  datasource: {
    url: rawUrl,
  },
});
